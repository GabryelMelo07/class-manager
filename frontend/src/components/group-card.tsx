'use client'

import { useDraggable } from "@dnd-kit/core"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import { Group } from "@/lib/types"

interface GroupCardProps {
  group: Group
  draggable: boolean
}

export function GroupCard({ group, draggable }: GroupCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `group-${group.id}`,
    data: {
      type: 'group', // Adicione o tipo
      groupId: group.id,
    },
    disabled: !draggable,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

    const colorMap: Record<string, string> = {
      indigo: "bg-indigo-100 border-l-4 border-indigo-500",
      green: "bg-green-100 border-l-4 border-green-500",
      yellow: "bg-yellow-100 border-l-4 border-yellow-500",
      red: "bg-red-100 border-l-4 border-red-500",
      purple: "bg-purple-100 border-l-4 border-purple-500",
      grey: "bg-grey-100 border-l-4 border-grey-500",
    }
  
  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${colorMap[group.color] || ""} p-3 rounded-lg shadow-sm cursor-move hover:shadow-md hover:-translate-y-0.5 transition-all`}
      {...listeners}
      {...attributes}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-800">{group.abbreviation}</h3>
          <p className="text-sm text-gray-600">{group.name}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-1">Prof. {group.discipline?.teacher?.fullName}</p>
    </Card>
  )
}
