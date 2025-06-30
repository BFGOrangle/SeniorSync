export interface Ticket {
  id: string;

  // Personal Information
  seniorName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;

  // Request Details
  requestType: string;
  priority: "low" | "medium" | "high" | "urgent";
  description: string;
  preferredDate?: string;
  preferredTime?: string;

  // Medical Information
  medicalConditions?: string;
  medications?: string;
  mobilityAssistance: boolean;

  // Agent Information
  agentName: string;
  agentId: string;

  // System fields
  createdAt: string;
  status: "pending" | "in-progress" | "in-review" | "completed" | "cancelled";
  dueDate?: Date;

  // Legacy compatibility for display
  title?: string;
  assignee?: string;
  createdDate?: Date;
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
