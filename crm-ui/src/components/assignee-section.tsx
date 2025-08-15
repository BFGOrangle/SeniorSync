"use client";

import { useState } from "react";
import { User, UserMinus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/contexts/user-context";
import { SeniorRequestDisplayView } from "@/types/request";
import { StaffAssignmentDropdown } from "@/components/staff-assignment-dropdown";
import { cn } from "@/lib/utils";

interface AssigneeSectionProps {
  request: SeniorRequestDisplayView;
  onUpdate?: (request: SeniorRequestDisplayView) => void;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function AssigneeSection({ request, onUpdate, className }: AssigneeSectionProps) {
  const { currentUser } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';
  const isUnassigned = !request.assignedStaffId;
  const currentUserNumericId = currentUser ? parseInt(currentUser.id, 10) : undefined;
  const isAssignedToMe = currentUserNumericId !== undefined && request.assignedStaffId === currentUserNumericId;

  const handleAssignToMe = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser || isLoading) return;

    setIsLoading(true);
    try {
      const updatedRequest = {
        ...request,
        assignedStaffId: parseInt(currentUser.id, 10),
        assignedStaffName: currentUser.fullName,
      };
      onUpdate?.(updatedRequest);
    } catch (error) {
      console.error('Failed to assign request to current user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnassign = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    setIsLoading(true);
    try {
      const updatedRequest = {
        ...request,
        assignedStaffId: undefined,
        assignedStaffName: undefined,
      };
      onUpdate?.(updatedRequest);
    } catch (error) {
      console.error('Failed to unassign request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Unassigned state
  if (isUnassigned) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="h-6 w-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
          <User className="h-3 w-3 text-gray-400" />
        </div>
        
        {/* Different UI for Admin vs Staff */}
        {currentUser && isAdmin ? (
          /* Admin: Single assign button that can assign to self or others */
          <StaffAssignmentDropdown 
            request={request} 
            onUpdate={onUpdate}
            disabled={isLoading}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            includeAssignToMe={true}
          />
        ) : currentUser ? (
          /* Staff: Simple "Assign To Me" button */
          <Button
            size="sm"
            variant="default"
            onClick={handleAssignToMe}
            disabled={isLoading}
            className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isLoading ? "..." : "Assign To Me"}
          </Button>
        ) : null}
      </div>
    );
  }

  // Assigned state
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar className="h-6 w-6">
        <AvatarFallback className="text-xs bg-blue-100 text-blue-700 font-medium">
          {getInitials(request.assignedStaffName || "U")}
        </AvatarFallback>
      </Avatar>
      
      <span className="text-xs text-gray-700 font-medium">
        {request.assignedStaffName}
      </span>
      
      {/* Staff can unassign requests assigned to themselves */}
      {!isAdmin && isAssignedToMe && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleUnassign}
          disabled={isLoading}
          className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
        >
          <UserMinus className="h-3 w-3 mr-1" />
          {isLoading ? "..." : "Unassign"}
        </Button>
      )}
      
      {/* Admin can reassign to anyone including themselves */}
      {isAdmin && (
        <div className="flex items-center ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <StaffAssignmentDropdown 
            request={request} 
            onUpdate={onUpdate}
            disabled={isLoading}
            showUnassignOption={true}
            includeAssignToMe={true}
          />
        </div>
      )}
    </div>
  );
}