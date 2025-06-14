'use client';

import { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
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
import { Semester, Person, IScheduleItem } from '@/lib/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { formatTimeSlot, usePagination } from '@/utils/Helpers';

const TEACHER_DAYS_MAP: Record<string, string> = {
  MONDAY: 'Segunda',
  TUESDAY: 'Terça',
  WEDNESDAY: 'Quarta',
  THURSDAY: 'Quinta',
  FRIDAY: 'Sexta',
  SATURDAY: 'Sábado',
};

export default function ExportTeachersSchedules() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    null
  );
  const [teachersData, setTeachersData] = useState<Array<{
    teacher: Person;
    schedules: IScheduleItem[];
  }> | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedTimeSlots, setGeneratedTimeSlots] = useState<string[]>([]);

  const semestersPagination = usePagination();
  const teachersPagination = usePagination();

  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  // Buscar todos os semestres e cursos
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
        semestersPagination.setHasMore(
          response.data.page.number + 1 < response.data.page.totalPages
        );
        if (
          semestersPagination.page === 0 &&
          response.data.content.length > 0
        ) {
          setSelectedSemester(response.data.content[0]);
        }
      } catch (error) {
        console.error('Error fetching semesters:', error);
        toast.error('Erro ao carregar semestres');
      } finally {
        semestersPagination.setIsLoading(false);
      }
    };
    fetchSemesters();
  }, [semestersPagination.page]);

  // Buscar dados dos professores quando um semestre for selecionado
  useEffect(() => {
    if (!selectedSemester) return;

    const fetchTeachersData = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `/api/v1/users/teachers?page=${teachersPagination.page}&size=50`
        );
        const teachers = response.data.content || [];

        // Para cada teacher desta página, buscar schedules
        const teachersDataPromises = teachers.map(async (teacher: Person) => {
          try {
            const schedulesResponse = await api.get(
              `/api/v1/schedules/semester/${selectedSemester.id}/teacher/${teacher.id}`
            );
            const schedules = schedulesResponse.data;
            return { teacher, schedules };
          } catch (error) {
            console.error(
              `Error fetching schedules for teacher ${teacher.id}:`,
              error
            );
            return null;
          }
        });

        const teachersDataResults = await Promise.all(teachersDataPromises);
        const newTeachersData = teachersDataResults.filter(
          (data) => data !== null && data.schedules.length > 0
        );

        setTeachersData((prev) =>
          teachersPagination.page === 0
            ? newTeachersData
            : [...(prev || []), ...newTeachersData]
        );

        teachersPagination.setHasMore(
          response.data.page.number + 1 < response.data.page.totalPages
        );

        const allSchedules = [
          ...(teachersPagination.page === 0
            ? []
            : teachersData?.flatMap((td) => td.schedules) || []),
          ...newTeachersData.flatMap((td) => td.schedules),
        ];

        const slotsSet = new Set<string>();
        allSchedules.forEach((s: IScheduleItem) => {
          slotsSet.add(formatTimeSlot(s.startTime, s.endTime));
        });
        const uniqueSlots = Array.from(slotsSet).sort((a, b) => {
          const [aStart] = a.split('-');
          const [bStart] = b.split('-');
          return aStart.localeCompare(bStart);
        });
        setGeneratedTimeSlots(uniqueSlots);
      } catch (error) {
        console.error('Error fetching teachers data:', error);
        toast.error('Erro ao carregar dados dos professores');
      } finally {
        setLoading(false);
      }
    };
    fetchTeachersData();
  }, [selectedSemester, teachersPagination.page]);

  const handleSemesterChange = (semesterId: string) => {
    const semester = semesters.find((s) => s.id === Number(semesterId));
    setSelectedSemester(semester || null);
    teachersPagination.setPage(0);
  };

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `Horários dos Professores - ${selectedSemester?.name || ''}`,
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
    <div className="container mx-auto p-8">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <ArrowLeft
            onClick={() => navigate(-1)}
            className="w-8 h-8 mr-5 cursor-pointer transition-all hover:-translate-y-0.5"
          />
          <h1 className="text-2xl font-bold">
            Exportar Horários por Professor
          </h1>
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
              {/* Grupo Ativo */}
              {semesters.some((s) => s.status === 'ACTIVE') && (
                <SelectGroup>
                  <SelectLabel className="text-xs font-semibold text-gray-500 px-2 py-1">
                    Semestres Ativos
                  </SelectLabel>
                  {semesters
                    .filter((s) => s.status === 'ACTIVE')
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              )}

              {/* Grupo Finalizado */}
              {semesters.some((s) => s.status === 'FINALIZED') && (
                <SelectGroup>
                  <SelectLabel className="text-xs font-semibold text-gray-500 px-2 py-1">
                    Semestres Concluídos
                  </SelectLabel>
                  {semesters
                    .filter((s) => s.status === 'FINALIZED')
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              )}

              {/* Botão Carregar Mais */}
              {semestersPagination.hasMore && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    semestersPagination.loadMore();
                  }}
                  disabled={semestersPagination.isLoading}
                  variant="ghost"
                  className="w-full"
                >
                  {semestersPagination.isLoading ? (
                    <>
                      <Loader2 className="animate-spin" /> Carregando...
                    </>
                  ) : (
                    'Carregar mais'
                  )}
                </Button>
              )}
            </SelectContent>
          </Select>
          <Button onClick={handlePrint} disabled={!selectedSemester || loading}>
            <Download className="mr-2" /> Exportar PDF
          </Button>
        </div>
      </div>

      <div ref={contentRef}>
        {loading && (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin text-gray-500" size={32} />
          </div>
        )}
        {!loading &&
          selectedSemester &&
          teachersData &&
          teachersData.length > 0 && (
            <div className="space-y-12">
              {teachersData.map((teacherData, index) => (
                <div
                  key={teacherData.teacher.id}
                  className={`mb-10 ${index !== 0 ? 'page-break' : ''}`}
                >
                  <div className="mb-4">
                    <h2 className="text-xl font-bold">
                      {teacherData.teacher.name} {teacherData.teacher.surname}
                    </h2>
                    <p className="text-gray-600">
                      Semestre: {selectedSemester.name}
                    </p>
                  </div>
                  <ScheduleTable
                    schedules={teacherData.schedules}
                    droppable={false}
                    daysMap={TEACHER_DAYS_MAP}
                    generatedTimeSlots={generatedTimeSlots}
                    onDeleteSchedule={undefined}
                    timeSlotsError={false}
                    scheduleTableRef={null}
                    showCourse={true}
                  />
                </div>
              ))}
            </div>
          )}
        {!loading && selectedSemester && teachersPagination.hasMore && (
          <div className="text-center mt-8">
            <Button
              onClick={teachersPagination.loadMore}
              disabled={teachersPagination.isLoading}
            >
              {teachersPagination.isLoading ? (
                <>
                  <Loader2 strokeWidth={2} className="animate-spin" />{' '}
                  Carregando...
                </>
              ) : (
                'Carregar mais professores'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
