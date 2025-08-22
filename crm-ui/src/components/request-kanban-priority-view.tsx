/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  pointerWithin,
  rectIntersection,
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
import { ScrollArea } from "@/components/ui/scroll-area";

type Priority = "urgent" | "high" | "medium" | "low";

interface RequestKanbanPriorityViewProps {
  requests: SeniorRequestDisplayView[];
  onRequestUpdate: (request: SeniorRequestDisplayView) => void;
  spamDetectionStatus?: Map<number, 'pending' | 'completed'>; // PHASE 4: Add spam detection status
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

export function RequestKanbanPriorityView({ 
  requests, 
  onRequestUpdate,
  spamDetectionStatus = new Map() // PHASE 4: Default to empty map
}: RequestKanbanPriorityViewProps) {
  const [activeRequest, setActiveRequest] = useState<SeniorRequestDisplayView | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Custom collision detection that prioritizes droppable columns
  const collisionDetectionStrategy = (args: any) => {
    // First try to find intersecting droppable areas
    const pointerIntersections = pointerWithin(args);
    const droppableIntersections = pointerIntersections.filter((intersection: any) => {
      return priorityColumns.some(col => col.id === intersection.id);
    });

    if (droppableIntersections.length > 0) {
      return droppableIntersections;
    }

    // Fallback to rect intersection for droppable areas only
    const rectIntersections = rectIntersection(args);
    const droppableRectIntersections = rectIntersections.filter((intersection: any) => {
      return priorityColumns.some(col => col.id === intersection.id);
    });

    if (droppableRectIntersections.length > 0) {
      return droppableRectIntersections;
    }

    // Last resort: closest center for droppable areas only
    const allIntersections = closestCenter(args);
    return allIntersections.filter((intersection: any) => {
      return priorityColumns.some(col => col.id === intersection.id);
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const request = requests.find((r) => r.id === active.id);
    setActiveRequest(request || null);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveRequest(null);

    if (!over) {
      return;
    }

    const requestId = active.id as number;
    let newPriority: Priority | null = null;

    // Check if dropped directly on a column
    if (priorityColumns.some(col => col.id === over.id)) {
      newPriority = over.id as Priority;
    } else {
      // If dropped on a card, find which column it belongs to
      const droppedOnRequest = requests.find(r => r.id === over.id);
      if (droppedOnRequest) {
        newPriority = droppedOnRequest.frontendPriority;
      }
    }

    if (!newPriority) {
      return;
    }

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
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full overflow-x-auto pb-6 min-w-fit">
        {priorityColumns.map((column) => {
          const columnRequests = getRequestsForPriority(column.id);          
          return (
            <Card
              key={column.id}
              className={cn("border shadow-sm flex flex-col flex-1 min-w-80 h-full", column.color)}
            >
              <CardHeader className="pb-3 flex-shrink-0">
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
              <CardContent className="pt-0 flex-1 flex flex-col min-h-0 overflow-hidden">
                <SortableContext
                  items={columnRequests.map((r) => r.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableColumn
                    id={column.id}
                    className={cn("rounded flex-1 min-h-0 p-2 overflow-y-auto", column.color)}
                  >
                    <ScrollArea className="h-full w-full">
                      <div className="space-y-2 pr-2">
                        {columnRequests.map((request) => (
                          <RequestCard
                            key={request.id}
                            request={request}
                            isKanban
                            onUpdate={onRequestUpdate}
                            spamDetectionStatus={spamDetectionStatus.get(request.id)} // PHASE 4: Pass spam status
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
                      </div>
                    </ScrollArea>
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
              spamDetectionStatus={spamDetectionStatus.get(activeRequest.id)} // PHASE 4: Pass spam status
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
