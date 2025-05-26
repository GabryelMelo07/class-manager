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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { DefaultFormProps } from '@/lib/types';
import { Button } from '../ui/button';

export default function CourseForm({ onSubmit, onCancel }: DefaultFormProps) {
  const formSchema = z.object({
    'text-input-0': z.string().min(1, { message: 'This field is required' }),
    'text-input-1': z.string().min(1, { message: 'This field is required' }),
    'select-0': z.string().min(1, { message: 'This field is required' }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      'text-input-0': '',
      'text-input-1': '',
      'select-0': '',
    },
  });

  function onReset() {
    form.reset();
    form.clearErrors();
  }

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
                        placeholder="Insira o nome do curso"
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
                <FormLabel className="flex shrink-0">Abreviação</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        key="text-input-1"
                        placeholder="Por exemplo: TADS"
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
            name="select-0"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Professor</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <Select
                      key="select-0"
                      {...field}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full ">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key="option1" value="option1">
                          Option 1
                        </SelectItem>

                        <SelectItem key="option2" value="option2">
                          Option 2
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Form>
  );
}
