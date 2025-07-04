import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeniorRequestDisplayView } from "@/types/request";
import { RequestCard } from "@/components/request-card";
import { DroppableColumn } from "@/components/ui/droppable-column";
import { cn } from "@/lib/utils";

type Status = "pending" | "in-progress" | "completed";

interface RequestKanbanViewProps {
  requests: SeniorRequestDisplayView[];
  onRequestUpdate: (request: SeniorRequestDisplayView) => void;
  showOnlyFilteredStatuses?: boolean;
}

interface Column {
  id: Status;
  title: string;
  color: string;
  description: string;
}

const allColumns: Column[] = [
  {
    id: "pending",
    title: "Pending",
    color: "bg-blue-50 border-blue-200",
    description: "Awaiting assignment",
  },
  {
    id: "in-progress",
    title: "In Progress", 
    color: "bg-orange-50 border-orange-200",
    description: "Currently being worked on",
  },
  {
    id: "completed",
    title: "Completed",
    color: "bg-green-50 border-green-200",
    description: "Successfully completed",
  }
];

export function RequestKanbanView({ requests, onRequestUpdate, showOnlyFilteredStatuses = false }: RequestKanbanViewProps) {
  const [activeRequest, setActiveRequest] = useState<SeniorRequestDisplayView | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Get unique statuses from requests if we want to filter columns
  const getVisibleColumns = () => {
    if (!showOnlyFilteredStatuses) {
      return allColumns;
    }
    
    const requestStatuses = new Set(requests.map(r => r.frontendStatus));
    return allColumns.filter(col => requestStatuses.has(col.id));
  };

  const visibleColumns = getVisibleColumns();

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const request = requests.find((r) => r.id === active.id);
    setActiveRequest(request || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveRequest(null);

    // The request should remain in its original position (no action needed)
    if (!over) {
      return;
    }

    const requestId = active.id as number;
    const newStatus = over.id as Status;

    const request = requests.find((r) => r.id === requestId);

    if (!request) {
      console.error("Request not found during drag end:", requestId);
      return;
    }

    // Only update if the status actually changed
    if (request.frontendStatus !== newStatus) {
      onRequestUpdate({ ...request, frontendStatus: newStatus });
    }
  };

  const getRequestsForStatus = (status: Status) => {
    // Add defensive check to ensure requests is always an array
    if (!Array.isArray(requests)) {
      console.warn("Requests is not an array:", requests);
      return [];
    }
    return requests.filter((request) => request && request.frontendStatus === status);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full overflow-x-auto pb-6">
        {visibleColumns.map((column) => {
          const columnRequests = getRequestsForStatus(column.id);
          
          return (
            <Card
              key={column.id}
              className={cn(
                "flex-shrink-0 w-80 border shadow-sm",
                column.color
              )}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex flex-col">
                    <span>{column.title}</span>
                    <span className="text-xs text-gray-500 font-normal">
                      {column.description}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-white/80 text-gray-700 font-medium"
                  >
                    {columnRequests.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <SortableContext
                  items={columnRequests.map((r) => r.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableColumn id={column.id} className={cn(column.color)}>
                    {columnRequests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        isKanban
                        onUpdate={onRequestUpdate}
                      />
                    ))}
                    {columnRequests.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
                        Drop requests here
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
        {activeRequest ? (
          <div className="rotate-3 scale-105">
            <RequestCard
              request={activeRequest}
              isKanban
              onUpdate={onRequestUpdate}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
