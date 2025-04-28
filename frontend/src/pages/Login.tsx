'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { setTokens } from '@/lib/auth';
import api from '@/lib/api';

const formSchema = z.object({
  'email-input-0': z.string().min(1, { message: 'This field is required' }),
  'password-input-0': z.string().min(1, { message: 'This field is required' }),
  'button-0': z.string(),
});

export function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthenticated } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      'email-input-0': '',
      'password-input-0': '',
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
      alert('Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 px-4">
      <div className="w-full max-w-lg bg-gray-100 rounded-lg shadow-lg p-10">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 @container w-full max-w-md mx-auto"
          >
            <div>
              <h1>Class Manager Login</h1>
            </div>
            <div className="grid grid-cols-12 gap-4">
              <FormField
                control={form.control}
                name="email-input-0"
                render={({ field }) => (
                  <FormItem className="col-span-12 col-start-auto flex flex-col gap-2 space-y-0 items-start">
                    <FormLabel className="flex shrink-0">Email</FormLabel>

                    <div className="w-full">
                      <FormControl>
                        <Input
                          key="email-input-0"
                          placeholder="Insira seu e-mail"
                          type="email"
                          id="email-input-0"
                          className=""
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-12 gap-4">
              <FormField
                control={form.control}
                name="password-input-0"
                render={({ field }) => (
                  <FormItem className="col-span-12 col-start-auto flex flex-col gap-2 space-y-0 items-start">
                    <FormLabel className="flex shrink-0">Senha</FormLabel>

                    <div className="w-full">
                      <FormControl>
                        <Input
                          key="password-input-0"
                          placeholder="Insira sua senha"
                          type="password"
                          id="password-input-0"
                          className=""
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-12 gap-4">
              <FormField
                control={form.control}
                name="button-0"
                render={() => (
                  <FormItem className="col-span-12 col-start-auto flex flex-col gap-2 space-y-0 items-start">
                    <FormLabel className="hidden shrink-0">Login</FormLabel>

                    <div className="w-full">
                      <FormControl>
                        <Button
                          key="button-0"
                          id="button-0"
                          className="w-full"
                          disabled={loading}
                        >
                          {loading ? 'Entrando...' : 'Entrar'}
                        </Button>
                      </FormControl>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
