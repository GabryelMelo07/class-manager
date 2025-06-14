import { BookOpenIcon, CalendarIcon, ClockIcon, Send } from 'lucide-react';

export function LoginBenefits() {
  return (
    <div className="h-full flex flex-col justify-center p-12 text-white">
      <div className="max-w-md mx-auto">
        <h2 className="text-3xl font-bold mb-8">
          Organize os horários da sua universidade
        </h2>

        <div className="space-y-12">
          <div className="flex items-start space-x-4">
            <div className="bg-white/10 p-3 rounded-lg">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Gerencie os horários
              </h3>
              <p className="text-indigo-100">
                Organize cursos, turmas, disciplinas e professores em um
                calendário intuitivo e fácil de usar.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-white/10 p-3 rounded-lg">
              <ClockIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Poupe tempo ao montar horários
              </h3>
              <p className="text-indigo-100">
                Copie os horários de outros semestres com um clique ou deixe que
                o sistema crie horários automaticamente, evitando conflitos.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-white/10 p-3 rounded-lg">
              <BookOpenIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Mantenha o histórico de todos os horários e semestres
              </h3>
              <p className="text-indigo-100">
                Visualize a qualquer momento os horários de semestres
                anteriores.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-white/10 p-3 rounded-lg">
              {/* <GraduationCapIcon className="h-6 w-6" /> */}
              <Send className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Compartilhe com os Alunos
              </h3>
              <p className="text-indigo-100">
                Envie por e-mail ou baixe em PDF os horários de qualquer
                semestre.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
