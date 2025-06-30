"use client";

import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { KanbanSquare, List, Loader2, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanView } from "@/components/kanban-view";
import { TableView } from "@/components/table-view";
import { TicketFilters } from "@/components/ticket-filters";
import { Ticket, ViewMode, FilterOptions, SortOption } from "@/types/ticket";
import { useRequestManagement } from "@/hooks/use-requests";
import { useToast } from "@/hooks/use-toast";
import { TicketUtils } from "@/lib/ticket-conversion";

export default function TicketManagement() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sort, setSort] = useState<SortOption>({
    field: "createdAt",
    direction: "desc",
  });

  const { toast } = useToast();

  // Use the new request management hook
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

  // Convert enhanced requests to legacy ticket format for existing components
  const tickets: Ticket[] = useMemo(() => {
    if (!mounted || !requests) return [];
    return TicketUtils.enhancedArrayToTicketArray(requests);
  }, [mounted, requests]);

  // Filter and sort tickets based on current state
  const processedTickets = useMemo(() => {
    if (!mounted || !tickets) return [];
    
    // Convert FilterOptions to the new filter format
    const newFilters = {
      priority: filters.priority,
      status: filters.status,
      requestType: filters.requestType,
      assignedStaff: filters.assignee,
      searchTerm: filters.search,
    };

    // Convert sort field
    const sortField = sort.field === 'seniorName' ? 'seniorName' : 
                     sort.field === 'createdAt' ? 'createdAt' :
                     sort.field === 'priority' ? 'priority' :
                     sort.field === 'status' ? 'status' : 'createdAt';

    // Use the enhanced requests for filtering, then convert back to tickets
    const filteredEnhanced = filterAndSortRequests(newFilters, sortField, sort.direction);
    
    // Convert enhanced tickets back to legacy ticket format
    return TicketUtils.enhancedArrayToTicketArray(filteredEnhanced);
  }, [tickets, filters, sort, viewMode, mounted, filterAndSortRequests]);

  const handleTicketUpdate = async (updatedTicket: Ticket) => {
    try {
      // Convert ticket back to enhanced request format
      const enhancedTicket = TicketUtils.ticketToEnhanced(updatedTicket);

      const success = await updateRequest(enhancedTicket);
      if (!success) {
        // Error handling is done in the hook
        return;
      }
    } catch (error) {
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
          <Button onClick={refresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Senior Care Requests
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage and track senior care assistance requests
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="bg-slate-50 text-slate-700 border-slate-200 font-medium px-3 py-1"
              >
                <div className="w-2 h-2 bg-slate-400 rounded-full mr-2"></div>
                Pending: {statusCounts.pending}
              </Badge>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 font-medium px-3 py-1"
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                In Progress: {statusCounts["in-progress"]}
              </Badge>
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 border-yellow-200 font-medium px-3 py-1"
              >
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                In Review: {statusCounts["in-review"]}
              </Badge>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 font-medium px-3 py-1"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Completed: {statusCounts.completed}
              </Badge>
            </div>

            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as ViewMode)}
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger
                  value="kanban"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <KanbanSquare className="h-4 w-4" />
                  Kanban
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
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0">
        <TicketFilters
          filters={filters}
          sort={sort}
          onFiltersChange={setFilters}
          onSortChange={setSort}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto min-h-0">
        {viewMode === "kanban" ? (
          <KanbanView
            tickets={processedTickets}
            onTicketUpdate={handleTicketUpdate}
          />
        ) : (
          <TableView
            tickets={processedTickets}
            onTicketUpdate={handleTicketUpdate}
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
              <span className="text-gray-900">{processedTickets.length}</span>
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
              className="h-6 px-2 ml-2"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
