import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
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
  RequestUtils
} from '@/types/request';
import { spamFilterService } from '@/services/spam-filter-service';

// Hook for managing requests with full CRUD operations
export function useRequestManagement() {
  const [requests, setRequests] = useState<SeniorRequestDisplayView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<RequestApiError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // PHASE 2: Enhanced spam detection state management
  const [spamDetectionStatus, setSpamDetectionStatus] = useState<Map<number, 'pending' | 'completed'>>(new Map());
  const [spamPollingActive, setSpamPollingActive] = useState(false);
  
  const { toast } = useToast();

  // Load requests with optional filtering - ENHANCED WITH PHASE 2: IMMEDIATE LOADING
  const loadRequests = useCallback(async (filter?: SeniorRequestFilterDto) => {
    try {
      setLoading(true);
      setError(null);
      
      // console.log('🚀 Phase 2: Starting immediate loading strategy...');
      
      // STEP 1: Load requests immediately (even without spam detection)
      const enhancedRequests = await requestManagementApiService.getEnhancedRequests(filter);
      setRequests(enhancedRequests);
      setLoading(false); // UI can render immediately!
      
      // console.log(`📊 Loaded ${enhancedRequests.length} requests immediately`);
      
      // STEP 2: Identify requests needing spam detection
      const requestsNeedingSpam = spamFilterService.getRequestsNeedingSpamDetection(enhancedRequests);
      
      if (requestsNeedingSpam.length > 0) {
        // console.log(`🔍 Found ${requestsNeedingSpam.length} requests needing spam detection`);
        
        // STEP 3: Start async spam detection (don't wait)
        await spamFilterService.initiateSpamDetectionAsync(requestsNeedingSpam);
        
        // STEP 4: Mark requests as pending spam detection
        const pendingMap = new Map<number, 'pending' | 'completed'>();
        requestsNeedingSpam.forEach(id => pendingMap.set(id, 'pending'));
        setSpamDetectionStatus(pendingMap);
        setSpamPollingActive(true);
        
        // STEP 5: Start polling for updates
        let pollAttempts = 0;
        const maxPollAttempts = 24; // Poll for 2 minutes max (24 * 5 seconds)
        
        const pollInterval = setInterval(async () => {
          pollAttempts++;
          
          try {
            // console.log(`🔄 Polling for spam updates (attempt ${pollAttempts}/${maxPollAttempts})`);
            
            const updates = await spamFilterService.pollForSpamUpdates(requestsNeedingSpam);
            
            if (updates.size > 0) {
              // console.log(`✅ Received spam updates for ${updates.size} requests`);
              
              // Show completion alert for each batch of updates
              const spamCount = Array.from(updates.values()).filter(update => update.isSpam).length;
              const cleanCount = updates.size - spamCount;
              
              let alertMessage = '';
              if (spamCount > 0 && cleanCount > 0) {
                alertMessage = `Spam detection completed: ${spamCount} likely spam, ${cleanCount} unlikely spam`;
              } else if (spamCount > 0) {
                alertMessage = `Spam detection completed: ${spamCount} request${spamCount > 1 ? 's' : ''} flagged as likely spam`;
              } else {
                alertMessage = `Spam detection completed: ${cleanCount} request${cleanCount > 1 ? 's' : ''} marked as unlikely spam`;
              }
              
              toast({
                title: 'AI Spam Detection Complete',
                description: alertMessage,
                duration: 3000, // Short duration - 3 seconds
              });
              
              // STEP 6: Update requests with new spam data
              setRequests(prevRequests => 
                prevRequests.map(req => {
                  const spamUpdate = updates.get(req.id);
                  if (spamUpdate) {
                    return {
                      ...req,
                      isSpam: spamUpdate.isSpam,
                      spamConfidenceScore: spamUpdate.confidenceScore,
                      spamDetectionReason: spamUpdate.detectionReason,
                      spamDetectedAt: spamUpdate.detectedAt
                    };
                  }
                  return req;
                })
              );
              
              // Update status tracking
              setSpamDetectionStatus(prev => {
                const newMap = new Map(prev);
                updates.forEach((_, requestId) => {
                  newMap.set(requestId, 'completed');
                });
                return newMap;
              });
            }
            
            // Check if all requests have been processed or max attempts reached
            const completedCount = Array.from(spamDetectionStatus.values()).filter(status => status === 'completed').length + updates.size;
            const allComplete = completedCount >= requestsNeedingSpam.length || pollAttempts >= maxPollAttempts;
            
            if (allComplete) {
              // console.log(`🏁 Spam detection polling complete (${completedCount}/${requestsNeedingSpam.length} processed)`);
              clearInterval(pollInterval);
              setSpamPollingActive(false);
              
              if (pollAttempts >= maxPollAttempts && completedCount < requestsNeedingSpam.length) {
                console.warn('⚠️ Spam detection polling timed out for some requests');
                toast({
                  title: 'Spam Detection',
                  description: 'Some spam detection processes are taking longer than expected. Results will appear when available.',
                  variant: 'default',
                });
              }
            }
            
          } catch (pollError) {
            console.error('❌ Error during spam polling:', pollError);
            
            // Continue polling even if one attempt fails
            if (pollAttempts >= maxPollAttempts) {
              clearInterval(pollInterval);
              setSpamPollingActive(false);
            }
          }
        }, 5000); // Poll every 5 seconds
        
        // Show user feedback that background processing is happening
        toast({
          title: 'AI Spam Detection',
          description: `Analyzing ${requestsNeedingSpam.length} requests for spam in the background...`,
          duration: 4000,
        });
        
      } else {
        // console.log('✅ All requests already have spam detection data');
      }
      
      setLastUpdated(new Date());
      
    } catch (err) {
      const apiError = err instanceof RequestApiError ? err : new RequestApiError(0, 'Failed to load requests', [{ message: 'Failed to load requests', timestamp: new Date().toISOString() }]);
      setError(apiError);
      setLoading(false); // Make sure loading is false on error
      console.error('❌ Error loading requests:', apiError);
      
      toast({
        title: 'Error Loading Requests',
        description: apiError.errors[0]?.message || 'Failed to load senior requests. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast, spamDetectionStatus]);

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
      
      // Use the assignedStaffName from the response, or from the original request
      const assignedStaffName = updated.assignedStaffName || updatedRequest.assignedStaffName;
      
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
      const apiError = err instanceof RequestApiError ? err : new RequestApiError(0, 'Failed to update request', [{ message: 'Failed to update request', timestamp: new Date().toISOString() }]);
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
  }, [toast]);

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
      const apiError = err instanceof RequestApiError ? err : new RequestApiError(0, 'Failed to delete request', [{ message: 'Failed to delete request', timestamp: new Date().toISOString() }]);
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
      requestType?: number[];
      assignedStaff?: number[];
      searchTerm?: string;
    },
    sortBy: 'createdAt' | 'updatedAt' | 'priority' | 'status' | 'seniorName' = 'createdAt',
    sortDirection: 'asc' | 'desc' = 'desc'
  ) => {
    const filtered = requestUtils.filterRequests(requests, filters);
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
    // PHASE 2: Enhanced spam detection state
    spamDetectionStatus,
    spamPollingActive,
    // Existing methods
    loadRequests,
    updateRequest,
    deleteRequest,
    refresh,
    filterAndSortRequests,
    getStatusCounts,
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
      const apiError = err instanceof RequestApiError ? err : new RequestApiError(0, 'Failed to load dashboard data', [{ message: 'Failed to load dashboard data', timestamp: new Date().toISOString() }]);
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
      const apiError = err instanceof RequestApiError ? err : new RequestApiError(0, 'Unknown error', [{ message: 'Unknown error', timestamp: new Date().toISOString() }]);
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

// Hook for managing a single request (for details page) - ENHANCED WITH SPAM DETECTION
export function useRequest(requestId: number | null) {
  const [request, setRequest] = useState<SeniorRequestDisplayView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<RequestApiError | null>(null);
  const [spamDetectionPending, setSpamDetectionPending] = useState(false);
  const { toast } = useToast();

  const fetchRequest = useCallback(async () => {
    if (!requestId) {
      setRequest(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Load request data
      const data = await requestManagementApiService.getRequestById(requestId);
      
      if (data) {
        setRequest(data);
        
        // Check if spam detection is needed for this single request
        if (data.isSpam === undefined || data.isSpam === null) {
          // console.log(`🔍 Single request ${requestId} needs spam detection`);
          setSpamDetectionPending(true);
          
          // Start async spam detection
          await spamFilterService.initiateSpamDetectionAsync([requestId]);
          
          // Poll for this specific request
          let pollAttempts = 0;
          const maxPollAttempts = 12; // 1 minute max for single request
          
          const pollInterval = setInterval(async () => {
            pollAttempts++;
            
            try {
              const updates = await spamFilterService.pollForSpamUpdates([requestId]);
              
              if (updates.has(requestId)) {
                const spamUpdate = updates.get(requestId)!;
                // console.log(`✅ Received spam update for request ${requestId}`);
                
                // Show completion alert
                const alertMessage = spamUpdate.isSpam 
                  ? 'Request flagged as likely spam'
                  : 'Request marked as unlikely spam';
                  
                toast({
                  title: 'Spam Detection Complete',
                  description: alertMessage,
                  duration: 3000, // Short duration - 3 seconds
                });
                
                setRequest(prev => prev ? {
                  ...prev,
                  isSpam: spamUpdate.isSpam,
                  spamConfidenceScore: spamUpdate.confidenceScore,
                  spamDetectionReason: spamUpdate.detectionReason,
                  spamDetectedAt: spamUpdate.detectedAt
                } : null);
                
                setSpamDetectionPending(false);
                clearInterval(pollInterval);
              } else if (pollAttempts >= maxPollAttempts) {
                console.warn(`⚠️ Spam detection timed out for request ${requestId}`);
                setSpamDetectionPending(false);
                clearInterval(pollInterval);
              }
            } catch (pollError) {
              console.error('❌ Error polling single request spam update:', pollError);
              if (pollAttempts >= maxPollAttempts) {
                setSpamDetectionPending(false);
                clearInterval(pollInterval);
              }
            }
          }, 5000);
        }
      }
      
    } catch (err) {
      const apiError = err instanceof RequestApiError ? err : new RequestApiError(0, 'Unknown error', [{ message: 'Unknown error', timestamp: new Date().toISOString() }]);
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
      
      // Use the assignedStaffName from the response, or from the original request
      const assignedStaffName = updated.assignedStaffName || updatedRequest.assignedStaffName;
      
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
      const apiError = err instanceof RequestApiError ? err : new RequestApiError(0, 'Failed to update request', [{ message: 'Failed to update request', timestamp: new Date().toISOString() }]);
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
  }, [toast]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  return {
    request,
    loading,
    error,
    spamDetectionPending,
    updateRequest,
    refetch: fetchRequest
  };
}

// Export useRequest as the main hook for the details page
export const useRequests = () => useRequestManagement();
export { useRequest as useRequestDetails };
