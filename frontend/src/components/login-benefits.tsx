import {
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  GraduationCapIcon,
} from 'lucide-react';

export function LoginBenefits() {
  return (
    <div className="h-full flex flex-col justify-center p-12 text-white">
      <div className="max-w-md mx-auto">
        <h2 className="text-3xl font-bold mb-8">Organize sua vida acadêmica</h2>

        <div className="space-y-12">
          <div className="flex items-start space-x-4">
            <div className="bg-white/10 p-3 rounded-lg">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Gerencie seu horário
              </h3>
              <p className="text-indigo-100">
                Organize suas aulas, laboratórios e atividades em um calendário
                intuitivo e fácil de usar.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-white/10 p-3 rounded-lg">
              <ClockIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Nunca perca um prazo
              </h3>
              <p className="text-indigo-100">
                Receba lembretes de provas, trabalhos e atividades para entregar
                sempre no prazo.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-white/10 p-3 rounded-lg">
              <BookOpenIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Organize seus materiais
              </h3>
              <p className="text-indigo-100">
                Mantenha seus livros, apostilas e materiais de estudo
                organizados por disciplina.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-white/10 p-3 rounded-lg">
              <GraduationCapIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Acompanhe seu desempenho
              </h3>
              <p className="text-indigo-100">
                Registre suas notas e acompanhe seu desempenho acadêmico com
                gráficos e estatísticas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
