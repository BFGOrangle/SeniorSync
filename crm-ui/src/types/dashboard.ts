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