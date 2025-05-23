import { UserTypeEnum } from '@/utils/UserTypeEnum';
import { Header } from '../header';
import { ScheduleView } from '../ScheduleView';

export function TeacherView() {
  // TODO: Pode visualizar os horários enquanto são montados, pode visualizar os relatórios e gráficos que dizem respeito a ele.

  const userType = UserTypeEnum.TEACHER;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userType={userType} />
      <main className="container mx-auto px-4 py-8">
        {/* Container principal usando grid */}
        <ScheduleView userType={userType} />
      </main>
    </div>
  );
}
