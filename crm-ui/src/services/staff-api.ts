import { AuthenticatedApiClient, BaseApiError } from './authenticated-api-client';
import {
  StaffResponseDto,
  CreateStaffDto,
  UpdateStaffDto,
  StaffApiError,
  StaffValidationError,
  StaffDisplayView,
  StaffUtils
} from '@/types/staff';
import { PaginatedResponse } from "@/types/common";

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088';
const STAFF_ENDPOINT = `${API_BASE_URL}/api/staff`;

// Default pagination settings
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// Staff-specific error classes (extending base)
export class StaffApiErrorClass extends BaseApiError {
  constructor(
    status: number,
    statusText: string,
    errors?: Array<{ message: string; timestamp: string; field?: string; rejectedValue?: any }>,
    timestamp?: string
  ) {
    super(status, statusText, errors || [], timestamp);
    this.name = 'StaffApiError';
  }
}

export class StaffValidationErrorClass extends StaffApiErrorClass {
  constructor(
    public validationErrors: Array<{ message: string; field: string; rejectedValue?: any; timestamp: string }>,
    status: number = 400,
    statusText: string = 'Validation Error'
  ) {
    super(status, statusText, validationErrors);
    this.name = 'StaffValidationError';
  }
}

// HTTP client for staff management extending authenticated base
class StaffApiClient extends AuthenticatedApiClient {
  // Override error handling for staff-specific errors
  protected async handleErrorResponse(response: Response): Promise<never> {
    let errorData: unknown;
    
    try {
      errorData = await response.json();
    } catch {
      // If JSON parsing fails, create a generic error
      throw new StaffApiErrorClass(
        response.status,
        response.statusText,
        [{ message: 'An unexpected error occurred', timestamp: new Date().toISOString() }]
      );
    }

    // Type assertion for safe property access
    const errorResponse = errorData as {
      error?: string;
      errors?: Array<{ message: string; field?: string; rejectedValue?: any }>;
      timestamp?: string;
      message?: string;
    };

    // Handle validation errors (400)
    if (response.status === 400 && errorResponse.errors) {
      const validationErrors = errorResponse.errors.map(error => ({
        message: error.message || 'Validation error',
        field: error.field || '',
        rejectedValue: error.rejectedValue,
        timestamp: errorResponse.timestamp || new Date().toISOString()
      }));
      
      throw new StaffValidationErrorClass(validationErrors);
    }

    // Handle other API errors
    const normalizedErrors = (errorResponse.errors || []).map(err => ({
      message: err.message || errorResponse.error || errorResponse.message || 'An error occurred',
      field: err.field,
      rejectedValue: err.rejectedValue,
      timestamp: errorResponse.timestamp || new Date().toISOString()
    }));

    throw new StaffApiErrorClass(
      response.status,
      response.statusText,
      normalizedErrors.length > 0 ? normalizedErrors : [{
        message: errorResponse.error || errorResponse.message || 'An error occurred',
        timestamp: errorResponse.timestamp || new Date().toISOString()
      }]
    );
  }
}

// Staff API service with proper pagination and CRUD operations
export class StaffApiService {
  private client = new StaffApiClient();

  /**
   * Create a new staff member (Admin only)
   * @param staffData - The staff data to create
   * @returns Promise<StaffResponseDto> - The created staff member
   */
  async createStaff(staffData: CreateStaffDto): Promise<StaffResponseDto> {
    return this.client.post<StaffResponseDto>(STAFF_ENDPOINT, staffData);
  }

  /**
   * Get paginated staff members (Admin only)
   * @param page - Page number (0-based)
   * @param size - Page size
   * @returns Promise<PaginatedResponse<StaffResponseDto>> - Paginated response
   */
  async getStaffPaginated(
    page: number = 0, 
    size: number = DEFAULT_PAGE_SIZE
  ): Promise<PaginatedResponse<StaffResponseDto>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: Math.min(size, MAX_PAGE_SIZE).toString()
    });

    const url = `${STAFF_ENDPOINT}?${params}`;
    return this.client.get<PaginatedResponse<StaffResponseDto>>(url);
  }

  /**
   * Get all staff members with enhanced display data
   * @param page - Page number (0-based)
   * @param size - Page size
   * @returns Promise<PaginatedResponse<StaffDisplayView>> - Paginated response with display data
   */
  async getStaffWithDisplayData(
    page: number = 0, 
    size: number = DEFAULT_PAGE_SIZE
  ): Promise<PaginatedResponse<StaffDisplayView>> {
    const paginatedResult = await this.getStaffPaginated(page, size);
    
    return {
      ...paginatedResult,
      content: paginatedResult.content.map(staff => StaffUtils.toDisplayView(staff))
    };
  }

  /**
   * Get staff members by center ID (must match user's center)
   * @param centerId - Center ID
   * @param page - Page number (0-based)
   * @param size - Page size
   * @returns Promise<PaginatedResponse<StaffResponseDto>> - Paginated response
   */
  async getStaffByCenter(
    centerId: number,
    page: number = 0, 
    size: number = DEFAULT_PAGE_SIZE
  ): Promise<PaginatedResponse<StaffResponseDto>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: Math.min(size, MAX_PAGE_SIZE).toString()
    });

    const url = `${STAFF_ENDPOINT}/center/${centerId}?${params}`;
    return this.client.get<PaginatedResponse<StaffResponseDto>>(url);
  }

  /**
   * Get a single staff member by ID
   * @param id - The staff ID
   * @returns Promise<StaffResponseDto | null> - The staff member or null if not found
   */
  async getStaffById(id: number): Promise<StaffResponseDto | null> {
    try {
      return await this.client.get<StaffResponseDto>(`${STAFF_ENDPOINT}/${id}`);
    } catch (error) {
      if (error instanceof StaffApiErrorClass && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Update an existing staff member
   * @param id - The staff ID to update
   * @param staffData - The staff data to update
   * @returns Promise<StaffResponseDto> - The updated staff member
   */
  async updateStaff(id: number, staffData: UpdateStaffDto): Promise<StaffResponseDto> {
    return this.client.put<StaffResponseDto>(`${STAFF_ENDPOINT}/${id}`, staffData);
  }

  /**
   * Delete (deactivate) a staff member (Admin only)
   * @param id - The staff ID to delete
   * @returns Promise<void>
   */
  async deleteStaff(id: number): Promise<void> {
    return this.client.delete<void>(`${STAFF_ENDPOINT}/${id}`);
  }

  /**
   * Toggle staff member status (activate/deactivate) (Admin only)
   * @param id - The staff ID
   * @param isActive - New active status
   * @returns Promise<StaffResponseDto> - The updated staff member
   */
  async toggleStaffStatus(id: number, isActive: boolean): Promise<StaffResponseDto> {
    const params = new URLSearchParams({ isActive: isActive.toString() });
    const url = `${STAFF_ENDPOINT}/${id}/status?${params}`;
    return this.client.patch<StaffResponseDto>(url, {});
  }

  /**
   * Get active staff members for dropdowns (lightweight)
   * @param centerId - Center ID (optional, will use current user's center if not provided)
   * @returns Promise<Array<{id: number, fullName: string, jobTitle: string}>>
   */
  async getActiveStaffForDropdown(centerId?: number): Promise<Array<{
    id: number;
    fullName: string;
    jobTitle: string;
  }>> {
    try {
      let url = STAFF_ENDPOINT;
      if (centerId) {
        url = `${STAFF_ENDPOINT}/center/${centerId}`;
      }
      
      // Get first page with larger size to get most staff
      const params = new URLSearchParams({
        page: '0',
        size: '100'
      });
      
      const response = await this.client.get<PaginatedResponse<StaffResponseDto>>(`${url}?${params}`);
      
      // Filter active staff and return lightweight objects
      return response.content
        .filter(staff => staff.isActive)
        .map(staff => ({
          id: staff.id,
          fullName: staff.fullName,
          jobTitle: staff.jobTitle
        }));
    } catch (error) {
      console.error('Error fetching active staff for dropdown:', error);
      return [];
    }
  }

  /**
   * Search staff by name or email
   * @param searchTerm - Search term
   * @param page - Page number (0-based)
   * @param size - Page size
   * @returns Promise<PaginatedResponse<StaffDisplayView>> - Paginated search results
   */
  async searchStaff(
    searchTerm: string,
    page: number = 0,
    size: number = DEFAULT_PAGE_SIZE
  ): Promise<PaginatedResponse<StaffDisplayView>> {
    // For now, get all staff and filter client-side
    // In a real implementation, you might want a dedicated search endpoint
    const allStaff = await this.getStaffWithDisplayData(0, 1000); // Get a large page
    
    const filteredStaff = allStaff.content.filter(staff => {
      const searchLower = searchTerm.toLowerCase();
      return (
        staff.fullName.toLowerCase().includes(searchLower) ||
        staff.contactEmail.toLowerCase().includes(searchLower) ||
        staff.jobTitle.toLowerCase().includes(searchLower)
      );
    });

    // Manual pagination for filtered results
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedContent = filteredStaff.slice(startIndex, endIndex);

    return {
      content: paginatedContent,
      totalElements: filteredStaff.length,
      totalPages: Math.ceil(filteredStaff.length / size),
      number: page,
      size: size,
      first: page === 0,
      last: endIndex >= filteredStaff.length,
      numberOfElements: paginatedContent.length,
      empty: paginatedContent.length === 0
    };
  }

  /**
   * Get staff statistics for dashboard
   * @returns Promise<{total: number, active: number, inactive: number, byRole: Record<string, number>}>
   */
  async getStaffStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
  }> {
    try {
      // Get all staff for stats calculation
      const response = await this.getStaffPaginated(0, 1000);
      const allStaff = response.content;

      const stats = {
        total: allStaff.length,
        active: allStaff.filter(s => s.isActive).length,
        inactive: allStaff.filter(s => !s.isActive).length,
        byRole: {} as Record<string, number>
      };

      // Count by role
      allStaff.forEach(staff => {
        stats.byRole[staff.roleType] = (stats.byRole[staff.roleType] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching staff stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byRole: {}
      };
    }
  }

  /**
   * Get staff member's Cognito Sub
   * @param id - Staff ID
   * @returns Promise<string | null> - Full name or null if not found
   */
  async getStaffByCognitoSub(sub: string): Promise<StaffResponseDto | null> {
    try {
      return await this.client.get<StaffResponseDto>(`${STAFF_ENDPOINT}/my-profile/sub/${sub}`);
      console.log("Staff fetched by Cognito Sub:", sub);
    } catch (error) {
      console.error('Error fetching staff of Cognito Sub:', error);
      return null;
    }
  }
}

// Export singleton instance
export const staffApiService = new StaffApiService();

// Export error classes for use in components
export { StaffApiErrorClass as StaffApiError, StaffValidationErrorClass as StaffValidationError };