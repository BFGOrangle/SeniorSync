import { Pageable } from "./common";

// Enhanced filter with pagination
export interface SeniorFilterDto extends Pageable {
  firstName?: string | null;
  lastName?: string | null;
  minDateOfBirth?: string | null; // ISO date string
  maxDateOfBirth?: string | null; // ISO date string
  contactPhone?: string | null;
  contactEmail?: string | null;
  characteristics?: string[] | null;
  careLevelId?: number | null;
}

// Search parameters with pagination
export interface SeniorSearchParams extends Pageable {
  firstName?: string;
  lastName?: string;
  sortBy?: 'firstName' | 'lastName' | 'dateOfBirth' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
}

// Senior DTOs matching backend Java DTOs
export interface SeniorDto {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  contactPhone: string | null;
  contactEmail: string | null;
  address: string | null;
  careLevelId: number | null;
  characteristics: string[] | null;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export interface CreateSeniorDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string | null; // ISO date string
  contactPhone: string | null;
  contactEmail: string | null;
  address: string | null;
  careLevelId: number | null;
  characteristics: string[] | null;
}

export interface UpdateSeniorDto {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null; // ISO date string
  contactPhone: string | null;
  contactEmail: string | null;
  address: string | null;
  careLevelId: number | null;
  characteristics: string[] | null;
}

// Senior projection for high-performance read operations
export interface SeniorView {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

// Form state interface for UI
export interface SeniorFormData extends Omit<CreateSeniorDto, 'dateOfBirth' | 'characteristics'> {
  dateOfBirth: string; // Form date input value
  characteristics: string; // Keep as string for form internal handling, convert on submit
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  timestamp: string;
}

export interface ValidationError extends ApiError {
  field: string;
  rejectedValue?: unknown;
}

// Interface for API error responses
export interface ErrorResponse {
  errors?: ApiError[];
  message?: string;
  timestamp?: string;
}