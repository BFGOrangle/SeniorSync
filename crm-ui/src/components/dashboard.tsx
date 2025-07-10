"use client";

import { Button } from "@/components/ui/button";
import {
  TotalRequestsCard,
  PendingRequestsCard,
  CompletedThisMonthCard,
  AverageCompletionTimeCard,
} from "@/components/dashboard-stats-card";
import {
  StatusDistributionChart,
  PriorityDistributionChart,
  RequestTypesChart,
  MonthlyTrendChart,
  StaffWorkloadChart,
  RequestTypeDetails,
} from "@/components/dashboard-charts";

import { CreateRequestModal } from "@/components/create-request-modal";
import { RefreshCw, Calendar, Download, Plus } from "lucide-react";
import { useDashboardWithMode } from "@/hooks/use-dashboard-with-mode";
import { DashboardToggle, DashboardMode } from "@/components/dashboard-toggle";
import { useCurrentUser } from "@/contexts/user-context";

import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';
  
  // Initialize with personal mode for all users
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
    mode,
    setMode,
    forceRefresh,
    clearError,
  } = useDashboardWithMode(isAdmin ? "center" : "personal");

  const handleRefresh = async () => {
    await forceRefresh();
  };

  const handleRequestCreated = () => {
    // Refresh dashboard data when a new request is created
    forceRefresh();
  };

  const handleModeChange = (newMode: DashboardMode) => {
    setMode(newMode);
  };

  // Determine if StaffWorkloadChart should be shown
  const showStaffWorkload = mode === 'center' && isAdmin;

  // Dynamic title based on mode
  const dashboardTitle = mode === 'personal' ? 'My Dashboard' : 'Center Dashboard';
  const dashboardDescription = mode === 'personal' 
    ? 'Overview of your assigned requests' 
    : 'Overview of all center requests and staff workload';

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">{dashboardTitle}</h2>
          <p className="text-muted-foreground">
            {dashboardDescription}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Dashboard Mode Toggle - Only for Admins */}
          {isAdmin && (
            <DashboardToggle 
              mode={mode} 
              onModeChange={handleModeChange}
              className="mr-4"
            />
          )}

          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>

          {lastUpdated && (
            <Badge variant="secondary" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              Updated {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
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
        <StatusDistributionChart data={statusDistribution} loading={loading} />
        <PriorityDistributionChart
          data={priorityDistribution}
          loading={loading}
        />
        <RequestTypesChart data={requestTypeSummaries} loading={loading} />
        <MonthlyTrendChart data={monthlyTrend} loading={loading} />
      </div>

      {/* Staff Workload and Request Details */}
      <div className={`grid gap-6 ${showStaffWorkload ? 'md:grid-cols-1 lg:grid-cols-2' : 'md:grid-cols-1'}`}>
        {/* Only show StaffWorkloadChart in center mode for admins */}
        {showStaffWorkload && (
          <StaffWorkloadChart data={staffWorkload} loading={loading} />
        )}
        <RequestTypeDetails data={requestTypeSummaries} loading={loading} />
      </div>

      {/* Floating Create Request Button */}
      <CreateRequestModal
        onRequestCreated={handleRequestCreated}
        trigger={
          <Button
            size="sm"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700 z-50"
            title="Create New Request"
          >
            <Plus className="h-6 w-6" />
          </Button>
        }
      />
    </div>
  );
} 