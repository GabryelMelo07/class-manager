// app/export/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Moon, Sun } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ScheduleTable from '@/components/schedule-table';
import { Loader } from 'lucide-react';
import api from '@/lib/api';
import { Semester } from '@/lib/types';
import { toast } from 'sonner';
import { DAY_ORDER, generateTimeSlots } from '@/utils/Helpers';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

export default function ExportSchedules() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    null
  );
  const [coursesData, setCoursesData] = useState<Array<{
    course: any;
    schedules: any[];
    daysMap: Record<string, string>;
    generatedTimeSlots: string[];
  }> | null>(null);
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const contentRef = useRef<HTMLDivElement>(null);

  // Buscar todos os semestres
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await api.get('/api/v1/semesters');
        setSemesters(response.data.content || []);
      } catch (error) {
        console.error('Error fetching semesters:', error);
        toast.error('Erro ao carregar semestres');
      }
    };

    fetchSemesters();
  }, []);

  // Buscar dados dos cursos quando um semestre for selecionado
  useEffect(() => {
    if (!selectedSemester) return;

    const fetchCoursesData = async () => {
      setLoading(true);
      try {
        // Buscar todos os cursos
        const coursesResponse = await api.get('/api/v1/courses');
        const courses = coursesResponse.data;

        // Para cada curso, buscar horários e informações de timeslots
        const coursesDataPromises = courses.map(async (course: any) => {
          try {
            // Buscar horários do curso no semestre selecionado
            const schedulesResponse = await api.get(
              `/api/v1/schedules?courseId=${course.id}&semesterId=${selectedSemester.id}`
            );
            const schedules = schedulesResponse.data;

            // Buscar timeslots do curso
            const timeSlotsResponse = await api.get(
              `/api/v1/time-slots/${course.id}`
            );
            const timeSlotsData = timeSlotsResponse.data;

            // Gerar daysMap (mapeamento dos dias da semana)
            const daysOrder = timeSlotsData.daysOfWeek.sort(
              (a: string, b: string) => {
                return DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b);
              }
            );

            const daysMap = daysOrder.reduce(
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

            // Gerar time slots
            const generatedTimeSlots = generateTimeSlots(
              timeSlotsData.startTime,
              timeSlotsData.endTime,
              timeSlotsData.lessonDurationMinutes
            );

            return {
              course,
              schedules,
              daysMap,
              generatedTimeSlots,
            };
          } catch (error) {
            const { data, status } = error.response;

            if (
              data.status !== 'NOT_FOUND' &&
              status !== 404 &&
              !data.error.includes('Time Slot not found with courseId')
            ) {
              console.error(
                `Error fetching data for course ${course.id}:`,
                error
              );
            }

            return null;
          }
        });

        const coursesDataResults = await Promise.all(coursesDataPromises);
        setCoursesData(
          coursesDataResults.filter((data) => data !== null) as any
        );
      } catch (error) {
        console.error('Error fetching courses data:', error);
        toast.error('Erro ao carregar dados dos cursos');
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesData();
  }, [selectedSemester]);

  const handleSemesterChange = (semesterId: string) => {
    const semester = semesters.find((s) => s.id === Number(semesterId));
    setSelectedSemester(semester || null);
  };

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `Horários - ${selectedSemester?.name || ''}`,
    pageStyle: `
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .schedule-item { break-inside: avoid; }
        .page-break {
          page-break-before: always;
          break-before: page;
        }
      }
    `,
  });

  return (
    <>
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto mb-6 px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <ArrowLeft
              onClick={() => {
                navigate(-1);
              }}
              className="w-8 h-8 mr-5 cursor-pointer transition-all hover:-translate-y-0.5"
            />
            <img
              className="w-[250px] h-max"
              src="logo_horizontal_branco.png"
              alt="Logo Class Manager"
            />
          </div>
          <div className="flex items-center gap-4">
            <Select
              onValueChange={handleSemesterChange}
              value={selectedSemester?.id?.toString() || ''}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione o semestre" />
              </SelectTrigger>
              <SelectContent>
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

                <SelectGroup>
                  <SelectLabel className="text-xs font-semibold text-gray-500 px-2 py-1">
                    Semestres Concluídos
                  </SelectLabel>
                  {semesters
                    .filter((semester) => semester.status === 'FINALIZED')
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
              </SelectContent>
            </Select>

            <Button
              onClick={handlePrint}
              disabled={!selectedSemester || loading}
              variant="secondary"
            >
              <Download className="mr-2" /> Exportar PDF
            </Button>

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
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold pb-4">Exportar Horários</h1>
        <div ref={contentRef}>
          {loading && (
            <div className="flex justify-center py-12">
              <Loader className="animate-spin text-gray-500" size={32} />
            </div>
          )}

          {!loading &&
            selectedSemester &&
            coursesData &&
            coursesData.length > 0 && (
              <div className="space-y-12">
                {coursesData.map((courseData, index) => (
                  <div
                    key={courseData.course.id}
                    className={`mb-10 ${index !== 0 ? 'page-break' : ''}`}
                  >
                    <div className="mb-4">
                      <h2 className="text-xl font-bold">
                        {courseData.course.name}
                      </h2>
                      <p className="text-gray-600">
                        Semestre: {selectedSemester.name}
                      </p>
                    </div>

                    <ScheduleTable
                      schedules={courseData.schedules}
                      droppable={false}
                      daysMap={courseData.daysMap}
                      generatedTimeSlots={courseData.generatedTimeSlots}
                      onDeleteSchedule={undefined}
                      timeSlotsError={false}
                      scheduleTableRef={null}
                    />
                  </div>
                ))}
              </div>
            )}

          {!loading &&
            selectedSemester &&
            coursesData &&
            coursesData.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Nenhum horário encontrado para este semestre
                </p>
              </div>
            )}

          {!loading && !selectedSemester && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Selecione um semestre para visualizar os horários
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
