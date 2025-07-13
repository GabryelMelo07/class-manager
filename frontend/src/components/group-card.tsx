'use client';

import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Group } from '@/lib/types';
import { getColorClasses } from '@/utils/Helpers';

interface GroupCardProps {
  group: Group;
  draggable: boolean;
}

export function GroupCard({ group, draggable }: GroupCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `group-${group.id}`,
    data: {
      type: 'group',
      groupId: group.id,
    },
    disabled: !draggable,
  });

  const style: React.CSSProperties | undefined = transform
    ? {
        opacity: 0.5,
      }
    : undefined;

  const colorClasses = getColorClasses(group.color);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${colorClasses.bgClass} p-3 border-l-4 ${
        colorClasses.borderClass
      } rounded-lg shadow-sm
      ${
        draggable
          ? 'cursor-grab'
          : 'cursor-default'
      }
      transition-all ${
        transform
          ? 'shadow-lg scale-105'
          : 'hover:shadow-md hover:-translate-y-0.5'
      }`}
      {...listeners}
      {...attributes}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-800">{group.abbreviation}</h3>
          <p className="text-sm text-gray-600">{group.name}</p>
          <p className="text-xs text-gray-500">
            {group.classRoom.abbreviation}
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Prof. {group.discipline?.teacher?.fullName}
      </p>
    </Card>
  );
}
