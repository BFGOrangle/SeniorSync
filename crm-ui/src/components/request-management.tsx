"use client";

import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { KanbanSquare, List, Loader2, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestKanbanView } from "@/components/request-kanban-view";
import { RequestKanbanPriorityView } from "@/components/request-kanban-priority-view";
import { RequestTableView } from "@/components/request-table-view";
import { RequestFilters } from "@/components/request-filters";
import { SeniorRequestDisplayView } from "@/types/request";
import { useRequestManagement } from "@/hooks/use-requests";
import { useToast } from "@/hooks/use-toast";
import { CreateRequestModal } from "@/components/create-request-modal";
import { useCurrentUser } from "@/contexts/user-context";
import { ErrorMessageCallout } from "@/components/error-message-callout";

type ViewMode = "kanban-status" | "kanban-priority" | "table";

interface RequestFilterOptions {
  priority?: ("low" | "medium" | "high" | "urgent")[];
  status?: ("todo" | "in-progress" | "completed")[];
  requestType?: number[];
  assignedStaff?: number[];
  searchTerm?: string;
}

interface RequestSortOption {
  field: 'createdAt' | 'updatedAt' | 'priority' | 'status' | 'seniorName';
  direction: "asc" | "desc";
}

export default function RequestManagement() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban-status");
  const [filters, setFilters] = useState<RequestFilterOptions>({});
  const [sort, setSort] = useState<RequestSortOption>({
    field: "createdAt",
    direction: "desc",
  });

  const { toast } = useToast();
  const { currentUser } = useCurrentUser();

  // Use the enhanced request management hook with spam detection
  const {
    requests,
    loading: isLoading,
    error,
    spamDetectionStatus,
    updateRequest,
    refresh,
    filterAndSortRequests,
    getStatusCounts,
  } = useRequestManagement();

  // Fix hydration error by ensuring client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter and sort requests based on current state
  const processedRequests = useMemo(() => {
    if (!mounted || !requests) return [];
    
    // Use the enhanced requests for filtering
    const filteredRequests = filterAndSortRequests(filters, sort.field, sort.direction);
    
    return filteredRequests;
  }, [requests, filters, sort, mounted, filterAndSortRequests]);

  const handleRequestUpdate = async (updatedRequest: SeniorRequestDisplayView) => {
    try {
      const success = await updateRequest(updatedRequest);
      if (!success) {
        // Error handling is done in the hook
        return;
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update senior request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMyTicketsClick = () => {
    if (currentUser && currentUser.backendStaffId) {
      const currentUserId = currentUser.backendStaffId;
      const isMyTicketsActive = filters.assignedStaff?.length === 1 && filters.assignedStaff[0] === currentUserId;
      
      if (isMyTicketsActive) {
        // Toggle off - remove the assignedStaff filter
        const newFilters = { ...filters };
        delete newFilters.assignedStaff;
        setFilters(newFilters);
        toast({
          title: "Filter Removed",
          description: "Showing all requests",
          duration: 2000,
        });
      } else {
        // Toggle on - show only my requests
        setFilters({
          ...filters,
          assignedStaff: [currentUserId],
        });
        toast({
          title: "Filter Applied",
          description: "Showing only your assigned requests",
          duration: 2000,
        });
      }
    } else {
      // Handle case where backend staff ID is not available
      toast({
        title: "Error",
        description: "Unable to filter by your assigned requests. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleUnassignedClick = () => {
    const isUnassignedActive = filters.assignedStaff?.length === 0;
    
    if (isUnassignedActive) {
      // Toggle off - remove the assignedStaff filter
      const newFilters = { ...filters };
      delete newFilters.assignedStaff;
      setFilters(newFilters);
      toast({
        title: "Filter Removed",
        description: "Showing all requests",
        duration: 2000,
      });
    } else {
      // Toggle on - show only unassigned requests
      setFilters({
        ...filters,
        assignedStaff: [], // Empty array means unassigned in the backend filter
      });
      toast({
        title: "Filter Applied", 
        description: "Showing only unassigned requests",
        duration: 2000,
      });
    }
  };

  const statusCounts = getStatusCounts();

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600 font-medium">
            Loading senior requests...
          </span>
        </div>
      </div>
    );
  }

  if (isLoading && (!requests || requests.length === 0)) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600 font-medium">
            Loading senior requests...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-gray-50 p-6">
        <ErrorMessageCallout
          errorHeader="Request Management Error"
          errorMessage="Failed to load requests"
          errorCode={error.status}
          statusText={error.statusText}
          errors={error.errors}
        />
        <div className="flex justify-center mt-4">
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Request Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track senior care requests
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              {/* Status Badges Row */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 font-medium px-3 py-1 whitespace-nowrap"
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  TODO: {statusCounts.todo}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-700 border-orange-200 font-medium px-3 py-1 whitespace-nowrap"
                >
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                  In Progress: {statusCounts['in-progress']}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 font-medium px-3 py-1 whitespace-nowrap"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Completed: {statusCounts.completed}
                </Badge>
              </div>

              {/* View Toggle and Create Button Row */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Tabs
                  value={viewMode}
                  onValueChange={(value) => setViewMode(value as ViewMode)}
                  className="flex-shrink-0"
                >
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100 min-w-fit">
                    <TabsTrigger
                      value="kanban-status"
                      className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <KanbanSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Status</span>
                      <span className="sm:hidden">S</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="kanban-priority"
                      className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Priority</span>
                      <span className="sm:hidden">P</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="table"
                      className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <List className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Table</span>
                      <span className="sm:hidden">T</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Create Request Button */}
                <CreateRequestModal 
                  onRequestCreated={() => {
                    refresh();
                    toast({
                      title: "Success",
                      description: "Request created successfully and list refreshed!",
                    });
                  }}
                />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Filters Section */}
          <RequestFilters
            filters={filters}
            onFiltersChange={setFilters}
            onSortChange={setSort}
            sort={sort}
            onMyTicketsClick={handleMyTicketsClick}
            onUnassignedClick={handleUnassignedClick}
            isMyTicketsActive={currentUser?.backendStaffId ? filters.assignedStaff?.length === 1 && filters.assignedStaff[0] === currentUser.backendStaffId : false}
            isUnassignedActive={filters.assignedStaff?.length === 0}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-5">
        {viewMode === "kanban-status" && (
          <RequestKanbanView
            requests={processedRequests}
            onRequestUpdate={handleRequestUpdate}
            spamDetectionStatus={spamDetectionStatus} // PHASE 4: Pass spam detection status
          />
        )}
        {viewMode === "kanban-priority" && (
          <RequestKanbanPriorityView
            requests={processedRequests}
            onRequestUpdate={handleRequestUpdate}
            spamDetectionStatus={spamDetectionStatus} // PHASE 4: Pass spam detection status
          />
        )}
        {viewMode === "table" && (
          <RequestTableView
            requests={processedRequests}
            onRequestUpdate={handleRequestUpdate}
            spamDetectionStatus={spamDetectionStatus} // PHASE 4: Pass spam detection status
          />
        )}
      </div>
    </div>
  );
}