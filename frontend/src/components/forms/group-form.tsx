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
import api from '@/lib/api';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { DefaultFormProps } from '@/lib/types';
import { SelectGroup } from '@radix-ui/react-select';
import { Button } from '@/components/ui/button';
import ColorSelector from '@/components/color-selector';
import { requiredFieldMessage, usePagination } from '@/utils/Helpers';
import { Loader2 } from 'lucide-react';
import FormButtons from '@/components/forms/form-buttons';

interface GroupFormProps extends DefaultFormProps {
  courseId?: number;
}

export default function GroupForm({
  onSubmit,
  onCancel,
  courseId,
  isEditMode,
  initialData,
}: GroupFormProps) {
  const [disciplines, setDisciplines] = useState<
    { id: number; name: string }[]
  >([]);
  const [classRooms, setClassRooms] = useState<{ id: number; name: string }[]>(
    []
  );

  const disciplinesPagination = usePagination();
  const classRoomsPagination = usePagination();

  const formSchema = z.object({
    name: z.string().min(1, { message: requiredFieldMessage }),
    abbreviation: z.string().min(1, { message: requiredFieldMessage }),
    color: z.string().min(1, { message: requiredFieldMessage }),
    semesterOfCourse: z.coerce
      .number({
        invalid_type_error: 'Este campo deve ser um número',
      })
      .min(1, { message: requiredFieldMessage })
      .min(1, { message: 'Este campo deve ser pelo menos 1' }),
    disciplineId: isEditMode
      ? z.string().optional()
      : z.string().min(1, { message: requiredFieldMessage }),
    classRoomId: isEditMode
      ? z.string().optional()
      : z.string().min(1, { message: requiredFieldMessage }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      abbreviation: '',
      color: '',
      semesterOfCourse: 1,
      disciplineId: undefined,
      classRoomId: undefined,
    },
  });

  function onReset() {
    form.reset();
    form.clearErrors();
  }

  const fetchDisciplines = useCallback(async () => {
    try {
      if (isEditMode && initialData) {
        courseId = initialData.discipline?.course?.id;
      }
      disciplinesPagination.setIsLoading(true);

      const response = await api.get(
        `/api/v1/disciplines?courseId=${courseId}&page=${disciplinesPagination.page}&size=20`
      );

      setDisciplines((prev) =>
        disciplinesPagination.page === 0
          ? response.data.content
          : [...prev, ...response.data.content]
      );

      disciplinesPagination.setHasMore(
        response.data.page.number + 1 < response.data.page.totalPages
      );
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error);
    } finally {
      disciplinesPagination.setIsLoading(false);
    }
  }, [courseId, disciplinesPagination.page]);

  const fetchClassRooms = useCallback(async () => {
    try {
      classRoomsPagination.setIsLoading(true);

      const response = await api.get(
        `/api/v1/class-rooms?page=${classRoomsPagination.page}&size=20`
      );

      setClassRooms((prev) =>
        classRoomsPagination.page === 0
          ? response.data.content
          : [...prev, ...response.data.content]
      );

      classRoomsPagination.setHasMore(
        response.data.page.number + 1 < response.data.page.totalPages
      );
    } catch (error) {
      console.error('Erro ao buscar salas de aula:', error);
    } finally {
      classRoomsPagination.setIsLoading(false);
    }
  }, [classRoomsPagination.page]);

  useEffect(() => {
    fetchDisciplines();
  }, [fetchDisciplines]);

  useEffect(() => {
    fetchClassRooms();
  }, [fetchClassRooms]);

  // Preencher formulário com dados iniciais quando em modo de edição
  useEffect(() => {
    if (isEditMode && initialData) {
      form.reset({
        name: initialData.name,
        abbreviation: initialData.abbreviation,
        color: initialData.color,
        semesterOfCourse: initialData.semesterOfCourse,
        disciplineId: initialData.discipline?.id?.toString(),
        classRoomId: initialData.classRoom?.id?.toString(),
      });
    }
  }, [isEditMode, initialData, form]);

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
                <FormLabel className="flex shrink-0">Nome</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        key="text-input-0"
                        placeholder="Insira o nome da turma"
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
                <FormLabel className="flex shrink-0">Abreviação</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        key="text-input-1"
                        placeholder="Insira a abreviação do nome"
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
            name="color"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start my-2">
                <FormLabel className="flex shrink-0">Cor</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <ColorSelector
                        value={field.value}
                        onChange={field.onChange}
                        label=""
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
            name="semesterOfCourse"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Semestre</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        key="number-input-0"
                        placeholder=""
                        type="number"
                        id="semesterOfCourse"
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
            name="disciplineId"
            render={({ field }) => (
              <FormItem className="col-span-12">
                <FormLabel>Disciplina</FormLabel>
                <FormControl>
                  <Select
                    {...field}
                    value={field.value?.toString()}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a disciplina da turma" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      <SelectGroup>
                        {disciplines.map((discipline) => (
                          <SelectItem
                            key={discipline.id}
                            value={discipline.id.toString()}
                          >
                            {discipline.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>

                      {disciplinesPagination.hasMore && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            disciplinesPagination.loadMore();
                          }}
                          disabled={disciplinesPagination.isLoading}
                          variant="ghost"
                          className="w-full"
                        >
                          {disciplinesPagination.isLoading ? (
                            <>
                              <Loader2
                                strokeWidth={2}
                                className="animate-spin"
                              />{' '}
                              Carregando...
                            </>
                          ) : (
                            'Carregar mais'
                          )}
                        </Button>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="classRoomId"
            render={({ field }) => (
              <FormItem className="col-span-12">
                <FormLabel>Sala de aula</FormLabel>
                <FormControl>
                  <Select
                    {...field}
                    value={field.value?.toString()}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a sala a ser usada" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      <SelectGroup>
                        {classRooms.map((classRoom) => (
                          <SelectItem
                            key={classRoom.id}
                            value={classRoom.id.toString()}
                          >
                            {classRoom.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>

                      {classRoomsPagination.hasMore && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            classRoomsPagination.loadMore();
                          }}
                          disabled={classRoomsPagination.isLoading}
                          variant="ghost"
                          className="w-full"
                        >
                          {classRoomsPagination.isLoading ? (
                            <>
                              <Loader2 className="animate-spin" /> Carregando...
                            </>
                          ) : (
                            'Carregar mais'
                          )}
                        </Button>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormButtons onCancel={onCancel} isEditMode={isEditMode} />
      </form>
    </Form>
  );
}
