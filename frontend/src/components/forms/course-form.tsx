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
import { useForm } from 'react-hook-form';
import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { DefaultFormProps } from '@/lib/types';
import { Loader } from 'lucide-react';
import { requiredFieldMessage } from '@/utils/Helpers';
import { Button } from '@/components/ui/button';
import FormButtons from '@/components/forms/form-buttons';

interface Coordinator {
  id: string;
  name: string;
  surname: string;
}

interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export default function CourseForm({
  onSubmit,
  onCancel,
  isEditMode,
  initialData,
}: DefaultFormProps) {
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 30,
    totalPages: 1,
    hasMore: true,
    loading: false,
  });

  const formSchema = z.object({
    name: z.string().min(1, { message: requiredFieldMessage }),
    abbreviation: z.string().min(1, { message: requiredFieldMessage }),
    coordinator: isEditMode
      ? z.string().optional()
      : z.string().min(1, { message: requiredFieldMessage }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      abbreviation: '',
      coordinator: '',
    },
  });

  function onReset() {
    form.reset();
    form.clearErrors();
  }

  const fetchCoordinators = useCallback(
    async (page: number) => {
      if (pagination.loading) return;

      setPagination((prev) => ({ ...prev, loading: true }));

      try {
        const params = {
          page,
          size: pagination.size,
          sort: 'name,asc',
        };

        const response = await api.get<PaginatedResponse<Coordinator>>(
          '/api/v1/users/coordinators',
          { params }
        );

        const data = response.data;

        setCoordinators((prevCoordinators) => {
          if (page === 0) return data.content;

          const newCoordinators = [...prevCoordinators, ...data.content];
          return Array.from(
            new Map(newCoordinators.map((item) => [item.id, item])).values()
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
    [pagination.size, pagination.loading]
  );

  // Recarrega quando o modal abrir
  useEffect(() => {
    if (coordinators.length === 0) {
      fetchCoordinators(0);
    }
  }, [fetchCoordinators, coordinators.length]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        abbreviation: initialData.abbreviation,
        coordinator: initialData.coordinator?.id || '',
      });
    } else {
      form.reset({
        name: '',
        abbreviation: '',
        coordinator: '',
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
                <FormLabel className="flex shrink-0">Nome</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        key="name"
                        placeholder="Insira o nome do curso"
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
                        key="abbreviation"
                        placeholder="Por exemplo: TADS"
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
            name="coordinator"
            render={({ field }) => (
              <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                <FormLabel className="flex shrink-0">Coordenador</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <Select
                      {...field}
                      key={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um coordenador..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        <SelectGroup>
                          {/* Coordenadores */}
                          {coordinators.map((coordinator) => (
                            <SelectItem
                              key={coordinator.id}
                              value={coordinator.id}
                              className="hover:bg-accent hover:text-accent-foreground"
                            >
                              {coordinator.name} {coordinator.surname}
                            </SelectItem>
                          ))}
                        </SelectGroup>

                        {/* Botão para carregar mais */}
                        {pagination.hasMore && !pagination.loading && (
                          <div className="text-center p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={() =>
                                fetchCoordinators(pagination.page + 1)
                              }
                              className="w-full"
                            >
                              Carregar mais
                            </Button>
                          </div>
                        )}

                        {/* Indicador de carregamento */}
                        {pagination.loading && (
                          <div className="flex justify-center p-2">
                            <Loader className="h-4 w-4 animate-spin" />
                          </div>
                        )}

                        {/* Mensagem quando não há coordenadores */}
                        {coordinators.length === 0 && !pagination.loading && (
                          <div className="text-center p-2 text-gray-500">
                            Nenhum coordenador encontrado
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

        <FormButtons onCancel={onCancel} isEditMode={isEditMode} />
      </form>
    </Form>
  );
}
