// PublicScheduleView.tsx
'use client';

import { useState, useEffect } from 'react';
import { Loader2, Moon, Sun } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ScheduleTable from '@/components/schedule-table';
import type { IScheduleItem } from '@/lib/types';
import { DAY_ORDER, generateTimeSlots } from '@/utils/Helpers';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Interface para tipagem dos dados
interface GroupWithDetails {
  id: number;
  name: string;
  abbreviation: string;
  semesterOfCourse: number;
  color: string;
  active: boolean;
  discipline: {
    id: number;
    name: string;
    abbreviation: string;
    credits: number;
    active: boolean;
    course: {
      id: number;
      name: string;
      abbreviation: string;
      active: boolean;
      coordinator: {
        id: string;
        email: string;
        name: string;
        surname: string;
        active: boolean;
        fullName: string;
      };
      timeSlot: {
        id: number;
        daysOfWeek: string[];
        startTime: string;
        endTime: string;
        lessonDurationMinutes: number;
      };
    };
    teacher: {
      id: string;
      email: string;
      name: string;
      surname: string;
      active: boolean;
      fullName: string;
    };
  };
  classRoom: {
    id: number;
    name: string;
    abbreviation: string;
    location: string;
    active: boolean;
  };
}

interface ScheduleItemWithDetails extends IScheduleItem {
  group: GroupWithDetails;
  semester: {
    id: number;
    name: string;
    year: number;
    semester: number;
    startDate: string;
    endDate: string;
    status: string;
    active: boolean;
  };
  semesterId: number;
}

export default function PublicScheduleView() {
  // Estados
  const [schedules, setSchedules] = useState<ScheduleItemWithDetails[]>([]);
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [daysMap, setDaysMap] = useState<Record<string, string>>({});
  const [generatedTimeSlots, setGeneratedTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { theme, toggleTheme } = useTheme();

  // Buscar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Substituir pela URL real da API pública
        const response = await api.get('/api/v1/schedules/public');

        if (!response.data) {
          throw new Error('Erro ao carregar dados da API');
        }

        const data: ScheduleItemWithDetails[] = await response.data;
        setSchedules(data);

        // Extrair cursos únicos
        const uniqueCourses = Array.from(
          new Map(
            data.map((item) => [
              item.group.discipline.course.id,
              {
                id: item.group.discipline.course.id,
                name: item.group.discipline.course.name,
              },
            ])
          ).values()
        );

        setCourses(uniqueCourses);

        // Selecionar primeiro curso por padrão
        if (uniqueCourses.length > 0) {
          setSelectedCourseId(uniqueCourses[0].id);
        }

        setError('');
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError(
          'Não foi possível carregar os horários. Tente novamente mais tarde.'
        );
        toast.error('Erro ao carregar dados da API');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Atualizar time slots quando o curso selecionado muda
  useEffect(() => {
    if (!selectedCourseId || schedules.length === 0) return;

    // Encontrar o primeiro schedule com o curso selecionado para pegar o timeSlot
    const scheduleForCourse = schedules.find(
      (item) => item.group.discipline.course.id === selectedCourseId
    );

    if (
      !scheduleForCourse ||
      !scheduleForCourse.group.discipline.course.timeSlot
    ) {
      return;
    }

    const timeSlot = scheduleForCourse.group.discipline.course.timeSlot;

    // Criar mapeamento de dias
    const daysOrder = [...timeSlot.daysOfWeek].sort(
      (a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)
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

    // Gerar slots de horário
    const slots = generateTimeSlots(
      timeSlot.startTime,
      timeSlot.endTime,
      timeSlot.lessonDurationMinutes
    );

    setGeneratedTimeSlots(slots);
  }, [selectedCourseId, schedules]);

  // Filtrar horários com base no curso selecionado
  const filteredSchedules = selectedCourseId
    ? schedules.filter(
        (item) => item.group.discipline.course.id === selectedCourseId
      )
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-12 w-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-2">Erro</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto mb-6 px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img
              className="w-[250px] h-max"
              src="logo_horizontal_branco.png"
              alt="Logo Class Manager"
            />
          </div>
          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            className="font-semibold bg-transparent hover:text-stone-200 hover:bg-transparent dark:hover:bg-transparent"
            onClick={toggleTheme}
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? (
              <Sun strokeWidth={2} />
            ) : (
              <Moon strokeWidth={2} />
            )}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Consulta Pública de Horários
        </h1>

        <div className="bg-card max-w-2xl mx-auto rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col gap-4">
            {/* Seletor de Curso */}
            <div>
              <div className="flex gap-2 align-center">
                <label className="block text-sm font-medium mb-2">
                  Selecione o Curso
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-gray-400 cursor-help">🛈</span>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>
                        Se o curso não aparece na lista, os horários ainda não
                        foram criados.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                onValueChange={(value) => setSelectedCourseId(Number(value))}
                value={selectedCourseId?.toString() || ''}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Informação do Semestre */}
            {filteredSchedules.length > 0 && (
              <div className="py-2 px-1 rounded-lg">
                <p className="text-sm font-medium">
                  {filteredSchedules[0]?.semester?.name?.replace('-', ' ') ||
                    ''}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabela de Horários */}
        <div className="bg-card rounded-lg shadow-md overflow-hidden">
          {courses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhum curso disponível para exibição
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhum horário encontrado para o curso selecionado
            </div>
          ) : (
            <ScheduleTable
              schedules={filteredSchedules}
              droppable={false}
              daysMap={daysMap}
              generatedTimeSlots={generatedTimeSlots}
              onDeleteSchedule={undefined}
              timeSlotsError={false}
              scheduleTableRef={null}
              showCourse={false}
            />
          )}
        </div>
      </div>
    </>
  );
}
