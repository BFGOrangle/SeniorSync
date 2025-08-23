import { PaginatedResponse } from "./common";

// Care Level DTOs matching backend Java DTOs
export interface CareLevelDto {
  id: number;
  careLevel: string;
  careLevelColor: string;
}

export interface CreateCareLevelDto {
  careLevel: string;
  careLevelColor: string;
}

export interface UpdateCareLevelDto {
  id: number;
  careLevel: string;
  careLevelColor: string;
}

// API Response Types
export interface CareLevelExistsResponse {
  exists: boolean;
}

export interface CareLevelInitializeResponse {
  message: string;
  timestamp: number;
}

// Error response format from backend
export interface CareLevelErrorResponse {
  error: string;
  timestamp: number;
}

// Paginated response type
export interface PaginatedCareLevelsResponse extends PaginatedResponse<CareLevelDto> {}

// Legacy care level format for backwards compatibility
export interface LegacyCareLevel {
  name: string;
  color: string;
}

// Filter/Search types
export interface CareLevelFilterParams {
  search?: string;
  color?: string;
}

// Form data interface for UI components
export interface CareLevelFormData {
  careLevel: string;
  careLevelColor: string;
}

// Validation error types
export interface CareLevelValidationError {
  field: string;
  message: string;
  rejectedValue?: any;
  timestamp: string;
}

// API Error classes that match the service implementation
export class CareLevelApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public errors: Array<{ message: string; timestamp: string; field?: string; rejectedValue?: any }> = []
  ) {
    super(`Care Level API Error: ${status} ${statusText}`);
    this.name = 'CareLevelApiError';
  }
}

export class CareLevelValidationError extends CareLevelApiError {
  constructor(public validationErrors: Array<{ message: string; field: string; rejectedValue?: any; timestamp: string }>) {
    super(400, 'Validation Error', validationErrors);
    this.name = 'CareLevelValidationError';
  }
}

// Utility functions for care level operations
export class CareLevelUtils {
  /**
   * Validates hex color format
   */
  static isValidHexColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }

  /**
   * Formats care level name (uppercase, trimmed)
   */
  static formatCareLevelName(name: string): string {
    return name.trim().toUpperCase();
  }

  /**
   * Converts legacy care level format to new format
   */
  static convertLegacyToNew(legacy: LegacyCareLevel): CreateCareLevelDto {
    return {
      careLevel: this.formatCareLevelName(legacy.name),
      careLevelColor: legacy.color
    };
  }

  /**
   * Converts new format to legacy format for backwards compatibility
   */
  static convertNewToLegacy(careLevel: CareLevelDto): LegacyCareLevel {
    return {
      name: careLevel.careLevel,
      color: careLevel.careLevelColor
    };
  }

  /**
   * Default care levels that match backend constants
   */
  static getDefaultCareLevels(): CreateCareLevelDto[] {
    return [
      { careLevel: 'LOW', careLevelColor: '#22c55e' },
      { careLevel: 'MEDIUM', careLevelColor: '#eab308' },
      { careLevel: 'HIGH', careLevelColor: '#f97316' },
      { careLevel: 'CRITICAL', careLevelColor: '#ef4444' },
      { careLevel: 'INDEPENDENT', careLevelColor: '#3b82f6' },
      { careLevel: 'SUPERVISED', careLevelColor: '#6f42c1' }
    ];
  }

  /**
   * Get care level color by name (fallback for legacy support)
   */
  static getCareLevelColor(careLevelName: string): string {
    const defaults = this.getDefaultCareLevels();
    const found = defaults.find(level => level.careLevel === careLevelName.toUpperCase());
    return found?.careLevelColor || '#6b7280'; // Gray fallback
  }
}

