'use client';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DefaultFormProps } from '@/lib/types';
import { requiredFieldMessage } from '@/utils/Helpers';

export default function SemesterForm({ onSubmit, onCancel }: DefaultFormProps) {
  const formSchema = z.object({
    'date-0': z.date({
      required_error: requiredFieldMessage,
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      'date-0': new Date(),
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
            name="date-0"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Data de início</FormLabel>

                <div className="w-full">
                  <FormControl>
                    {/* Para usar o date picker do shadcn dentro de um modal, precisa ser setada a flag modal={true} */}
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className="justify-start text-left font-normal w-full"
                          id="date-0"
                          name=""
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span className="text-muted-foreground">
                              Selecione uma data
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormDescription className="mt-5">
                    A data de fim do semestre será gerada automaticamente a
                    partir desta data.
                  </FormDescription>
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
