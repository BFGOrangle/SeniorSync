// Backend API types for request management
export type RequestStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";

// Import reminder types from dedicated file
import { Reminder } from "./reminder";

export interface SeniorRequestDto {
  id: number;
  seniorId: number;
  assignedStaffId?: number;
  requestTypeId?: number;
  title: string;
  description: string;
  priority: number; // 1-5 scale in backend
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  completedAt?: string; // ISO string
  status: RequestStatus;
  assignedStaffName?: string; // Added to match backend DTO
  // Spam detection fields
  isSpam?: boolean;
  spamConfidenceScore?: number;
  spamDetectionReason?: string;
  spamDetectedAt?: string; // ISO string
}

export interface CreateSeniorRequestDto {
  seniorId: number;
  requestTypeId: number;
  title: string;
  description: string;
  priority: number; // 1-5 scale
}

export interface UpdateSeniorRequestDto {
  id: number;
  title: string;
  description: string;
  priority: number;
  status: RequestStatus;
  assignedStaffId?: number;
  requestTypeId?: number;
}

export interface SeniorRequestFilterDto {
  status?: RequestStatus;
  seniorId?: number;
  assignedStaffId?: number;
  requestTypeId?: number;
  minPriority?: number;
  maxPriority?: number;
  createdAfter?: string; // ISO string
  createdBefore?: string; // ISO string
}

// Filter options from backend
export interface RequestFilterOptionsDto {
  staffOptions: StaffOptionDto[];
  requestTypeOptions: RequestTypeOptionDto[];
}

export interface StaffOptionDto {
  id: number;
  fullName: string;
  jobTitle: string;
}

export interface RequestTypeOptionDto {
  id: number;
  name: string;
  description?: string;
}

// High-performance projection for read operations - matches backend SeniorRequestView interface
export interface SeniorRequestView {
  id: number;
  seniorId: number;
  assignedStaffId?: number;
  requestTypeId?: number;
  title: string;
  description: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  status: RequestStatus;
}

// Extended view with populated reference data for UI display
export interface SeniorRequestDisplayView extends SeniorRequestView {
  // Additional senior information (populated via join or separate call)
  seniorName?: string;
  seniorPhone?: string;
  seniorEmail?: string;
  seniorAddress?: string;

  // Additional staff information (populated via join or separate call)
  assignedStaffName?: string;

  // Additional request type information
  requestTypeName?: string;

  // Frontend compatibility fields (computed from backend data)
  frontendStatus: "todo" | "in-progress" | "completed";
  frontendPriority: "low" | "medium" | "high" | "urgent";

  // Reminder information
  reminders?: Reminder[];

  // Spam detection fields
  isSpam?: boolean;
  spamConfidenceScore?: number;
  spamDetectionReason?: string;
  spamDetectedAt?: string;
}

// Utility functions for converting between backend and frontend formats
export const RequestUtils = {
  // Convert backend status to frontend status
  backendToFrontendStatus(
    status: RequestStatus
  ): "todo" | "in-progress" | "completed" {
    switch (status) {
      case "TODO":
        return "todo";
      case "IN_PROGRESS":
        return "in-progress";
      case "COMPLETED":
        return "completed";
      default:
        return "todo";
    }
  },

  // Convert frontend status to backend status
  frontendToBackendStatus(
    status: "todo" | "in-progress" | "completed"
  ): RequestStatus {
    switch (status) {
      case "todo":
        return "TODO";
      case "in-progress":
        return "IN_PROGRESS";
      case "completed":
        return "COMPLETED";
      default:
        return "TODO";
    }
  },

  // Convert backend priority (1-5) to frontend priority
  backendToFrontendPriority(
    priority: number
  ): "low" | "medium" | "high" | "urgent" {
    if (priority <= 1) return "low";
    if (priority <= 2) return "medium";
    if (priority <= 3) return "high";
    return "urgent";
  },

  // Convert frontend priority to backend priority (1-5)
  frontendToBackendPriority(
    priority: "low" | "medium" | "high" | "urgent"
  ): number {
    switch (priority) {
      case "low":
        return 1;
      case "medium":
        return 2;
      case "high":
        return 3;
      case "urgent":
        return 4;
      default:
        return 1;
    }
  },

  // Convert SeniorRequestView to SeniorRequestDisplayView with additional info
  toDisplayView(
    request: SeniorRequestView,
    additionalInfo?: {
      seniorName?: string;
      seniorPhone?: string;
      seniorEmail?: string;
      seniorAddress?: string;
      assignedStaffName?: string;
      requestTypeName?: string;
    }
  ): SeniorRequestDisplayView {
    return {
      ...request,
      ...additionalInfo,
      frontendStatus: this.backendToFrontendStatus(request.status),
      frontendPriority: this.backendToFrontendPriority(request.priority),
    };
  },

  // Convert SeniorRequestDto to SeniorRequestDisplayView with additional info
  fromDtoToDisplayView(
    request: SeniorRequestDto,
    additionalInfo?: {
      seniorName?: string;
      seniorPhone?: string;
      seniorEmail?: string;
      seniorAddress?: string;
      assignedStaffName?: string;
      requestTypeName?: string;
    }
  ): SeniorRequestDisplayView {
    return {
      ...request,
      ...additionalInfo,
      // Use assignedStaffName from the DTO if available, otherwise from additionalInfo
      assignedStaffName: request.assignedStaffName || additionalInfo?.assignedStaffName,
      frontendStatus: this.backendToFrontendStatus(request.status),
      frontendPriority: this.backendToFrontendPriority(request.priority),
      // Include spam detection fields
      isSpam: request.isSpam,
      spamConfidenceScore: request.spamConfidenceScore,
      spamDetectionReason: request.spamDetectionReason,
      spamDetectedAt: request.spamDetectedAt,
    };
  },
};
