import { Home, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-accent p-4">
            <AlertCircle className="h-12 w-12 text-primary" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-2">
          Página não encontrada
        </h1>

        <p className="text-xl text-muted-foreground mb-8">
          Desculpe, não conseguimos encontrar a página que você está procurando.
        </p>

        <div className="flex justify-center">
          <Button
            onClick={() => navigate('/')}
            asChild
            className="bg-primary hover:bg-[#5b1693] text-white cursor-pointer"
          >
            <div className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              <p>Voltar para o início</p>
            </div>
          </Button>
        </div>
      </div>

      <div className="mt-16 text-center">
        <p className="text-sm text-muted-foreground">Código de erro: 404</p>
      </div>
    </div>
  );
}
