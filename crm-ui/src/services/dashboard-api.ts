import {
  DashboardStats,
  RequestTypeSummary,
  StatusDistribution,
  PriorityDistribution,
  MonthlyTrend,
  StaffWorkload,
} from '@/types/dashboard';

// Mock data that will be replaced with actual API calls
const MOCK_DATA = {
  dashboardStats: {
    statusCounts: {
      'Pending': 15,
      'In Progress': 8,
      'Completed': 45,
      'Cancelled': 2
    },
    requestTypeCounts: {
      'Medical Assistance': 25,
      'Social Visit': 20,
      'Home Maintenance': 15,
      'Transportation': 10
    },
    priorityCounts: {
      'High': 12,
      'Medium': 28,
      'Low': 30
    },
    monthlyTrend: {
      'Jan 2024': 45,
      'Feb 2024': 52,
      'Mar 2024': 48,
      'Apr 2024': 60,
      'May 2024': 55,
      'Jun 2024': 65
    },
    totalRequests: 70,
    totalCompletedThisMonth: 25,
    totalPendingRequests: 23,
    averageCompletionTime: 3.5,
    staffWorkload: {
      'John Smith': 12,
      'Sarah Johnson': 15,
      'Mike Brown': 8,
      'Lisa Davis': 10,
      'Tom Wilson': 7
    }
  },
  requestTypes: [
    {
      id: 1,
      name: 'Medical Assistance',
      description: 'Medical-related assistance requests',
      count: 25,
      percentage: 35.7,
      pendingCount: 5,
      inProgressCount: 3,
      completedCount: 17
    },
    {
      id: 2,
      name: 'Social Visit',
      description: 'Regular social visits and companionship',
      count: 20,
      percentage: 28.6,
      pendingCount: 4,
      inProgressCount: 2,
      completedCount: 14
    },
    {
      id: 3,
      name: 'Home Maintenance',
      description: 'Home repair and maintenance tasks',
      count: 15,
      percentage: 21.4,
      pendingCount: 3,
      inProgressCount: 2,
      completedCount: 10
    },
    {
      id: 4,
      name: 'Transportation',
      description: 'Transportation to appointments or events',
      count: 10,
      percentage: 14.3,
      pendingCount: 3,
      inProgressCount: 1,
      completedCount: 6
    }
  ]
};

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088';
// const DASHBOARD_ENDPOINT = `${API_BASE_URL}/api/dashboard`;

// Custom error class for dashboard API errors
export class DashboardApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public message: string = 'Dashboard API Error'
  ) {
    super(message);
    this.name = 'DashboardApiError';
  }
}

// Dashboard API Service
export class DashboardApiService {
  // Uncomment and use this client when connecting to real backend
  // private client = new DashboardApiClient();

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    // return this.client.get<DashboardStats>(`${DASHBOARD_ENDPOINT}/stats`);
    return MOCK_DATA.dashboardStats;
  }

  /**
   * Get request type summaries with counts and percentages
   */
  async getRequestTypeSummaries(): Promise<RequestTypeSummary[]> {
    // return this.client.get<RequestTypeSummary[]>(`${DASHBOARD_ENDPOINT}/request-types`);
    return MOCK_DATA.requestTypes;
  }

  /**
   * Get status distribution counts
   */
  async getStatusDistribution(): Promise<StatusDistribution> {
    // return this.client.get<StatusDistribution>(`${DASHBOARD_ENDPOINT}/status-distribution`);
    return MOCK_DATA.dashboardStats.statusCounts;
  }

  /**
   * Get priority distribution counts
   */
  async getPriorityDistribution(): Promise<PriorityDistribution> {
    // return this.client.get<PriorityDistribution>(`${DASHBOARD_ENDPOINT}/priority-distribution`);
    return MOCK_DATA.dashboardStats.priorityCounts;
  }

  /**
   * Get monthly request trends
   */
  async getMonthlyTrends(months: number = 6): Promise<MonthlyTrend> {
    // return this.client.get<MonthlyTrend>(`${DASHBOARD_ENDPOINT}/monthly-trends?months=${months}`);
    return MOCK_DATA.dashboardStats.monthlyTrend;
  }

  /**
   * Get requests by date range
   */
  async getRequestsByDateRange(startDate: string, endDate: string): Promise<Record<string, number>> {
    // return this.client.get<Record<string, number>>(`${DASHBOARD_ENDPOINT}/date-range?startDate=${startDate}&endDate=${endDate}`);
    return MOCK_DATA.dashboardStats.monthlyTrend;
  }

  /**
   * Get staff workload distribution
   */
  async getStaffWorkload(): Promise<StaffWorkload> {
    // return this.client.get<StaffWorkload>(`${DASHBOARD_ENDPOINT}/staff-workload`);
    return MOCK_DATA.dashboardStats.staffWorkload;
  }
}

// Export singleton instance
export const dashboardApiService = new DashboardApiService(); 