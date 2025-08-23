import { AuthenticatedApiClient, BaseApiError, BaseValidationError } from './authenticated-api-client';
import {
  CareLevelDto,
  CreateCareLevelDto,
  UpdateCareLevelDto,
  CareLevelExistsResponse,
  CareLevelInitializeResponse,
  CareLevelErrorResponse,
  PaginatedCareLevelsResponse,
  CareLevelFilterParams,
  CareLevelApiError,
  CareLevelValidationError
} from '@/types/care-level';
import { PaginatedResponse, Pageable } from '@/types/common';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088';
const CARE_LEVELS_ENDPOINT = `${API_BASE_URL}/api/care-levels`;

/**
 * Care Level API Client with service-specific error handling
 */
class CareLevelApiClient extends AuthenticatedApiClient {
  /**
   * Override error handling for care level-specific errors
   */
  protected async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any;
    
    try {
      errorData = await response.json();
    } catch {
      throw new CareLevelApiError(
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
      
      throw new CareLevelValidationError(validationErrors);
    }

    // Handle single error response format (from backend)
    if (response.status === 400 && errorData.error) {
      throw new CareLevelApiError(
        response.status,
        response.statusText,
        [{ 
          message: errorData.error, 
          timestamp: errorData.timestamp ? new Date(errorData.timestamp).toISOString() : new Date().toISOString()
        }]
      );
    }

    // Handle other API errors
    throw new CareLevelApiError(
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

  async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
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

/**
 * Care Level Management API Service
 */
export class CareLevelApiService {
  private client = new CareLevelApiClient();

  /**
   * Create a new care level
   */
  async createCareLevel(careLevelData: CreateCareLevelDto): Promise<CareLevelDto> {
    console.log('🎯 Creating care level:', careLevelData);
    
    try {
      const result = await this.client.post<CareLevelDto>(CARE_LEVELS_ENDPOINT, careLevelData);
      console.log('✅ Care level created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to create care level:', error);
      throw error;
    }
  }

  /**
   * Update an existing care level
   */
  async updateCareLevel(careLevelData: UpdateCareLevelDto): Promise<CareLevelDto> {
    console.log('🔄 Updating care level:', careLevelData);
    
    try {
      const result = await this.client.put<CareLevelDto>(CARE_LEVELS_ENDPOINT, careLevelData);
      console.log('✅ Care level updated successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to update care level:', error);
      throw error;
    }
  }

  /**
   * Delete a care level by ID
   */
  async deleteCareLevel(id: number): Promise<void> {
    console.log('🗑️ Deleting care level with ID:', id);
    
    try {
      await this.client.delete<void>(`${CARE_LEVELS_ENDPOINT}/${id}`);
      console.log('✅ Care level deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete care level:', error);
      throw error;
    }
  }

  /**
   * Get care level by ID
   */
  async getCareLevelById(id: number): Promise<CareLevelDto> {
    console.log('🔍 Fetching care level with ID:', id);
    
    try {
      const result = await this.client.get<CareLevelDto>(`${CARE_LEVELS_ENDPOINT}/${id}`);
      console.log('✅ Care level retrieved successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch care level:', error);
      throw error;
    }
  }

  /**
   * Get all care levels for current user's center
   */
  async getAllCareLevels(): Promise<CareLevelDto[]> {
    console.log('📋 Fetching all care levels');
    
    try {
      const result = await this.client.get<CareLevelDto[]>(CARE_LEVELS_ENDPOINT);
      console.log('✅ Care levels retrieved successfully:', result.length, 'items');
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch care levels:', error);
      throw error;
    }
  }

  /**
   * Get paginated care levels
   */
  async getCareLevelsPaginated(pageable: Pageable): Promise<PaginatedResponse<CareLevelDto>> {
    console.log('📄 Fetching paginated care levels:', pageable);
    
    // Build query parameters
    const params = new URLSearchParams();
    if (pageable.page !== undefined) params.append('page', pageable.page.toString());
    if (pageable.size !== undefined) params.append('size', pageable.size.toString());
    if (pageable.sort && pageable.sort.length > 0) {
      pageable.sort.forEach(sortParam => params.append('sort', sortParam));
    }

    const url = `${CARE_LEVELS_ENDPOINT}/paginated?${params.toString()}`;
    
    try {
      const result = await this.client.get<PaginatedResponse<CareLevelDto>>(url);
      console.log('✅ Paginated care levels retrieved successfully:', {
        totalElements: result.totalElements,
        totalPages: result.totalPages,
        currentPage: result.number,
        size: result.size
      });
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch paginated care levels:', error);
      throw error;
    }
  }

  /**
   * Check if care level name exists
   */
  async checkCareLevelExists(careLevel: string): Promise<boolean> {
    console.log('🔍 Checking if care level exists:', careLevel);
    
    const params = new URLSearchParams({ careLevel });
    const url = `${CARE_LEVELS_ENDPOINT}/exists?${params.toString()}`;
    
    try {
      const result = await this.client.get<CareLevelExistsResponse>(url);
      console.log('✅ Care level existence check completed:', result.exists);
      return result.exists;
    } catch (error) {
      console.error('❌ Failed to check care level existence:', error);
      throw error;
    }
  }

  /**
   * Initialize default care levels for current user's center
   * Admin only operation
   */
  async initializeDefaultCareLevels(): Promise<CareLevelInitializeResponse> {
    console.log('🚀 Initializing default care levels');
    
    try {
      const result = await this.client.post<CareLevelInitializeResponse>(`${CARE_LEVELS_ENDPOINT}/initialize-defaults`);
      console.log('✅ Default care levels initialized successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to initialize default care levels:', error);
      throw error;
    }
  }

  /**
   * Search/filter care levels (client-side filtering for now)
   * Can be extended to support server-side filtering later
   */
  async searchCareLevels(filters: CareLevelFilterParams): Promise<CareLevelDto[]> {
    console.log('🔍 Searching care levels with filters:', filters);
    
    try {
      const allCareLevels = await this.getAllCareLevels();
      
      let filteredLevels = allCareLevels;
      
      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredLevels = filteredLevels.filter(level => 
          level.careLevel.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply color filter
      if (filters.color) {
        filteredLevels = filteredLevels.filter(level => 
          level.careLevelColor === filters.color
        );
      }
      
      console.log('✅ Care level search completed:', filteredLevels.length, 'results');
      return filteredLevels;
    } catch (error) {
      console.error('❌ Failed to search care levels:', error);
      throw error;
    }
  }

  /**
   * Bulk operations helper - validate multiple care levels
   */
  async validateCareLevels(careLevels: CreateCareLevelDto[]): Promise<{ valid: boolean; errors: string[] }> {
    console.log('🔍 Validating care levels:', careLevels);
    
    const errors: string[] = [];
    
    try {
      // Check for duplicates within the array
      const names = careLevels.map(cl => cl.careLevel.toUpperCase());
      const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
      if (duplicates.length > 0) {
        errors.push(`Duplicate care level names: ${[...new Set(duplicates)].join(', ')}`);
      }
      
      // Check for existing care levels
      for (const careLevel of careLevels) {
        const exists = await this.checkCareLevelExists(careLevel.careLevel);
        if (exists) {
          errors.push(`Care level '${careLevel.careLevel}' already exists`);
        }
        
        // Validate hex color format
        if (!/^#[0-9A-Fa-f]{6}$/.test(careLevel.careLevelColor)) {
          errors.push(`Invalid color format for '${careLevel.careLevel}': ${careLevel.careLevelColor}`);
        }
      }
      
      const isValid = errors.length === 0;
      console.log('✅ Care level validation completed:', { valid: isValid, errorCount: errors.length });
      
      return { valid: isValid, errors };
    } catch (error) {
      console.error('❌ Failed to validate care levels:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const careLevelApiService = new CareLevelApiService();

// Export types for convenience
export type {
  CareLevelDto,
  CreateCareLevelDto,
  UpdateCareLevelDto,
  CareLevelExistsResponse,
  CareLevelInitializeResponse,
  CareLevelFilterParams
};

// Export error classes
export { CareLevelApiError, CareLevelValidationError };

