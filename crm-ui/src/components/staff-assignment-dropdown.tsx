"use client";

import { useState, useEffect, ReactNode } from "react";
import { ChevronDown, User, UserX } from "lucide-react";
import { useCurrentUser } from "@/contexts/user-context";
import { useStaffDropdown } from "@/hooks/use-staff";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SeniorRequestDisplayView } from "@/types/request";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StaffAssignmentDropdownProps {
  request: SeniorRequestDisplayView;
  onUpdate?: (request: SeniorRequestDisplayView) => void;
  className?: string;
  disabled?: boolean;
  showUnassignOption?: boolean;
  includeAssignToMe?: boolean;
  // When true, use a custom trigger (e.g., assignee name) instead of the button
  useNameAsTrigger?: boolean;
  triggerContent?: ReactNode;
  triggerClassName?: string;
  tooltipText?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function StaffAssignmentDropdown({ 
  request, 
  onUpdate, 
  className, 
  disabled,
  showUnassignOption = false,
  includeAssignToMe = false,
  useNameAsTrigger,
  triggerContent,
  triggerClassName,
  tooltipText,
}: StaffAssignmentDropdownProps) {
  const { currentUser } = useCurrentUser();
  const { staffOptions, loading: staffLoading } = useStaffDropdown();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const currentUserNumericId = currentUser ? parseInt(currentUser.id, 10) : undefined;

  const handleAssignToStaff = async (staffId: number, staffName: string) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const updatedRequest = {
        ...request,
        assignedStaffId: staffId,
        assignedStaffName: staffName,
      };
      onUpdate?.(updatedRequest);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to assign request to staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnassign = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const updatedRequest = {
        ...request,
        assignedStaffId: undefined,
        assignedStaffName: undefined,
      };
      onUpdate?.(updatedRequest);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to unassign request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <DropdownMenuTrigger asChild>
            <TooltipTrigger asChild>
              {useNameAsTrigger && triggerContent ? (
                <div
                  className={cn("inline-flex items-center gap-1 cursor-pointer", triggerClassName)}
                  onClick={(e) => e.stopPropagation()}
                >
                  {triggerContent}
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={disabled || isLoading}
                  className={cn("h-6 px-2 text-xs", className)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <User className="h-3 w-3 mr-1" />
                  {request.assignedStaffId ? "Reassign" : "Assign"}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              )}
            </TooltipTrigger>
          </DropdownMenuTrigger>
          <TooltipContent>
            {tooltipText || (request.assignedStaffId ? "Reassign" : "Assign")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={disabled || isLoading || staffLoading}
          className={cn("h-6 px-2 text-xs", className)}
          onClick={(e) => e.stopPropagation()}
        >
          <User className="h-3 w-3 mr-1" />
          {isLoading ? "Updating..." : request.assignedStaffId ? "Reassign" : "Assign"}
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-48"
        onClick={(e) => e.stopPropagation()}
      >
        {staffLoading ? (
          <DropdownMenuItem disabled>
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Loading staff...</span>
            </div>
          </DropdownMenuItem>
        ) : (
          <>
            {/* Assign to Me option for admins */}
            {includeAssignToMe && currentUser && currentUserNumericId !== undefined && !Number.isNaN(currentUserNumericId) && (
              <>
                <DropdownMenuItem
                  onClick={() => handleAssignToStaff(currentUserNumericId, currentUser.fullName)}
                  disabled={isLoading || request.assignedStaffId === currentUserNumericId}
                  className="flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                      {getInitials(currentUser.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {request.assignedStaffId ? "Reassign to Me" : "Assign to Me"}
                    </span>
                    <span className="text-xs text-gray-500">{currentUser.fullName}</span>
                  </div>
                  {request.assignedStaffId === currentUserNumericId && (
                    <span className="text-xs text-blue-600 ml-auto">Current</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {staffOptions.length === 0 ? (
              <DropdownMenuItem disabled>
                <span className="text-sm text-muted-foreground">No staff available</span>
              </DropdownMenuItem>
            ) : (
              staffOptions.map((staff) => (
                <DropdownMenuItem
                  key={staff.id}
                  onClick={() => handleAssignToStaff(staff.id, staff.fullName)}
                  disabled={isLoading || request.assignedStaffId === staff.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs bg-gray-100">
                      {getInitials(staff.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{staff.fullName}</span>
                    <span className="text-xs text-gray-500">{staff.jobTitle}</span>
                  </div>
                  {request.assignedStaffId === staff.id && (
                    <span className="text-xs text-blue-600 ml-auto">Current</span>
                  )}
                </DropdownMenuItem>
              ))
            )}

            {showUnassignOption && request.assignedStaffId && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleUnassign}
                  disabled={isLoading}
                  className="flex items-center gap-2 cursor-pointer text-red-600"
                >
                  <UserX className="h-4 w-4" />
                  <span>Unassign</span>
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}