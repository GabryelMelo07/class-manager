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
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { DefaultFormProps } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { TimePicker } from '@/components/time-picker';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { SelectGroup } from '@radix-ui/react-select';

export default function TimeSlotForm({ onSubmit, onCancel }: DefaultFormProps) {
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/api/v1/courses');
        setCourses(response.data);
      } catch (error) {
        console.error('Erro ao buscar cursos:', error);
      }
    };

    fetchCourses();
  }, []);

  const formSchema = z.object({
    daysOfWeek: z
      .array(z.string())
      .refine((value) => value.some((item) => item), {
        message: 'Selecione pelo menos um dia',
      }),
    startTime: z.object({
      hours: z.number().min(0).max(23),
      minutes: z.number().min(0).max(59),
    }),
    endTime: z.object({
      hours: z.number().min(0).max(23),
      minutes: z.number().min(0).max(59),
    }),
    lessonDurationMinutes: z.coerce
      .number({
        invalid_type_error: 'Deve ser um número',
      })
      .min(1, { message: 'Obrigatório' })
      .min(1, { message: 'Mínimo de 1 minuto' }),
    courseId: z.coerce
      .number({
        invalid_type_error: 'Selecione um curso',
      })
      .min(1, { message: 'Selecione um curso' }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      daysOfWeek: [
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
      ],
      startTime: {
        hours: 18,
        minutes: 50,
      },
      endTime: {
        hours: 22,
        minutes: 20,
      },
      lessonDurationMinutes: 50,
      courseId: undefined,
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
            name="daysOfWeek"
            render={() => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">
                  Dias de aula do Curso
                </FormLabel>

                <div className="w-full">
                  <FormControl>
                    <div className="grid w-full gap-2">
                      <FormField
                        name="daysOfWeek"
                        control={form.control}
                        render={({ field: OptionField }) => {
                          return (
                            <FormItem
                              key="MONDAY"
                              className="border-0 p-0 flex items-start"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={OptionField.value?.includes(
                                    'MONDAY'
                                  )}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? OptionField.onChange([
                                          ...(OptionField.value || []),
                                          'MONDAY',
                                        ])
                                      : OptionField.onChange(
                                          OptionField.value?.filter(
                                            (value: string) =>
                                              value !== 'MONDAY'
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="grid gap-2 leading-none">
                                <FormLabel className="font-normal">
                                  Segunda-feira
                                </FormLabel>
                              </div>
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        name="daysOfWeek"
                        control={form.control}
                        render={({ field: OptionField }) => {
                          return (
                            <FormItem
                              key="TUESDAY"
                              className="border-0 p-0 flex items-start"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={OptionField.value?.includes(
                                    'TUESDAY'
                                  )}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? OptionField.onChange([
                                          ...(OptionField.value || []),
                                          'TUESDAY',
                                        ])
                                      : OptionField.onChange(
                                          OptionField.value?.filter(
                                            (value: string) =>
                                              value !== 'TUESDAY'
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="grid gap-2 leading-none">
                                <FormLabel className="font-normal">
                                  Terça-feira
                                </FormLabel>
                              </div>
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        name="daysOfWeek"
                        control={form.control}
                        render={({ field: OptionField }) => {
                          return (
                            <FormItem
                              key="WEDNESDAY"
                              className="border-0 p-0 flex items-start"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={OptionField.value?.includes(
                                    'WEDNESDAY'
                                  )}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? OptionField.onChange([
                                          ...(OptionField.value || []),
                                          'WEDNESDAY',
                                        ])
                                      : OptionField.onChange(
                                          OptionField.value?.filter(
                                            (value: string) =>
                                              value !== 'WEDNESDAY'
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="grid gap-2 leading-none">
                                <FormLabel className="font-normal">
                                  Quarta-feira
                                </FormLabel>
                              </div>
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        name="daysOfWeek"
                        control={form.control}
                        render={({ field: OptionField }) => {
                          return (
                            <FormItem
                              key="THURSDAY"
                              className="border-0 p-0 flex items-start"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={OptionField.value?.includes(
                                    'THURSDAY'
                                  )}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? OptionField.onChange([
                                          ...(OptionField.value || []),
                                          'THURSDAY',
                                        ])
                                      : OptionField.onChange(
                                          OptionField.value?.filter(
                                            (value: string) =>
                                              value !== 'THURSDAY'
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="grid gap-2 leading-none">
                                <FormLabel className="font-normal">
                                  Quinta-feira
                                </FormLabel>
                              </div>
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        name="daysOfWeek"
                        control={form.control}
                        render={({ field: OptionField }) => {
                          return (
                            <FormItem
                              key="FRIDAY"
                              className="border-0 p-0 flex items-start"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={OptionField.value?.includes(
                                    'FRIDAY'
                                  )}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? OptionField.onChange([
                                          ...(OptionField.value || []),
                                          'FRIDAY',
                                        ])
                                      : OptionField.onChange(
                                          OptionField.value?.filter(
                                            (value: string) =>
                                              value !== 'FRIDAY'
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="grid gap-2 leading-none">
                                <FormLabel className="font-normal">
                                  Sexta-feira
                                </FormLabel>
                              </div>
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        name="daysOfWeek"
                        control={form.control}
                        render={({ field: OptionField }) => {
                          return (
                            <FormItem
                              key="SATURDAY"
                              className="border-0 p-0 flex items-start"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={OptionField.value?.includes(
                                    'SATURDAY'
                                  )}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? OptionField.onChange([
                                          ...(OptionField.value || []),
                                          'SATURDAY',
                                        ])
                                      : OptionField.onChange(
                                          OptionField.value?.filter(
                                            (value: string) =>
                                              value !== 'SATURDAY'
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <div className="grid gap-2 leading-none">
                                <FormLabel className="font-normal">
                                  Sábado
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
          <FormField
            control={form.control}
            name="startTime"
            render={() => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <div className="w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <TimePicker
                        name="startTime"
                        control={form.control}
                        label="Horário de início das aulas"
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
            name="endTime"
            render={() => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <div className="w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <TimePicker
                        name="endTime"
                        control={form.control}
                        label="Horário de fim das aulas"
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
            name="lessonDurationMinutes"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">
                  Duração de cada aula
                </FormLabel>

                <div className="w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        key="lesson-duration-minutes"
                        placeholder="Tempo de duração da aula em minutos"
                        type="number"
                        id="lesson-duration-minutes"
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
            name="courseId"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Curso</FormLabel>
                <div className="w-full">
                  <FormControl>
                    <Select
                      {...field}
                      key="courseId"
                      onValueChange={field.onChange}
                      value={field.value?.toString()}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um curso" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        <SelectGroup>
                          {courses.map((course) => (
                            <SelectItem
                              key={course.id}
                              value={course.id.toString()}
                              className="hover:bg-accent hover:text-accent-foreground"
                            >
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
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
