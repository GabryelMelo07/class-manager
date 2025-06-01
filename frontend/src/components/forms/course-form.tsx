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
import { useCallback, useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { Loader } from 'lucide-react';
import { SelectGroup } from '@radix-ui/react-select';

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
  isOpen,
}: DefaultFormProps & { isOpen: boolean }) {
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 30,
    totalPages: 1,
    hasMore: true,
    loading: false,
  });

  const selectContentRef = useRef<HTMLDivElement>(null);

  const fetchCoordinators = useCallback(
    async (page: number) => {
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

        // Atualiza coordinators usando o estado anterior
        setCoordinators((prevCoordinators) => {
          if (page === 0) return data.content; // Substitui na primeira página

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
    [pagination.size]
  );

  const handleScroll = useCallback(() => {
    if (!selectContentRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = selectContentRef.current;
    const isBottom = scrollHeight - scrollTop <= clientHeight + 10; // 10px de margem

    if (isBottom && pagination.hasMore && !pagination.loading) {
      fetchCoordinators(pagination.page + 1);
    }
  }, [pagination, fetchCoordinators]);

  // Adiciona o event listener de scroll
  useEffect(() => {
    const contentElement = selectContentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Recarrega quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      fetchCoordinators(0);
    }
  }, [isOpen, fetchCoordinators]);

  function onReset() {
    form.reset();
    form.clearErrors();
  }

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
                <FormLabel className="flex shrink-0">Coordenador</FormLabel>

                <div className="w-full">
                  <FormControl>
                    <Select
                      {...field}
                      key="select-0"
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um coordenador..." />
                      </SelectTrigger>
                      <SelectContent
                        ref={selectContentRef}
                        className="max-h-60 overflow-y-auto"
                      >
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
