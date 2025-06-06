import { UserTypeEnum } from '@/utils/UserTypeEnum';
import { Header } from '../header';
import { ScheduleView } from './ScheduleView';

export function AdminView() {
  const userType = UserTypeEnum.ADMIN;

  return (
    <div className="min-h-screen">
      <Header userType={userType} />
      <main className="container mx-auto px-4 py-8">
        <ScheduleView userType={userType} />
      </main>
    </div>
  );
}
