import {
  DashboardStats,
  RequestTypeSummary,
  StatusDistribution,
  PriorityDistribution,
  MonthlyTrend,
  StaffWorkload,
  DashboardResponse,
  DashboardUtils,
} from "@/types/dashboard";
import {
  AuthenticatedApiClient,
  BaseApiError,
} from "./authenticated-api-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088";
const DASHBOARD_ENDPOINT = `${API_BASE_URL}/api/requests/dashboard`;
const PERSONAL_DASHBOARD_ENDPOINT = `${API_BASE_URL}/api/requests/dashboard/personal`;
const CENTER_DASHBOARD_ENDPOINT = `${API_BASE_URL}/api/requests/dashboard/center`;

// Custom error class for dashboard API errors
export class DashboardApiError extends BaseApiError {
  constructor(
    status: number,
    statusText: string,
    errors: Array<{
      message: string;
      timestamp: string;
      field?: string;
      rejectedValue?: any;
    }> = []
  ) {
    super(status, statusText, errors);
    this.name = "DashboardApiError";
  }
}

// Dashboard API Service
export class DashboardApiService extends AuthenticatedApiClient {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Override error handling for dashboard-specific errors
  protected async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any;

    try {
      errorData = await response.json();
    } catch {
      throw new DashboardApiError(response.status, response.statusText, [
        {
          message: "Failed to parse dashboard error response",
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    // Handle specific dashboard errors
    throw new DashboardApiError(
      response.status,
      response.statusText,
      errorData.errors || [
        {
          message: errorData.message || "Dashboard API error",
          timestamp: errorData.timestamp || new Date().toISOString(),
        },
      ]
    );
  }

  /**
   * Get cached data or fetch from API
   */
  private async getCachedData<T>(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const data = await fetcher();
      this.cache.set(key, { data, timestamp: now });
      return data;
    } catch (error) {
      // If API fails and we have stale cached data, return it
      if (cached) {
        console.warn("API failed, returning stale cached data");
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * Get the raw dashboard response from backend
   */
  private async getRawDashboardData(): Promise<DashboardResponse> {
    return this.getCachedData("dashboard-raw", () =>
      this.get<DashboardResponse>(DASHBOARD_ENDPOINT)
    );
  }

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const rawData = await this.getRawDashboardData();
      return DashboardUtils.transformDashboardResponse(rawData);
    } catch (error) {
      console.error("Failed to get dashboard stats:", error);
      // Return empty/default stats as fallback
      return {
        statusCounts: {},
        requestTypeCounts: {},
        priorityCounts: {},
        monthlyTrend: {},
        totalRequests: 0,
        totalCompletedThisMonth: 0,
        totalPendingRequests: 0,
        averageCompletionTime: 0,
        staffWorkload: {},
      };
    }
  }

  /**
   * Get request type summaries with counts and percentages
   */
  async getRequestTypeSummaries(): Promise<RequestTypeSummary[]> {
    try {
      const rawData = await this.getRawDashboardData();
      return DashboardUtils.generateRequestTypeSummaries(rawData);
    } catch (error) {
      console.error("Failed to get request type summaries:", error);
      return [];
    }
  }

  /**
   * Get status distribution counts
   */
  async getStatusDistribution(): Promise<StatusDistribution> {
    try {
      const stats = await this.getDashboardStats();
      return stats.statusCounts;
    } catch (error) {
      console.error("Failed to get status distribution:", error);
      return {};
    }
  }

  /**
   * Get priority distribution counts
   */
  async getPriorityDistribution(): Promise<PriorityDistribution> {
    try {
      const stats = await this.getDashboardStats();
      return stats.priorityCounts;
    } catch (error) {
      console.error("Failed to get priority distribution:", error);
      return {};
    }
  }

  /**
   * Get monthly request trends
   */
  async getMonthlyTrends(months: number = 6): Promise<MonthlyTrend> {
    try {
      const stats = await this.getDashboardStats();
      return stats.monthlyTrend;
    } catch (error) {
      console.error("Failed to get monthly trends:", error);
      return {};
    }
  }

  /**
   * Get requests by date range
   */
  async getRequestsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<Record<string, number>> {
    try {
      // For now, return monthly trend data as we don't have date range endpoint
      const stats = await this.getDashboardStats();
      return stats.monthlyTrend;
    } catch (error) {
      console.error("Failed to get requests by date range:", error);
      return {};
    }
  }

  /**
   * Get staff workload distribution
   */
  async getStaffWorkload(): Promise<StaffWorkload> {
    try {
      const stats = await this.getDashboardStats();
      return stats.staffWorkload;
    } catch (error) {
      console.error("Failed to get staff workload:", error);
      return {};
    }
  }

  /**
   * Get personal dashboard data (filtered to current user's assigned requests)
   */
  private async getRawPersonalDashboardData(): Promise<DashboardResponse> {
    return this.getCachedData("dashboard-personal-raw", () =>
      this.get<DashboardResponse>(PERSONAL_DASHBOARD_ENDPOINT)
    );
  }

  /**
   * Get personal dashboard statistics
   */
  async getPersonalDashboardStats(): Promise<DashboardStats> {
    try {
      const rawData = await this.getRawPersonalDashboardData();
      return DashboardUtils.transformDashboardResponse(rawData);
    } catch (error) {
      console.error("Failed to get personal dashboard stats:", error);
      throw error;
    }
  }

  /**
   * Get center dashboard data (all requests - admin only)
   */
  private async getRawCenterDashboardData(): Promise<DashboardResponse> {
    return this.getCachedData("dashboard-center-raw", () =>
      this.get<DashboardResponse>(CENTER_DASHBOARD_ENDPOINT)
    );
  }

  /**
   * Get center dashboard statistics
   */
  async getCenterDashboardStats(): Promise<DashboardStats> {
    try {
      const rawData = await this.getRawCenterDashboardData();
      return DashboardUtils.transformDashboardResponse(rawData);
    } catch (error) {
      console.error("Failed to get center dashboard stats:", error);
      return {
        statusCounts: {},
        requestTypeCounts: {},
        priorityCounts: {},
        monthlyTrend: {},
        totalRequests: 0,
        totalCompletedThisMonth: 0,
        totalPendingRequests: 0,
        averageCompletionTime: 0,
        staffWorkload: {},
      };
    }
  }

  /**
   * Get dashboard data based on mode (personal or center)
   */
  async getDashboardStatsByMode(mode: 'personal' | 'center'): Promise<DashboardStats> {
    if (mode === 'personal') {
      return this.getPersonalDashboardStats();
    } else {
      return this.getCenterDashboardStats();
    }
  }

  /**
   * Get request type summaries by mode
   */
  async getRequestTypeSummariesByMode(mode: 'personal' | 'center'): Promise<RequestTypeSummary[]> {
    try {
      const rawData = mode === 'personal' 
        ? await this.getRawPersonalDashboardData() 
        : await this.getRawCenterDashboardData();
      return DashboardUtils.generateRequestTypeSummaries(rawData);
    } catch (error) {
      console.error(`Failed to get ${mode} request type summaries:`, error);
      return [];
    }
  }

  /**
   * Get status distribution by mode
   */
  async getStatusDistributionByMode(mode: 'personal' | 'center'): Promise<StatusDistribution> {
    try {
      const stats = await this.getDashboardStatsByMode(mode);
      return stats.statusCounts;
    } catch (error) {
      console.error(`Failed to get ${mode} status distribution:`, error);
      return {};
    }
  }

  /**
   * Get priority distribution by mode
   */
  async getPriorityDistributionByMode(mode: 'personal' | 'center'): Promise<PriorityDistribution> {
    try {
      const stats = await this.getDashboardStatsByMode(mode);
      return stats.priorityCounts;
    } catch (error) {
      console.error(`Failed to get ${mode} priority distribution:`, error);
      return {};
    }
  }

  /**
   * Get monthly trends by mode
   */
  async getMonthlyTrendsByMode(mode: 'personal' | 'center'): Promise<MonthlyTrend> {
    try {
      const stats = await this.getDashboardStatsByMode(mode);
      return stats.monthlyTrend;
    } catch (error) {
      console.error(`Failed to get ${mode} monthly trends:`, error);
      return {};
    }
  }

  /**
   * Get staff workload by mode (only relevant for center mode)
   */
  async getStaffWorkloadByMode(mode: 'personal' | 'center'): Promise<StaffWorkload> {
    try {
      if (mode === 'personal') {
        // Personal mode doesn't show staff workload
        return {};
      }
      const stats = await this.getDashboardStatsByMode(mode);
      return stats.staffWorkload;
    } catch (error) {
      console.error(`Failed to get ${mode} staff workload:`, error);
      return {};
    }
  }

  /**
   * Force refresh all dashboard data (clears cache and refetches)
   */
  async forceRefresh(): Promise<DashboardStats> {
    this.clearCache();
    return this.getDashboardStats();
  }

  /**
   * Force refresh dashboard data by mode
   */
  async forceRefreshByMode(mode: 'personal' | 'center'): Promise<DashboardStats> {
    this.clearCache();
    return this.getDashboardStatsByMode(mode);
  }

  /**
   * Clear cache (useful for forced refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus(): { keys: string[]; size: number } {
    return {
      keys: Array.from(this.cache.keys()),
      size: this.cache.size,
    };
  }
}

// Export singleton instance
export const dashboardApiService = new DashboardApiService();
