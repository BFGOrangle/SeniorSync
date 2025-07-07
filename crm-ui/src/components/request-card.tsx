import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Clock, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SeniorRequestDisplayView } from "@/types/request";
import { useCurrentUser } from "@/contexts/user-context";
import { cn } from "@/lib/utils";

interface RequestCardProps {
  request: SeniorRequestDisplayView;
  isKanban?: boolean;
  onUpdate?: (request: SeniorRequestDisplayView) => void;
}

export function RequestCard({
  request,
  isKanban = false,
  onUpdate,
}: RequestCardProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const { currentUser } = useCurrentUser();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: request.id,
    disabled: isNavigating,
  });

  const handleViewDetails = () => {
    setIsNavigating(true);
    router.push(`/admin/requests/${request.id}`);
  };

  const handleAssignToMe = async () => {
    if (!currentUser) {
      console.error('No current user available for assignment');
      return;
    }

    try {
      // Update the request with current user assignment
      const updatedRequest = {
        ...request,
        assignedStaffId: currentUser.id,
        assignedStaffName: currentUser.fullName,
      };
      
      if (onUpdate) {
        onUpdate(updatedRequest);
      }
    } catch (error) {
      console.error('Failed to assign request to current user:', error);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "urgent":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "todo":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "in-progress":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (date: string | undefined): string => {
    if (!date) return "No date";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={handleViewDetails}
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
                {request.id}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-medium",
                  getPriorityColor(request.frontendPriority)
                )}
              >
                {request.frontendPriority.charAt(0).toUpperCase() +
                  request.frontendPriority.slice(1)}
              </Badge>
              {!isKanban && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium",
                    getStatusColor(request.frontendStatus)
                  )}
                >
                  {request.frontendStatus
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              )}
            </div>
            <div className="flex gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-gray-100"
                    title="More Actions"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails();
                    }}
                  >
                    View Details
                  </DropdownMenuItem>
                  {currentUser && request.assignedStaffId !== currentUser.id && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssignToMe();
                      }}
                    >
                      Assign to Me
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 leading-tight">
            {request.title}
          </h3>

          {request.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
              {request.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-gray-100 text-gray-600 font-medium">
                  {getInitials(
                    request.assignedStaffName || "Unassigned"
                  )}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-600 font-medium">
                {request.assignedStaffName || "Unassigned"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span className="font-medium">
                {formatDate(request.createdAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
