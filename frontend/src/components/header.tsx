import {
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  LogOut,
  Moon,
  Pencil,
  Sun,
  Trash2,
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
import { Skeleton } from '@/components/ui/skeleton';

interface HeaderProps {
  userType: UserTypeEnum;
}

export function Header({ userType }: HeaderProps) {
  const isAdmin = userType === UserTypeEnum.ADMIN;
  const { logout } = useAuth();
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [cadastrarOpen, setCadastrarOpen] = useState(false);
  const [editarOpen, setEditarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [entityType, setEntityType] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialFormData, setInitialFormData] = useState<any>(null);

  const fetchItems = async (entity: string, page: number = 0) => {
    const isFirstPage = page === 0;
    if (isFirstPage) setLoading(true);
    else setLoadingMore(true);

    try {
      const endpoint = getEntityEndpoint(entity);
      let url = `/api/v1/${endpoint}`;

      if (entity === 'disciplines') {
        url += '/all';
      }

      const response = await api.get(url, {
        params: { page, size: 10 },
      });

      const responseData = response.data;
      let itemsData: any[] = [];
      let pageNumber = 0;
      let totalPagesCount = 1;

      // Resposta direta (não paginada)
      if (Array.isArray(responseData)) {
        itemsData = responseData;
      } else if (responseData && Array.isArray(responseData.content)) {
        // Resposta paginada
        itemsData = responseData.content;
        pageNumber = responseData.number || 0;
        totalPagesCount = responseData.totalPages || 1;
      } else {
        console.error('Formato de resposta inesperado:', responseData);
        itemsData = [];
      }

      setItems((prev) => (isFirstPage ? itemsData : [...prev, ...itemsData]));
      setCurrentPage(pageNumber);
      setTotalPages(totalPagesCount);
    } catch (error) {
      toast.error(`Erro ao buscar ${entity}`);
    } finally {
      if (isFirstPage) setLoading(false);
      else setLoadingMore(false);
    }
  };

  const getEntityExibitionName = (type: string) => {
    const endpoints: Record<string, string> = {
      user: 'Usuários',
      course: 'Cursos',
      timeSlots: 'Horários de Aula do Curso',
      semester: 'Semestres',
      classRoom: 'Salas de Aula',
      discipline: 'Disciplinas',
      group: 'Turmas',
    };
    return endpoints[type] || type;
  };

  // Mapeia tipos para endpoints
  const getEntityEndpoint = (type: string) => {
    const endpoints: Record<string, string> = {
      user: 'auth/users',
      course: 'courses',
      timeSlots: 'time-slots',
      semester: 'semesters',
      classRoom: 'class-rooms',
      discipline: 'disciplines',
      group: 'groups',
    };
    return endpoints[type] || type;
  };

  // Abre modal de cadastro
  const handleOpenCadastrarModal = (modalType: string) => {
    setCadastrarOpen(false);
    setEditingId(null);
    setInitialFormData(null);
    setTimeout(() => setOpenModal(modalType), 100);
  };

  // Abre modal de edição (lista)
  const handleOpenEditarModal = (modalType: string) => {
    setEntityType(modalType);
    setEditarOpen(false);
    setItems([]);
    setCurrentPage(0);

    setTimeout(() => {
      setOpenModal('edit-list');
      fetchItems(getEntityEndpoint(modalType));
    }, 100);
  };

  // Abre formulário de edição
  const handleEditItem = (item: any) => {
    setInitialFormData(item);
    setEditingId(item.id);
    setOpenModal(`edit-${entityType}`);
  };

  // Exclui item
  const handleDeleteItem = async (id: string) => {
    if (!entityType) return;

    try {
      const endpoint = getEntityEndpoint(entityType);
      await api.delete(`/api/v1/${endpoint}/${id}`);

      // Atualiza lista
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success('Item excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir item');
    }
  };

  const handleUserSubmit = async (data: any) => {
    try {
      const payload = {
        email: data['email-input-0'],
        ...(!editingId && { password: data['password-input-0'] }),
        name: data['text-input-0'],
        surname: data['text-input-1'],
        roles: data['checkbox-group-0'],
      };

      if (editingId) {
        await api.patch(`/api/v1/users/${editingId}`, payload);
      } else {
        await api.post('/api/v1/auth/register', payload);
      }

      setOpenModal(null);
      toast.success(
        editingId
          ? 'Usuário atualizado com sucesso!'
          : 'Usuário criado com sucesso!'
      );
    } catch (error) {
      console.error('Erro:', error);
      toast.error(
        editingId ? 'Erro ao atualizar usuário' : 'Erro ao criar usuário'
      );
    } finally {
      setEditingId(null);
    }
  };

  const handleCourseSubmit = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        abbreviation: data.abbreviation,
        coordinatorId: data.coordinator,
      };

      if (editingId) {
        await api.patch(`/api/v1/courses/${editingId}`, payload);
      } else {
        await api.post('/api/v1/courses', payload);
      }

      setOpenModal(null);
      toast.success('Curso criado com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error(
        editingId ? 'Erro ao atualizar curso' : 'Erro ao criar curso'
      );
    } finally {
      setEditingId(null);
    }
  };

  const handleSemesterSubmit = async (data: any) => {
    try {
      const payload = {
        startDate: new Date(data['date-0']).toISOString(),
      };

      if (editingId) {
        await api.patch(`/api/v1/semesters/${editingId}`, payload);
      } else {
        await api.post('/api/v1/semesters', payload);
      }

      setOpenModal(null);
      toast.success(
        editingId
          ? 'Semestre atualizado com sucesso!'
          : 'Semestre criado com sucesso!'
      );
    } catch (error) {
      console.error('Erro:', error);
      toast.error(
        editingId ? 'Erro ao atualizar semestre' : 'Erro ao criar semestre'
      );
    } finally {
      setEditingId(null);
    }
  };

  const handleTimeSlotSubmit = async (data: any) => {
    try {
      const payload: any = {
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
      };

      if (!editingId) {
        payload.courseId = data.courseId;
      }

      if (editingId) {
        await api.patch(`/api/v1/time-slots/${editingId}`, payload);
      } else {
        await api.post('/api/v1/time-slots', payload);
      }

      setOpenModal(null);
      toast.success(
        editingId
          ? 'Horário de aula do curso atualizado com sucesso!'
          : 'Horário de aula do curso criado com sucesso!'
      );
    } catch (error) {
      console.error('Erro:', error);
      toast.error(
        editingId
          ? 'Erro ao atualizar horário de aula'
          : 'Erro ao criar horário de aula'
      );
    } finally {
      setEditingId(null);
    }
  };

  const handleClassRoomSubmit = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        abbreviation: data.abbreviation,
        location: data.location,
      };

      if (editingId) {
        await api.patch(`/api/v1/class-rooms/${editingId}`, payload);
      } else {
        await api.post('/api/v1/class-rooms', payload);
      }

      setOpenModal(null);
      toast.success(
        editingId
          ? 'Sala de aula atualizada com sucesso!'
          : 'Sala de aula criada com sucesso!'
      );
    } catch (error) {
      console.error('Erro:', error);
      toast.error(
        editingId
          ? 'Erro ao atualizar sala de aula'
          : 'Erro ao criar sala de aula'
      );
    } finally {
      setEditingId(null);
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

      if (editingId) {
        await api.patch(`/api/v1/disciplines/${editingId}`, payload);
      } else {
        await api.post('/api/v1/disciplines', payload);
      }

      setOpenModal(null);
      toast.success(
        editingId
          ? 'Disciplina atualizada com sucesso!'
          : 'Disciplina criada com sucesso!'
      );
    } catch (error) {
      console.error('Erro:', error);
      toast.error(
        editingId ? 'Erro ao atualizar disciplina' : 'Erro ao criar disciplina'
      );
    } finally {
      setEditingId(null);
    }
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
                  {/* Cadastrar Dropdown */}
                  <DropdownMenu
                    open={cadastrarOpen}
                    onOpenChange={setCadastrarOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-md font-semibold hover:text-stone-300 hover:bg-transparent dark:hover:bg-transparent"
                      >
                        Cadastrar{' '}
                        {cadastrarOpen ? (
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
                      <DropdownMenuItem
                        onClick={() => handleOpenCadastrarModal('user')}
                      >
                        Usuário
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenCadastrarModal('course')}
                      >
                        Curso
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenCadastrarModal('timeSlots')}
                      >
                        Horário de aula
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenCadastrarModal('semester')}
                      >
                        Semestre
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenCadastrarModal('classRoom')}
                      >
                        Sala de Aula
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenCadastrarModal('discipline')}
                      >
                        Disciplina
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {/* Editar dropdown */}
                  <DropdownMenu open={editarOpen} onOpenChange={setEditarOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-md font-semibold hover:text-stone-300 hover:bg-transparent dark:hover:bg-transparent"
                      >
                        Editar{' '}
                        {editarOpen ? (
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
                      <DropdownMenuItem
                        onClick={() => handleOpenEditarModal('user')}
                      >
                        Usuário
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenEditarModal('course')}
                      >
                        Curso
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenEditarModal('timeSlots')}
                      >
                        Horário de aula
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenEditarModal('semester')}
                      >
                        Semestre
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenEditarModal('classRoom')}
                      >
                        Sala de Aula
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenEditarModal('discipline')}
                      >
                        Disciplina
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenEditarModal('group')}
                      >
                        Turma
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Modal para exibir os registros para edição */}
                  <DynamicModal
                    trigger={<div hidden />}
                    title={`Editar ${getEntityExibitionName(entityType)}`}
                    description="Editar ou deletar registros"
                    open={openModal === 'edit-list'}
                    onOpenChange={(open) => !open && setOpenModal(null)}
                  >
                    <div className="max-h-[60vh] overflow-y-auto custom-scroll-bar px-2">
                      {loading ? (
                        <div className="space-y-3">
                          {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                          ))}
                        </div>
                      ) : items.length > 0 ? (
                        <>
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between items-center p-3 border-b"
                            >
                              <div>
                                <p className="font-medium">
                                  {item.name ||
                                    item.email ||
                                    item.title ||
                                    item.course?.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {item.surname ||
                                    item.abbreviation ||
                                    item.course?.abbreviation}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="cursor-pointer"
                                  onClick={() => handleEditItem(item)}
                                >
                                  <Pencil size={16} />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="cursor-pointer bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                          ))}

                          {currentPage < totalPages - 1 && (
                            <div className="mt-4 text-center">
                              <Button
                                variant="outline"
                                onClick={() =>
                                  fetchItems(entityType!, currentPage + 1)
                                }
                                disabled={loadingMore}
                              >
                                {loadingMore
                                  ? 'Carregando...'
                                  : 'Carregar Mais'}
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-center py-4">
                          Nenhum registro encontrado
                        </p>
                      )}
                    </div>
                  </DynamicModal>

                  {/* Modals */}
                  <DynamicModal
                    trigger={<div hidden />}
                    title={editingId ? 'Editar Usuário' : 'Cadastrar Usuário'}
                    description={
                      editingId
                        ? 'Atualize os dados do usuário'
                        : 'Preencha os dados para cadastrar um novo usuário'
                    }
                    open={openModal === 'user' || openModal === 'edit-user'}
                    onOpenChange={(open) => !open && setOpenModal(null)}
                    initialData={initialFormData}
                  >
                    <UserForm
                      onSubmit={handleUserSubmit}
                      onCancel={() => setOpenModal(null)}
                      isEditMode={!!editingId}
                    />
                  </DynamicModal>
                  <DynamicModal
                    trigger={<div hidden />}
                    title={editingId ? 'Editar Curso' : 'Cadastrar Curso'}
                    description={
                      editingId
                        ? 'Atualize os dados do curso'
                        : 'Preencha os dados para cadastrar um novo curso'
                    }
                    open={openModal === 'course' || openModal === 'edit-course'}
                    onOpenChange={(open) => !open && setOpenModal(null)}
                    initialData={initialFormData}
                  >
                    <CourseForm
                      onSubmit={handleCourseSubmit}
                      onCancel={() => setOpenModal(null)}
                      isEditMode={!!editingId}
                    />
                  </DynamicModal>
                  <DynamicModal
                    trigger={<div hidden />}
                    title={
                      editingId
                        ? 'Editar Horários de Aula'
                        : 'Cadastrar Horários de Aula'
                    }
                    description={
                      editingId
                        ? 'Atualize os dados do horário de aula'
                        : 'Preencha os dados para cadastrar um novo horário de aula'
                    }
                    open={
                      openModal === 'timeSlots' ||
                      openModal === 'edit-timeSlots'
                    }
                    onOpenChange={(open) => !open && setOpenModal(null)}
                    initialData={initialFormData}
                  >
                    <TimeSlotForm
                      onSubmit={handleTimeSlotSubmit}
                      onCancel={() => setOpenModal(null)}
                      isEditMode={!!editingId}
                    />
                  </DynamicModal>
                  <DynamicModal
                    trigger={<div hidden />}
                    title={editingId ? 'Editar Semestre' : 'Cadastrar Semestre'}
                    description={
                      editingId
                        ? 'Atualize os dados do semestre'
                        : 'Preencha os dados para cadastrar um novo semestre'
                    }
                    open={
                      openModal === 'semester' || openModal === 'edit-semester'
                    }
                    onOpenChange={(open) => !open && setOpenModal(null)}
                    initialData={initialFormData}
                  >
                    <SemesterForm
                      onSubmit={handleSemesterSubmit}
                      onCancel={() => setOpenModal(null)}
                      isEditMode={!!editingId}
                    />
                  </DynamicModal>
                  <DynamicModal
                    trigger={<div hidden />}
                    title={
                      editingId
                        ? 'Editar Sala de Aula'
                        : 'Cadastrar Sala de Aula'
                    }
                    description={
                      editingId
                        ? 'Atualize os dados da sala de aula'
                        : 'Preencha os dados para cadastrar uma nova sala de aula'
                    }
                    open={
                      openModal === 'classRoom' ||
                      openModal === 'edit-classRoom'
                    }
                    onOpenChange={(open) => !open && setOpenModal(null)}
                    initialData={initialFormData}
                  >
                    <ClassRoomForm
                      onSubmit={handleClassRoomSubmit}
                      onCancel={() => setOpenModal(null)}
                      isEditMode={!!editingId}
                    />
                  </DynamicModal>
                  <DynamicModal
                    trigger={<div hidden />}
                    title={
                      editingId ? 'Editar Disciplina' : 'Cadastrar Disciplina'
                    }
                    description={
                      editingId
                        ? 'Atualize os dados da disciplina'
                        : 'Preencha os dados para cadastrar uma nova disciplina'
                    }
                    open={
                      openModal === 'discipline' ||
                      openModal === 'edit-discipline'
                    }
                    onOpenChange={(open) => !open && setOpenModal(null)}
                    initialData={initialFormData}
                  >
                    <DisciplineForm
                      onSubmit={handleDisciplineSubmit}
                      onCancel={() => setOpenModal(null)}
                      isEditMode={!!editingId}
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
