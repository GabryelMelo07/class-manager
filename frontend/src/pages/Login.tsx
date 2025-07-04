'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { setTokens } from '@/lib/auth';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EyeIcon, EyeOffIcon, Loader2, LockIcon, MailIcon } from 'lucide-react';
import { useState } from 'react';
import { LoginBenefits } from '@/components/login-benefits';
import { toast } from 'sonner';

const formSchema = z.object({
  'email-input-0': z.string().min(1, { message: 'This field is required' }),
  'password-input-0': z.string().min(1, { message: 'This field is required' }),
  'button-0': z.string(),
});

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email({ message: 'E-mail inválido' })
    .min(1, { message: 'Campo obrigatório' }),
});

export function Login() {
  const navigate = useNavigate();
  const { setAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      'email-input-0': 'admin@riogrande.ifrs.edu.br',
      'password-input-0': 'admin',
      'button-0': '',
    },
  });

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
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
      toast.error('Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (
    values: z.infer<typeof forgotPasswordSchema>
  ) => {
    try {
      setForgotPasswordLoading(true);
      await api.post(
        `/api/v1/auth/reset-password/request?email=${encodeURIComponent(
          values.email
        )}`
      );
      setForgotPasswordOpen(false);
      toast.success(
        'E-mail enviado com sucesso! Verifique sua caixa de entrada.'
      );
    } catch (err) {
      toast.error('Ocorreu um erro ao enviar o e-mail. Tente novamente.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img
                className="w-[250px] h-max"
                src="logo_horizontal_branco.png"
                alt="Logo Class Manager"
              />
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
              <h2 className="text-3xl font-bold text-gray-800 dark:text-foreground">
                Bem-vindo de volta!
              </h2>
              <p className="text-gray-600 dark:text-foreground mt-2">
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
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOffIcon className="w-4 h-4" />
                            ) : (
                              <EyeIcon className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Dialog
                    open={forgotPasswordOpen}
                    onOpenChange={setForgotPasswordOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm underline p-0 text-secondary-foreground hover:text-primary"
                      >
                        Esqueci minha senha
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-[#5b1693]"
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
        <div className="hidden md:block md:w-1/2 bg-primary">
          <LoginBenefits />
        </div>
      </main>

      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir senha</DialogTitle>
          </DialogHeader>
          <Form {...forgotPasswordForm}>
            <form
              onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)}
              className="space-y-4"
            >
              <FormField
                control={forgotPasswordForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Digite seu e-mail"
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={forgotPasswordLoading}
                >
                  {forgotPasswordLoading ? 'Enviando...' : 'Enviar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
