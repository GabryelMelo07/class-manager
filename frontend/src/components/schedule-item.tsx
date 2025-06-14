import { IScheduleItem } from '@/lib/types';
import { getColorClasses } from '@/utils/Helpers';
import { useDraggable } from '@dnd-kit/core';
import { X } from 'lucide-react';

export default function ScheduleItem({
  schedule,
  draggable,
  onDeleteSchedule,
  showCourse = false
}: {
  schedule: IScheduleItem;
  draggable: boolean;
  onDeleteSchedule: (id: number) => void;
  showCourse?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: schedule.id,
    data: {
      type: 'schedule',
      scheduleId: schedule.id,
      groupId: schedule.group.id,
    },
    disabled: !draggable,
  });

  const style: React.CSSProperties | undefined = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        pointerEvents: 'none' as const,
        opacity: 0,
      }
    : undefined;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteSchedule(schedule.id);
  };

  // Criar listeners customizados que excluem o botão de delete
  const customListeners = draggable
    ? {
        ...listeners,
        onPointerDown: (e: React.PointerEvent) => {
          // Se o clique foi no botão ou dentro dele, não iniciar drag
          if ((e.target as HTMLElement).closest('button[data-delete-button]')) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          // Caso contrário, usar o listener original
          if (listeners?.onPointerDown) {
            listeners.onPointerDown(e);
          }
        },
      }
    : {};

  const colorClasses = getColorClasses(schedule.group?.color);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...customListeners}
      className={`relative group print:group-hover:shadow-none ${
        colorClasses.bgClass
      } hover:shadow-sm transition-all border-l-4 ${
        colorClasses.borderClass
      } p-1 rounded mb-2 ${draggable ? 'cursor-move' : ''} ${
        transform ? 'shadow-lg scale-105' : 'hover:-translate-y-0.5'
      }`}
    >
      {draggable && (
        <button
          type="button"
          data-delete-button="true"
          onClick={handleDeleteClick}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="no-print absolute top-1 right-1 p-1 rounded-full bg-white/80 hover:bg-red-100 transition-colors z-10 opacity-0 group-hover:opacity-100"
          title="Excluir horário"
        >
          <X className="h-3 w-3 text-red-500" />
        </button>
      )}

      <div className="flex flex-col justify-between pr-2 h-28 overflow-hidden">
        {/* Nova linha para mostrar o curso quando necessário */}
          {showCourse && schedule.group?.discipline?.course && (
            <p className="text-xs text-gray-500 break-words mt-1">
              {schedule.group.discipline.course.abbreviation}
            </p>
          )}
        <div>
          <h4 className="font-medium text-sm flex-1 break-words text-gray-900 dark:text-gray-900">
            {schedule.group?.abbreviation}
          </h4>
          <p className="text-xs text-gray-600 break-words">
            {schedule.group?.name}
          </p>
        </div>
        <p className="text-xs text-gray-500 break-words">
          {schedule.group?.classRoom?.abbreviation}
        </p>

        {!showCourse && (
          <p className="mt-2 text-xs text-gray-500 break-words">
            {schedule.group?.discipline?.teacher?.fullName}
          </p>
        )}
      </div>
    </div>
  );
}
