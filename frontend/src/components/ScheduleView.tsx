'use client';

import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { ScheduleItem, Course, Group, Semester } from '@/lib/types';
import { toast } from 'sonner';
import { Download, Info, Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GroupCard } from '@/components/group-card';
import GroupForm from '@/components/forms/group-form';
import { DynamicModal } from '@/components/dynamic-modal';
import { CustomCheckboxGroup } from '@/components/custom-checkbox-group';
import { UserTypeEnum } from '@/utils/UserTypeEnum';
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
  const [courseSemesters, setCourseSemesters] = useState<number[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    null
  );
  const [selectedCustomCheckboxSemesters, setSelectedCustomCheckboxSemesters] =
    useState<number[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [daysMap, setDaysMap] = useState<Record<string, string>>({});
  const [generatedTimeSlots, setGeneratedTimeSlots] = useState<string[]>([]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<Group | ScheduleItem | null>(
    null
  );
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // Pagination hooks
  const groupsPagination = usePagination();
  const semestersPagination = usePagination();

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/api/v1/courses');
        setCourses(response.data);
        if (response.data.length > 0) {
          setSelectedCourse(response.data[0]);
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
          `/api/v1/groups/course/${selectedCourse.id}?page=${groupsPagination.page}&size=20`
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
          const currentDate = new Date();

          // Encontrar semestre atual baseado nas datas
          const currentSemester = response.data.content.find(
            (semester: Semester) => {
              const startDate = new Date(semester.startDate);
              const endDate = new Date(semester.endDate);
              return currentDate >= startDate && currentDate <= endDate;
            }
          );

          // Selecionar o semestre atual ou o primeiro da lista
          setSelectedSemester(currentSemester || response.data.content[0]);
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

  // TODO: Adicionar a opção de ver Meus horários
  // Fetch schedules when course or semester changes
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!selectedCourse || !selectedSemester) return;

      try {
        const response = await api.get(
          `/api/v1/schedules?courseId=${selectedCourse.id}&semesterId=${selectedSemester.id}`
        );
        setSchedules(response.data);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };

    fetchSchedules();
  }, [selectedCourse, selectedSemester]);

  // Fetch semesters of the selected course
  useEffect(() => {
    const fetchCourseSemesters = async () => {
      if (!selectedCourse) return;

      try {
        const response = await api.get(
          `/api/v1/groups/semesters-of-course/${selectedCourse.id}`
        );

        setCourseSemesters(response.data);
      } catch (error) {
        console.error('Error fetching course semesters:', error);
      }
    };

    fetchCourseSemesters();
  }, [selectedCourse]);

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

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

    try {
      await api.delete(`/api/v1/schedules/${scheduleId}`);
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Erro ao excluir horário');
    }
  };

  const filteredGroups = groups.filter((group) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      group.name.toLowerCase().includes(searchLower) ||
      group.abbreviation.toLowerCase().includes(searchLower) ||
      group.discipline.teacher.name.toLowerCase().includes(searchLower)
    );
  });

  const getFilteredSchedules = () => {
    if (selectedCustomCheckboxSemesters.length === 0) {
      return schedules;
    }

    return schedules.filter((schedule) =>
      selectedCustomCheckboxSemesters.includes(schedule.group?.semesterOfCourse)
    );
  };

  const handleGroupSubmit = async (data: any) => {
    try {
      if (!selectedCourse) {
        toast.error('Selecione um curso antes de criar uma turma');
        return;
      }

      const payload = {
        ...data,
        courseId: selectedCourse.id,
      };

      const response = await api.post('/api/v1/groups', payload);

      if (response.status !== 201) {
        throw new Error('Erro ao criar turma');
      }

      setIsGroupModalOpen(false);

      setGroups((prev) => [response.data, ...prev]);

      toast.success('Turma criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      toast.error('Erro ao criar turma');
    }
  };

  // DnD handling
  // Adicione estas funções de handler:
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));

    // Identifica se é um grupo ou schedule sendo arrastado
    if (event.active.data.current?.type === 'group') {
      const groupId = event.active.data.current.groupId;
      const group = groups.find((g) => g.id === groupId);
      setActiveItem(group || null);
    } else if (event.active.data.current?.type === 'schedule') {
      const scheduleId = event.active.data.current.scheduleId;
      const schedule = schedules.find((s) => s.id === scheduleId);
      setActiveItem(schedule || null);
    }
  };

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
          semesterId: selectedSemester.id,
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

      setActiveId(null);
      setActiveItem(null);
    } catch (error) {
      console.error('Error creating or updating schedule:', error);
      toast.error('Erro ao salvar horário.');
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

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 3, // Reduz a distância mínima para ativar o drag
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100, // Reduz o delay para touch
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 bg-card dark:bg-secondary rounded-xl shadow-md p-6 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Meus Cursos</h2>
            <Button
              variant="link"
              className="text-indigo-600 dark:text-neutral-300 hover:text-indigo-700 cursor-pointer"
              onClick={() => setIsGroupModalOpen(true)}
            >
              <Plus strokeWidth={2} />
              Adicionar Turma
            </Button>
          </div>

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
                    <SelectItem
                      key={course.id}
                      value={course.id.toString()}
                      className="hover:bg-accent hover:text-accent-foreground"
                    >
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
            {groupsPagination.isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin text-gray-500" />
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {searchTerm ? (
                  'Nenhuma turma encontrada'
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      className="w-30 h-30"
                      src="thinking.png"
                      alt="thinking emote"
                    />
                    <p className="mt-8">Nenhuma turma cadastrada neste curso</p>
                  </div>
                )}
              </div>
            ) : (
              filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  draggable={[
                    UserTypeEnum.ADMIN,
                    UserTypeEnum.COORDINATOR,
                  ].includes(userType)}
                />
              ))
            )}
          </div>

          {groupsPagination.hasMore && groups.length > 0 && (
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
          {groups.length > 0 && (
            <>
              <hr />
              <div className="flex justify-center items-center mt-4 gap-2">
                <Info className="w-4 h-4 font-semibold text-muted-foreground" />
                <p className="text-sm font-semibold text-muted-foreground">
                  Arraste a Turma para a grade
                </p>
              </div>
            </>
          )}
        </div>

        {/* Schedule Grid */}
        <div className="lg:col-span-3 bg-card dark:bg-secondary rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Horário</h2>

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
                        {/* Semestres Ativos */}
                        <SelectGroup>
                          <SelectLabel className="text-xs font-semibold text-gray-500 px-2 py-1">
                            Semestres Ativos
                          </SelectLabel>
                          {semesters
                            .filter((semester) => semester.status === 'ACTIVE')
                            .map((semester) => (
                              <SelectItem
                                key={semester.id}
                                value={semester.id.toString()}
                                className="pl-4"
                              >
                                {semester.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>

                        {/* Semestres Concluídos */}
                        <SelectGroup>
                          <SelectLabel className="text-xs font-semibold text-gray-500 px-2 py-1">
                            Semestres Concluídos
                          </SelectLabel>
                          {semesters
                            .filter(
                              (semester) => semester.status === 'FINALIZED'
                            )
                            .map((semester) => (
                              <SelectItem
                                key={semester.id}
                                value={semester.id.toString()}
                                className="pl-4 opacity-75"
                              >
                                {semester.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>

                        {/* Botão Carregar Mais */}
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
                <Button className="bg-primary hover:bg-indigo-700">
                  <Download strokeWidth={2} />
                  Exportar
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <CustomCheckboxGroup
                options={courseSemesters.map((s) => ({
                  value: s,
                  label: `${s}º Semestre`,
                }))}
                selectedValues={selectedCustomCheckboxSemesters}
                onChange={setSelectedCustomCheckboxSemesters}
              />
            </div>
          </div>

          <ScheduleTable
            schedules={getFilteredSchedules()}
            droppable={[UserTypeEnum.ADMIN, UserTypeEnum.COORDINATOR].includes(
              userType
            )}
            daysMap={daysMap}
            generatedTimeSlots={generatedTimeSlots}
            onDeleteSchedule={handleDeleteSchedule}
          />
        </div>
      </div>

      <DynamicModal
        trigger={<div style={{ display: 'none' }} />}
        title="Cadastrar Turma"
        description="Preencha os dados para cadastrar uma nova turma"
        open={isGroupModalOpen}
        onOpenChange={(open) => setIsGroupModalOpen(open)}
      >
        <GroupForm
          onSubmit={handleGroupSubmit}
          onCancel={() => setIsGroupModalOpen(false)}
          courseId={selectedCourse?.id}
        />
      </DynamicModal>

      <DragOverlay>
        {activeItem && activeId ? (
          activeId.startsWith('group-') ? (
            <GroupCard group={activeItem as Group} draggable={false} />
          ) : (
            <div
              className={`bg-${
                (activeItem as ScheduleItem).group?.color || 'blue'
              }-100 border-l-4 border-${
                (activeItem as ScheduleItem).group?.color || 'blue'
              }-500 p-2 rounded shadow-lg`}
            >
              <h4 className="font-medium text-sm">
                {(activeItem as ScheduleItem).group?.abbreviation}
              </h4>
              <p className="text-xs text-gray-600">
                {(activeItem as ScheduleItem).group?.name}
              </p>
              <p className="text-xs text-gray-500">
                {(activeItem as ScheduleItem).group?.classRoom?.abbreviation}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                {
                  (activeItem as ScheduleItem).group?.discipline?.teacher
                    ?.fullName
                }
              </p>
            </div>
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Schedule Table Component
function ScheduleTable({
  schedules,
  droppable,
  daysMap,
  generatedTimeSlots,
  onDeleteSchedule,
}: {
  schedules: ScheduleItem[];
  droppable: boolean;
  daysMap: Record<string, string>;
  generatedTimeSlots: string[];
  onDeleteSchedule: (id: number) => void;
}) {
  const sortedDays = Object.entries(daysMap).sort(([a], [b]) => {
    return DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b);
  });

  return (
    <div className="overflow-x-visible">
      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b">
            <th className="w-24 py-3 text-center font-medium text-gray-500 dark:text-gray-300">
              Dia
            </th>
            {sortedDays.map(([apiDay, ptDay]) => (
              <th
                key={apiDay}
                className="py-3 text-center font-medium text-gray-500 min-w-[200px] dark:text-gray-300"
              >
                {ptDay}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {generatedTimeSlots.map((timeSlot) => (
            <tr key={timeSlot} className="border-b">
              <td className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
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
                        onDeleteSchedule={onDeleteSchedule}
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
      className={`p-2 min-h-16 ${
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
  onDeleteSchedule,
}: {
  schedule: ScheduleItem;
  draggable: boolean;
  onDeleteSchedule: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: schedule.id,
    data: {
      type: 'schedule',
      scheduleId: schedule.id,
      groupId: schedule.group.id,
    },
    disabled: !draggable,
  });

  const style: React.CSSProperties | undefined = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        pointerEvents: 'none' as const,
        opacity: 0,
      }
    : undefined;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteSchedule(schedule.id);
  };

  // Criar listeners customizados que excluem o botão de delete
  const customListeners = draggable
    ? {
        ...listeners,
        onPointerDown: (e: React.PointerEvent) => {
          // Se o clique foi no botão ou dentro dele, não iniciar drag
          if ((e.target as HTMLElement).closest('button[data-delete-button]')) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          // Caso contrário, usar o listener original
          if (listeners?.onPointerDown) {
            listeners.onPointerDown(e);
          }
        },
      }
    : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...customListeners}
      className={`relative group bg-${
        schedule.group?.color || 'blue'
      }-100 hover:shadow-sm transition-all border-l-4 border-${
        schedule.group?.color || 'blue'
      }-500 p-2 rounded mb-2 ${draggable ? 'cursor-move' : ''} ${
        transform ? 'shadow-lg scale-105' : 'hover:-translate-y-0.5'
      }`}
    >
      {draggable && (
        <button
          type="button"
          data-delete-button="true"
          onClick={handleDeleteClick}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute top-1 right-1 p-1 rounded-full bg-white/80 hover:bg-red-100 transition-colors z-10 opacity-0 group-hover:opacity-100"
          title="Excluir horário"
        >
          <X className="h-3 w-3 text-red-500" />
        </button>
      )}

      <div className="pr-6">
        <h4 className="font-medium text-sm flex-1 break-words text-gray-900 dark:text-gray-900">
          {schedule.group?.abbreviation}
        </h4>
        <p className="text-xs text-gray-600 break-words">
          {schedule.group?.name}
        </p>
        <p className="text-xs text-gray-500 break-words">
          {schedule.group?.classRoom?.abbreviation}
        </p>
        <p className="mt-2 text-xs text-gray-500 break-words">
          {schedule.group?.discipline?.teacher?.fullName}
        </p>
      </div>
    </div>
  );
}
