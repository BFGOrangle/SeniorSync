import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Edit2, Save, X, AlertTriangle } from "lucide-react";
import { Ticket, Priority, Status } from "@/types/ticket";
import {
  getPriorityColor,
  getStatusColor,
  formatDate,
  isOverdue,
} from "@/lib/ticket-utils";
import { cn } from "@/lib/utils";

interface TicketCardProps {
  ticket: Ticket;
  isKanban?: boolean;
  onUpdate?: (ticket: Ticket) => void;
}

export function TicketCard({
  ticket,
  isKanban = false,
  onUpdate,
}: TicketCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState<Ticket>(ticket);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket.id,
    disabled: isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    onUpdate?.(editedTicket);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTicket(ticket);
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isEditing) {
    return (
      <Card className="w-full bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Input
              value={editedTicket.id}
              onChange={(e) =>
                setEditedTicket({ ...editedTicket, id: e.target.value })
              }
              className="text-sm font-mono"
              placeholder="Ticket ID"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="h-8 w-8 p-0">
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Input
            value={editedTicket.title}
            onChange={(e) =>
              setEditedTicket({ ...editedTicket, title: e.target.value })
            }
            placeholder="Ticket title"
            className="font-medium"
          />

          <Textarea
            value={editedTicket.description || ""}
            onChange={(e) =>
              setEditedTicket({ ...editedTicket, description: e.target.value })
            }
            placeholder="Description"
            className="min-h-[60px] resize-none"
          />

          <div className="grid grid-cols-2 gap-2">
            <Select
              value={editedTicket.priority}
              onValueChange={(value: Priority) =>
                setEditedTicket({ ...editedTicket, priority: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={editedTicket.status}
              onValueChange={(value: Status) =>
                setEditedTicket({ ...editedTicket, status: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="in-review">In Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            value={editedTicket.assignee}
            onChange={(e) =>
              setEditedTicket({ ...editedTicket, assignee: e.target.value })
            }
            placeholder="Assignee"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "w-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group",
        isDragging && "opacity-50 rotate-3 scale-105",
        isKanban && "mb-3"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="text-xs font-mono bg-gray-50 text-gray-600 hover:bg-gray-50"
            >
              {ticket.id}
            </Badge>
            {isOverdue(ticket.dueDate) && ticket.status !== "completed" && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-gray-100"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        </div>

        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 leading-tight">
          {ticket.title}
        </h3>

        {ticket.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
            {ticket.description}
          </p>
        )}

        <div className="flex items-center gap-2 mb-3">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium",
              getPriorityColor(ticket.priority)
            )}
          >
            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
          </Badge>
          {!isKanban && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium",
                getStatusColor(ticket.status)
              )}
            >
              {ticket.status
                .replace("-", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-gray-100 text-gray-600 font-medium">
                {getInitials(ticket.agentName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600 font-medium">
              {ticket.agentName}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span
              className={cn(
                "font-medium",
                isOverdue(ticket.dueDate) &&
                  ticket.status !== "completed" &&
                  "text-red-600"
              )}
            >
              {formatDate(ticket.dueDate)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
