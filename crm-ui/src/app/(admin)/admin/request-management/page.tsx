"use client";

import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { KanbanSquare, List, Loader2, BarChart3 } from "lucide-react";
import { KanbanView } from "@/components/kanban-view";
import { TableView } from "@/components/table-view";
import { TicketFilters } from "@/components/ticket-filters";
import { Ticket, ViewMode, FilterOptions, SortOption } from "@/types/ticket";
import { mockTickets } from "@/lib/ticket-data";
import { filterTickets, sortTickets } from "@/lib/ticket-utils";
import { useToast } from "@/hooks/use-toast";

export default function TicketManagement() {
  const [mounted, setMounted] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sort, setSort] = useState<SortOption>({
    field: "createdAt",
    direction: "desc",
  });
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  // Fix hydration error by ensuring client-side rendering
  useEffect(() => {
    setTickets(mockTickets);
    setMounted(true);
  }, []);

  // Filter and sort tickets based on current state
  const processedTickets = useMemo(() => {
    if (!mounted) return [];
    let filtered = filterTickets(tickets, filters);
    if (viewMode === "table") {
      filtered = sortTickets(filtered, sort);
    }
    return filtered;
  }, [tickets, filters, sort, viewMode, mounted]);

  const handleTicketUpdate = async (updatedTicket: Ticket) => {
    try {
      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === updatedTicket.id ? updatedTicket : ticket
        )
      );

      toast({
        title: "Senior request updated",
        description: `Request ${updatedTicket.id} for ${updatedTicket.seniorName} has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update senior request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusCounts = () => {
    if (!mounted)
      return {
        pending: 0,
        "in-progress": 0,
        "in-review": 0,
        completed: 0,
        cancelled: 0,
      };

    const counts = {
      pending: 0,
      "in-progress": 0,
      "in-review": 0,
      completed: 0,
      cancelled: 0,
    };
    tickets.forEach((ticket) => {
      counts[ticket.status]++;
    });
    return counts;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600 font-medium">
            Updating senior requests...
          </span>
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
              <span className="text-gray-900">{tickets.length}</span>
            </span>
            <Separator orientation="vertical" className="h-4" />
            <span className="font-medium">
              Filtered:{" "}
              <span className="text-gray-900">{processedTickets.length}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <BarChart3 className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
