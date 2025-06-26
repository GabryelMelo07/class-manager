import { UserTypeEnum } from '@/utils/UserTypeEnum';
import { Header } from '@/components/header';
import { ScheduleView } from '@/components/views/ScheduleView';

export function CoordinatorView() {
  const userType = UserTypeEnum.COORDINATOR;

  return (
    <div className="min-h-screen">
      <Header userType={userType} />
      <main className="container mx-auto px-4 py-8">
        <ScheduleView userType={userType} />
      </main>
    </div>
  );
}
