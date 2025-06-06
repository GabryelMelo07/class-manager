import {
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

import { UserTypeEnum } from '@/utils/UserTypeEnum';
import { Button } from '@/components/ui/button';
import { DynamicModal } from '@/components/dynamic-modal';
import UserForm from '@/components/forms/user-form';
import CourseForm from '@/components/forms/course-form';
import SemesterForm from '@/components/forms/semester-form';
import TimeSlotForm from '@/components/forms/timeslot-form';
import ClassRoomForm from '@/components/forms/class-room-form';
import DisciplineForm from '@/components/forms/discipline-form';

interface HeaderProps {
  userType: UserTypeEnum;
}

export function Header({ userType }: HeaderProps) {
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const isAdmin = userType === UserTypeEnum.ADMIN;

  const handleUserSubmit = async (data: any) => {
    try {
      const payload = {
        email: data['email-input-0'],
        password: data['password-input-0'],
        name: data['text-input-0'],
        surname: data['text-input-1'],
        roles: data['checkbox-group-0'],
      };

      const response = await api.post('/api/v1/auth/register', payload);

      if (response.status !== 201) {
        throw new Error('Erro ao criar usuário');
      }

      setOpenModal(null);
      toast.success('Usuário criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro ao criar usuário');
    }
  };

  const handleCourseSubmit = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        abbreviation: data.abbreviation,
        coordinatorId: data.coordinator,
      };

      const response = await api.post('/api/v1/courses', payload);

      if (response.status !== 201) {
        throw new Error('Erro ao criar curso');
      }

      setOpenModal(null);
      toast.success('Curso criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar curso:', error);
      toast.error('Erro ao criar curso');
    }
  };

  const handleSemesterSubmit = async (data: any) => {
    try {
      const payload = {
        startDate: new Date(data['date-0']).toISOString(),
      };

      const response = await api.post('/api/v1/semesters', payload);

      if (response.status !== 201) {
        throw new Error('Erro ao criar semestre');
      }

      setOpenModal(null);
      toast.success('Semestre criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar semestre:', error);
      toast.error('Erro ao criar semestre');
    }
  };

  const handleTimeSlotSubmit = async (data: any) => {
    try {
      const payload = {
        daysOfWeek: data.daysOfWeek,
        startTime: `${data.startTime.hours
          .toString()
          .padStart(2, '0')}:${data.startTime.minutes
          .toString()
          .padStart(2, '0')}`,
        endTime: `${data.endTime.hours
          .toString()
          .padStart(2, '0')}:${data.endTime.minutes
          .toString()
          .padStart(2, '0')}`,
        lessonDurationMinutes: data.lessonDurationMinutes,
        courseId: data.courseId,
      };

      const response = await api.post('/api/v1/time-slots', payload);

      if (response.status !== 200) {
        throw new Error('Erro ao criar ou atualizar horário de aula');
      }

      setOpenModal(null);
      toast.success(
        'Horário de aula do curso criado ou atualizado com sucesso!'
      );
    } catch (error) {
      console.error('Erro ao criar ou atualizar horário de aula:', error);
      toast.error('Erro ao criar ou atualizar horário de aula');
    }
  };

  const handleClassRoomSubmit = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        abbreviation: data.abbreviation,
        location: data.location,
      };

      const response = await api.post('/api/v1/class-rooms', payload);

      if (response.status !== 201) {
        throw new Error('Erro ao criar sala de aula');
      }

      setOpenModal(null);
      toast.success('Sala de aula criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar sala de aula:', error);
      toast.error('Erro ao criar sala de aula');
    }
  };

  const handleDisciplineSubmit = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        abbreviation: data.abbreviation,
        courseId: data.courseId,
        teacherId: data.teacherId,
      };

      const response = await api.post('/api/v1/disciplines', payload);

      if (response.status !== 201) {
        throw new Error('Erro ao criar disciplina');
      }

      setOpenModal(null);
      toast.success('Disciplina criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar disciplina:', error);
      toast.error('Erro ao criar disciplina');
    }
  };

  const handleOpenModal = (modalType: string) => {
    setDropdownOpen(false); // Fecha o dropdown
    setTimeout(() => {
      setOpenModal(modalType); // Abre o modal após um pequeno delay
    }, 100);
  };

  return (
    <>
      <header className="bg-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <CalendarIcon className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Class Manager</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Cadastros */}
              {isAdmin && (
                <div>
                  <DropdownMenu
                    open={dropdownOpen}
                    onOpenChange={setDropdownOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-md font-semibold hover:text-stone-300 hover:bg-transparent dark:hover:bg-transparent"
                      >
                        Cadastrar{' '}
                        {dropdownOpen ? (
                          <ChevronUp
                            className="font-semibold"
                            strokeWidth={2}
                          />
                        ) : (
                          <ChevronDown
                            className="font-semibold"
                            strokeWidth={2}
                          />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleOpenModal('user')}>
                        Usuário
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenModal('course')}
                      >
                        Curso
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenModal('timeSlots')}
                      >
                        Horário de aula
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenModal('semester')}
                      >
                        Semestre
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenModal('classRoom')}
                      >
                        Sala de Aula
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenModal('discipline')}
                      >
                        Disciplina
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Modals */}
                  <DynamicModal
                    trigger={<div style={{ display: 'none' }} />}
                    title="Cadastrar Usuário"
                    description="Preencha os dados para cadastrar um novo usuário"
                    open={openModal === 'user'}
                    onOpenChange={(open) => setOpenModal(open ? 'user' : null)}
                  >
                    <UserForm
                      onSubmit={handleUserSubmit}
                      onCancel={() => setOpenModal(null)}
                    />
                  </DynamicModal>

                  <DynamicModal
                    trigger={<div style={{ display: 'none' }} />}
                    title="Cadastrar Curso"
                    description="Preencha os dados para cadastrar um novo curso"
                    open={openModal === 'course'}
                    onOpenChange={(open) =>
                      setOpenModal(open ? 'course' : null)
                    }
                  >
                    <CourseForm
                      onSubmit={handleCourseSubmit}
                      onCancel={() => setOpenModal(null)}
                      isOpen={openModal === 'course'}
                    />
                  </DynamicModal>

                  <DynamicModal
                    trigger={<div style={{ display: 'none' }} />}
                    title="Cadastrar Horários de Aula"
                    description="Preencha os dados para os horários de aula do curso"
                    open={openModal === 'timeSlots'}
                    onOpenChange={(open) =>
                      setOpenModal(open ? 'timeSlots' : null)
                    }
                  >
                    <TimeSlotForm
                      onSubmit={handleTimeSlotSubmit}
                      onCancel={() => setOpenModal(null)}
                    />
                  </DynamicModal>

                  <DynamicModal
                    trigger={<div style={{ display: 'none' }} />}
                    title="Cadastrar Semestre"
                    description="Preencha os dados para cadastrar um novo semestre"
                    open={openModal === 'semester'}
                    onOpenChange={(open) =>
                      setOpenModal(open ? 'semester' : null)
                    }
                  >
                    <SemesterForm
                      onSubmit={handleSemesterSubmit}
                      onCancel={() => setOpenModal(null)}
                    />
                  </DynamicModal>

                  <DynamicModal
                    trigger={<div style={{ display: 'none' }} />}
                    title="Cadastrar Sala de Aula"
                    description="Preencha os dados para cadastrar uma nova sala de aula"
                    open={openModal === 'classRoom'}
                    onOpenChange={(open) =>
                      setOpenModal(open ? 'classRoom' : null)
                    }
                  >
                    <ClassRoomForm
                      onSubmit={handleClassRoomSubmit}
                      onCancel={() => setOpenModal(null)}
                    />
                  </DynamicModal>

                  <DynamicModal
                    trigger={<div style={{ display: 'none' }} />}
                    title="Cadastrar Disciplina"
                    description="Preencha os dados para cadastrar uma nova disciplina"
                    open={openModal === 'discipline'}
                    onOpenChange={(open) =>
                      setOpenModal(open ? 'discipline' : null)
                    }
                  >
                    <DisciplineForm
                      onSubmit={handleDisciplineSubmit}
                      onCancel={() => setOpenModal(null)}
                      isOpen={openModal === 'discipline'}
                    />
                  </DynamicModal>
                </div>
              )}

              {/* Logout Button */}
              {userType !== UserTypeEnum.PUBLIC && (
                <Button
                  variant="ghost"
                  className="font-semibold text-md hover:text-stone-300 hover:bg-transparent dark:hover:bg-transparent"
                  onClick={logout}
                >
                  Sair
                  <LogOut className="ml-2" strokeWidth={2} />
                </Button>
              )}

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
        </div>
      </header>
    </>
  );
}
