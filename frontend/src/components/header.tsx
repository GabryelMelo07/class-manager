import { Button } from '@/components/ui/button';
import { clearTokens } from '@/lib/auth';
import { UserTypeEnum } from '@/utils/UserTypeEnum';
import {
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  LogOut,
  Moon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { DynamicModal } from './dynamic-modal';
import UserForm from '@/components/forms/user-form';
import CourseForm from '@/components/forms/course-form';

interface HeaderProps {
  userType: UserTypeEnum;
}

export function Header({ userType }: HeaderProps) {
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleUserSubmit = (data: any) => {
    console.log('Dados do usuário:', data);
    // Aqui você faria a requisição para salvar o usuário
    setOpenModal(null);
  };

  const handleCourseSubmit = (data: any) => {
    console.log('Dados do curso:', data);
    // Aqui você faria a requisição para salvar o curso
    setOpenModal(null);
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
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  {/* TODO: Remover o background ao fazer hover e adicionar underline */}
                  <Button
                    variant="ghost"
                    className="text-md font-semibold hover:bg-transparent hover:text-stone-300"
                  >
                    Cadastros{' '}
                    {dropdownOpen ? (
                      <ChevronUp className="font-semibold" strokeWidth={2} />
                    ) : (
                      <ChevronDown className="font-semibold" strokeWidth={2} />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white">
                  <DropdownMenuItem onClick={() => handleOpenModal('user')}>
                    Usuário
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleOpenModal('course')}>
                    Curso
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
                onOpenChange={(open) => setOpenModal(open ? 'course' : null)}
              >
                <CourseForm
                  onSubmit={handleCourseSubmit}
                  onCancel={() => setOpenModal(null)}
                />
              </DynamicModal>

              {userType !== UserTypeEnum.PUBLIC && (
                <Button
                  variant="ghost"
                  className="font-semibold text-md hover:bg-transparent hover:text-stone-300"
                  onClick={() => {
                    clearTokens();
                    window.location.reload();
                  }}
                >
                  Sair
                  <LogOut className="ml-2" strokeWidth={2} />
                </Button>
              )}

              <Button
                variant="ghost"
                className="font-semibold bg-transparent hover:bg-transparent hover:text-stone-200"
              >
                <Moon strokeWidth={2} />
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
