// Backend API types for request management
export type RequestStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

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
  minPriority?: number;
  maxPriority?: number;
  createdAfter?: string; // ISO string
  createdBefore?: string; // ISO string
}

// High-performance projection for read operations
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

// Request types from backend
export interface RequestTypeDto {
  id: number;
  name: string;
  description?: string;
}

// Staff DTO for assignment
export interface StaffDto {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  contactPhone?: string;
  contactEmail?: string;
  createdAt: string;
  updatedAt: string;
}

// Enhanced ticket type that bridges frontend and backend
export interface EnhancedTicket {
  // Backend fields
  id: number;
  seniorId: number;
  assignedStaffId?: number;
  requestTypeId?: number;
  title: string;
  description: string;
  priority: number;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  
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
  frontendStatus: 'pending' | 'in-progress' | 'in-review' | 'completed' | 'cancelled';
  frontendPriority: 'low' | 'medium' | 'high' | 'urgent';
}

// Utility functions for converting between backend and frontend formats
export const RequestUtils = {
  // Convert backend status to frontend status
  backendToFrontendStatus(status: RequestStatus): 'pending' | 'in-progress' | 'in-review' | 'completed' | 'cancelled' {
    switch (status) {
      case 'TODO':
        return 'pending';
      case 'IN_PROGRESS':
        return 'in-progress';
      case 'COMPLETED':
        return 'completed';
      default:
        return 'pending';
    }
  },

  // Convert frontend status to backend status
  frontendToBackendStatus(status: 'pending' | 'in-progress' | 'in-review' | 'completed' | 'cancelled'): RequestStatus {
    switch (status) {
      case 'pending':
        return 'TODO';
      case 'in-progress':
      case 'in-review': // Map both to IN_PROGRESS since backend only has 3 states
        return 'IN_PROGRESS';
      case 'completed':
        return 'COMPLETED';
      case 'cancelled':
        return 'TODO'; // Could be enhanced to add CANCELLED status to backend
      default:
        return 'TODO';
    }
  },

  // Convert backend priority (1-5) to frontend priority
  backendToFrontendPriority(priority: number): 'low' | 'medium' | 'high' | 'urgent' {
    if (priority <= 1) return 'low';
    if (priority <= 2) return 'medium';
    if (priority <= 3) return 'high';
    return 'urgent';
  },

  // Convert frontend priority to backend priority (1-5)
  frontendToBackendPriority(priority: 'low' | 'medium' | 'high' | 'urgent'): number {
    switch (priority) {
      case 'low':
        return 1;
      case 'medium':
        return 2;
      case 'high':
        return 3;
      case 'urgent':
        return 4;
      default:
        return 1;
    }
  },

  // Convert SeniorRequestDto to EnhancedTicket
  toEnhancedTicket(request: SeniorRequestDto, additionalInfo?: {
    seniorName?: string;
    seniorPhone?: string;
    seniorEmail?: string;
    seniorAddress?: string;
    assignedStaffName?: string;
    requestTypeName?: string;
  }): EnhancedTicket {
    return {
      ...request,
      ...additionalInfo,
      frontendStatus: this.backendToFrontendStatus(request.status),
      frontendPriority: this.backendToFrontendPriority(request.priority),
    };
  }
};
