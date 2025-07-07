import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  RequestManagementApiService,
  RequestApiError,
  RequestValidationError,
  requestManagementApiService,
  requestUtils
} from '@/services/request-api';
import {
  SeniorRequestDisplayView,
  SeniorRequestFilterDto,
  UpdateSeniorRequestDto,
  SeniorRequestDto,
  RequestUtils,
  StaffDto
} from '@/types/request';

// Hook for managing requests with full CRUD operations
export function useRequestManagement() {
  const [requests, setRequests] = useState<SeniorRequestDisplayView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<RequestApiError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [staffCache, setStaffCache] = useState<StaffDto[]>([]);
  
  const { toast } = useToast();

  // Load requests with optional filtering
  const loadRequests = useCallback(async (filter?: SeniorRequestFilterDto) => {
    try {
      setLoading(true);
      setError(null);
      
      // Load staff data and enhanced requests in parallel
      const [enhancedRequests, staff] = await Promise.all([
        requestManagementApiService.getEnhancedRequests(filter),
        requestManagementApiService.getStaff().catch(() => [] as StaffDto[])
      ]);
      
      setRequests(enhancedRequests);
      setStaffCache(staff);
      setLastUpdated(new Date());
      
      console.log(`Loaded ${enhancedRequests.length} requests`);
    } catch (err) {
      const apiError = err instanceof RequestApiError ? err : new RequestApiError(500, 'Failed to load requests');
      setError(apiError);
      console.error('Error loading requests:', apiError);
      
      toast({
        title: 'Error Loading Requests',
        description: apiError.errors[0]?.message || 'Failed to load senior requests. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Update a request
  const updateRequest = useCallback(async (updatedRequest: SeniorRequestDisplayView): Promise<boolean> => {
    try {
      setLoading(true);

      // Convert SeniorRequestDisplayView back to UpdateSeniorRequestDto
      const updateDto: UpdateSeniorRequestDto = {
        id: updatedRequest.id,
        title: updatedRequest.title,
        description: updatedRequest.description,
        priority: RequestUtils.frontendToBackendPriority(updatedRequest.frontendPriority),
        status: RequestUtils.frontendToBackendStatus(updatedRequest.frontendStatus),
        assignedStaffId: updatedRequest.assignedStaffId,
        requestTypeId: updatedRequest.requestTypeId,
      };

      const updated = await requestManagementApiService.updateRequest(updateDto);
      
      // Resolve staff name from cache if assignedStaffId changed
      let assignedStaffName = updatedRequest.assignedStaffName;
      if (updated.assignedStaffId) {
        const assignedStaff = staffCache.find(s => s.id === updated.assignedStaffId);
        assignedStaffName = assignedStaff ? `${assignedStaff.firstName} ${assignedStaff.lastName}` : undefined;
      } else {
        assignedStaffName = undefined; // Unassigned
      }
      
      // Update local state
      setRequests(prev => 
        prev.map(request => 
          request.id === updated.id 
            ? RequestUtils.fromDtoToDisplayView(updated, {
                seniorName: updatedRequest.seniorName,
                seniorPhone: updatedRequest.seniorPhone,
                seniorEmail: updatedRequest.seniorEmail,
                seniorAddress: updatedRequest.seniorAddress,
                assignedStaffName: assignedStaffName,
                requestTypeName: updatedRequest.requestTypeName,
              })
            : request
        )
      );

      setLastUpdated(new Date());

      toast({
        title: 'Request Updated',
        description: `Request ${updated.id} has been updated successfully.`,
      });

      return true;
    } catch (err) {
      const apiError = err instanceof RequestApiError ? err : new RequestApiError(500, 'Failed to update request');
      setError(apiError);
      
      if (err instanceof RequestValidationError) {
        // Handle validation errors specifically
        const validationMessages = err.validationErrors.map(e => e.message).join(', ');
        toast({
          title: 'Validation Error',
          description: validationMessages,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error Updating Request',
          description: apiError.errors[0]?.message || 'Failed to update request. Please try again.',
          variant: 'destructive',
        });
      }

      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, staffCache]);

  // Delete a request
  const deleteRequest = useCallback(async (requestId: number): Promise<boolean> => {
    try {
      setLoading(true);

      await requestManagementApiService.deleteRequest(requestId);
      
      // Update local state
      setRequests(prev => prev.filter(request => request.id !== requestId));
      setLastUpdated(new Date());

      toast({
        title: 'Request Deleted',
        description: `Request ${requestId} has been deleted successfully.`,
      });

      return true;
    } catch (err) {
      const apiError = err instanceof RequestApiError ? err : new RequestApiError(500, 'Failed to delete request');
      setError(apiError);
      
      toast({
        title: 'Error Deleting Request',
        description: apiError.errors[0]?.message || 'Failed to delete request. Please try again.',
        variant: 'destructive',
      });

      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Refresh requests
  const refresh = useCallback(async () => {
    await loadRequests();
  }, [loadRequests]);

  // Filter and sort requests locally (for UI responsiveness)
  const filterAndSortRequests = useCallback((
    filters: {
      priority?: ('low' | 'medium' | 'high' | 'urgent')[];
      status?: ('todo' | 'in-progress' | 'completed')[];
      requestType?: string[];
      assignedStaff?: string[];
      searchTerm?: string;
    },
    sortBy: 'createdAt' | 'updatedAt' | 'priority' | 'status' | 'seniorName' = 'createdAt',
    sortDirection: 'asc' | 'desc' = 'desc'
  ) => {
    let filtered = requestUtils.filterRequests(requests, filters);
    return requestUtils.sortRequests(filtered, sortBy, sortDirection);
  }, [requests]);

  // Get status counts
  const getStatusCounts = useCallback(() => {
    const counts = {
      todo: 0,
      'in-progress': 0,
      completed: 0,
    };

    requests.forEach(request => {
      const status = request.frontendStatus;
      if (status in counts) {
        counts[status as keyof typeof counts]++;
      }
    });

    return counts;
  }, [requests]);

  return {
    requests,
    loading,
    error,
    lastUpdated,
    loadRequests,
    updateRequest,
    deleteRequest,
    refresh,
    filterAndSortRequests,
    getStatusCounts,
  };
}

// Hook for loading reference data (request types, staff, etc.)
export function useRequestReferenceData() {
  const [requestTypes, setRequestTypes] = useState<{ id: number; name: string; description?: string }[]>([]);
  const [staff, setStaff] = useState<{ id: number; firstName: string; lastName: string; role: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<RequestApiError | null>(null);

  const { toast } = useToast();

  const loadReferenceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [requestTypesData, staffData] = await Promise.allSettled([
        requestManagementApiService.getRequestTypes(),
        requestManagementApiService.getStaff(),
      ]);

      // Handle request types
      if (requestTypesData.status === 'fulfilled') {
        setRequestTypes(requestTypesData.value);
      } else {
        console.warn('Failed to load request types:', requestTypesData.reason);
        // Provide fallback data
        setRequestTypes([
          { id: 1, name: 'Medical Assistance' },
          { id: 2, name: 'Transportation' },
          { id: 3, name: 'Home Care' },
          { id: 4, name: 'Emergency Support' },
          { id: 5, name: 'Other' },
        ]);
      }

      // Handle staff
      if (staffData.status === 'fulfilled') {
        setStaff(staffData.value);
      } else {
        console.warn('Failed to load staff:', staffData.reason);
        // Provide fallback data
        setStaff([
          { id: 1, firstName: 'Sarah', lastName: 'Johnson', role: 'Care Coordinator' },
          { id: 2, firstName: 'Michael', lastName: 'Chen', role: 'Social Worker' },
          { id: 3, firstName: 'Emily', lastName: 'Rodriguez', role: 'Nurse' },
        ]);
      }

    } catch (err) {
      const apiError = err instanceof RequestApiError ? err : new RequestApiError(500, 'Failed to load reference data');
      setError(apiError);
      console.error('Error loading reference data:', apiError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  return {
    requestTypes,
    staff,
    loading,
    error,
    refresh: loadReferenceData,
  };
}

// Hook for dashboard statistics
export function useRequestDashboard() {
  const [statusCounts, setStatusCounts] = useState({
    todo: 0,
    'in-progress': 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<RequestApiError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const counts = await requestManagementApiService.getStatusCounts();
      setStatusCounts(counts);
      setLastUpdated(new Date());

    } catch (err) {
      const apiError = err instanceof RequestApiError ? err : new RequestApiError(500, 'Failed to load dashboard data');
      setError(apiError);
      console.error('Error loading dashboard data:', apiError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    statusCounts,
    loading,
    error,
    lastUpdated,
    refresh: loadDashboardData,
  };
}

// Hook for managing requests for a specific senior
export function useSeniorRequests(seniorId: number | null) {
  const [requests, setRequests] = useState<SeniorRequestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<RequestApiError | null>(null);
  const { toast } = useToast();

  const fetchRequests = useCallback(async () => {
    if (!seniorId) {
      setRequests([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await requestManagementApiService.getRequestsBySenior(seniorId);
      setRequests(data);
    } catch (err) {
      const apiError = err instanceof RequestApiError ? err : new RequestApiError(500, 'Unknown error');
      setError(apiError);
      toast({
        title: 'Error Loading Requests',
        description: apiError.errors[0]?.message || 'Failed to load requests for this senior.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [seniorId, toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Convert to display format for easier consumption by components
  const displayRequests = requests.map(request => 
    RequestUtils.fromDtoToDisplayView(request)
  );

  return {
    requests: displayRequests,
    loading,
    error,
    refetch: fetchRequests
  };
}

// Hook for managing a single request (for details page)
export function useRequest(requestId: number | null) {
  const [request, setRequest] = useState<SeniorRequestDisplayView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<RequestApiError | null>(null);
  const [staffCache, setStaffCache] = useState<StaffDto[]>([]);
  const { toast } = useToast();

  const fetchRequest = useCallback(async () => {
    if (!requestId) {
      setRequest(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Load request and staff data in parallel
      const [data, staff] = await Promise.all([
        requestManagementApiService.getRequestById(requestId),
        requestManagementApiService.getStaff().catch(() => [] as StaffDto[])
      ]);
      
      setRequest(data);
      setStaffCache(staff);
    } catch (err) {
      const apiError = err instanceof RequestApiError ? err : new RequestApiError(500, 'Unknown error');
      setError(apiError);
      toast({
        title: 'Error Loading Request',
        description: apiError.errors[0]?.message || 'Failed to load request details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [requestId, toast]);

  const updateRequest = useCallback(async (updatedRequest: SeniorRequestDisplayView): Promise<boolean> => {
    try {
      setLoading(true);

      // Convert SeniorRequestDisplayView back to UpdateSeniorRequestDto
      const updateDto: UpdateSeniorRequestDto = {
        id: updatedRequest.id,
        title: updatedRequest.title,
        description: updatedRequest.description,
        priority: RequestUtils.frontendToBackendPriority(updatedRequest.frontendPriority),
        status: RequestUtils.frontendToBackendStatus(updatedRequest.frontendStatus),
        assignedStaffId: updatedRequest.assignedStaffId,
        requestTypeId: updatedRequest.requestTypeId,
      };

      const updated = await requestManagementApiService.updateRequest(updateDto);
      
      // Resolve staff name from cache if assignedStaffId changed
      let assignedStaffName = updatedRequest.assignedStaffName;
      if (updated.assignedStaffId) {
        const assignedStaff = staffCache.find(s => s.id === updated.assignedStaffId);
        assignedStaffName = assignedStaff ? `${assignedStaff.firstName} ${assignedStaff.lastName}` : undefined;
      } else {
        assignedStaffName = undefined; // Unassigned
      }
      
      // Update local state with enhanced request
      const enhancedUpdated = RequestUtils.fromDtoToDisplayView(updated, {
        seniorName: updatedRequest.seniorName,
        seniorPhone: updatedRequest.seniorPhone,
        seniorEmail: updatedRequest.seniorEmail,
        seniorAddress: updatedRequest.seniorAddress,
        assignedStaffName: assignedStaffName,
        requestTypeName: updatedRequest.requestTypeName,
      });

      setRequest(enhancedUpdated);

      toast({
        title: 'Request Updated',
        description: `Request ${updated.id} has been updated successfully.`,
      });

      return true;
    } catch (err) {
      const apiError = err instanceof RequestApiError ? err : new RequestApiError(500, 'Failed to update request');
      setError(apiError);
      
      if (err instanceof RequestValidationError) {
        const validationMessages = err.validationErrors.map(e => e.message).join(', ');
        toast({
          title: 'Validation Error',
          description: validationMessages,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error Updating Request',
          description: apiError.errors[0]?.message || 'Failed to update request. Please try again.',
          variant: 'destructive',
        });
      }

      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, staffCache]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  return {
    request,
    loading,
    error,
    updateRequest,
    refetch: fetchRequest
  };
}

// Export useRequest as the main hook for the details page
export const useRequests = () => useRequestManagement();
export { useRequest as useRequestDetails };
