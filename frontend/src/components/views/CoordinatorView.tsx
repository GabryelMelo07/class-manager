import { UserTypeEnum } from '@/utils/UserTypeEnum';
import { Header } from '../header';

export function CoordinatorView() {
  // TODO: Criar a lógica de exibição para o Coordinator, pode mexer nos horários dos cursos em que é coordenador e cadastrar novas disciplinas neles.

  return (
    <div>
      <Header userType={UserTypeEnum.COORDINATOR} />
      <h1>Coordinator View</h1>
      <p>Welcome to the Coordinator view!</p>
    </div>
  );
}
