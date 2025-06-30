import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragCancelEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketCard } from "./ticket-card";
import { Ticket, Status } from "@/types/ticket";
import { statusColumns } from "@/lib/ticket-data";
import { cn } from "@/lib/utils";

interface KanbanViewProps {
  tickets: Ticket[];
  onTicketUpdate: (ticket: Ticket) => void;
}

function DroppableColumn({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[200px] rounded-lg p-2 transition-all duration-200",
        isOver && "bg-blue-50 border-2 border-blue-300 border-dashed",
        className
      )}
    >
      {children}
    </div>
  );
}

export function KanbanView({ tickets, onTicketUpdate }: KanbanViewProps) {
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [isDragInProgress, setIsDragInProgress] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ticket = tickets.find((t) => t.id === active.id);
    setActiveTicket(ticket || null);
    setIsDragInProgress(true);
  };

  const handleDragCancel = () => {
    setActiveTicket(null);
    setIsDragInProgress(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Always clear the active ticket and drag state
    setActiveTicket(null);
    setIsDragInProgress(false);

    // If there's no valid drop target, the drag was canceled
    // The ticket should remain in its original position (no action needed)
    if (!over) {
      return;
    }

    const ticketId = active.id as string;
    const newStatus = over.id as Status;

    const ticket = tickets.find((t) => t.id === ticketId);

    if (!ticket) {
      console.error("Ticket not found during drag end:", ticketId);
      return;
    }

    // Only update if the status actually changed
    if (ticket.status !== newStatus) {
      onTicketUpdate({ ...ticket, status: newStatus });
    }
  };

  const getTicketsForStatus = (status: Status) => {
    // Add defensive check to ensure tickets is always an array
    if (!Array.isArray(tickets)) {
      console.warn("Tickets is not an array:", tickets);
      return [];
    }
    return tickets.filter((ticket) => ticket && ticket.status === status);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
        {statusColumns.map((column) => {
          const columnTickets = getTicketsForStatus(column.id);

          return (
            <Card
              key={column.id}
              className="flex flex-col bg-gray-50 border-gray-200"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm font-medium">
                  <span className="text-gray-700">{column.title}</span>
                  <Badge variant="secondary" className="ml-2">
                    {columnTickets.length}
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 pt-0">
                <SortableContext
                  items={columnTickets.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableColumn id={column.id} className={cn(column.color)}>
                    {columnTickets.map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        isKanban
                        onUpdate={onTicketUpdate}
                      />
                    ))}
                    {columnTickets.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
                        Drop tickets here
                      </div>
                    )}
                  </DroppableColumn>
                </SortableContext>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DragOverlay>
        {activeTicket ? (
          <div className="rotate-3 scale-105">
            <TicketCard
              ticket={activeTicket}
              isKanban
              onUpdate={() => {}} // Disable updates in overlay
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
