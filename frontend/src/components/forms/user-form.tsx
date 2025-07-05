'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DefaultFormProps } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { InfoTooltip } from '@/components/info-tooltip';
import { requiredFieldMessage } from '@/utils/Helpers';
import FormButtons from '@/components/forms/form-buttons';

export default function UserForm({
  onSubmit,
  onCancel,
  initialData,
  isEditMode,
}: DefaultFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const formSchema = z.object({
    'text-input-0': z.string().min(1, { message: requiredFieldMessage }),
    'text-input-1': z.string().min(1, { message: requiredFieldMessage }),
    'email-input-0': z
      .string()
      .email({ message: 'Endereço de email inválido' })
      .min(1, { message: requiredFieldMessage }),
    'password-input-0': isEditMode
      ? z.string().optional()
      : z.string().min(1, { message: requiredFieldMessage }),
    'checkbox-group-0': z
      .array(z.string())
      .refine((value) => value.some((item) => item), {
        message: 'Você deve selecionar pelo menos um item.',
      }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      'text-input-0': '',
      'text-input-1': '',
      'email-input-0': '',
      'password-input-0': '',
      'checkbox-group-0': ['ADMIN'],
    },
  });

  function onReset() {
    form.reset();
    form.clearErrors();
  }

  useEffect(() => {
    if (initialData) {
      form.reset({
        'text-input-0': initialData.name,
        'text-input-1': initialData.surname,
        'email-input-0': initialData.email,
        'checkbox-group-0': initialData.roles.map((role) => role.name),
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onReset={onReset}
        className="space-y-8 @container"
      >
        <div className="grid grid-cols-12 gap-4">
          <FormField
            control={form.control}
            name="text-input-0"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Nome</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        key="text-input-0"
                        placeholder="Insira o nome do usuário"
                        type="text"
                        id="text-input-0"
                        className=" "
                        {...field}
                      />
                    </div>
                  </FormControl>

                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="text-input-1"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Sobrenome</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        key="text-input-1"
                        placeholder="Insira o sobrenome do usuário"
                        type="text"
                        id="text-input-1"
                        className=" "
                        {...field}
                      />
                    </div>
                  </FormControl>

                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email-input-0"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Email</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        key="email-input-0"
                        placeholder="usuario@exemplo.com"
                        type="email"
                        id="email-input-0"
                        className=" "
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          {!isEditMode && (
            <FormField
              control={form.control}
              name="password-input-0"
              render={({ field }) => (
                <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                  <FormLabel className="flex shrink-0">Senha</FormLabel>

                  <div className="w-full">
                    <FormControl>
                      <div className="relative w-full">
                        <Input
                          {...field}
                          key="password-input-0"
                          placeholder=""
                          type={showPassword ? 'text' : 'password'}
                          id="password-input-0"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
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
                  </div>
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="checkbox-group-0"
            render={({}) => (
              <FormItem className="col-span-12 col-start-auto @5xl:block flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">
                  Permissões do usuário{' '}
                  <InfoTooltip
                    message="As permissões de usuário interferem diretamente no que ele é capaz
                    de ver e fazer no sistema"
                  />
                </FormLabel>

                <div className="w-full">
                  <FormControl>
                    <div className="grid w-full gap-2">
                      <FormField
                        name="checkbox-group-0"
                        control={form.control}
                        render={({ field: OptionField }) => {
                          return (
                            <FormItem
                              key="ADMIN"
                              className="border-0 p-0 flex items-start"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={OptionField.value?.includes('ADMIN')}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? OptionField.onChange([
                                          ...(OptionField.value || []),
                                          'ADMIN',
                                        ])
                                      : OptionField.onChange(
                                          OptionField.value?.filter(
                                            (value: string) => value !== 'ADMIN'
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="grid gap-2 leading-none">
                                <FormLabel className="font-normal">
                                  Admin
                                </FormLabel>
                              </div>
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        name="checkbox-group-0"
                        control={form.control}
                        render={({ field: OptionField }) => {
                          return (
                            <FormItem
                              key="COORDINATOR"
                              className="border-0 p-0 flex items-start"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={OptionField.value?.includes(
                                    'COORDINATOR'
                                  )}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? OptionField.onChange([
                                          ...(OptionField.value || []),
                                          'COORDINATOR',
                                        ])
                                      : OptionField.onChange(
                                          OptionField.value?.filter(
                                            (value: string) =>
                                              value !== 'COORDINATOR'
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="grid gap-2 leading-none">
                                <FormLabel className="font-normal">
                                  Coordenador
                                </FormLabel>
                              </div>
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        name="checkbox-group-0"
                        control={form.control}
                        render={({ field: OptionField }) => {
                          return (
                            <FormItem
                              key="TEACHER"
                              className="border-0 p-0 flex items-start"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={OptionField.value?.includes(
                                    'TEACHER'
                                  )}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? OptionField.onChange([
                                          ...(OptionField.value || []),
                                          'TEACHER',
                                        ])
                                      : OptionField.onChange(
                                          OptionField.value?.filter(
                                            (value: string) =>
                                              value !== 'TEACHER'
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="grid gap-2 leading-none">
                                <FormLabel className="font-normal">
                                  Professor
                                </FormLabel>
                              </div>
                            </FormItem>
                          );
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormButtons onCancel={onCancel} isEditMode={isEditMode} />
      </form>
    </Form>
  );
}
