'use client';

import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
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
      className={`${colorClasses.bgClass} p-3 border-l-4 ${colorClasses.borderClass} rounded-lg shadow-sm cursor-move transition-all ${
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
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-foreground hover:bg-gray-300"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Prof. {group.discipline?.teacher?.fullName}
      </p>
    </Card>
  );
}
