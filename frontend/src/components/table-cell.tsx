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
      className={`p-1 min-h-16 ${
        isOver ? 'bg-[#faf5ff]' : ''
      } transition-colors`}
    >
      {children}
    </td>
  );
}
