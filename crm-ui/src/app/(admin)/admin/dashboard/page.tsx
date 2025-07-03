'use client';

import { Button } from '@/components/ui/button';
import { 
  TotalRequestsCard,
  PendingRequestsCard,
  CompletedThisMonthCard,
  AverageCompletionTimeCard,
} from '@/components/dashboard-stats-card';
import {
  StatusDistributionChart,
  PriorityDistributionChart,
  RequestTypesChart,
  MonthlyTrendChart,
  StaffWorkloadChart,
  RequestTypeDetails,
} from '@/components/dashboard-charts';
import { useDashboard } from '@/hooks/use-dashboard';
import { RefreshCw, Calendar, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const {
    dashboardStats,
    requestTypeSummaries,
    statusDistribution,
    priorityDistribution,
    monthlyTrend,
    staffWorkload,
    loading,
    error,
    lastUpdated,
    refreshAll,
    clearError,
  } = useDashboard();

  const handleRefresh = async () => {
    await refreshAll();
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of senior request management system
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <Badge variant="secondary" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              Updated {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
          
          <Button 
            onClick={handleRefresh} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Error loading dashboard data
              </h3>
              <p className="text-sm text-red-600 mt-1">
                {error.message}. Please try refreshing the page.
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TotalRequestsCard 
          value={dashboardStats?.totalRequests || 0}
          loading={loading}
        />
        <PendingRequestsCard 
          value={dashboardStats?.totalPendingRequests || 0}
          loading={loading}
        />
        <CompletedThisMonthCard 
          value={dashboardStats?.totalCompletedThisMonth || 0}
          loading={loading}
        />
        <AverageCompletionTimeCard 
          value={dashboardStats?.averageCompletionTime || 0}
          loading={loading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <StatusDistributionChart 
          data={statusDistribution}
          loading={loading}
        />
        <PriorityDistributionChart 
          data={priorityDistribution}
          loading={loading}
        />
        <RequestTypesChart 
          data={requestTypeSummaries}
          loading={loading}
        />
        <MonthlyTrendChart 
          data={monthlyTrend}
          loading={loading}
        />
      </div>

      {/* Staff Workload and Request Details */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <StaffWorkloadChart 
          data={staffWorkload}
          loading={loading}
        />
        <RequestTypeDetails 
          data={requestTypeSummaries}
          loading={loading}
        />
      </div>
    </div>
  );
} 