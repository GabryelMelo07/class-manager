import { Button } from '@/components/ui/button';
import { clearTokens } from '@/lib/auth';
import { UserTypeEnum } from '@/utils/UserTypeEnum';
import { CalendarIcon, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GenericModal } from './generic-modal';
import { useState } from 'react';

interface HeaderProps {
  userType: UserTypeEnum;
}

export function Header({ userType }: HeaderProps) {
  const [openModal, setOpenModal] = useState<
    null | 'user' | 'course' | 'subject' | 'schedule'
  >(null);

  const handleSave = () => {
    // Lógica de salvamento...
    setOpenModal(null); // ← Usando a função corretamente
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {/* TODO: Remover o background ao fazer hover e adicionar underline */}
                  <Button variant="ghost">Cadastros</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white">
                  <DropdownMenuItem onClick={() => setOpenModal('user')}>
                    Usuário
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setOpenModal('course')}>
                    Curso
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setOpenModal('subject')}>
                    Disciplina
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setOpenModal('schedule')}>
                    Horários por curso
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {userType !== UserTypeEnum.PUBLIC && (
                <Button
                  variant="outline"
                  className="bg-white text-indigo-600 hover:bg-indigo-50"
                  onClick={() => {
                    clearTokens();
                    window.location.reload();
                  }}
                >
                  Logout
                  <LogOut className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <GenericModal
        title="Cadastrar Usuário"
        isOpen={openModal === 'user'}
        onClose={() => setOpenModal(null)}
        onSave={handleSave}
      >
        <p>Cadastro de usuário</p>
      </GenericModal>

      <GenericModal
        title="Cadastrar Curso"
        isOpen={openModal === 'course'}
        onClose={() => setOpenModal(null)}
        onSave={handleSave}
      >
        <p>Cadastro de curso</p>
      </GenericModal>

      <GenericModal
        title="Cadastrar Disciplina"
        isOpen={openModal === 'subject'}
        onClose={() => setOpenModal(null)}
        onSave={handleSave}
      >
        <p>Cadastro de disciplina</p>
      </GenericModal>

      <GenericModal
        title="Cadastrar Horários por Curso"
        isOpen={openModal === 'schedule'}
        onClose={() => setOpenModal(null)}
        onSave={handleSave}
      >
        <p>Cadastro de horários por curso</p>
      </GenericModal>
    </>
  );
}
