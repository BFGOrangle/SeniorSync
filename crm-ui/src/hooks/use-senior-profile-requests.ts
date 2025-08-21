import { useState, useEffect, useCallback } from "react";
import { SeniorRequestDto } from "@/types/request";
import { SeniorProfileRequestFilterOptions } from "@/types/senior-profile-requests";
import { requestManagementApiService } from "@/services/request-api";

// Convert backend priority (1-5) to frontend priority string
const mapPriorityToFrontend = (priority: number): "low" | "medium" | "high" | "urgent" => {
  if (priority >= 5) return "urgent";
  if (priority >= 4) return "high";
  if (priority >= 3) return "medium";
  return "low";
};

// Convert backend status to frontend status string
const mapStatusToFrontend = (status: string): "todo" | "in-progress" | "completed" => {
  switch (status) {
    case "TODO": return "todo";
    case "IN_PROGRESS": return "in-progress";
    case "COMPLETED": return "completed";
    default: return "todo";
  }
};

export function useSeniorProfileRequests(
  seniorId: number | null, 
  filters?: SeniorProfileRequestFilterOptions
) {
  const [requests, setRequests] = useState<SeniorRequestDto[]>([]);
  const [allRequests, setAllRequests] = useState<SeniorRequestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Apply filters whenever allRequests or filters change
  useEffect(() => {
    setLoading(true);
    
    // Filter requests locally
    const filteredRequests = !filters ? allRequests : allRequests.filter(request => {
      const frontendPriority = mapPriorityToFrontend(request.priority);
      const frontendStatus = mapStatusToFrontend(request.status);

      // Priority filter
      if (filters.priority && filters.priority.length > 0) {
        if (!filters.priority.includes(frontendPriority)) {
          return false;
        }
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(frontendStatus)) {
          return false;
        }
      }

      // Request type filter
      if (filters.requestType && filters.requestType.length > 0) {
        if (!request.requestTypeId || !filters.requestType.includes(request.requestTypeId)) {
          return false;
        }
      }

      // Assigned staff filter
      if (filters.assignedStaff && filters.assignedStaff.length > 0) {
        if (!request.assignedStaffId || !filters.assignedStaff.includes(request.assignedStaffId)) {
          return false;
        }
      }

      // Search term filter
      if (filters.searchTerm && filters.searchTerm.trim()) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesTitle = request.title.toLowerCase().includes(searchLower);
        const matchesDescription = request.description.toLowerCase().includes(searchLower);
        const matchesType = request.requestTypeName?.toLowerCase().includes(searchLower);
        const matchesStaff = request.assignedStaffName?.toLowerCase().includes(searchLower);
        
        if (!matchesTitle && !matchesDescription && !matchesType && !matchesStaff) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) {
        const requestDate = new Date(request.createdAt);
        
        if (filters.dateRange.from) {
          const fromDate = new Date(filters.dateRange.from);
          if (requestDate < fromDate) {
            return false;
          }
        }
        
        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
          // Set to end of day to include the full day
          toDate.setHours(23, 59, 59, 999);
          if (requestDate > toDate) {
            return false;
          }
        }
      }

      return true;
    });
    
    setRequests(filteredRequests);
    setLoading(false);
  }, [allRequests, filters]);

  // Fetch all requests when seniorId changes
  useEffect(() => {
    if (seniorId) {
      const fetchData = async () => {
        try {
          setError(null);
          const data = await requestManagementApiService.getRequestsBySenior(seniorId);
          setAllRequests(data);
        } catch (err) {
          console.error('Failed to fetch all senior requests:', err);
          setError('Failed to fetch requests');
        }
      };
      fetchData();
    } else {
      setAllRequests([]);
      setRequests([]);
    }
  }, [seniorId]);

  const refetch = useCallback(() => {
    if (seniorId) {
      const fetchData = async () => {
        try {
          setError(null);
          const data = await requestManagementApiService.getRequestsBySenior(seniorId);
          setAllRequests(data);
        } catch (err) {
          console.error('Failed to fetch all senior requests:', err);
          setError('Failed to fetch requests');
        }
      };
      fetchData();
    }
  }, [seniorId]);

  return {
    requests,
    allRequests,
    loading,
    error,
    refetch,
    refetchAll: refetch,
  };
}
