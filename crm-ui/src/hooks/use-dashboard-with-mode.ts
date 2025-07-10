import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  dashboardApiService,
  DashboardApiError,
} from "@/services/dashboard-api";
import {
  DashboardStats,
  RequestTypeSummary,
  StatusDistribution,
  PriorityDistribution,
  MonthlyTrend,
  StaffWorkload,
} from "@/types/dashboard";
import { DashboardMode } from "@/components/dashboard-toggle";

export interface UseDashboardWithModeState {
  dashboardStats: DashboardStats | null;
  requestTypeSummaries: RequestTypeSummary[];
  statusDistribution: StatusDistribution | null;
  priorityDistribution: PriorityDistribution | null;
  monthlyTrend: MonthlyTrend | null;
  staffWorkload: StaffWorkload | null;
  loading: boolean;
  error: DashboardApiError | null;
  lastUpdated: Date | null;
  mode: DashboardMode;
}

export interface UseDashboardWithModeReturn extends UseDashboardWithModeState {
  refreshAll: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshRequestTypes: () => Promise<void>;
  clearError: () => void;
  setMode: (mode: DashboardMode) => void;
}

/**
 * Hook for managing dashboard data with mode support (personal vs center)
 */
export function useDashboardWithMode(initialMode: DashboardMode): UseDashboardWithModeReturn {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [requestTypeSummaries, setRequestTypeSummaries] = useState<RequestTypeSummary[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution | null>(null);
  const [priorityDistribution, setPriorityDistribution] = useState<PriorityDistribution | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend | null>(null);
  const [staffWorkload, setStaffWorkload] = useState<StaffWorkload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<DashboardApiError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [mode, setMode] = useState<DashboardMode>(initialMode);

  const { toast } = useToast();

  // Load comprehensive dashboard statistics based on mode
  const refreshStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const stats = await dashboardApiService.getDashboardStatsByMode(mode);
      setDashboardStats(stats);
      setLastUpdated(new Date());

      console.log(`Dashboard statistics loaded successfully for ${mode} mode`);
    } catch (err) {
      const apiError =
        err instanceof DashboardApiError
          ? err
          : new DashboardApiError(500, "Unknown Error");
      setError(apiError);
      console.error(`Error loading ${mode} dashboard statistics:`, apiError);

      toast({
        title: "Error Loading Dashboard",
        description: `Failed to load ${mode} dashboard statistics. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [mode, toast]);

  // Load request type summaries based on mode
  const refreshRequestTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const requestTypes = await dashboardApiService.getRequestTypeSummariesByMode(mode);
      setRequestTypeSummaries(requestTypes);
      setLastUpdated(new Date());

      console.log(`Request type summaries loaded successfully for ${mode} mode`);
    } catch (err) {
      const apiError =
        err instanceof DashboardApiError
          ? err
          : new DashboardApiError(500, "Unknown Error");
      setError(apiError);
      console.error(`Error loading ${mode} request type summaries:`, apiError);

      toast({
        title: "Error Loading Request Types",
        description: `Failed to load ${mode} request type data. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [mode, toast]);

  // Load all individual distributions based on mode
  const loadDistributions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statusDist, priorityDist, monthlyData, workload] =
        await Promise.all([
          dashboardApiService.getStatusDistributionByMode(mode),
          dashboardApiService.getPriorityDistributionByMode(mode),
          dashboardApiService.getMonthlyTrendsByMode(mode),
          dashboardApiService.getStaffWorkloadByMode(mode),
        ]);

      setStatusDistribution(statusDist);
      setPriorityDistribution(priorityDist);
      setMonthlyTrend(monthlyData);
      setStaffWorkload(workload);
      setLastUpdated(new Date());

      console.log(`Dashboard distributions loaded successfully for ${mode} mode`);
    } catch (err) {
      const apiError =
        err instanceof DashboardApiError
          ? err
          : new DashboardApiError(500, "Unknown Error");
      setError(apiError);
      console.error(`Error loading ${mode} dashboard distributions:`, apiError);

      toast({
        title: "Error Loading Analytics",
        description: `Failed to load ${mode} analytics data. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [mode, toast]);

  // Refresh all dashboard data
  const refreshAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Force refresh to clear cache and get fresh data
      const freshStats = await dashboardApiService.forceRefreshByMode(mode);
      setDashboardStats(freshStats);

      // Load all other data in parallel for better performance
      await Promise.all([refreshRequestTypes(), loadDistributions()]);

      setLastUpdated(new Date());
      console.log(`Dashboard refreshed successfully for ${mode} mode`);
    } catch (err) {
      const apiError =
        err instanceof DashboardApiError
          ? err
          : new DashboardApiError(500, "Unknown Error");
      setError(apiError);
      console.error(`Error refreshing ${mode} dashboard:`, apiError);

      toast({
        title: "Error Refreshing Dashboard",
        description: `Failed to refresh ${mode} dashboard data. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [mode, refreshRequestTypes, loadDistributions, toast]);

  // Force refresh with cache clearing
  const forceRefresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Clear cache and force fresh data
      dashboardApiService.clearCache();

      // Force refresh to get fresh data
      const freshStats = await dashboardApiService.forceRefreshByMode(mode);
      setDashboardStats(freshStats);

      // Load all other data in parallel for better performance
      await Promise.all([refreshRequestTypes(), loadDistributions()]);

      setLastUpdated(new Date());
      console.log(`Dashboard force refreshed successfully for ${mode} mode`);

      toast({
        title: "Dashboard Refreshed",
        description: `All ${mode} dashboard data has been refreshed successfully.`,
        variant: "default",
      });
    } catch (err) {
      const apiError =
        err instanceof DashboardApiError
          ? err
          : new DashboardApiError(500, "Unknown Error");
      setError(apiError);
      console.error(`Error force refreshing ${mode} dashboard:`, apiError);

      toast({
        title: "Error Refreshing Dashboard",
        description: `Failed to refresh ${mode} dashboard data. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [mode, refreshRequestTypes, loadDistributions, toast]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Effect to refresh data when mode changes
  useEffect(() => {
    refreshAll();
  }, [mode]); // Only depend on mode, not refreshAll to avoid infinite loops

  // Initial load
  useEffect(() => {
    refreshAll();
  }, []); // Only run once on mount

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
    mode,

    // Actions
    refreshAll,
    forceRefresh,
    refreshStats,
    refreshRequestTypes,
    clearError,
    setMode,
  };
} 