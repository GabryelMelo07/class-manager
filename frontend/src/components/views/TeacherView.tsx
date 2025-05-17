import { UserTypeEnum } from "@/utils/UserTypeEnum";
import { Header } from "../header";

export function TeacherView() {
  // TODO: Pode visualizar os horários enquanto são montados, pode visualizar os relatórios e gráficos que dizem respeito a ele.

  return (
    <div>
      <Header userType={UserTypeEnum.TEACHER} />
      <h1>Teacher View</h1>
      <p>Welcome to the Teacher view!</p>
    </div>
  );
}
