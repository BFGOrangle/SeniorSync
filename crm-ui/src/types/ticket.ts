
// Updated Ticket interface that is compatible with both legacy and new backend structure
export interface Ticket {
  // Core fields (from backend)
  id: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: "pending" | "in-progress" | "in-review" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  
  // Senior information (from joined data or legacy fields)
  seniorName?: string;
  seniorId?: number;
  phoneNumber?: string;
  email?: string;
  address?: string;
  
  // Request details
  requestType?: string; // Maps to requestTypeName from backend
  requestTypeId?: number;
  
  // Staff/Agent information
  assignee?: string; // Maps to assignedStaffName
  assignedStaffId?: number;
  agentName?: string; // Legacy compatibility
  agentId?: string; // Legacy compatibility
  
  // Legacy fields for backward compatibility
  emergencyContact?: string;
  emergencyPhone?: string;
  preferredDate?: string;
  preferredTime?: string;
  medicalConditions?: string;
  medications?: string;
  mobilityAssistance?: boolean;
  dueDate?: Date;
  completedAt?: string;
}

export type ViewMode = "kanban" | "table";
export type Priority = "low" | "medium" | "high" | "urgent";
export type Status =
  | "pending"
  | "in-progress"
  | "in-review"
  | "completed"
  | "cancelled";

export interface FilterOptions {
  priority?: Priority[];
  status?: Status[];
  requestType?: string[];
  agentId?: string[];
  assignee?: string[];
  search?: string;
}

export interface SortOption {
  field: keyof Ticket;
  direction: "asc" | "desc";
}
