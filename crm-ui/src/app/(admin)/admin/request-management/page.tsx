"use client";

import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { KanbanSquare, List, Loader2, BarChart3, RefreshCw, AlertTriangle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestKanbanView } from "@/components/request-kanban-view";
import { RequestKanbanPriorityView } from "@/components/request-kanban-priority-view";
import { RequestTableView } from "@/components/request-table-view";
import { RequestFilters } from "@/components/request-filters";
import { SeniorRequestDisplayView } from "@/types/request";
import { useRequestManagement } from "@/hooks/use-requests";
import { useToast } from "@/hooks/use-toast";
import { CreateRequestModal } from "@/components/create-request-modal";

type ViewMode = "kanban-status" | "kanban-priority" | "table";

interface RequestFilterOptions {
  priority?: ("low" | "medium" | "high" | "urgent")[];
  status?: ("pending" | "in-progress" | "in-review" | "completed" | "cancelled")[];
  requestType?: string[];
  assignedStaff?: string[];
  searchTerm?: string;
}

interface RequestSortOption {
  field: 'createdAt' | 'updatedAt' | 'priority' | 'status' | 'seniorName';
  direction: "asc" | "desc";
}

export default function RequestManagement() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban-status");
  const [smartFilter, setSmartFilter] = useState(true); // Hide empty columns when filtering
  const [filters, setFilters] = useState<RequestFilterOptions>({});
  const [sort, setSort] = useState<RequestSortOption>({
    field: "createdAt",
    direction: "desc",
  });

  const { toast } = useToast();

  // Use the request management hook
  const {
    requests,
    loading: isLoading,
    error,
    lastUpdated,
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-4">
            <span className="text-red-600 font-medium">
              Error loading requests: {error.errors[0]?.message || 'Unknown error'}
            </span>
          </div>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-screen bg-gray-50">
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

            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
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

              {/* Status Summary */}
              <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 font-medium px-3 py-1"
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  Pending: {statusCounts.pending}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-700 border-orange-200 font-medium px-3 py-1"
                >
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                  In Progress: {statusCounts['in-progress']}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 font-medium px-3 py-1"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Completed: {statusCounts.completed}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Tabs
                value={viewMode}
                onValueChange={(value) => setViewMode(value as ViewMode)}
              >
                <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                  <TabsTrigger
                    value="kanban-status"
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <KanbanSquare className="h-4 w-4" />
                    Status
                  </TabsTrigger>
                  <TabsTrigger
                    value="kanban-priority"
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Priority
                  </TabsTrigger>
                  <TabsTrigger
                    value="table"
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <List className="h-4 w-4" />
                    Table
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Smart Filter Toggle for Kanban views */}
              {(viewMode === "kanban-status" || viewMode === "kanban-priority") && (
                <div className="flex items-center gap-2">
                  <Button
                    variant={smartFilter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSmartFilter(!smartFilter)}
                    className="h-8"
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    {smartFilter ? "Smart View" : "All Columns"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0">
        <RequestFilters
          filters={filters}
          sort={sort}
          onFiltersChange={setFilters}
          onSortChange={setSort}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto min-h-0">
        {viewMode === "kanban-status" ? (
          <RequestKanbanView
            requests={processedRequests}
            onRequestUpdate={handleRequestUpdate}
            showOnlyFilteredStatuses={smartFilter && Object.keys(filters).length > 0}
          />
        ) : viewMode === "kanban-priority" ? (
          <RequestKanbanPriorityView
            requests={processedRequests}
            onRequestUpdate={handleRequestUpdate}
            showOnlyFilteredPriorities={smartFilter && Object.keys(filters).length > 0}
          />
        ) : (
          <RequestTableView
            requests={processedRequests}
            onRequestUpdate={handleRequestUpdate}
          />
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span className="font-medium">
              Total requests:{" "}
              <span className="text-gray-900">{requests?.length || 0}</span>
            </span>
            <Separator orientation="vertical" className="h-4" />
            <span className="font-medium">
              Filtered:{" "}
              <span className="text-gray-900">{processedRequests.length}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <BarChart3 className="h-4 w-4" />
            <span>Last updated: {lastUpdated?.toLocaleTimeString() || 'Never'}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refresh}
              disabled={isLoading}
              className="h-6 w-6 p-0 ml-2"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
