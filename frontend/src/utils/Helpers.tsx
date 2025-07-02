import { useState } from "react";
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

export const requiredFieldMessage = "Este campo é obrigatório";

export const DAY_ORDER = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

export const generateTimeSlots = (start: string, end: string, duration: number) => {
  const normalizeTime = (time: string) => {
    const parts = time.split(':');
    return parts.length === 2 ? `${time}:00` : time;
  };

  const slots = [];
  const startDate = new Date(`1970-01-01T${normalizeTime(start)}`);
  const endDate = new Date(`1970-01-01T${normalizeTime(end)}`);

  while (startDate < endDate) {
    const endTime = new Date(startDate.getTime() + duration * 60000);
    if (endTime > endDate) break;

    const format = (date: Date) => date.toTimeString().slice(0, 5);
    slots.push(`${format(startDate)}-${format(endTime)}`);
    startDate.setTime(endTime.getTime());
  }

  return slots;
};

export const groupColors = [
  { name: "red", bgClass: "bg-red-100", darkerBgClass: "bg-red-500", borderClass: "border-red-500" },
  { name: "green", bgClass: "bg-green-100", darkerBgClass: "bg-green-500", borderClass: "border-green-500" },
  { name: "blue", bgClass: "bg-blue-100", darkerBgClass: "bg-blue-500", borderClass: "border-blue-500" },
  { name: "yellow", bgClass: "bg-yellow-100", darkerBgClass: "bg-yellow-500", borderClass: "border-yellow-500" },
  { name: "orange", bgClass: "bg-orange-100", darkerBgClass: "bg-orange-500", borderClass: "border-orange-500" },
  { name: "purple", bgClass: "bg-purple-100", darkerBgClass: "bg-purple-500", borderClass: "border-purple-500" },
  { name: "pink", bgClass: "bg-pink-100", darkerBgClass: "bg-pink-500", borderClass: "border-pink-500" },
  { name: "indigo", bgClass: "bg-indigo-100", darkerBgClass: "bg-indigo-500", borderClass: "border-indigo-500" },
  { name: "cyan", bgClass: "bg-cyan-100", darkerBgClass: "bg-cyan-500", borderClass: "border-cyan-500" },
  { name: "teal", bgClass: "bg-teal-100", darkerBgClass: "bg-teal-500", borderClass: "border-teal-500" },
  { name: "lime", bgClass: "bg-lime-100", darkerBgClass: "bg-lime-500", borderClass: "border-lime-500" },
  { name: "emerald", bgClass: "bg-emerald-100", darkerBgClass: "bg-emerald-500", borderClass: "border-emerald-500" },
];

export const getColorClasses = (colorName: string) => {
  const color = groupColors.find(c => c.name === colorName);
  return color || { bgClass: '', borderClass: '', name: '' };;
};

export const formatTimeSlot = (startTime: string, endTime: string) => {
  const format = (time: string) => time.slice(0, 5); // Remove os segundos
  return `${format(startTime)}-${format(endTime)}`;
};

export const getTranslatedErrorMessage  = (originalErrorMessage: string) => {
  const mappedErrors: Record<string, string> = {
    'Teacher already has a lesson scheduled for this time': 'O professor já tem uma aula agendada para esse horário',
    'Class Room already occupied at this time': 'Sala de aula já ocupada neste horário',
    'Group already has an schedule at this time': 'Turma já tem um agendamento neste horário',
    'Cannot create schedule for a finalized semester': 'Não é possível criar horário(s) para um semestre finalizado'
  }

  return mappedErrors[originalErrorMessage] || '';
}

export const usePagination = (initialPage = 0) => {
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  return {
    page,
    hasMore,
    isLoading,
    setPage,
    setHasMore,
    setIsLoading,
    loadMore: () => setPage((prev) => prev + 1),
  };
};

export const generateSchedulePdfBlob = async (element: HTMLElement): Promise<Blob> => {
  const canvas = await html2canvas(element, {
    scale: 4,
    useCORS: true,
    backgroundColor: null,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgProps = pdf.getImageProperties(imgData);
  const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
  const imgWidth = imgProps.width * ratio;
  const imgHeight = imgProps.height * ratio;

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

  return pdf.output('blob');
};
