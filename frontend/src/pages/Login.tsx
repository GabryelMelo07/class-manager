'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { setTokens } from '@/lib/auth';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CalendarIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2,
  LockIcon,
  MailIcon,
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useState } from 'react';
import { LoginBenefits } from '@/components/login-benefits';

const formSchema = z.object({
  'email-input-0': z.string().min(1, { message: 'This field is required' }),
  'password-input-0': z.string().min(1, { message: 'This field is required' }),
  'button-0': z.string(),
});

export function Login() {
  const navigate = useNavigate();
  const { setAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      'email-input-0': 'admin@riogrande.ifrs.edu.br',
      'password-input-0': 'admin',
      'button-0': '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const response = await api.post('/api/v1/auth/login', {
        email: values['email-input-0'],
        password: values['password-input-0'],
      });

      const { accessToken, refreshToken } = response.data;

      setTokens(accessToken, refreshToken);
      setAuthenticated(true);
      navigate('/');
    } catch (err) {
      // TODO: TROCAR POR UM ALERT
      alert('Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <CalendarIcon className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Organizador Acadêmico</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Left Side - Login Form */}
        <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Bem-vindo de volta!
              </h2>
              <p className="text-gray-600 mt-2">
                Acesse sua conta para gerenciar seus cursos e atividades
                acadêmicas
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email-input-0"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MailIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            {...field}
                            key="email-input-0"
                            placeholder="Insira seu e-mail"
                            type="email"
                            id="email-input-0"
                            className="pl-10"
                            // value={
                            //   'admin@riogrande.ifrs.edu.br'
                            // } /* VALOR PADRÃO PARA FACILITAR O TESTE. TODO: REMOVER AO TERMINAR OS TESTES */
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password-input-0"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LockIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            {...field}
                            key="password-input-0"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Insira sua senha"
                            className="pl-10 pr-10"
                            id="password-input-0"
                            // value={
                            //   'admin'
                            // } /* VALOR PADRÃO PARA FACILITAR O TESTE. TODO: REMOVER AO TERMINAR OS TESTES */
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-8 w-8 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                          >
                            {showPassword ? (
                              <EyeOffIcon className="size-4" />
                            ) : (
                              <EyeIcon className="size-4" strokeWidth={2} />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        {/* Right Side - Benefits */}
        <div className="hidden md:block md:w-1/2 bg-indigo-600">
          <LoginBenefits />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-6 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © 2023 Organizador Acadêmico. Todos os direitos reservados.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-600 hover:text-indigo-600 text-sm"
              >
                Termos de Uso
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-indigo-600 text-sm"
              >
                Política de Privacidade
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
