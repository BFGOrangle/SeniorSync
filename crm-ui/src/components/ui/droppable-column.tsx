import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function DroppableColumn({
  id,
  children,
  className,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[200px] rounded-lg p-2 transition-all duration-200 relative",
        isOver && "bg-blue-50 border-2 border-blue-300 border-dashed",
        className
      )}
    >
      {/* High z-index overlay to ensure drop events are captured above cards */}
      {isOver && (
        <div className="absolute inset-0 z-50 pointer-events-none rounded-lg border-2 border-blue-300 border-dashed bg-blue-50/30" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
