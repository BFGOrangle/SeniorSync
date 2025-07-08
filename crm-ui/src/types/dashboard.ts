// Backend API response types
export interface DashboardResponse {
  totalRequests: number;
  pendingRequests: number;
  completedThisMonth: number;
  avgCompletionTimeDays: number;
  statusCountDto: StatusCountDto[];
  requestTypeCounts: LabelCountDto[];
  priorityCounts: PriorityCountDto[];
  monthlyCounts: LabelCountDto[];
  staffWorkloadCounts: LabelCountDto[];
  requestTypeStatusCounts: RequestTypeStatusCountDto[];
}

export interface StatusCountDto {
  status: string;
  count: number;
}

export interface LabelCountDto {
  label: string;
  count: number;
}

export interface PriorityCountDto {
  priority: number;
  count: number;
}

export interface RequestTypeStatusCountDto {
  requestTypeName: string;
  status: string;
  count: number;
}

// Frontend-friendly types (transformed from backend response)
export interface DashboardStats {
  statusCounts: Record<string, number>;
  requestTypeCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  monthlyTrend: Record<string, number>;
  totalRequests: number;
  totalCompletedThisMonth: number;
  totalPendingRequests: number;
  averageCompletionTime: number; // in days
  staffWorkload: Record<string, number>;
}

export interface RequestTypeSummary {
  id: number;
  name: string;
  description: string;
  count: number;
  percentage: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
}

export interface StatusDistribution {
  [status: string]: number;
}

export interface PriorityDistribution {
  [priority: string]: number;
}

export interface MonthlyTrend {
  [month: string]: number;
}

export interface StaffWorkload {
  [staffName: string]: number;
}

// Utility functions for data transformation
export class DashboardUtils {
  // Transform backend response to frontend-friendly format
  static transformDashboardResponse(
    response: DashboardResponse
  ): DashboardStats {
    return {
      statusCounts: this.transformStatusCounts(response.statusCountDto || []),
      requestTypeCounts: this.transformLabelCounts(
        response.requestTypeCounts || []
      ),
      priorityCounts: this.transformPriorityCounts(
        response.priorityCounts || []
      ),
      monthlyTrend: this.transformLabelCounts(response.monthlyCounts || []),
      totalRequests: response.totalRequests || 0,
      totalCompletedThisMonth: response.completedThisMonth || 0,
      totalPendingRequests: response.pendingRequests || 0,
      averageCompletionTime: response.avgCompletionTimeDays || 0,
      staffWorkload: this.transformLabelCounts(
        response.staffWorkloadCounts || []
      ),
    };
  }

  // Transform status counts array to object
  static transformStatusCounts(
    statusCounts: StatusCountDto[]
  ): Record<string, number> {
    const result: Record<string, number> = {};
    statusCounts.forEach((item) => {
      // Transform backend status to frontend-friendly format
      const friendlyStatus = this.transformStatusName(item.status);
      result[friendlyStatus] = item.count;
    });
    return result;
  }

  // Transform label-count arrays to objects
  static transformLabelCounts(
    labelCounts: LabelCountDto[]
  ): Record<string, number> {
    const result: Record<string, number> = {};
    labelCounts.forEach((item) => {
      result[item.label] = item.count;
    });
    return result;
  }

  // Transform priority counts to friendly format
  static transformPriorityCounts(
    priorityCounts: PriorityCountDto[]
  ): Record<string, number> {
    const result: Record<string, number> = {};
    priorityCounts.forEach((item) => {
      const friendlyPriority = this.transformPriorityName(item.priority);
      result[friendlyPriority] = item.count;
    });
    return result;
  }

  // Transform backend status names to frontend-friendly names
  static transformStatusName(backendStatus: string): string {
    const statusMap: Record<string, string> = {
      TODO: "Pending",
      IN_PROGRESS: "In Progress",
      COMPLETED: "Completed",
    };
    return statusMap[backendStatus] || backendStatus;
  }

  // Transform priority numbers to friendly names
  static transformPriorityName(priority: number): string {
    const priorityMap: Record<number, string> = {
      1: "Very Low",
      2: "Low",
      3: "Medium",
      4: "High",
      5: "Urgent",
    };
    return priorityMap[priority] || `Priority ${priority}`;
  }

  // Generate request type summaries from backend data
  static generateRequestTypeSummaries(
    response: DashboardResponse
  ): RequestTypeSummary[] {
    const typeCounts = response.requestTypeCounts || [];
    const typeStatusCounts = response.requestTypeStatusCounts || [];
    const totalRequests = response.totalRequests || 1; // Avoid division by zero

    return typeCounts.map((typeCount, index) => {
      // Calculate status counts for this request type
      const statusCounts = typeStatusCounts.filter(
        (item) => item.requestTypeName === typeCount.label
      );

      const pendingCount = statusCounts
        .filter((item) => item.status === "TODO")
        .reduce((sum, item) => sum + item.count, 0);

      const inProgressCount = statusCounts
        .filter((item) => item.status === "IN_PROGRESS")
        .reduce((sum, item) => sum + item.count, 0);

      const completedCount = statusCounts
        .filter((item) => item.status === "COMPLETED")
        .reduce((sum, item) => sum + item.count, 0);

      return {
        id: index + 1, // Generate ID since backend doesn't provide it
        name: typeCount.label,
        description: `${typeCount.label} requests`, // Generate description
        count: typeCount.count,
        percentage:
          Math.round((typeCount.count / totalRequests) * 100 * 10) / 10, // Round to 1 decimal
        pendingCount,
        inProgressCount,
        completedCount,
      };
    });
  }
}
