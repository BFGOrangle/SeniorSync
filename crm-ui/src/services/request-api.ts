import { AuthenticatedApiClient } from './authenticated-api-client';
import {
  SeniorRequestDto,
  CreateSeniorRequestDto,
  UpdateSeniorRequestDto,
  SeniorRequestFilterDto,
  SeniorRequestView,
  SeniorRequestDisplayView,
  RequestUtils,
  RequestFilterOptionsDto
} from '@/types/request';
import { SeniorDto } from '@/types/senior';
import { PaginatedResponse } from '@/types/common';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088';
const REQUESTS_ENDPOINT = `${API_BASE_URL}/api/requests`;

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

// HTTP client for request management with JWT authentication
class RequestApiClient extends AuthenticatedApiClient {
  // Override error handling for request-specific errors
  protected async handleErrorResponse(response: Response): Promise<never> {
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
   * Get requests by senior ID
   */
  async getRequestsBySenior(seniorId: number): Promise<SeniorRequestDto[]> {
    const url = `${REQUESTS_ENDPOINT}/senior/${seniorId}`;
    return this.client.get<SeniorRequestDto[]>(url);
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
   * Enhanced method to get requests with full details
   * This method combines request data with senior information
   */
  async getEnhancedRequests(filter?: SeniorRequestFilterDto): Promise<SeniorRequestDisplayView[]> {
    try {
      // Get basic request data
      const requests = await this.getRequests(filter);
      
      // Get senior data
      const seniors = await this.getSeniorsForRequests(requests);

      // Create lookup map for performance
      const seniorMap = new Map(seniors.map(s => [s.id, s]));

      // Enhance requests with additional information
      return requests.map(request => {
        const senior = seniorMap.get(request.seniorId);

        return RequestUtils.fromDtoToDisplayView(request, {
          seniorName: senior ? `${senior.firstName} ${senior.lastName}` : `Senior ID ${request.seniorId}`,
          seniorPhone: senior?.contactPhone || undefined,
          seniorEmail: senior?.contactEmail || undefined,
          seniorAddress: senior?.address || undefined,
        });
      });
    } catch (error) {
      console.error('Error getting enhanced requests:', error);
      // Fallback to basic request data if enhancement fails
      const requests = await this.getRequests(filter);
      return requests.map(request => RequestUtils.fromDtoToDisplayView(request));
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
    todo: number;
    'in-progress': number;
    completed: number;
  }> {
    try {
      // Get all requests and count by status
      const requests = await this.getRequests();
      
      const counts = {
        todo: 0,
        'in-progress': 0,
        completed: 0,
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
        todo: 0,
        'in-progress': 0,
        completed: 0,
      };
    }
  }

  /**
   * Get a single request by ID with enhanced details
   */
  async getRequestById(id: number): Promise<SeniorRequestDisplayView | null> {
    try {
      // Get basic request data (we'll need to implement this endpoint)
      const request = await this.client.get<SeniorRequestDto>(`${REQUESTS_ENDPOINT}/${id}`);
      
      if (!request) {
        return null;
      }

      // Get senior data
      const seniors = await this.getSeniorsForRequests([request]);

      // Create lookup map for performance
      const seniorMap = new Map(seniors.map(s => [s.id, s]));

      // Enhance request with additional information
      const senior = seniorMap.get(request.seniorId);

      return RequestUtils.fromDtoToDisplayView(request, {
        seniorName: senior ? `${senior.firstName} ${senior.lastName}` : `Senior ID ${request.seniorId}`,
        seniorPhone: senior?.contactPhone || undefined,
        seniorEmail: senior?.contactEmail || undefined,
        seniorAddress: senior?.address || undefined,
      });
    } catch (error) {
      console.error('Error getting request by ID:', error);
      return null;
    }
  }

  /**
   * Get filter options for request filtering
   */
  async getFilterOptions(): Promise<RequestFilterOptionsDto> {
    return this.client.get<RequestFilterOptionsDto>(`${REQUESTS_ENDPOINT}/filter-options`);
  }

  /**
   * Get current user's requests with optional filtering
   */
  async getMyRequests(filter?: SeniorRequestFilterDto): Promise<SeniorRequestDto[]> {
    if (filter) {
      return this.client.post<SeniorRequestDto[]>(`${REQUESTS_ENDPOINT}/my-requests`, filter);
    } else {
      return this.client.get<SeniorRequestDto[]>(`${REQUESTS_ENDPOINT}/my-requests`);
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
  formatRequestTitle(request: SeniorRequestDisplayView): string {
    const seniorName = request.seniorName || `Senior ${request.seniorId}`;
    return `Request for ${seniorName}`;
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
  getStatusInfo(status: 'todo' | 'in-progress'| 'completed' ) {
    const statusMap = {
      todo: { label: 'TODO', color: 'text-slate-700', bgColor: 'bg-slate-50' },
      'in-progress': { label: 'In Progress', color: 'text-blue-700', bgColor: 'bg-blue-50' },
      completed: { label: 'Completed', color: 'text-green-700', bgColor: 'bg-green-50' }
    };
    return statusMap[status];
  },

  /**
   * Filter requests based on frontend filter options
   */
  filterRequests(
    requests: SeniorRequestDisplayView[],
    filters: {
      priority?: ('low' | 'medium' | 'high' | 'urgent')[];
      status?: ('todo' | 'in-progress'| 'completed' )[];
      requestType?: number[];
      assignedStaff?: number[];
      searchTerm?: string;
      showAllCompleted?: boolean; // Show all completed requests, not just last week
      dueDate?: {
        overdue?: boolean;
        dueToday?: boolean;
        dueThisWeek?: boolean;
        noDueDate?: boolean;
        // Phase 3: Advanced date range filtering
        dateRange?: {
          from?: string; // ISO date string
          to?: string; // ISO date string
        };
      };
    }
  ): SeniorRequestDisplayView[] {
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
        if (!request.requestTypeId || !filters.requestType.includes(request.requestTypeId)) {
          return false;
        }
      }

      // Assigned staff filter - filter by staff ID
      if (filters.assignedStaff) {
        // Handle unassigned requests (empty array means show unassigned)
        if (filters.assignedStaff.length === 0) {
          if (request.assignedStaffId) {
            return false;
          }
        } else {
          if (!request.assignedStaffId || !filters.assignedStaff.includes(request.assignedStaffId)) {
            return false;
          }
        }
      }

      // Search term filter
      if (filters.searchTerm && filters.searchTerm.trim()) {
        const searchTerm = filters.searchTerm.toLowerCase().trim();
        const searchableText = [
          request.title,
          request.description,
          request.seniorName,
          request.assignedStaffName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Due date filter - only apply to non-completed requests
      // Completed requests should not show overdue status as it's irrelevant
      if (filters.dueDate && request.frontendStatus !== 'completed') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);

        let dueDateMatches = false;

        // Check if request has no due date
        if (filters.dueDate.noDueDate && !request.dueDate) {
          dueDateMatches = true;
        }

        // Check due date conditions if request has a due date
        if (request.dueDate) {
          const dueDate = new Date(request.dueDate);
          const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

          if (filters.dueDate.overdue && dueDateOnly < today) {
            dueDateMatches = true;
          }

          if (filters.dueDate.dueToday && dueDateOnly.getTime() === today.getTime()) {
            dueDateMatches = true;
          }

          if (filters.dueDate.dueThisWeek && dueDateOnly >= today && dueDateOnly <= weekFromNow) {
            dueDateMatches = true;
          }

          // Phase 3: Date range filtering
          if (filters.dueDate.dateRange) {
            const { from, to } = filters.dueDate.dateRange;
            
            if (from && to) {
              const fromDate = new Date(from);
              const toDate = new Date(to);
              toDate.setHours(23, 59, 59, 999); // Include the entire "to" date
              
              if (dueDateOnly >= fromDate && dueDateOnly <= toDate) {
                dueDateMatches = true;
              }
            } else if (from) {
              const fromDate = new Date(from);
              if (dueDateOnly >= fromDate) {
                dueDateMatches = true;
              }
            } else if (to) {
              const toDate = new Date(to);
              toDate.setHours(23, 59, 59, 999);
              if (dueDateOnly <= toDate) {
                dueDateMatches = true;
              }
            }
          }
        }

        // If any due date filter is selected but none match, exclude this request
        const hasDueDateFilters = filters.dueDate.overdue || filters.dueDate.dueToday || 
                                 filters.dueDate.dueThisWeek || filters.dueDate.noDueDate ||
                                 (filters.dueDate.dateRange?.from || filters.dueDate.dateRange?.to);
        
        if (hasDueDateFilters && !dueDateMatches) {
          return false;
        }
      }

      // Auto-filter completed requests to show only last week by default
      // UNLESS the user explicitly wants to see all completed requests
      // This improves UX by keeping the completed column clean and relevant
      if (request.frontendStatus === 'completed' && !filters.showAllCompleted) {
        if (request.completedAt) {
          const completedDate = new Date(request.completedAt);
          const today = new Date();
          const oneWeekAgo = new Date(today);
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          
          // Only show completed requests from the last week
          if (completedDate < oneWeekAgo) {
            return false;
          }
        }
      }

      return true;
    });
  },

  /**
   * Sort requests
   */
  sortRequests(
    requests: SeniorRequestDisplayView[],
    sortBy: 'createdAt' | 'updatedAt' | 'priority' | 'status' | 'seniorName' | 'dueDate',
    direction: 'asc' | 'desc' = 'desc'
  ): SeniorRequestDisplayView[] {
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
          const statusOrder = { todo: 1, 'in-progress': 2,  completed: 4 };
          comparison = statusOrder[a.frontendStatus] - statusOrder[b.frontendStatus];
          break;
        case 'seniorName':
          comparison = (a.seniorName || '').localeCompare(b.seniorName || '');
          break;
        case 'dueDate':
          // Handle null/undefined due dates - put them at the end
          if (!a.dueDate && !b.dueDate) {
            comparison = 0;
          } else if (!a.dueDate) {
            comparison = 1; // a comes after b
          } else if (!b.dueDate) {
            comparison = -1; // a comes before b
          } else {
            comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          }
          break;
        default:
          comparison = 0;
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }
};
