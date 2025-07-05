import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.error('Token inválido ou ausente');
    }
  }, [token]);

  const handleReset = async () => {
    if (password !== confirm) {
      toast.error('As senhas não coincidem');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        `/api/v1/auth/reset-password?token=${encodeURIComponent(token)}`,
        {
          newPassword: password,
        }
      );

      if (response.status !== 200) {
        throw new Error('Erro ao redefinir a senha');
      }

      toast.success('Senha redefinida com sucesso!');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      toast.error('Erro ao redefinir a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Redefinir Senha</h2>

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOffIcon className="w-4 h-4" />
            ) : (
              <EyeIcon className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirmar nova senha"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="pr-10"
          />
        </div>

        <Button
          className="w-full"
          onClick={handleReset}
          disabled={loading || !password || !confirm}
        >
          {loading ? 'Enviando...' : 'Confirmar Redefinição'}
        </Button>
      </div>
    </div>
  );
}
