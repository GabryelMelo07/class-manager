'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Legend,
} from 'recharts';

import { Users, Home, GraduationCap, BookOpen, ArrowLeft } from 'lucide-react';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import api from '@/lib/api';
import { toast } from 'sonner';
import { Semester } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#E4B7E5', '#B288C0', '#C4B5FD', '#7E5A9B', '#9A48D0'];

const chartConfig: ChartConfig = {
  desktop: { label: 'Desktop', color: 'var(--chart-1)' },
};

type UserResponseDto = {
  id: string;
  email: string;
  name: string;
  surname: string;
  roles: string[];
};

type TeacherWorkloadReport = { teacherName: string; totalHours: number };

type CourseDisciplineWorkloadReport = {
  courseName: string;
  disciplineName: string;
  totalHours: number;
};
type ClassRoomOccupationReport = {
  classRoomName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  groupName: string;
  disciplineName: string;
};

export default function DashboardPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    null
  );
  const [teacherWorkload, setTeacherWorkload] = useState<
    TeacherWorkloadReport[]
  >([]);
  const [unassignedTeachers, setUnassignedTeachers] = useState<
    UserResponseDto[]
  >([]);
  const [courseDisciplineWorkload, setCourseDisciplineWorkload] = useState<
    CourseDisciplineWorkloadReport[]
  >([]);
  const [classRoomOccupation, setClassRoomOccupation] = useState<
    ClassRoomOccupationReport[]
  >([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await api.get('/api/v1/semesters?page=0&size=20');
        setSemesters(response.data.content || []);
        const activeSemester = response.data.content.find(
          (s: Semester) => s.status === 'ACTIVE'
        );
        setSelectedSemester(activeSemester || response.data.content[0]);
      } catch (error) {
        toast.error('Erro ao carregar semestres');
      }
    };
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (!selectedSemester) return;
    const fetchDashboardData = async () => {
      try {
        const [workloadRes, unassignedRes, courseWorkloadRes, occupationRes] =
          await Promise.all([
            api.get(
              `/api/v1/dashboard/teacher-workload?semesterId=${selectedSemester.id}`
            ),
            api.get(
              `/api/v1/dashboard/unassigned-teachers?semesterId=${selectedSemester.id}`
            ),
            api.get(
              `/api/v1/dashboard/course-discipline-workload?semesterId=${selectedSemester.id}`
            ),
            api.get(
              `/api/v1/dashboard/class-room-occupation?semesterId=${selectedSemester.id}`
            ),
          ]);
        setTeacherWorkload(workloadRes.data);
        setUnassignedTeachers(unassignedRes.data);
        setCourseDisciplineWorkload(courseWorkloadRes.data);
        setClassRoomOccupation(occupationRes.data);
      } catch {
        toast.error('Erro ao carregar dados do dashboard');
      }
    };
    fetchDashboardData();
  }, [selectedSemester]);

  const courseWorkloadData = courseDisciplineWorkload.reduce(
    (acc: any[], curr) => {
      const existing = acc.find((item) => item.name === curr.courseName);
      if (existing) existing.value += curr.totalHours;
      else acc.push({ name: curr.courseName, value: curr.totalHours });
      return acc;
    },
    []
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <ArrowLeft
              onClick={() => navigate(-1)}
              className="w-8 h-8 mr-5 cursor-pointer transition-all hover:-translate-y-0.5"
            />
            Dashboard Acadêmico
          </h1>
          <Select
            value={selectedSemester?.id.toString() || ''}
            onValueChange={(id) =>
              setSelectedSemester(
                semesters.find((s) => s.id === Number(id)) || null
              )
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o semestre" />
            </SelectTrigger>
            <SelectContent>
              {['ACTIVE', 'FINALIZED'].map((status) => (
                <SelectGroup key={status}>
                  <SelectLabel>
                    {status === 'ACTIVE'
                      ? 'Semestres Ativos'
                      : 'Semestres Concluídos'}
                  </SelectLabel>
                  {semesters
                    .filter((s) => s.status === status)
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 grid gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <h3 className="text-md font-medium">Total de Professores</h3>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {unassignedTeachers.length + teacherWorkload.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  <h3 className="text-md font-medium">Cursos Ativos</h3>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{courseWorkloadData.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <h3 className="text-md font-medium">Disciplinas</h3>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {courseDisciplineWorkload.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  <h3 className="text-md font-medium">Salas de Aula</h3>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {
                  [...new Set(classRoomOccupation.map((i) => i.classRoomName))]
                    .length
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* GRÁFICOS LADO A LADO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="h-full overflow-auto">
            <CardHeader>
              <CardTitle>Carga Horária dos Professores</CardTitle>
              <CardDescription>
                Ordenado por carga horária decrescente
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-96">
              {teacherWorkload.length > 0 ? (
                <ChartContainer config={chartConfig}>
                  <BarChart
                    accessibilityLayer
                    data={[...teacherWorkload].sort(
                      (a, b) => b.totalHours - a.totalHours
                    )}
                    layout="vertical"
                    margin={{ right: 16 }}
                  >
                    <CartesianGrid horizontal={false} />
                    <YAxis
                      dataKey="teacherName"
                      type="category"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                      hide
                    />
                    <XAxis dataKey="totalHours" type="number" hide />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Bar
                      dataKey="totalHours"
                      fill="var(--color-desktop)"
                      radius={4}
                      name="Horas"
                    >
                      <LabelList
                        dataKey="teacherName"
                        position="insideLeft"
                        offset={8}
                        className="fill-(--color-label)"
                        fontSize={12}
                      />
                      <LabelList
                        dataKey="totalHours"
                        position="right"
                        formatter={(value: string) =>
                          parseFloat(value).toFixed(1)
                        }
                        offset={8}
                        className="fill-foreground"
                        fontSize={12}
                      />
                      <Legend />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle>Carga Horária por Curso</CardTitle>
              <CardDescription>
                Distribuição das horas por curso
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {courseWorkloadData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={courseWorkloadData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${
                          name.length > 15 ? name.slice(0, 15) + '…' : name
                        }: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {courseWorkloadData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: string) => [
                        `${parseFloat(value).toFixed(1)} horas`,
                        'Horas',
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* TABELAS */}
        <Card>
          <CardHeader>
            <CardTitle>Professores Não Alocados</CardTitle>
            <CardDescription>
              Total: {unassignedTeachers.length} professores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {unassignedTeachers.length === 0 ? (
              <div className="text-muted-foreground text-center">
                Nenhum dado disponível
              </div>
            ) : (
              <div className="overflow-auto max-h-72">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Nome</th>
                      <th className="text-left">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unassignedTeachers.map((teacher, index) => (
                      <tr key={index} className="border-t">
                        <td>
                          {teacher.name} {teacher.surname}
                        </td>
                        <td>{teacher.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ocupação de Salas de Aula</CardTitle>
            <CardDescription>
              Total de {classRoomOccupation.length} agendamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classRoomOccupation.length === 0 ? (
              <div className="text-muted-foreground text-center">
                Nenhum dado disponível
              </div>
            ) : (
              <div className="max-h-96 overflow-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Sala</th>
                      <th className="text-left">Dia</th>
                      <th className="text-left">Horário</th>
                      <th className="text-left">Turma</th>
                      <th className="text-left">Disciplina</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classRoomOccupation.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td>{item.classRoomName}</td>
                        <td>{item.dayOfWeek}</td>
                        <td>
                          {item.startTime} - {item.endTime}
                        </td>
                        <td>{item.groupName}</td>
                        <td>{item.disciplineName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
