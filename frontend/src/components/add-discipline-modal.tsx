'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import api from '@/lib/api';

interface Course {
  id: number;
  name: string;
}

interface Teacher {
  id: string;
  name: string;
}

interface AddDisciplineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDiscipline: (discipline: {
    name: string;
    abbreviation: string;
    courseId: number;
    teacherId: string;
    color: string;
  }) => void;
}

export function AddDisciplineModal({
  isOpen,
  onClose,
  onAddDiscipline,
}: AddDisciplineModalProps) {
  const initialFormState = {
    name: '',
    abbreviation: '',
    courseId: '',
    teacherId: '',
    color: '#6366f1',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const [coursesRes, teachersRes] = await Promise.all([
          api.get('/api/v1/courses'),
          // TODO: Criar a rota para busca de professores e alterar aqui
          api.get('/api/v1/auth/users'),
        ]);

        setCourses(coursesRes.data.content);
        setTeachers(teachersRes.data.content);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.courseId || !formData.teacherId)
      return alert('Selecione curso e professor');

    onAddDiscipline({
      name: formData.name,
      abbreviation: formData.abbreviation,
      courseId: Number(formData.courseId),
      teacherId: formData.teacherId,
      color: formData.color,
    });

    setFormData(initialFormState);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="[&>button:last-child]:hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            Adicionar Nova Disciplina
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="abbreviation">Sigla</Label>
            <Input
              id="abbreviation"
              name="abbreviation"
              value={formData.abbreviation}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="courseId">Curso</Label>
            <select
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2"
            >
              <option value="" disabled>
                Selecione um curso
              </option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="teacherId">Professor</Label>
            <select
              id="teacherId"
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2"
            >
              <option value="" disabled>
                Selecione um professor
              </option>
              {/* {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))} */}
            </select>
          </div>

          <div>
            <Label htmlFor="color">Cor</Label>
            <Input
              id="color"
              name="color"
              type="color"
              value={formData.color}
              onChange={handleChange}
              className="h-10 w-20 p-0 border-none cursor-pointer"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
