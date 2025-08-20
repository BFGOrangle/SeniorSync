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
import { AIRecommendationsWidget } from "@/components/ai-recommendations-widget";
import { RefreshCw, Calendar, Plus } from "lucide-react";
import { useDashboardWithMode } from "@/hooks/use-dashboard-with-mode";
import { DashboardToggle, DashboardMode } from "@/components/dashboard-toggle";
import { useCurrentUser } from "@/contexts/user-context";
import { ErrorMessageCallout } from "@/components/error-message-callout";

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
  const dashboardTitle = mode === 'personal' ? 'My Analytics' : 'Center Analytics';
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

      {/* Error State with ErrorMessageCallout */}
      {error && (
        <ErrorMessageCallout
          errorHeader="Dashboard Error"
          errorMessage={`Failed to load ${mode} dashboard data`}
          errorCode={error.status}
          statusText={error.statusText}
          errors={error.errors}
        />
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

      {/* AI Recommendations Section */}
      <AIRecommendationsWidget 
        className="w-full" 
        showAllRequests={mode === 'center'}
        maxItems={6}
        onViewAll={() => {
          if (isAdmin && mode === 'center') {
            window.location.href = '/admin/request-management/ai-recommendations';
          } else {
            window.location.href = '/staff/request-management/ai-recommendations';
          }
        }}
      />

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