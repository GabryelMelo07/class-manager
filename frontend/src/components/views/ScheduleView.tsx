'use client';

import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
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

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import type { Course, Group, IScheduleItem, Semester } from '@/lib/types';
import { toast } from 'sonner';
import { Download, Info, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GroupCard } from '@/components/group-card';
import GroupForm from '@/components/forms/group-form';
import { DynamicModal } from '@/components/dynamic-modal';
import { CustomCheckboxGroup } from '@/components/custom-checkbox-group';
import { UserTypeEnum } from '@/utils/UserTypeEnum';
import { DAY_ORDER, formatTimeSlot, getColorClasses, getTranslatedErrorMessage } from '@/utils/Helpers';
import { useReactToPrint } from 'react-to-print';
import ScheduleTable from '@/components/schedule-table';
import { useRefreshDataContext } from '@/context/RefreshDataContext';

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
  const [groupedCourses, setGroupedCourses] = useState<{
    coordination: Course[];
    teaching: Course[];
  }>({ coordination: [], teaching: [] });
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
  const [schedules, setSchedules] = useState<IScheduleItem[]>([]);
  const [daysMap, setDaysMap] = useState<Record<string, string>>({});
  const [generatedTimeSlots, setGeneratedTimeSlots] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<Group | IScheduleItem | null>(
    null
  );
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [timeSlotsError, setTimeSlotsError] = useState(false);

  const [isDeleteScheduleDialogOpen, setIsDeleteScheduleDialogOpen] =
    useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<number | null>(null);

  // Pagination hooks
  const groupsPagination = usePagination();
  const semestersPagination = usePagination();

  // Referência para a tabela
  const scheduleTableRef = useRef<HTMLDivElement>(null);

  const { refreshTriggerMap, triggerRefresh } = useRefreshDataContext();

  // Valida se o usuário tem permissão para gerenciar horários do curso
  const canManageCourse = () => {
    if (userType === UserTypeEnum.ADMIN) return true;

    if (userType === UserTypeEnum.COORDINATOR) {
      // Verifica se é um curso de coordenação
      return groupedCourses.coordination.some(
        (c) => c.id === selectedCourse?.id
      );
    }

    return false;
  };

  const canManage = canManageCourse();

  const shouldShowGroupsArea =
    userType === UserTypeEnum.ADMIN ||
    userType === UserTypeEnum.TEACHER ||
    (userType === UserTypeEnum.COORDINATOR && canManage);

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/api/v1/courses');

        if (userType === UserTypeEnum.COORDINATOR) {
          if (response.data.coordinatorCourse) {
            const coordinatorCourse = response.data.coordinatorCourse
              ? [response.data.coordinatorCourse]
              : [];

            const teachingCourses = response.data.teachingCourses || [];

            setGroupedCourses({
              coordination: coordinatorCourse,
              teaching: teachingCourses,
            });

            setSelectedCourse(coordinatorCourse[0] || null);
          }
        } else {
          // Admin recebe array direto de cursos
          if (response.data.length > 0) {
            setCourses(response.data);
            setSelectedCourse(response.data[0] || null);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar os cursos do usuário:', error);
        toast.error(
          'Erro ao carregar os cursos do usuário, por favor entre em contato com o suporte.'
        );
      }
    };

    fetchCourses();
  }, [userType, refreshTriggerMap.courses]);

  // Fetch time slots when course changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedCourse) return;

      setTimeSlotsError(false);

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
      } catch (error: any) {
        console.error('Error fetching time slots:', error);

        if (error.response?.status === 404) {
          setTimeSlotsError(true);
          setGeneratedTimeSlots([]);
          setDaysMap({});
        }
      }
    };

    fetchTimeSlots();
  }, [selectedCourse]);

  // Fetch groups when course changes
  useEffect(() => {
    const fetchGroups = async () => {
      if (!selectedCourse) return;

      if (userType === UserTypeEnum.COORDINATOR && !canManage) {
        setGroups([]);
        return;
      }

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
  }, [selectedCourse, groupsPagination.page, refreshTriggerMap.groups]);

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
  }, [semestersPagination.page, refreshTriggerMap.semesters]);

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
  }, [selectedCourse, refreshTriggerMap.groups]);

  const renderCourseSelect = () => {
    // ADMIN e PROFESSOR: lista simples de cursos
    if (userType === UserTypeEnum.ADMIN || userType === UserTypeEnum.TEACHER) {
      return (
        <Select
          onValueChange={handleCourseChange}
          value={selectedCourse?.id?.toString() || ''}
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
      );
    } else if (userType === UserTypeEnum.COORDINATOR) {
      // COORDINATOR: grupos separados
      const hasCoordination = groupedCourses.coordination.length > 0;
      const hasTeaching = groupedCourses.teaching.length > 0;

      return (
        <Select
          onValueChange={handleCourseChange}
          value={selectedCourse?.id?.toString() || ''}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o curso" />
          </SelectTrigger>
          <SelectContent className="max-h-80 overflow-y-auto">
            {hasCoordination || hasTeaching ? (
              <>
                {/* Grupo de Coordenação */}
                {hasCoordination && (
                  <SelectGroup>
                    <SelectLabel className="text-xs font-semibold text-gray-500 px-2 py-1">
                      Coordenação
                    </SelectLabel>
                    {groupedCourses.coordination.map((course) => (
                      <SelectItem
                        key={course.id}
                        value={course.id.toString()}
                        className="pl-4 hover:bg-accent hover:text-accent-foreground"
                      >
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}

                {/* Grupo de Docência */}
                {hasTeaching && (
                  <SelectGroup>
                    <SelectLabel className="text-xs font-semibold text-gray-500 px-2 py-1">
                      Docência
                    </SelectLabel>
                    {groupedCourses.teaching.map((course) => (
                      <SelectItem
                        key={course.id}
                        value={course.id.toString()}
                        className="pl-4 hover:bg-accent hover:text-accent-foreground"
                      >
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </>
            ) : (
              <SelectItem value="none" disabled className="text-gray-400">
                Nenhum curso disponível
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      );
    }
  };

  // Handlers
  const handleCourseChange = (courseId: string) => {
    let course: Course | undefined;

    // ADMIN e TEACHER usam a lista direta de cursos
    if (userType === UserTypeEnum.ADMIN || userType === UserTypeEnum.TEACHER) {
      course = courses.find((c) => c.id === Number(courseId));
    } else if (userType === UserTypeEnum.COORDINATOR) {
      // COORDINATOR usa groupedCourses
      const allCourses = [
        ...groupedCourses.coordination,
        ...groupedCourses.teaching,
      ];
      course = allCourses.find((c) => c.id === Number(courseId));
    }

    setSelectedCourse(course || null);
    groupsPagination.setPage(0);
  };

  const handleSemesterChange = (semesterId: string) => {
    const semester = semesters.find((s) => s.id === Number(semesterId));
    setSelectedSemester(semester || null);
  };

  const handleDeleteSchedule = (scheduleId: number) => {
    setScheduleToDelete(scheduleId);
    setIsDeleteScheduleDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!scheduleToDelete) return;

    try {
      await api.delete(`/api/v1/schedules/${scheduleToDelete}`);
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleToDelete));
      toast.success('Horário excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Erro ao excluir horário');
    } finally {
      setIsDeleteScheduleDialogOpen(false);
      setScheduleToDelete(null);
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

      setGroups((prev) => [...prev, response.data]);

      toast.success('Turma criada com sucesso!');
      triggerRefresh('groups');
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      toast.error('Erro ao criar turma');
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: scheduleTableRef,
    documentTitle: `Horário do curso ${selectedCourse?.name || ''} ${
      selectedSemester?.name || ''
    }`,
    pageStyle: `
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .schedule-item { break-inside: avoid; }
      }
    `,
  });

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
    if (!canManage) return;

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

      const { data, status } = error.response;
      let translatedErrorMessage: string;

      if (data.status === 'CONFLICT' && status === 409) {
        translatedErrorMessage = getTranslatedErrorMessage(data.error);
      }
      
      toast.error(translatedErrorMessage);
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

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 3 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    })
  );

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="border lg:col-span-1 bg-card rounded-xl shadow-md p-6 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Meus Cursos</h2>
              {canManage && (
                <Button
                  variant="link"
                  className="text-indigo-600 dark:text-neutral-300 hover:text-indigo-700 cursor-pointer"
                  onClick={() => setIsGroupModalOpen(true)}
                >
                  <Plus strokeWidth={2} />
                  Adicionar Turma
                </Button>
              )}
            </div>

            <div className="mb-6 space-y-4">
              {renderCourseSelect()}

              {shouldShowGroupsArea && (
                <Input
                  placeholder="Buscar turma"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              )}
            </div>

            {shouldShowGroupsArea && (
              <>
                <div className="flex-1 min-h-0 overflow-y-auto custom-scroll-bar">
                  <div className="space-y-3 pr-2 pt-1">
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
                            <p className="mt-8 dark:text-foreground">
                              Nenhuma turma cadastrada neste curso
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      filteredGroups.map((group) => (
                        <GroupCard
                          key={group.id}
                          group={group}
                          draggable={canManage}
                        />
                      ))
                    )}
                  </div>
                </div>

                {groupsPagination.hasMore && groups.length > 0 && (
                  <Button
                    onClick={groupsPagination.loadMore}
                    disabled={groupsPagination.isLoading}
                    variant="outline"
                    className="w-full mt-2"
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
                  <div className="mt-4 space-y-4">
                    <hr />
                    <div className="flex justify-center items-center gap-2">
                      <Info className="w-4 h-4 font-semibold text-muted-foreground" />
                      <p className="text-sm font-semibold text-muted-foreground">
                        Arraste a Turma para a grade
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Schedule Grid */}
          <div className="lg:col-span-3 border bg-card rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Horário</h2>

                <div className="flex space-x-3">
                  <Select
                    onValueChange={handleSemesterChange}
                    value={selectedSemester?.id?.toString() || ''}
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
                              .filter(
                                (semester) => semester.status === 'ACTIVE'
                              )
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
                  <Button
                    onClick={handlePrint}
                    className="bg-primary hover:bg-indigo-700"
                  >
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
              scheduleTableRef={scheduleTableRef}
              schedules={getFilteredSchedules()}
              droppable={canManage}
              daysMap={daysMap}
              generatedTimeSlots={generatedTimeSlots}
              onDeleteSchedule={canManage ? handleDeleteSchedule : undefined}
              timeSlotsError={timeSlotsError}
            />
          </div>
        </div>

        <DragOverlay>
          {activeItem && activeId ? (
            activeId.startsWith('group-') ? (
              <GroupCard group={activeItem as Group} draggable={false} />
            ) : (
              <div
                className={`${
                  getColorClasses((activeItem as IScheduleItem).group?.color)
                    .bgClass
                } border-l-4 ${
                  getColorClasses((activeItem as IScheduleItem).group?.color)
                    .borderClass
                } p-2 rounded shadow-lg`}
              >
                <h4 className="font-medium text-sm">
                  {(activeItem as IScheduleItem).group?.abbreviation}
                </h4>
                <p className="text-xs text-gray-600">
                  {(activeItem as IScheduleItem).group?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(activeItem as IScheduleItem).group?.classRoom?.abbreviation}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {
                    (activeItem as IScheduleItem).group?.discipline?.teacher
                      ?.fullName
                  }
                </p>
              </div>
            )
          ) : null}
        </DragOverlay>
      </DndContext>

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

      <DynamicModal
        trigger={<span style={{ display: 'none' }}></span>}
        title="Confirmar Exclusão"
        description="Tem certeza que deseja excluir este agendamento de horário?"
        open={isDeleteScheduleDialogOpen}
        onOpenChange={(open) => setIsDeleteScheduleDialogOpen(open)}
      >
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => setIsDeleteScheduleDialogOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            className="cursor-pointer bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            Excluir
          </Button>
        </div>
      </DynamicModal>
    </>
  );
}
