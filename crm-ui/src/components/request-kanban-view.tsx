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

type Status = "todo" | "in-progress" | "completed";

interface RequestKanbanViewProps {
  requests: SeniorRequestDisplayView[];
  onRequestUpdate: (request: SeniorRequestDisplayView) => void;
  spamDetectionStatus?: Map<number, 'pending' | 'completed'>; // PHASE 4: Add spam detection status
}

interface Column {
  id: Status;
  title: string;
  color: string;
  description: string;
}

const allColumns: Column[] = [
  {
    id: "todo",
    title: "TODO",
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
  },
];

export function RequestKanbanView({
  requests,
  onRequestUpdate,
  spamDetectionStatus = new Map(), // PHASE 4: Default to empty map
}: RequestKanbanViewProps) {
  const [activeRequest, setActiveRequest] =
    useState<SeniorRequestDisplayView | null>(null);

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
      return allColumns.some(col => col.id === intersection.id);
    });

    if (droppableIntersections.length > 0) {
      return droppableIntersections;
    }

    // Fallback to rect intersection for droppable areas only
    const rectIntersections = rectIntersection(args);
    const droppableRectIntersections = rectIntersections.filter((intersection: any) => {
      return allColumns.some(col => col.id === intersection.id);
    });

    if (droppableRectIntersections.length > 0) {
      return droppableRectIntersections;
    }

    // Last resort: closest center for droppable areas only
    const allIntersections = closestCenter(args);
    return allIntersections.filter((intersection: any) => {
      return allColumns.some(col => col.id === intersection.id);
    });
  };

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
    let newStatus: Status | null = null;

    // Check if dropped directly on a column
    if (allColumns.some(col => col.id === over.id)) {
      newStatus = over.id as Status;
    } else {
      // If dropped on a card, find which column it belongs to
      const droppedOnRequest = requests.find(r => r.id === over.id);
      if (droppedOnRequest) {
        newStatus = droppedOnRequest.frontendStatus;
      }
    }

    if (!newStatus) {
      return;
    }

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
    return requests.filter(
      (request) => request && request.frontendStatus === status
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto h-full">
        <div className="flex gap-6 h-full w-full min-w-fit">
          {allColumns.map((column) => {
            const columnRequests = getRequestsForStatus(column.id);

            return (
              <Card
                key={column.id}
                className={cn("border shadow-sm flex flex-col flex-1 min-w-80 h-full", column.color)}
              >
                <CardHeader className="pb-3 flex-shrink-0">
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
                              Drop requests here
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
