import { useDroppable } from "@dnd-kit/core";

export function TableCell({
  id,
  children,
  droppable,
}: {
  id: string;
  children: React.ReactNode;
  droppable: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id, disabled: !droppable });

  return (
    <td
      ref={setNodeRef}
      className={`p-2 min-h-16 ${
        isOver ? 'bg-indigo-50' : ''
      } transition-colors`}
    >
      {children}
    </td>
  );
}
