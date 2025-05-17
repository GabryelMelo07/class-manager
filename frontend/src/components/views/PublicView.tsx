import { UserTypeEnum } from "@/utils/UserTypeEnum";
import { Header } from "../header";

export function PublicView() {
  // TODO: Só poderá ver os horários dos cursos, quando a montagem deles for finalizada, deve selecionar o curso que quer ver os horários.

  return (
    <div>
      <Header userType={UserTypeEnum.PUBLIC} />
      <h1>Public View</h1>
      <p>Welcome to the Public view!</p>
    </div>
  );
}
