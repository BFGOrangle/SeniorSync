"use client";

import { useState, useEffect, ReactNode } from "react";
import { ChevronDown, User, UserX } from "lucide-react";
import { useCurrentUser } from "@/contexts/user-context";
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

interface StaffMember {
  id: number;
  fullName: string;
  jobTitle: string;
  isActive: boolean;
}

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
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // TODO: Replace with actual API call to get staff list
  useEffect(() => {
    const fetchStaffList = async () => {
      // Placeholder - replace with actual API call
      const mockStaff: StaffMember[] = [
        { id: 1, fullName: "John Smith", jobTitle: "Care Coordinator", isActive: true },
        { id: 2, fullName: "Emily Johnson", jobTitle: "Nurse", isActive: true },
        { id: 3, fullName: "Michael Williams", jobTitle: "Social Worker", isActive: true },
        { id: 4, fullName: "Sarah Brown", jobTitle: "Administrator", isActive: true },
      ];
      setStaffList(mockStaff);
    };

    fetchStaffList();
  }, []);

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
      
      <DropdownMenuContent 
        align="end" 
        className="w-48"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Assign to Me option for admins */}
        {includeAssignToMe && currentUser && (
          <>
            <DropdownMenuItem
              onClick={() => handleAssignToStaff(currentUser.id, currentUser.fullName)}
              disabled={isLoading || request.assignedStaffId === currentUser.id}
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
              {request.assignedStaffId === currentUser.id && (
                <span className="text-xs text-blue-600 ml-auto">Current</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {staffList.map((staff) => (
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
        ))}
        
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 