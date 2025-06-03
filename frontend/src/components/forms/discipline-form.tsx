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
  SelectGroup,
} from '@/components/ui/select';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { DefaultFormProps, Person } from '@/lib/types';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { Loader } from 'lucide-react';
import { requiredFieldMessage } from '@/utils/Helpers';

interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export default function DisciplineForm({
  onSubmit,
  onCancel,
  isOpen,
}: DefaultFormProps & { isOpen: boolean }) {
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [teachers, setTeachers] = useState<Person[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 30,
    totalPages: 1,
    hasMore: true,
    loading: false,
  });

  const selectContentRef = useRef<HTMLDivElement>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await api.get('/api/v1/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Erro ao buscar cursos:', error);
    }
  }, []);

  const fetchTeachers = useCallback(
    async (page: number) => {
      setPagination((prev) => ({ ...prev, loading: true }));

      try {
        const params = {
          page,
          size: pagination.size,
          sort: 'name,asc',
        };

        const response = await api.get<PaginatedResponse<Person>>(
          '/api/v1/users/teachers',
          { params }
        );

        const data = response.data;

        setTeachers((prevTeachers) => {
          if (page === 0) return data.content;

          const newTeachers = [...prevTeachers, ...data.content];
          return Array.from(
            new Map(newTeachers.map((item) => [item.id, item])).values()
          );
        });

        setPagination((prev) => ({
          ...prev,
          page: data.number,
          totalPages: data.totalPages,
          hasMore: data.number < data.totalPages - 1,
          loading: false,
        }));
      } catch (error) {
        console.error('Erro ao buscar coordenadores:', error);
        setPagination((prev) => ({ ...prev, loading: false }));
      }
    },
    [pagination.size]
  );

  const handleScroll = useCallback(() => {
    if (!selectContentRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = selectContentRef.current;
    const isBottom = scrollHeight - scrollTop <= clientHeight + 10; // 10px de margem

    if (isBottom && pagination.hasMore && !pagination.loading) {
      fetchTeachers(pagination.page + 1);
    }
  }, [pagination, fetchTeachers]);

  useEffect(() => {
    const contentElement = selectContentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Buscar cursos apenas uma vez quando o modal abre
  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  // Recarrega quando o modal abrir e faz paginação por scroll
  useEffect(() => {
    if (isOpen) {
      fetchTeachers(0);
    }
  }, [isOpen, fetchTeachers]);

  const formSchema = z.object({
    name: z.string().min(1, { message: requiredFieldMessage }),
    abbreviation: z.string().min(1, { message: requiredFieldMessage }),
    courseId: z.string().min(1, { message: requiredFieldMessage }),
    teacherId: z.string().min(1, { message: requiredFieldMessage }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      abbreviation: '',
      courseId: '',
      teacherId: '',
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
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Nome *</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        key="text-input-0"
                        placeholder="Insira o nome da disciplina"
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
                        placeholder="Insira a abreviação do nome da disciplina"
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
            name="courseId"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Curso *</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <Select
                      {...field}
                      key="select-0"
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full ">
                        <SelectValue placeholder="Selecione o curso" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {courses.map((course) => (
                            <SelectItem
                              key={course.id}
                              value={course.id}
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
          <FormField
            control={form.control}
            name="teacherId"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Professor *</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <Select
                      {...field}
                      key="teacherId"
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full ">
                        <SelectValue placeholder="Selecione o professor" />
                      </SelectTrigger>
                      <SelectContent
                        ref={selectContentRef}
                        className="max-h-60 overflow-y-auto"
                      >
                        <SelectGroup>
                          {teachers.map((teacher) => (
                            <SelectItem
                              key={teacher.id}
                              value={teacher.id}
                              className="hover:bg-accent hover:text-accent-foreground"
                            >
                              {teacher.name} {teacher.surname}
                            </SelectItem>
                          ))}
                        </SelectGroup>

                        {pagination.loading && (
                          <div className="flex justify-center p-2">
                            <Loader className="h-4 w-4 animate-spin" />
                          </div>
                        )}

                        {teachers.length === 0 && !pagination.loading && (
                          <div className="text-center p-2 text-gray-500">
                            Nenhum professor encontrado
                          </div>
                        )}
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
