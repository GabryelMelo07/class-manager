'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { DefaultFormProps } from '@/lib/types';
import { requiredFieldMessage } from '@/utils/Helpers';
import { useEffect } from 'react';
import FormButtons from '@/components/forms/form-buttons';

export default function ClassRoomForm({
  onSubmit,
  onCancel,
  initialData,
  isEditMode,
}: DefaultFormProps) {
  const formSchema = z.object({
    name: z.string().min(1, { message: requiredFieldMessage }),
    abbreviation: z.string().min(1, { message: requiredFieldMessage }),
    location: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      abbreviation: '',
      location: '',
    },
  });

  function onReset() {
    form.reset();
    form.clearErrors();
  }

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        abbreviation: initialData.abbreviation,
        location: initialData.location
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
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Nome *</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        key="text-input-0"
                        placeholder="Insira o nome da sala de aula"
                        type="text"
                        id="name"
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
            name="abbreviation"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Abreviação *</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        key="text-input-1"
                        placeholder="Insira o nome abreviado da sala de aula"
                        type="text"
                        id="abbreviation"
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
            name="location"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Localização</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        key="text-input-2"
                        placeholder="Insira o local da sala de aula"
                        type="text"
                        id="location"
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
        </div>

        <FormButtons onCancel={onCancel} isEditMode={isEditMode} />
      </form>
    </Form>
  );
}
