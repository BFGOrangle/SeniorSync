'use client';

import { SeniorRequestDto } from "@/types/request";
import { SeniorProfileRequestFilterOptions, SeniorProfileRequestCounts } from "@/types/senior-profile-requests";

interface SeniorProfileQuickFiltersProps {
  allRequests: SeniorRequestDto[];
  currentFilters: SeniorProfileRequestFilterOptions;
  onFilterChange: (filters: SeniorProfileRequestFilterOptions) => void;
}

export function SeniorProfileQuickFilters({ 
  allRequests, 
  currentFilters, 
  onFilterChange 
}: SeniorProfileQuickFiltersProps) {
  
  // Convert backend priority (1-5) to frontend priority string
  const mapPriorityToFrontend = (priority: number): "low" | "medium" | "high" | "urgent" => {
    if (priority >= 5) return "urgent";
    if (priority >= 4) return "high";
    if (priority >= 3) return "medium";
    return "low";
  };

  // Convert backend status to frontend status string
  const mapStatusToFrontend = (status: string): "todo" | "in-progress" | "completed" => {
    switch (status) {
      case "TODO": return "todo";
      case "IN_PROGRESS": return "in-progress";
      case "COMPLETED": return "completed";
      default: return "todo";
    }
  };

  // Calculate counts for badges
  const calculateCounts = (): SeniorProfileRequestCounts => {
    const counts: SeniorProfileRequestCounts = {
      total: allRequests.length,
      open: 0,
      completed: 0,
      highPriority: 0,
      byStatus: { "todo": 0, "in-progress": 0, "completed": 0 },
      byPriority: { "low": 0, "medium": 0, "high": 0, "urgent": 0 },
      byType: {},
    };

    allRequests.forEach(request => {
      const frontendPriority = mapPriorityToFrontend(request.priority);
      const frontendStatus = mapStatusToFrontend(request.status);
      
      counts.byPriority[frontendPriority]++;
      counts.byStatus[frontendStatus]++;
      
      if (frontendStatus !== "completed") {
        counts.open++;
      } else {
        counts.completed++;
      }
      
      if (frontendPriority === "high" || frontendPriority === "urgent") {
        counts.highPriority++;
      }

      if (request.requestTypeId) {
        counts.byType[request.requestTypeId] = (counts.byType[request.requestTypeId] || 0) + 1;
      }
    });

    return counts;
  };

  const counts = calculateCounts();

  // Quick filter handlers
  const handleAllClick = () => {
    onFilterChange({});
  };

  const handlePriorityClick = (priority: "low" | "medium" | "high" | "urgent") => {
    const newPriorityFilters = currentFilters.priority?.includes(priority) 
      ? currentFilters.priority.filter(p => p !== priority)
      : [...(currentFilters.priority || []), priority];
    
    onFilterChange({
      ...currentFilters,
      priority: newPriorityFilters.length > 0 ? newPriorityFilters : undefined,
    });
  };

  const handleStatusClick = (status: "todo" | "in-progress" | "completed") => {
    const newStatusFilters = currentFilters.status?.includes(status)
      ? currentFilters.status.filter(s => s !== status)
      : [...(currentFilters.status || []), status];
    
    onFilterChange({
      ...currentFilters,
      status: newStatusFilters.length > 0 ? newStatusFilters : undefined,
    });
  };

  // Check if filter is active
  const isAllActive = !currentFilters.priority && !currentFilters.status && !currentFilters.requestType && !currentFilters.assignedStaff && !currentFilters.searchTerm;
  const isPriorityActive = (priority: "low" | "medium" | "high" | "urgent") => currentFilters.priority?.includes(priority) ?? false;
  const isStatusActive = (status: "todo" | "in-progress" | "completed") => currentFilters.status?.includes(status) ?? false;

  // Styling helpers
  const getButtonClass = (isActive: boolean, isClickable: boolean = true) => {
    const baseClass = "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors";
    const clickableClass = isClickable ? "cursor-pointer hover:bg-gray-100" : "";
    const activeClass = isActive 
      ? "bg-blue-100 text-blue-700 border border-blue-200" 
      : "bg-gray-50 text-gray-600 border border-gray-200";
    
    return `${baseClass} ${clickableClass} ${activeClass}`;
  };

  const getBadgeClass = (count: number) => {
    return count > 0 
      ? "inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
      : "inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-400";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-600 bg-red-50 border-red-200";
      case "high": return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "text-slate-700 bg-slate-100 border-slate-300";
      case "in-progress": return "text-blue-600 bg-blue-50 border-blue-200";
      case "completed": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Senior Profile Quick Filters</h3>
      
      <div className="space-y-3">
        {/* All Requests */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAllClick}
            className={getButtonClass(isAllActive)}
          >
            All Requests
            <span className={getBadgeClass(counts.total)}>
              {counts.total}
            </span>
          </button>
        </div>

        {/* Priority Filters */}
        <div>
          <div className="text-xs font-medium text-gray-500 mb-2">Priority</div>
          <div className="flex flex-wrap gap-2">
            {(["urgent", "high", "medium", "low"] as const).map((priority) => (
              <button
                key={priority}
                onClick={() => handlePriorityClick(priority)}
                className={`${getButtonClass(isPriorityActive(priority))} ${
                  isPriorityActive(priority) ? getPriorityColor(priority) : ""
                }`}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
                <span className={getBadgeClass(counts.byPriority[priority] || 0)}>
                  {counts.byPriority[priority] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Status Filters */}
        <div>
          <div className="text-xs font-medium text-gray-500 mb-2">Status</div>
          <div className="flex flex-wrap gap-2">
            {(["todo", "in-progress", "completed"] as const).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusClick(status)}
                className={`${getButtonClass(isStatusActive(status))} ${
                  isStatusActive(status) ? getStatusColor(status) : ""
                }`}
              >
                {status === "in-progress" ? "In Progress" : 
                 status.charAt(0).toUpperCase() + status.slice(1)}
                <span className={getBadgeClass(counts.byStatus[status] || 0)}>
                  {counts.byStatus[status] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {!isAllActive && (
          <div className="pt-2">
            <button
              onClick={handleAllClick}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
