'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core';
import api from '@/lib/api';
import { UserTypeEnum } from '@/utils/UserTypeEnum';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GroupCard } from './group-card';
import type { ScheduleItem, Course, Group, Semester } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { formatTimeSlot } from '@/utils/Helpers';

const DAY_ORDER = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

const usePagination = (initialPage = 0) => {
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  return {
    page,
    hasMore,
    isLoading,
    setPage,
    setHasMore,
    setIsLoading,
    loadMore: () => setPage((prev) => prev + 1),
  };
};

export function ScheduleView({ userType }: { userType: UserTypeEnum }) {
  // State management
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    null
  );
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  // const [timeSlotsData, setTimeSlotsData] = useState<TimeSlot | null>(null);
  const [daysMap, setDaysMap] = useState<Record<string, string>>({});
  const [generatedTimeSlots, setGeneratedTimeSlots] = useState<string[]>([]);

  // Pagination hooks
  const groupsPagination = usePagination();
  const semestersPagination = usePagination();

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      const endpoint =
        userType === UserTypeEnum.ADMIN
          ? '/api/v1/courses/admin'
          : '/api/v1/courses';

      try {
        // TODO: REMOVER A PAGINAÇÃO DO REQUEST DOS MEUS CURSOS
        const response = await api.get(`${endpoint}?page=0&size=20`);
        setCourses(response.data.content);
        if (response.data.content.length > 0) {
          setSelectedCourse(response.data.content[0]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, [userType]);

  // Fetch time slots when course changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedCourse) return;

      try {
        const response = await api.get(
          `/api/v1/time-slots/${selectedCourse.id}`
        );
        // setTimeSlotsData(response.data);

        const daysOrder = response.data.daysOfWeek.sort(
          (a: string, b: string) => {
            return DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b);
          }
        );
        const orderedDays = daysOrder.reduce(
          (acc: Record<string, string>, day: string) => {
            acc[day] =
              {
                MONDAY: 'Segunda',
                TUESDAY: 'Terça',
                WEDNESDAY: 'Quarta',
                THURSDAY: 'Quinta',
                FRIDAY: 'Sexta',
                SATURDAY: 'Sábado',
              }[day] || day;
            return acc;
          },
          {}
        );
        setDaysMap(orderedDays);

        // Generate time slots
        const slots = generateTimeSlots(
          response.data.startTime,
          response.data.endTime,
          response.data.lessonDurationMinutes
        );
        setGeneratedTimeSlots(slots);
      } catch (error) {
        console.error('Error fetching time slots:', error);
        // Fallback to default values
        setGeneratedTimeSlots([
          '08:00-09:00',
          '09:00-10:00',
          '11:00-12:00',
          '13:30-14:30',
          '15:30-16:30',
          '18:50-19:40',
          '17:00-18:00',
        ]);
        setDaysMap({
          MONDAY: 'Segunda',
          TUESDAY: 'Terça',
          WEDNESDAY: 'Quarta',
          THURSDAY: 'Quinta',
          FRIDAY: 'Sexta',
          SATURDAY: 'Sábado',
        });
      }
    };

    fetchTimeSlots();
  }, [selectedCourse]);

  // Fetch groups when course changes
  useEffect(() => {
    const fetchGroups = async () => {
      if (!selectedCourse) return;

      groupsPagination.setIsLoading(true);

      try {
        const response = await api.get(
          `/api/v1/groups?courseId=${selectedCourse.id}&page=${groupsPagination.page}&size=20`
        );

        setGroups((prev) =>
          groupsPagination.page === 0
            ? response.data.content
            : [...prev, ...response.data.content]
        );

        groupsPagination.setHasMore(
          response.data.page.number + 1 < response.data.page.totalPages
        );
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        groupsPagination.setIsLoading(false);
      }
    };

    fetchGroups();
  }, [selectedCourse, groupsPagination.page]);

  // Fetch Semesters
  useEffect(() => {
    const fetchSemesters = async () => {
      semestersPagination.setIsLoading(true);

      try {
        const response = await api.get(
          `/api/v1/semesters?page=${semestersPagination.page}&size=20`
        );

        setSemesters((prev) =>
          semestersPagination.page === 0
            ? response.data.content
            : [...prev, ...response.data.content]
        );

        if (
          semestersPagination.page === 0 &&
          response.data.content.length > 0
        ) {
          setSelectedSemester(response.data.content[0]);
        }

        semestersPagination.setHasMore(
          response.data.page.number + 1 < response.data.page.totalPages
        );
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        semestersPagination.setIsLoading(false);
      }
    };

    fetchSemesters();
  }, [semestersPagination.page]);

  // Fetch schedules when course or semester changes
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!selectedCourse || !selectedSemester) return;

      try {
        const response = await api.get(
          // `/api/v1/schedules?courseId=${selectedCourse.id}&semesterId=${selectedSemester.id}`
          `/api/v1/schedules?semesterId=${selectedSemester.id}`
        );
        setSchedules(response.data);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };

    fetchSchedules();
  }, [selectedCourse, selectedSemester]);

  // Handlers
  const handleCourseChange = (courseId: string) => {
    const course = courses.find((c) => c.id === Number(courseId));
    setSelectedCourse(course || null);
    groupsPagination.setPage(0);
  };

  const handleSemesterChange = (semesterId: string) => {
    const semester = semesters.find((s) => s.id === Number(semesterId));
    setSelectedSemester(semester || null);
  };

  const filteredGroups = groups.filter((group) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      group.name.toLowerCase().includes(searchLower) ||
      group.abbreviation.toLowerCase().includes(searchLower) ||
      group.discipline.teacher.name.toLowerCase().includes(searchLower)
    );
  });

  // DnD handling
  const handleDragEnd = async (event: DragEndEvent) => {
    const MIN_DRAG_DISTANCE = 5;

    // Verificar se houve movimento significativo
    if (
      Math.abs(event.delta.x) < MIN_DRAG_DISTANCE &&
      Math.abs(event.delta.y) < MIN_DRAG_DISTANCE
    ) {
      return;
    }

    if (!event.over || !selectedCourse || !selectedSemester) return;

    const { active, over } = event;

    if (active.id === over.id) return;

    const overId = String(over.id);
    const [dayOfWeek, timeSlot] = overId.split('|');

    try {
      let body;
      let isNew = false;

      // Se for um grupo sendo arrastado (novo agendamento)
      if (active.data.current?.type === 'group') {
        const groupId = active.data.current.groupId;
        const [startTime, endTime] = timeSlot.split('-');

        const hasConflict = schedules.some(
          (s) =>
            s.dayOfWeek === dayOfWeek &&
            s.startTime === startTime &&
            s.endTime === endTime
        );

        if (hasConflict) {
          alert('Já existe uma turma neste horário!');
          return;
        }

        body = {
          dayOfWeek,
          startTime,
          endTime,
          groupId,
        };
        isNew = true;
      } else {
        const scheduleId = active.data.current?.scheduleId;
        const [newStartTime, newEndTime] = timeSlot.split('-');

        // Encontrar o agendamento original
        const originalSchedule = schedules.find((s) => s.id === scheduleId);
        if (!originalSchedule) return;

        const originalPosition = `${
          originalSchedule.dayOfWeek
        }|${formatTimeSlot(
          originalSchedule.startTime,
          originalSchedule.endTime
        )}`;

        if (overId === originalPosition) return;

        const hasConflict = schedules.some(
          (s) =>
            s.id !== scheduleId &&
            s.dayOfWeek === dayOfWeek &&
            s.startTime === newStartTime &&
            s.endTime === newEndTime
        );

        if (hasConflict) {
          alert('Já existe uma turma neste horário!');
          return;
        }

        body = {
          dayOfWeek,
          startTime: newStartTime,
          endTime: newEndTime,
          scheduleId,
        };
      }

      const response = await api.post(
        '/api/v1/schedules/create-or-update',
        body
      );

      setSchedules((prev) => {
        if (isNew) return [...prev, response.data];
        return prev.map((s) => (s.id === response.data.id ? response.data : s));
      });
    } catch (error) {
      console.error('Error creating or updating schedule:', error);
      alert('Erro ao salvar horário.');
    }
  };

  // Helper to generate time slots
  const generateTimeSlots = (start: string, end: string, duration: number) => {
    const normalizeTime = (time: string) => {
      const parts = time.split(':');
      return parts.length === 2 ? `${time}:00` : time;
    };

    const slots = [];
    const startDate = new Date(`1970-01-01T${normalizeTime(start)}`);
    const endDate = new Date(`1970-01-01T${normalizeTime(end)}`);

    while (startDate < endDate) {
      const endTime = new Date(startDate.getTime() + duration * 60000);
      if (endTime > endDate) break;

      const format = (date: Date) => date.toTimeString().slice(0, 5);
      slots.push(`${format(startDate)}-${format(endTime)}`);
      startDate.setTime(endTime.getTime());
    }

    return slots;
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6 h-fit">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Meus Cursos</h2>

          <div className="mb-6 space-y-4">
            <Select
              onValueChange={handleCourseChange}
              value={selectedCourse?.id.toString()}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o curso" />
              </SelectTrigger>
              <SelectContent className="max-h-80 overflow-y-auto">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled className="text-gray-400">
                    Nenhum curso disponível
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            <Input
              placeholder="Buscar turma"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3 mb-4">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                draggable={[
                  UserTypeEnum.ADMIN,
                  UserTypeEnum.COORDINATOR,
                ].includes(userType)}
              />
            ))}
          </div>

          {groupsPagination.hasMore && (
            <Button
              onClick={groupsPagination.loadMore}
              disabled={groupsPagination.isLoading}
              variant="outline"
              className="w-full"
            >
              {groupsPagination.isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Carregando...
                </>
              ) : (
                'Carregar mais'
              )}
            </Button>
          )}
        </div>

        {/* Schedule Grid */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Horário</h2>

              <div className="flex space-x-3">
                <Select
                  onValueChange={handleSemesterChange}
                  value={selectedSemester?.id.toString()}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o semestre" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80 overflow-y-auto">
                    {semesters.length > 0 ? (
                      <>
                        {semesters.map((semester) => (
                          <SelectItem
                            key={semester.id}
                            value={semester.id.toString()}
                          >
                            {semester.name}
                          </SelectItem>
                        ))}

                        <div>
                          {semestersPagination.hasMore && (
                            <Button
                              onClick={semestersPagination.loadMore}
                              disabled={semestersPagination.isLoading}
                              variant="ghost"
                              className="w-full"
                            >
                              {semestersPagination.isLoading ? (
                                <>
                                  <Loader2 className="animate-spin" />
                                  Carregando...
                                </>
                              ) : (
                                'Carregar mais'
                              )}
                            </Button>
                          )}
                        </div>
                      </>
                    ) : (
                      <SelectItem
                        value="none"
                        disabled
                        className="text-gray-400"
                      >
                        Nenhum semestre disponível
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Exportar
                </Button>
              </div>
            </div>
          </div>

          <ScheduleTable
            schedules={schedules}
            droppable={[UserTypeEnum.ADMIN, UserTypeEnum.COORDINATOR].includes(
              userType
            )}
            daysMap={daysMap}
            generatedTimeSlots={generatedTimeSlots}
          />
        </div>
      </div>
    </DndContext>
  );
}

// Schedule Table Component
function ScheduleTable({
  schedules,
  droppable,
  daysMap,
  generatedTimeSlots,
}: {
  schedules: ScheduleItem[];
  droppable: boolean;
  daysMap: Record<string, string>;
  generatedTimeSlots: string[];
}) {
  const sortedDays = Object.entries(daysMap).sort(([a], [b]) => {
    return DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b);
  });

  return (
    <div className="overflow-x-visible">
      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b">
            <th className="w-24 py-3 text-center font-medium text-gray-500">
              Dia
            </th>
            {sortedDays.map(([apiDay, ptDay]) => (
              <th
                key={apiDay}
                className="py-3 text-center font-medium text-gray-500 min-w-[200px] max-w-[200px]"
              >
                {ptDay}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {generatedTimeSlots.map((timeSlot) => (
            <tr key={timeSlot} className="border-b">
              <td className="py-8 text-center text-sm text-gray-500">
                {timeSlot}
              </td>

              {sortedDays.map(([apiDay, ptDay]) => {
                const cellSchedules = schedules.filter(
                  (s) =>
                    s.dayOfWeek === apiDay &&
                    formatTimeSlot(s.startTime, s.endTime) === timeSlot
                );

                return (
                  <TableCell
                    key={`${ptDay}-${timeSlot}`}
                    id={`${apiDay}|${timeSlot}`}
                    droppable={droppable}
                  >
                    {cellSchedules.map((schedule) => (
                      <ScheduleItem
                        key={schedule.id}
                        schedule={schedule}
                        draggable={droppable}
                      />
                    ))}
                  </TableCell>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Table Cell Component
function TableCell({
  id,
  children,
  droppable,
}: {
  id: string;
  children: React.ReactNode;
  droppable: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id, disabled: !droppable });

  return (
    <td
      ref={setNodeRef}
      className={`p-2 min-h-16 min-w-[200px] max-w-[200px] ${
        isOver ? 'bg-indigo-50' : ''
      } transition-colors`}
    >
      {children}
    </td>
  );
}

// Schedule Item Component
function ScheduleItem({
  schedule,
  draggable,
}: {
  schedule: ScheduleItem;
  draggable: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: schedule.id,
    data: {
      type: 'schedule',
      scheduleId: schedule.id,
      groupId: schedule.group.id,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      // Prevenir comportamento de atualizar ao somente clicar no objeto
      {...(draggable
        ? {
            ...listeners,
            onMouseDown: (e) => {
              // Permite apenas arrastar a partir do elemento
              const element = e.currentTarget;
              const handleDragStart = (e: MouseEvent) => {
                const dx = e.clientX - element.getBoundingClientRect().left;
                const dy = e.clientY - element.getBoundingClientRect().top;

                if (
                  dx < 0 ||
                  dx > element.offsetWidth ||
                  dy < 0 ||
                  dy > element.offsetHeight
                ) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              };

              element.addEventListener('dragstart', handleDragStart);
              return () =>
                element.removeEventListener('dragstart', handleDragStart);
            },
          }
        : {})}
      className={`bg-${schedule.group?.color}-100 border-l-4 border-${
        schedule.group?.color
      }-500 p-2 rounded mb-2 ${draggable ? 'cursor-move' : ''}`}
    >
      <h4 className="font-medium text-sm">{schedule.group?.abbreviation}</h4>
      <p className="text-xs text-gray-600">{schedule.group?.name}</p>
      <div className="flex justify-between">
        <p className="text-xs text-gray-500 ">
          {schedule.group?.classRoom?.abbreviation}
        </p>
        <p className="text-xs text-gray-500">
          {schedule.group?.discipline?.teacher?.fullName}
        </p>
      </div>
    </div>
  );
}
