import { UserTypeEnum } from '@/utils/UserTypeEnum';
import { Header } from '@/components/header';
import { ScheduleView } from '@/components/views/ScheduleView';

export function PublicView() {
  // TODO: Só poderá ver os horários dos cursos, quando a montagem deles for finalizada, deve selecionar o curso que quer ver os horários.
  const userType = UserTypeEnum.PUBLIC;

  return (
    <div className="min-h-screen">
      <Header userType={userType} />
      <main className="container mx-auto px-4 py-8">
        <ScheduleView userType={userType} />
      </main>
    </div>
  );
}
