import { UserTypeEnum } from '@/utils/UserTypeEnum';
import { Header } from '../header';
import { ScheduleView } from '../ScheduleView';

export function AdminView() {
  // TODO: Criar a lógica de exibição para o Admin, pode fazer tudo no sistema.
  const userType = UserTypeEnum.ADMIN;

  return (
    <div className="min-h-screen">
      <Header userType={UserTypeEnum.ADMIN} />
      <main className="container mx-auto px-4 py-8">
        {/* Container principal usando grid */}
        <ScheduleView userType={userType} />
      </main>
    </div>
  );
}
