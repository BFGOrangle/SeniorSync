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

type Priority = "urgent" | "high" | "medium" | "low";

interface RequestKanbanPriorityViewProps {
  requests: SeniorRequestDisplayView[];
  onRequestUpdate: (request: SeniorRequestDisplayView) => void;
  showOnlyFilteredPriorities?: boolean;
}

interface PriorityColumn {
  id: Priority;
  title: string;
  color: string;
  description: string;
}

const priorityColumns: PriorityColumn[] = [
  {
    id: "urgent",
    title: "Urgent",
    color: "bg-red-50 border-red-200",
    description: "Immediate attention required",
  },
  {
    id: "high",
    title: "High Priority",
    color: "bg-orange-50 border-orange-200",
    description: "Important requests",
  },
  {
    id: "medium",
    title: "Medium Priority",
    color: "bg-yellow-50 border-yellow-200",
    description: "Standard requests",
  },
  {
    id: "low",
    title: "Low Priority",
    color: "bg-green-50 border-green-200",
    description: "Non-urgent requests",
  },
];

export function RequestKanbanPriorityView({ requests, onRequestUpdate, showOnlyFilteredPriorities = false }: RequestKanbanPriorityViewProps) {
  const [activeRequest, setActiveRequest] = useState<SeniorRequestDisplayView | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Get visible columns based on filtering
  const getVisibleColumns = () => {
    if (!showOnlyFilteredPriorities) {
      return priorityColumns;
    }
    
    const requestPriorities = new Set(requests.map(r => r.frontendPriority));
    return priorityColumns.filter(col => requestPriorities.has(col.id));
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

    if (!over) {
      return;
    }

    const requestId = active.id as number;
    const newPriority = over.id as Priority;

    const request = requests.find((r) => r.id === requestId);

    if (!request) {
      console.error("Request not found during drag end:", requestId);
      return;
    }

    // Only update if the priority actually changed
    if (request.frontendPriority !== newPriority) {
      onRequestUpdate({ ...request, frontendPriority: newPriority });
    }
  };

  const getRequestsForPriority = (priority: Priority) => {
    if (!Array.isArray(requests)) {
      console.warn("Requests is not an array:", requests);
      return [];
    }
    return requests.filter((request) => request && request.frontendPriority === priority);
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case "urgent":
        return "🚨";
      case "high":
        return "⚡";
      case "medium":
        return "📋";
      case "low":
        return "📝";
      default:
        return "📋";
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full overflow-x-auto pb-6">
        {visibleColumns.map((column) => {
          const columnRequests = getRequestsForPriority(column.id);
          
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
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getPriorityIcon(column.id)}</span>
                    <div className="flex flex-col">
                      <span className={cn("font-semibold", getPriorityColor(column.id))}>
                        {column.title}
                      </span>
                      <span className="text-xs text-gray-500 font-normal">
                        {column.description}
                      </span>
                    </div>
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
                        <div className="text-center">
                          <div className="text-2xl mb-2 opacity-50">
                            {getPriorityIcon(column.id)}
                          </div>
                          <div>Drop requests here</div>
                        </div>
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
