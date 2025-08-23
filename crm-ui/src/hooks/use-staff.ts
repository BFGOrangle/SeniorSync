import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/contexts/user-context';
import {
  staffApiService,
  StaffApiError,
  StaffValidationError
} from '@/services/staff-api';
import {
  StaffDisplayView,
  StaffResponseDto,
  CreateStaffDto,
  UpdateStaffDto,
  StaffFormData,
  StaffUpdateFormData,
  StaffFilterOptions,
  StaffUtils
} from '@/types/staff';
import { PaginatedResponse } from '@/types/common';

// Hook for managing staff with full CRUD operations (Admin only)
export function useStaffManagement() {
  const [staff, setStaff] = useState<StaffDisplayView[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<StaffDisplayView> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<StaffApiError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const { toast } = useToast();
  const { currentUser } = useCurrentUser();

  // Load staff with pagination
  const loadStaff = useCallback(async (page: number = 0, size: number = 20) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await staffApiService.getStaffWithDisplayData(page, size);
      
      setStaff(response.content);
      setPagination(response);
      setLastUpdated(new Date());
      
      console.log(`Loaded ${response.content.length} staff members (page ${page + 1})`);
    } catch (err) {
      const apiError = err instanceof StaffApiError ? err : new StaffApiError(500, 'Failed to load staff');
      setError(apiError);
      console.error('Error loading staff:', apiError);
      
      toast({
        title: 'Error Loading Staff',
        description: apiError.errors[0]?.message || 'Failed to load staff members. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  // Create a new staff member
  const createStaff = useCallback(async (formData: StaffFormData): Promise<boolean> => {
    try {
      setLoading(true);

      const createDto = StaffUtils.formDataToCreateDto(formData);
      const newStaff = await staffApiService.createStaff(createDto);
      
      // Add to local state
      const displayStaff = StaffUtils.toDisplayView(newStaff);
      setStaff(prev => [displayStaff, ...prev]);
      setLastUpdated(new Date());

      toast({
        title: 'Staff Member Created',
        description: `${newStaff.fullName} has been created successfully.`,
      });

      return true;
    } catch (err) {
      setError(err instanceof StaffApiError ? err : new StaffApiError(500, 'Failed to create staff'));
      
      if (err instanceof StaffValidationError) {
        const validationMessages = err.validationErrors.map(e => e.message).join(', ');
        toast({
          title: 'Validation Error',
          description: validationMessages,
          variant: 'destructive',
        });
      } else {
        const apiError = err instanceof StaffApiError ? err : new StaffApiError(500, 'Failed to create staff');
        toast({
          title: 'Error Creating Staff Member',
          description: apiError.errors[0]?.message || 'Failed to create staff member. Please try again.',
          variant: 'destructive',
        });
      }

      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update a staff member
  const updateStaff = useCallback(async (id: number, formData: StaffUpdateFormData): Promise<boolean> => {
    try {
      setLoading(true);

      const updateDto = StaffUtils.formDataToUpdateDto(formData);
      const updatedStaff = await staffApiService.updateStaff(id, updateDto);
      
      // Update local state
      const displayStaff = StaffUtils.toDisplayView(updatedStaff);
      setStaff(prev => 
        prev.map(member => 
          member.id === id ? displayStaff : member
        )
      );
      setLastUpdated(new Date());

      toast({
        title: 'Staff Member Updated',
        description: `${updatedStaff.fullName} has been updated successfully.`,
      });

      return true;
    } catch (err) {
      setError(err instanceof StaffApiError ? err : new StaffApiError(500, 'Failed to update staff'));
      
      if (err instanceof StaffValidationError) {
        const validationMessages = err.validationErrors.map(e => e.message).join(', ');
        toast({
          title: 'Validation Error',
          description: validationMessages,
          variant: 'destructive',
        });
      } else {
        const apiError = err instanceof StaffApiError ? err : new StaffApiError(500, 'Failed to update staff');
        toast({
          title: 'Error Updating Staff Member',
          description: apiError.errors[0]?.message || 'Failed to update staff member. Please try again.',
          variant: 'destructive',
        });
      }

      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Toggle staff status (activate/deactivate)
  const toggleStaffStatus = useCallback(async (id: number, isActive: boolean): Promise<boolean> => {
    try {
      setLoading(true);

      const updatedStaff = await staffApiService.toggleStaffStatus(id, isActive);
      
      // Update local state
      const displayStaff = StaffUtils.toDisplayView(updatedStaff);
      setStaff(prev => 
        prev.map(member => 
          member.id === id ? displayStaff : member
        )
      );
      setLastUpdated(new Date());

      toast({
        title: 'Staff Status Updated',
        description: `${updatedStaff.fullName} has been ${isActive ? 'activated' : 'deactivated'}.`,
      });

      return true;
    } catch (err) {
      const apiError = err instanceof StaffApiError ? err : new StaffApiError(500, 'Failed to update staff status');
      setError(apiError);
      
      toast({
        title: 'Error Updating Staff Status',
        description: apiError.errors[0]?.message || 'Failed to update staff status. Please try again.',
        variant: 'destructive',
      });

      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Delete a staff member (soft delete - deactivate)
  const deleteStaff = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);

      await staffApiService.deleteStaff(id);
      
      // Remove from local state
      setStaff(prev => prev.filter(member => member.id !== id));
      setLastUpdated(new Date());

      toast({
        title: 'Staff Member Deleted',
        description: 'Staff member has been deleted successfully.',
      });

      return true;
    } catch (err) {
      const apiError = err instanceof StaffApiError ? err : new StaffApiError(500, 'Failed to delete staff');
      setError(apiError);
      
      toast({
        title: 'Error Deleting Staff Member',
        description: apiError.errors[0]?.message || 'Failed to delete staff member. Please try again.',
        variant: 'destructive',
      });

      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Refresh staff list
  const refresh = useCallback(async () => {
    const currentPage = pagination?.number || 0;
    const currentSize = pagination?.size || 20;
    await loadStaff(currentPage, currentSize);
  }, [loadStaff, pagination]);

  // Search staff
  const searchStaff = useCallback(async (searchTerm: string, page: number = 0, size: number = 20) => {
    try {
      setLoading(true);
      setError(null);

      const response = await staffApiService.searchStaff(searchTerm, page, size);
      
      setStaff(response.content);
      setPagination(response);
      setLastUpdated(new Date());
    } catch (err) {
      const apiError = err instanceof StaffApiError ? err : new StaffApiError(500, 'Failed to search staff');
      setError(apiError);
      console.error('Error searching staff:', apiError);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort staff locally (for UI responsiveness)
  const filterAndSortStaff = useCallback((
    filters: StaffFilterOptions,
    sortBy: keyof StaffDisplayView = 'fullName',
    sortDirection: 'asc' | 'desc' = 'asc'
  ) => {
    let filtered = StaffUtils.filterStaff(staff, filters);
    return StaffUtils.sortStaff(filtered, sortBy, sortDirection);
  }, [staff]);

  return {
    staff,
    pagination,
    loading,
    error,
    lastUpdated,
    loadStaff,
    createStaff,
    updateStaff,
    toggleStaffStatus,
    deleteStaff,
    refresh,
    searchStaff,
    filterAndSortStaff,
  };
}

type useStaffProps = {
  staffId?: number | null
  staffSub?: string | null
}

// Hook for managing a single staff member (for details/edit page)
export function useStaff({ staffId, staffSub }: useStaffProps) {
  const [staff, setStaff] = useState<StaffResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<StaffApiError | null>(null);
  const { toast } = useToast();

  const fetchStaff = useCallback(async () => {
    if (!staffId && !staffSub) {
      setError(new StaffApiError(500, "Need to provide staffId or staffSub to fetch staff details"));
      return;
    }
    // Always take staff id first
    if (staffId !== null && staffId !== undefined) {
      try {
        setLoading(true);
        setError(null);
        const data = await staffApiService.getStaffById(staffId);
        setStaff(data);
      } catch (err) {
        const apiError = err instanceof StaffApiError ? err : new StaffApiError(500, 'Failed to load staff');
        setError(apiError);
        toast({
          title: 'Error Loading Staff Member',
          description: apiError.errors[0]?.message || 'Failed to load staff member details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    } else if (staffSub !== null && staffSub !== undefined) {
      // Here means we need to query for user id using their cognito sub
      try {
        const data = await staffApiService.getStaffByCognitoSub(staffSub);
        setStaff(data);
        return
      } catch (err) {
        const apiError = err instanceof StaffApiError ? err : new StaffApiError(500, 'Failed to load staff by sub');
        setError(apiError);
        toast({
          title: 'Error Loading Staff Member',
          description: apiError.errors[0]?.message || 'Failed to load staff member details.',
          variant: 'destructive',
        });
      }
    } else {
      console.error("No staffId or staffSub provided to fetch staff details");
      setError(new StaffApiError(500, "No staffId or staffSub provided to fetch staff details"));
    }
  }, [staffId, toast]);

  const updateStaff = useCallback(async (formData: StaffUpdateFormData): Promise<boolean> => {
    if (!staffId) return false;

    try {
      setLoading(true);

      const updateDto = StaffUtils.formDataToUpdateDto(formData);
      const updatedStaff = await staffApiService.updateStaff(staffId, updateDto);
      
      setStaff(updatedStaff);

      toast({
        title: 'Staff Member Updated',
        description: `${updatedStaff.fullName} has been updated successfully.`,
      });

      return true;
    } catch (err) {
      setError(err instanceof StaffApiError ? err : new StaffApiError(500, 'Failed to update staff'));
      
      if (err instanceof StaffValidationError) {
        const validationMessages = err.validationErrors.map(e => e.message).join(', ');
        toast({
          title: 'Validation Error',
          description: validationMessages,
          variant: 'destructive',
        });
      } else {
        const apiError = err instanceof StaffApiError ? err : new StaffApiError(500, 'Failed to update staff');
        toast({
          title: 'Error Updating Staff Member',
          description: apiError.errors[0]?.message || 'Failed to update staff member. Please try again.',
          variant: 'destructive',
        });
      }

      return false;
    } finally {
      setLoading(false);
    }
  }, [staffId, toast]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff, staffId, staffSub]);

  return {
    staff,
    loading,
    error,
    updateStaff,
    refetch: fetchStaff
  };
}

// Hook for getting staff dropdown options
export function useStaffDropdown(centerId?: number) {
  const [staffOptions, setStaffOptions] = useState<Array<{
    id: number;
    fullName: string;
    jobTitle: string;
  }>>([]);
  const [loading, setLoading] = useState(false);

  const loadStaffOptions = useCallback(async () => {
    try {
      setLoading(true);
      const options = await staffApiService.getActiveStaffForDropdown(centerId);
      setStaffOptions(options);
    } catch (error) {
      console.error('Error loading staff options:', error);
      setStaffOptions([]);
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  useEffect(() => {
    loadStaffOptions();
  }, [loadStaffOptions]);

  return {
    staffOptions,
    loading,
    refresh: loadStaffOptions
  };
}

// Hook for staff statistics
export function useStaffStats() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: {} as Record<string, number>
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<StaffApiError | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const statsData = await staffApiService.getStaffStats();
      setStats(statsData);
    } catch (err) {
      const apiError = err instanceof StaffApiError ? err : new StaffApiError(500, 'Failed to load staff stats');
      setError(apiError);
      console.error('Error loading staff stats:', apiError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refresh: loadStats
  };
}

// Main export for staff management
export const useStaffManagementHook = () => useStaffManagement();
export { useStaff as useStaffDetails };