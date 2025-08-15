// Backend API types for staff management
export type RoleType = "ADMIN" | "STAFF";

export interface StaffResponseDto {
  id: number;
  cognitoSub: string; // UUID as string
  centerId: number;
  centerName: string;
  firstName: string;
  lastName: string;
  fullName: string;
  jobTitle: string;
  contactPhone: string | null;
  contactEmail: string;
  roleType: RoleType;
  isActive: boolean;
  lastLoginAt: string | null; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CreateStaffDto {
  firstName: string;
  lastName: string;
  jobTitle: string;
  contactPhone: string | null;
  contactEmail: string;
  password: string;
  roleType: RoleType;
}

export interface UpdateStaffDto {
  centerId?: number;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  contactPhone?: string | null;
  contactEmail?: string;
  roleType?: RoleType;
  isActive?: boolean;
}

// Frontend display types
export interface StaffDisplayView extends StaffResponseDto {
  statusBadge: 'active' | 'inactive';
  roleDisplay: string;
  lastLoginDisplay: string;
  formattedCreatedAt: string;
}

// Form types for UI
export interface StaffFormData {
  firstName: string;
  lastName: string;
  jobTitle: string;
  contactPhone: string;
  contactEmail: string;
  password: string;
  roleType: RoleType;
  // isActive removed - new staff members are always active by default
}

export interface StaffUpdateFormData {
  firstName: string;
  lastName: string;
  jobTitle: string;
  contactPhone: string;
  contactEmail: string;
  roleType: RoleType;
  isActive: boolean;
}

// Filter and search types
export interface StaffFilterOptions {
  roleType?: RoleType[];
  isActive?: boolean;
  jobTitle?: string[];
  searchTerm?: string;
}

// Error types
export interface StaffApiError {
  status: number;
  statusText: string;
  errors: Array<{
    message: string;
    timestamp: string;
    field?: string;
    rejectedValue?: any;
  }>;
}

export interface StaffValidationError {
  validationErrors: Array<{
    message: string;
    field: string;
    rejectedValue?: any;
    timestamp: string;
  }>;
}

// Common job titles for dropdowns
export const COMMON_JOB_TITLES = [
  'Care Coordinator',
  'Nurse',
  'Social Worker',
  'Administrator',
  'Care Assistant',
  'Activities Coordinator',
  'Maintenance',
  'Kitchen Staff',
  'Cleaner',
  'Manager',
  'Supervisor',
  'Other'
] as const;

// Role type display mapping
export const ROLE_TYPE_DISPLAY: Record<RoleType, string> = {
  ADMIN: 'Administrator',
  STAFF: 'Staff Member'
};

// Utility functions for staff management
export class StaffUtils {
  /**
   * Convert StaffResponseDto to StaffDisplayView
   */
  static toDisplayView(staff: StaffResponseDto): StaffDisplayView {
    return {
      ...staff,
      statusBadge: staff.isActive ? 'active' : 'inactive',
      roleDisplay: ROLE_TYPE_DISPLAY[staff.roleType] || staff.roleType,
      lastLoginDisplay: staff.lastLoginAt 
        ? new Date(staff.lastLoginAt).toLocaleDateString()
        : 'Never',
      formattedCreatedAt: new Date(staff.createdAt).toLocaleDateString()
    };
  }

  /**
   * Convert form data to CreateStaffDto
   */
  static formDataToCreateDto(
    formData: StaffFormData,
  ): CreateStaffDto {
    return {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      jobTitle: formData.jobTitle.trim(),
      contactPhone: formData.contactPhone.trim() || null,
      contactEmail: formData.contactEmail.trim(),
      password: formData.password,
      roleType: formData.roleType,
      // isActive removed - new staff members are always active by default
    };
  }

  /**
   * Convert form data to UpdateStaffDto
   */
  static formDataToUpdateDto(formData: StaffUpdateFormData): UpdateStaffDto {
    return {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      jobTitle: formData.jobTitle.trim(),
      contactPhone: formData.contactPhone.trim() || null,
      contactEmail: formData.contactEmail.trim(),
      roleType: formData.roleType,
      isActive: formData.isActive
    };
  }

  /**
   * Convert StaffResponseDto to form data
   */
  static dtoToFormData(staff: StaffResponseDto): StaffUpdateFormData {
    return {
      firstName: staff.firstName,
      lastName: staff.lastName,
      jobTitle: staff.jobTitle,
      contactPhone: staff.contactPhone || '',
      contactEmail: staff.contactEmail,
      roleType: staff.roleType,
      isActive: staff.isActive
    };
  }

  /**
   * Get initials from full name
   */
  static getInitials(fullName: string): string {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  /**
   * Format datetime for display
   */
  static formatDateTime(dateTimeString: string): string {
    return new Date(dateTimeString).toLocaleString();
  }

  /**
   * Filter staff by search criteria
   */
  static filterStaff(
    staff: StaffDisplayView[],
    filters: StaffFilterOptions
  ): StaffDisplayView[] {
    return staff.filter(member => {
      // Role type filter
      if (filters.roleType?.length && !filters.roleType.includes(member.roleType)) {
        return false;
      }

      // Active status filter
      if (filters.isActive !== undefined && member.isActive !== filters.isActive) {
        return false;
      }

      // Job title filter
      if (filters.jobTitle?.length && !filters.jobTitle.includes(member.jobTitle)) {
        return false;
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchableText = [
          member.fullName,
          member.contactEmail,
          member.jobTitle,
          member.roleDisplay
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Sort staff by field
   */
  static sortStaff(
    staff: StaffDisplayView[],
    sortBy: keyof StaffDisplayView,
    sortDirection: 'asc' | 'desc' = 'asc'
  ): StaffDisplayView[] {
    return [...staff].sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];

      // Handle null values
      if (valueA === null || valueA === undefined) valueA = '';
      if (valueB === null || valueB === undefined) valueB = '';

      // Convert to strings for comparison
      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();

      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}