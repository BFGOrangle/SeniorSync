import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  dashboardApiService, 
  DashboardApiError 
} from '@/services/dashboard-api';
import {
  DashboardStats,
  RequestTypeSummary,
  StatusDistribution,
  PriorityDistribution,
  MonthlyTrend,
  StaffWorkload,
} from '@/types/dashboard';

export interface UseDashboardState {
  dashboardStats: DashboardStats | null;
  requestTypeSummaries: RequestTypeSummary[];
  statusDistribution: StatusDistribution | null;
  priorityDistribution: PriorityDistribution | null;
  monthlyTrend: MonthlyTrend | null;
  staffWorkload: StaffWorkload | null;
  loading: boolean;
  error: DashboardApiError | null;
  lastUpdated: Date | null;
}

export interface UseDashboardActions {
  refreshAll: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshRequestTypes: () => Promise<void>;
  clearError: () => void;
}

export interface UseDashboardReturn extends UseDashboardState, UseDashboardActions {}

/**
 * Hook for managing dashboard data with comprehensive analytics
 */
export function useDashboard(): UseDashboardReturn {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [requestTypeSummaries, setRequestTypeSummaries] = useState<RequestTypeSummary[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution | null>(null);
  const [priorityDistribution, setPriorityDistribution] = useState<PriorityDistribution | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend | null>(null);
  const [staffWorkload, setStaffWorkload] = useState<StaffWorkload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<DashboardApiError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { toast } = useToast();

  // Load comprehensive dashboard statistics
  const refreshStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const stats = await dashboardApiService.getDashboardStats();
      setDashboardStats(stats);
      setLastUpdated(new Date());

      console.log('Dashboard statistics loaded successfully');
    } catch (err) {
      const apiError = err instanceof DashboardApiError ? err : new DashboardApiError(500, 'Unknown Error');
      setError(apiError);
      console.error('Error loading dashboard statistics:', apiError);

      toast({
        title: 'Error Loading Dashboard',
        description: 'Failed to load dashboard statistics. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load request type summaries
  const refreshRequestTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const summaries = await dashboardApiService.getRequestTypeSummaries();
      setRequestTypeSummaries(summaries);
      setLastUpdated(new Date());

      console.log('Request type summaries loaded successfully');
    } catch (err) {
      const apiError = err instanceof DashboardApiError ? err : new DashboardApiError(500, 'Unknown Error');
      setError(apiError);
      console.error('Error loading request type summaries:', apiError);

      toast({
        title: 'Error Loading Request Types',
        description: 'Failed to load request type data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load all individual distributions
  const loadDistributions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statusDist, priorityDist, monthlyData, workload] = await Promise.all([
        dashboardApiService.getStatusDistribution(),
        dashboardApiService.getPriorityDistribution(),
        dashboardApiService.getMonthlyTrends(6),
        dashboardApiService.getStaffWorkload(),
      ]);

      setStatusDistribution(statusDist);
      setPriorityDistribution(priorityDist);
      setMonthlyTrend(monthlyData);
      setStaffWorkload(workload);
      setLastUpdated(new Date());

      console.log('Dashboard distributions loaded successfully');
    } catch (err) {
      const apiError = err instanceof DashboardApiError ? err : new DashboardApiError(500, 'Unknown Error');
      setError(apiError);
      console.error('Error loading dashboard distributions:', apiError);

      toast({
        title: 'Error Loading Analytics',
        description: 'Failed to load analytics data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Refresh all dashboard data
  const refreshAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel for better performance
      await Promise.all([
        refreshStats(),
        refreshRequestTypes(),
        loadDistributions(),
      ]);

      setLastUpdated(new Date());
    } catch (err) {
      const apiError = err instanceof DashboardApiError ? err : new DashboardApiError(500, 'Unknown Error');
      setError(apiError);
      console.error('Error refreshing dashboard:', apiError);

      toast({
        title: 'Error Refreshing Dashboard',
        description: 'Failed to refresh dashboard data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [refreshStats, refreshRequestTypes, loadDistributions, toast]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    // State
    dashboardStats,
    requestTypeSummaries,
    statusDistribution,
    priorityDistribution,
    monthlyTrend,
    staffWorkload,
    loading,
    error,
    lastUpdated,
    
    // Actions
    refreshAll,
    refreshStats,
    refreshRequestTypes,
    clearError,
  };
}

/**
 * Simplified hook for just status counts (lighter weight)
 */
export function useStatusCounts() {
  const [statusCounts, setStatusCounts] = useState<StatusDistribution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<DashboardApiError | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const distribution = await dashboardApiService.getStatusDistribution();
      setStatusCounts(distribution);
    } catch (err) {
      const apiError = err instanceof DashboardApiError ? err : new DashboardApiError(500, 'Unknown Error');
      setError(apiError);
      console.error('Error loading status counts:', apiError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    statusCounts,
    loading,
    error,
    refresh,
  };
} 