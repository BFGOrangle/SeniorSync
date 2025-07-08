import {
  SeniorDto,
  CreateSeniorDto,
  UpdateSeniorDto,
  SeniorFilterDto,
  SeniorView,
  SeniorSearchParams,
  ApiError,
  ValidationError
} from '@/types/senior';
import { PaginatedResponse } from "@/types/common";

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088';
const SENIORS_ENDPOINT = `${API_BASE_URL}/api/seniors`;

// Default pagination settings following big tech practices
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// Custom error classes following big tech practices
export class SeniorApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public errors?: ApiError[],
    public timestamp?: string
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'SeniorApiError';
  }
}

export class SeniorValidationError extends SeniorApiError {
  constructor(
    public validationErrors: ValidationError[],
    status: number = 400,
    statusText: string = 'Validation Error'
  ) {
    super(status, statusText, validationErrors);
    this.name = 'SeniorValidationError';
  }
}

// HTTP client with error handling and type safety
class ApiClient {
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
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
      if (error instanceof SeniorApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new SeniorApiError(
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
      // If JSON parsing fails, create a generic error
      throw new SeniorApiError(
        response.status,
        response.statusText,
        [{ message: 'An unexpected error occurred', timestamp: new Date().toISOString() }]
      );
    }

    // Handle validation errors (400)
    if (response.status === 400 && errorData.errors) {
      const validationErrors: ValidationError[] = errorData.errors.map((error: any) => ({
        message: error.message || 'Validation error',
        field: error.field || '',
        rejectedValue: error.rejectedValue,
        timestamp: errorData.timestamp || new Date().toISOString()
      }));
      
      throw new SeniorValidationError(validationErrors);
    }

    // Handle other API errors
    throw new SeniorApiError(
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

// Senior API service with proper pagination
export class SeniorApiService {
  private client = new ApiClient();

  /**
   * Create a new senior
   * @param seniorData - The senior data to create
   * @returns Promise<SeniorDto> - The created senior
   */
  async createSenior(seniorData: CreateSeniorDto): Promise<SeniorDto> {
    return this.client.post<SeniorDto>(SENIORS_ENDPOINT, seniorData);
  }

  /**
   * Get paginated seniors with filtering - ALWAYS uses pagination
   * @param filter - Filter criteria with pagination parameters
   * @returns Promise<PaginatedResponse<SeniorDto>> - Paginated response
   */
  async getSeniorsPaginated(filter: SeniorFilterDto = {}): Promise<PaginatedResponse<SeniorDto>> {
    // Always apply pagination - never fetch all records
    const searchParams = this.buildSearchParams({
      ...filter,
      page: filter.page ?? 0,
      size: Math.min(filter.size ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)
    });

    // Use POST for complex filtering (following backend pattern)
    const filterBody = this.buildFilterBody(filter);
    const url = `${SENIORS_ENDPOINT}/paginated?${searchParams}`;
    
    return this.client.post<PaginatedResponse<SeniorDto>>(url, filterBody);
  }

  /**
   * Legacy method - now delegates to paginated version with warning
   * @deprecated Use getSeniorsPaginated instead
   */
  async getSeniors(filter?: SeniorFilterDto): Promise<SeniorDto[]> {
    console.warn('getSeniors is deprecated. Use getSeniorsPaginated for better performance.');
    
    const paginatedResult = await this.getSeniorsPaginated({
      ...filter,
      page: 0,
      size: DEFAULT_PAGE_SIZE
    });
    
    return paginatedResult.content;
  }

  /**
   * Search seniors by name using high-performance projection with pagination
   * @param searchParams - Search parameters with pagination
   * @returns Promise<PaginatedResponse<SeniorView>> - Paginated senior views
   */
  async searchSeniorsByName(searchParams: SeniorSearchParams): Promise<PaginatedResponse<SeniorView>> {
    const params = this.buildSearchParams({
      ...searchParams,
      page: searchParams.page ?? 0,
      size: Math.min(searchParams.size ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)
    });

    if (searchParams.firstName) params.append('firstName', searchParams.firstName);
    if (searchParams.lastName) params.append('lastName', searchParams.lastName);
    
    const url = `${SENIORS_ENDPOINT}/search?${params.toString()}`;
    return this.client.get<PaginatedResponse<SeniorView>>(url);
  }

  /**
   * Get total count of seniors matching filter (for dashboard metrics)
   * @param filter - Filter criteria
   * @returns Promise<number> - Total count
   */
  async getSeniorsCount(filter: Omit<SeniorFilterDto, 'page' | 'size' | 'sort'> = {}): Promise<number> {
    const filterBody = this.buildFilterBody(filter);
    const url = `${SENIORS_ENDPOINT}/count`;
    
    return this.client.post<number>(url, filterBody);
  }

  /**
   * Update an existing senior
   * @param seniorData - The senior data to update
   * @returns Promise<SeniorDto> - The updated senior
   */
  async updateSenior(seniorData: UpdateSeniorDto): Promise<SeniorDto> {
    return this.client.put<SeniorDto>(SENIORS_ENDPOINT, seniorData);
  }

  /**
   * Delete a senior by ID
   * @param id - The senior ID to delete
   * @returns Promise<void>
   */
  async deleteSenior(id: number): Promise<void> {
    return this.client.delete<void>(`${SENIORS_ENDPOINT}/${id}`);
  }

  /**
   * Get a single senior by ID
   * Note: This would require adding a GET /{id} endpoint to the backend
   * @param id - The senior ID
   * @returns Promise<SeniorDto> - The senior
   */
  async getSeniorById(id: number): Promise<SeniorDto> {
    return this.client.get<SeniorDto>(`${SENIORS_ENDPOINT}/${id}`);
  }

  /**
   * Build URL search parameters for pagination and sorting
   */
  private buildSearchParams(params: {
    page?: number;
    size?: number;
    sort?: string[];
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): URLSearchParams {
    const searchParams = new URLSearchParams();
    
    if (params.page !== undefined) {
      searchParams.append('page', params.page.toString());
    }
    
    if (params.size !== undefined) {
      searchParams.append('size', params.size.toString());
    }
    
    // Handle sort parameters (Spring Boot format)
    if (params.sort && params.sort.length > 0) {
      params.sort.forEach(sort => searchParams.append('sort', sort));
    } else if (params.sortBy) {
      const direction = params.sortDirection || 'asc';
      searchParams.append('sort', `${params.sortBy},${direction}`);
    }
    
    return searchParams;
  }

  /**
   * Build filter body for POST requests
   */
  private buildFilterBody(filter: Omit<SeniorFilterDto, 'page' | 'size' | 'sort'>): object {
    const body: any = {};
    
    if (filter.firstName) body.firstName = filter.firstName;
    if (filter.lastName) body.lastName = filter.lastName;
    if (filter.contactPhone) body.contactPhone = filter.contactPhone;
    if (filter.contactEmail) body.contactEmail = filter.contactEmail;
    if (filter.minDateOfBirth) body.minDateOfBirth = filter.minDateOfBirth;
    if (filter.maxDateOfBirth) body.maxDateOfBirth = filter.maxDateOfBirth;
    if (filter.characteristics) body.characteristics = filter.characteristics;
    if (filter.careLevel) body.careLevel = filter.careLevel;
    if (filter.careLevelColor) body.careLevelColor = filter.careLevelColor;
    
    return body;
  }
}

// Export singleton instance
export const seniorApiService = new SeniorApiService();

// Enhanced utility functions
export const seniorUtils = {
  /**
   * Transform form data to CreateSeniorDto
   */
  formDataToCreateDto(
    formData: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      contactPhone: string;
      contactEmail: string;
      address: string;
      careLevel: string;
      careLevelColor: string;
      characteristics: string;
    },
    characteristicsTags: string[] = [] // Add this parameter
  ): CreateSeniorDto {
    return {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      dateOfBirth: formData.dateOfBirth || null,
      contactPhone: formData.contactPhone.trim() || null,
      contactEmail: formData.contactEmail.trim() || null,
      address: formData.address.trim() || null,
      careLevel: formData.careLevel.trim() || null,
      careLevelColor: formData.careLevelColor || null,
      // Use the characteristicsTags parameter instead of parsing the string
      characteristics: characteristicsTags.length > 0 ? characteristicsTags : null,
    };
  },

  /**
   * Transform form data to UpdateSeniorDto with characteristics as array
   */
  formDataToUpdateDto(
    formData: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      contactPhone: string;
      contactEmail: string;
      address: string;
      careLevel: string;
      careLevelColor: string;
      characteristics: string;
    },
    id: number,
    characteristicsTags: string[] = [] // Add this parameter
  ): UpdateSeniorDto {
    return {
      id,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      dateOfBirth: formData.dateOfBirth || null,
      contactPhone: formData.contactPhone.trim() || null,
      contactEmail: formData.contactEmail.trim() || null,
      address: formData.address.trim() || null,
      careLevel: formData.careLevel.trim() || null,
      careLevelColor: formData.careLevelColor || null,
      // Use the characteristicsTags parameter instead of parsing the string
      characteristics: characteristicsTags.length > 0 ? characteristicsTags : null,
    };
  },

  /**
   * Transform SeniorDto to form data
   */
  dtoToFormData(senior: SeniorDto): {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    contactPhone: string;
    contactEmail: string;
    address: string;
    careLevel: string;
    careLevelColor: string;
    characteristics: string;
  } {
    return {
      firstName: senior.firstName,
      lastName: senior.lastName,
      dateOfBirth: senior.dateOfBirth || '',
      contactPhone: senior.contactPhone || '',
      contactEmail: senior.contactEmail || '',
      address: senior.address || '',
      careLevel: senior.careLevel || '',
      careLevelColor: senior.careLevelColor || '#6b7280',
      characteristics: senior.characteristics?.join(', ') || '',
    };
  },

  /**
   * Get full name from senior data
   */
  getFullName(senior: SeniorDto | SeniorView): string {
    return `${senior.firstName} ${senior.lastName}`.trim();
  },

  /**
   * Calculate age from date of birth
   */
  calculateAge(dateOfBirth: string | null): number | null {
    if (!dateOfBirth) return null;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  },

  /**
   * Format date for display
   */
  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  },

  /**
   * Format datetime for display
   */
  formatDateTime(dateTimeString: string): string {
    try {
      return new Date(dateTimeString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  },

  /**
   * Create pagination info for UI display
   */
  getPaginationInfo(response: PaginatedResponse<any>): {
    currentPage: number; // 1-based for display
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    startItem: number;
    endItem: number;
    hasPrevious: boolean;
    hasNext: boolean;
  } {
    const startItem = response.number * response.size + 1;
    const endItem = Math.min(startItem + response.numberOfElements - 1, response.totalElements);
    
    return {
      currentPage: response.number + 1, // Convert to 1-based for display
      totalPages: response.totalPages,
      totalItems: response.totalElements,
      itemsPerPage: response.size,
      startItem,
      endItem,
      hasPrevious: !response.first,
      hasNext: !response.last
    };
  },

  /**
   * Build sort parameter for API calls
   */
  buildSortParam(sortBy: string, direction: 'asc' | 'desc' = 'asc'): string {
    return `${sortBy},${direction}`;
  },
};