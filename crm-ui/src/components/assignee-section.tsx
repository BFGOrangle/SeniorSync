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
  const isStaff = currentUser?.role === 'STAFF';
  const isUnassigned = !request.assignedStaffId;
  const currentUserNumericId = currentUser ? parseInt(currentUser.id, 10) : undefined;
  const isAssignedToMe = currentUserNumericId !== undefined && request.assignedStaffId === currentUserNumericId;

  // Both staff and admin can assign to any staff member
  const canAssign = isAdmin || isStaff;

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
        {canAssign ? (
          <StaffAssignmentDropdown
            request={request}
            onUpdate={onUpdate}
            disabled={isLoading}
            includeAssignToMe={true}
            showUnassignOption={false}
            useNameAsTrigger={true}
            triggerContent={
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <User className="h-3 w-3 text-gray-400" />
                </div>
                <span className="text-xs text-gray-700 cursor-pointer">
                  Unassigned
                </span>
              </div>
            }
            tooltipText="Assign"
          />
        ) : (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
              <User className="h-3 w-3 text-gray-400" />
            </div>
            <span className="text-xs text-gray-700">
              Unassigned
            </span>
          </div>
        )}
      </div>
    );
  }

  // Assigned state
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {canAssign ? (
        <StaffAssignmentDropdown
          request={request}
          onUpdate={onUpdate}
          disabled={isLoading}
          includeAssignToMe={true}
          showUnassignOption={true} // Both staff and admin can unassign
          useNameAsTrigger={true}
          triggerContent={
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-blue-100 text-blue-700 font-medium">
                  {getInitials(request.assignedStaffName || "U")}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-700 font-medium cursor-pointer">
                {request.assignedStaffName}
              </span>
            </div>
          }
          tooltipText={isUnassigned ? "Assign" : "Reassign"}
        />
      ) : (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-blue-100 text-blue-700 font-medium">
              {getInitials(request.assignedStaffName || "U")}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-gray-700 font-medium">
            {request.assignedStaffName}
          </span>
        </div>
      )}
    </div>
  );
}