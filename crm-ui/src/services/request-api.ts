import {
  SeniorRequestDto,
  CreateSeniorRequestDto,
  UpdateSeniorRequestDto,
  SeniorRequestFilterDto,
  SeniorRequestView,
  RequestTypeDto,
  StaffDto,
  EnhancedTicket,
  RequestUtils
} from '@/types/request';
import { SeniorDto } from '@/types/senior';
import { PaginatedResponse } from '@/types/common';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088';
const REQUESTS_ENDPOINT = `${API_BASE_URL}/api/requests`;
const REQUEST_TYPES_ENDPOINT = `${API_BASE_URL}/api/request-types`;
const STAFF_ENDPOINT = `${API_BASE_URL}/api/staff`;

// Custom error classes
export class RequestApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public errors: Array<{ message: string; timestamp: string; field?: string; rejectedValue?: any }> = []
  ) {
    super(`Request API Error: ${status} ${statusText}`);
    this.name = 'RequestApiError';
  }
}

export class RequestValidationError extends RequestApiError {
  constructor(public validationErrors: Array<{ message: string; field: string; rejectedValue?: any; timestamp: string }>) {
    super(400, 'Validation Error', validationErrors);
    this.name = 'RequestValidationError';
  }
}

// HTTP client for request management
class RequestApiClient {
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Handle empty responses (204 No Content)
      if (response.status === 204) {
        return null as T;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof RequestApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new RequestApiError(
        0,
        'Network Error',
        [{ message: 'Failed to connect to the server', timestamp: new Date().toISOString() }]
      );
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any;
    
    try {
      errorData = await response.json();
    } catch {
      throw new RequestApiError(
        response.status,
        response.statusText,
        [{ message: 'An unexpected error occurred', timestamp: new Date().toISOString() }]
      );
    }

    // Handle validation errors (400)
    if (response.status === 400 && errorData.errors) {
      const validationErrors = errorData.errors.map((error: any) => ({
        message: error.message || 'Validation error',
        field: error.field || '',
        rejectedValue: error.rejectedValue,
        timestamp: errorData.timestamp || new Date().toISOString()
      }));
      
      throw new RequestValidationError(validationErrors);
    }

    // Handle other API errors
    throw new RequestApiError(
      response.status,
      response.statusText,
      errorData.errors || [{ 
        message: errorData.message || 'An error occurred', 
        timestamp: errorData.timestamp || new Date().toISOString() 
      }]
    );
  }

  async get<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(url: string, data: any): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(url: string, data: any): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' });
  }
}

// Request Management API Service
export class RequestManagementApiService {
  private client = new RequestApiClient();

  /**
   * Create a new senior request
   */
  async createRequest(requestData: CreateSeniorRequestDto): Promise<SeniorRequestDto> {
    return this.client.post<SeniorRequestDto>(REQUESTS_ENDPOINT, requestData);
  }

  /**
   * Get all requests with optional filtering
   */
  async getRequests(filter?: SeniorRequestFilterDto): Promise<SeniorRequestDto[]> {
    // Backend expects filter in request body for complex filtering
    if (filter) {
      return this.client.post<SeniorRequestDto[]>(REQUESTS_ENDPOINT, filter);
    } else {
      return this.client.get<SeniorRequestDto[]>(REQUESTS_ENDPOINT);
    }
  }

  /**
   * Get requests by status (high-performance projection)
   */
  async getRequestsByStatus(status: string): Promise<SeniorRequestView[]> {
    const url = `${REQUESTS_ENDPOINT}/by-status?status=${status}`;
    return this.client.get<SeniorRequestView[]>(url);
  }

  /**
   * Update an existing request
   */
  async updateRequest(requestData: UpdateSeniorRequestDto): Promise<SeniorRequestDto> {
    return this.client.put<SeniorRequestDto>(REQUESTS_ENDPOINT, requestData);
  }

  /**
   * Delete a request by ID
   */
  async deleteRequest(id: number): Promise<void> {
    return this.client.delete<void>(`${REQUESTS_ENDPOINT}/${id}`);
  }

  /**
   * Get all request types
   */
  async getRequestTypes(): Promise<RequestTypeDto[]> {
    return this.client.get<RequestTypeDto[]>(REQUEST_TYPES_ENDPOINT);
  }

  /**
   * Get all staff members
   */
  async getStaff(): Promise<StaffDto[]> {
    return this.client.get<StaffDto[]>(STAFF_ENDPOINT);
  }

  /**
   * Enhanced method to get requests with full details
   * This method combines request data with senior and staff information
   */
  async getEnhancedRequests(filter?: SeniorRequestFilterDto): Promise<EnhancedTicket[]> {
    try {
      // Get basic request data
      const requests = await this.getRequests(filter);
      
      // Get reference data in parallel
      const [seniors, staff, requestTypes] = await Promise.all([
        this.getSeniorsForRequests(requests),
        this.getStaff().catch(() => [] as StaffDto[]), // Gracefully handle if staff endpoint doesn't exist yet
        this.getRequestTypes().catch(() => [] as RequestTypeDto[]) // Gracefully handle if request types endpoint doesn't exist yet
      ]);

      // Create lookup maps for performance
      const seniorMap = new Map(seniors.map(s => [s.id, s]));
      const staffMap = new Map(staff.map(s => [s.id, s]));
      const requestTypeMap = new Map(requestTypes.map(rt => [rt.id, rt]));

      // Enhance requests with additional information
      return requests.map(request => {
        const senior = seniorMap.get(request.seniorId);
        const assignedStaff = request.assignedStaffId ? staffMap.get(request.assignedStaffId) : undefined;
        const requestType = request.requestTypeId ? requestTypeMap.get(request.requestTypeId) : undefined;

        return RequestUtils.toEnhancedTicket(request, {
          seniorName: senior ? `${senior.firstName} ${senior.lastName}` : `Senior ID ${request.seniorId}`,
          seniorPhone: senior?.contactPhone || undefined,
          seniorEmail: senior?.contactEmail || undefined,
          seniorAddress: senior?.address || undefined,
          assignedStaffName: assignedStaff ? `${assignedStaff.firstName} ${assignedStaff.lastName}` : undefined,
          requestTypeName: requestType?.name,
        });
      });
    } catch (error) {
      console.error('Error getting enhanced requests:', error);
      // Fallback to basic request data if enhancement fails
      const requests = await this.getRequests(filter);
      return requests.map(request => RequestUtils.toEnhancedTicket(request));
    }
  }

  /**
   * Get seniors data for requests (using existing senior API)
   */
  private async getSeniorsForRequests(requests: SeniorRequestDto[]): Promise<SeniorDto[]> {
    // Extract unique senior IDs
    const seniorIds = Array.from(new Set(requests.map(r => r.seniorId)));
    
    // Import senior API service dynamically to avoid circular dependency
    const { seniorApiService } = await import('@/services/senior-api');
    
    // Get seniors in batches (could be optimized further with backend support)
    const seniorsPromises = seniorIds.map(async (id) => {
      try {
        return await seniorApiService.getSeniorById(id);
      } catch (error) {
        console.warn(`Could not fetch senior with ID ${id}:`, error);
        return null;
      }
    });

    const seniors = await Promise.all(seniorsPromises);
    return seniors.filter((s): s is SeniorDto => s !== null);
  }

  /**
   * Get counts by status for dashboard
   */
  async getStatusCounts(): Promise<{
    pending: number;
    'in-progress': number;
    'in-review': number;
    completed: number;
    cancelled: number;
  }> {
    try {
      // Get all requests and count by status
      const requests = await this.getRequests();
      
      const counts = {
        pending: 0,
        'in-progress': 0,
        'in-review': 0,
        completed: 0,
        cancelled: 0,
      };

      requests.forEach(request => {
        const frontendStatus = RequestUtils.backendToFrontendStatus(request.status);
        counts[frontendStatus]++;
      });

      return counts;
    } catch (error) {
      console.error('Error getting status counts:', error);
      // Return empty counts on error
      return {
        pending: 0,
        'in-progress': 0,
        'in-review': 0,
        completed: 0,
        cancelled: 0,
      };
    }
  }
}

// Export singleton instance
export const requestManagementApiService = new RequestManagementApiService();

// Enhanced utility functions
export const requestUtils = {
  /**
   * Format request for display
   */
  formatRequestTitle(request: EnhancedTicket): string {
    const typeName = request.requestTypeName || 'Request';
    const seniorName = request.seniorName || `Senior ${request.seniorId}`;
    return `${typeName} for ${seniorName}`;
  },

  /**
   * Get priority display info
   */
  getPriorityInfo(priority: 'low' | 'medium' | 'high' | 'urgent') {
    const priorityMap = {
      low: { label: 'Low', color: 'text-green-600', bgColor: 'bg-green-50' },
      medium: { label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
      high: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-50' },
      urgent: { label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-50' },
    };
    return priorityMap[priority];
  },

  /**
   * Get status display info
   */
  getStatusInfo(status: 'pending' | 'in-progress' | 'in-review' | 'completed' | 'cancelled') {
    const statusMap = {
      pending: { label: 'Pending', color: 'text-slate-700', bgColor: 'bg-slate-50' },
      'in-progress': { label: 'In Progress', color: 'text-blue-700', bgColor: 'bg-blue-50' },
      'in-review': { label: 'In Review', color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
      completed: { label: 'Completed', color: 'text-green-700', bgColor: 'bg-green-50' },
      cancelled: { label: 'Cancelled', color: 'text-gray-700', bgColor: 'bg-gray-50' },
    };
    return statusMap[status];
  },

  /**
   * Filter requests based on frontend filter options
   */
  filterRequests(
    requests: EnhancedTicket[],
    filters: {
      priority?: ('low' | 'medium' | 'high' | 'urgent')[];
      status?: ('pending' | 'in-progress' | 'in-review' | 'completed' | 'cancelled')[];
      requestType?: string[];
      assignedStaff?: string[];
      searchTerm?: string;
    }
  ): EnhancedTicket[] {
    return requests.filter(request => {
      // Priority filter
      if (filters.priority && filters.priority.length > 0) {
        if (!filters.priority.includes(request.frontendPriority)) {
          return false;
        }
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(request.frontendStatus)) {
          return false;
        }
      }

      // Request type filter
      if (filters.requestType && filters.requestType.length > 0) {
        if (!filters.requestType.includes(request.requestTypeName || '')) {
          return false;
        }
      }

      // Assigned staff filter
      if (filters.assignedStaff && filters.assignedStaff.length > 0) {
        if (!filters.assignedStaff.includes(request.assignedStaffName || '')) {
          return false;
        }
      }

      // Search term filter
      if (filters.searchTerm && filters.searchTerm.trim()) {
        const searchTerm = filters.searchTerm.toLowerCase().trim();
        const searchableText = [
          request.title,
          request.description,
          request.seniorName,
          request.requestTypeName,
          request.assignedStaffName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  },

  /**
   * Sort requests
   */
  sortRequests(
    requests: EnhancedTicket[],
    sortBy: 'createdAt' | 'updatedAt' | 'priority' | 'status' | 'seniorName',
    direction: 'asc' | 'desc' = 'desc'
  ): EnhancedTicket[] {
    return [...requests].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'createdAt':
        case 'updatedAt':
          comparison = new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime();
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
          comparison = priorityOrder[a.frontendPriority] - priorityOrder[b.frontendPriority];
          break;
        case 'status':
          const statusOrder = { pending: 1, 'in-progress': 2, 'in-review': 3, completed: 4, cancelled: 5 };
          comparison = statusOrder[a.frontendStatus] - statusOrder[b.frontendStatus];
          break;
        case 'seniorName':
          comparison = (a.seniorName || '').localeCompare(b.seniorName || '');
          break;
        default:
          comparison = 0;
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }
};
