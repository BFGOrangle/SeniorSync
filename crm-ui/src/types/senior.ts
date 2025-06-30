import { Pageable } from "./common";

// Enhanced filter with pagination
export interface SeniorFilterDto extends Pageable {
  firstName?: string | null;
  lastName?: string | null;
  minDateOfBirth?: string | null; // ISO date string
  maxDateOfBirth?: string | null; // ISO date string
  contactPhone?: string | null;
  contactEmail?: string | null;
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
}

export interface UpdateSeniorDto {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null; // ISO date string
  contactPhone: string | null;
  contactEmail: string | null;
  address: string | null;
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
export interface SeniorFormData extends Omit<CreateSeniorDto, 'dateOfBirth'> {
  dateOfBirth: string; // Form date input value
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
  rejectedValue?: any;
}