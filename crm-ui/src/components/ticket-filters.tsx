import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Filter, SortAsc, SortDesc, ChevronDown } from "lucide-react";
import { FilterOptions, SortOption, Priority, Status } from "@/types/ticket";
import { assignees } from "@/lib/ticket-data";
import { REQUEST_TYPES } from "@/services/senior-request-api";

interface TicketFiltersProps {
  filters: FilterOptions;
  sort: SortOption;
  onFiltersChange: (filters: FilterOptions) => void;
  onSortChange: (sort: SortOption) => void;
  onAddTicket?: () => void;
}

export function TicketFilters({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
}: TicketFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const priorityOptions: Priority[] = ["urgent", "high", "medium", "low"];
  const statusOptions: Status[] = [
    "pending",
    "in-progress",
    "in-review",
    "completed",
    "cancelled",
  ];

  const sortOptions = [
    { field: "createdAt", label: "Created Date" },
    { field: "dueDate", label: "Due Date" },
    { field: "seniorName", label: "Senior Name" },
    { field: "priority", label: "Priority" },
    { field: "status", label: "Status" },
    { field: "agentName", label: "Agent" },
    { field: "requestType", label: "Request Type" },
  ] as const;

  const handlePriorityChange = (priority: Priority, checked: boolean) => {
    const currentPriorities = filters.priority || [];
    const newPriorities = checked
      ? [...currentPriorities, priority]
      : currentPriorities.filter((p) => p !== priority);

    onFiltersChange({
      ...filters,
      priority: newPriorities.length > 0 ? newPriorities : undefined,
    });
  };

  const handleStatusChange = (status: Status, checked: boolean) => {
    const currentStatuses = filters.status || [];
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter((s) => s !== status);

    onFiltersChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined,
    });
  };

  const handleRequestTypeChange = (requestType: string, checked: boolean) => {
    const currentRequestTypes = filters.requestType || [];
    const newRequestTypes = checked
      ? [...currentRequestTypes, requestType]
      : currentRequestTypes.filter((rt) => rt !== requestType);

    onFiltersChange({
      ...filters,
      requestType: newRequestTypes.length > 0 ? newRequestTypes : undefined,
    });
  };

  const handleAssigneeChange = (assignee: string, checked: boolean) => {
    const currentAssignees = filters.assignee || [];
    const newAssignees = checked
      ? [...currentAssignees, assignee]
      : currentAssignees.filter((a) => a !== assignee);

    onFiltersChange({
      ...filters,
      assignee: newAssignees.length > 0 ? newAssignees : undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = [
    filters.priority?.length,
    filters.status?.length,
    filters.requestType?.length,
    filters.assignee?.length,
    filters.search ? 1 : 0,
  ].reduce((sum: number, count) => sum + (count || 0), 0);

  return (
    <div className="flex items-center gap-4 p-4 bg-white border-b border-gray-200">
      <div className="flex-1 flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search requests..."
            value={filters.search || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Filter Popover */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="relative border-gray-300 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown className="h-4 w-4 ml-2" />
              {activeFilterCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Filters</h4>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 px-2 text-gray-600 hover:text-gray-900"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {/* Priority Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    Priority
                  </Label>
                  <div className="space-y-2">
                    {priorityOptions.map((priority) => (
                      <div
                        key={priority}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`priority-${priority}`}
                          checked={
                            filters.priority?.includes(priority) || false
                          }
                          onCheckedChange={(checked) =>
                            handlePriorityChange(priority, checked as boolean)
                          }
                          className="border-gray-300"
                        />
                        <Label
                          htmlFor={`priority-${priority}`}
                          className="text-sm text-gray-700 font-normal cursor-pointer"
                        >
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Status Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    Status
                  </Label>
                  <div className="space-y-2">
                    {statusOptions.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={filters.status?.includes(status) || false}
                          onCheckedChange={(checked) =>
                            handleStatusChange(status, checked as boolean)
                          }
                          className="border-gray-300"
                        />
                        <Label
                          htmlFor={`status-${status}`}
                          className="text-sm text-gray-700 font-normal cursor-pointer"
                        >
                          {status
                            .replace("-", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Request Type Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    Request Type
                  </Label>
                  <div className="space-y-2">
                    {REQUEST_TYPES.map((requestType) => (
                      <div
                        key={requestType}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`request-type-${requestType}`}
                          checked={
                            filters.requestType?.includes(requestType) || false
                          }
                          onCheckedChange={(checked) =>
                            handleRequestTypeChange(
                              requestType,
                              checked as boolean
                            )
                          }
                          className="border-gray-300"
                        />
                        <Label
                          htmlFor={`request-type-${requestType}`}
                          className="text-sm text-gray-700 font-normal cursor-pointer"
                        >
                          {requestType}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Agent Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    Agent
                  </Label>
                  <div className="space-y-2">
                    {assignees.map((assignee) => (
                      <div
                        key={assignee}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`assignee-${assignee}`}
                          checked={
                            filters.assignee?.includes(assignee) || false
                          }
                          onCheckedChange={(checked) =>
                            handleAssigneeChange(assignee, checked as boolean)
                          }
                          className="border-gray-300"
                        />
                        <Label
                          htmlFor={`assignee-${assignee}`}
                          className="text-sm text-gray-700 font-normal cursor-pointer"
                        >
                          {assignee}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <Select
            value={`${sort.field}-${sort.direction}`}
            onValueChange={(value) => {
              const [field, direction] = value.split("-") as [
                keyof SortOption["field"],
                "asc" | "desc"
              ];
              onSortChange({ field: field as any, direction });
            }}
          >
            <SelectTrigger className="w-[180px] border-gray-300">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <div key={option.field}>
                  <SelectItem value={`${option.field}-asc`}>
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      {option.label} (A-Z)
                    </div>
                  </SelectItem>
                  <SelectItem value={`${option.field}-desc`}>
                    <div className="flex items-center gap-2">
                      <SortDesc className="h-4 w-4" />
                      {option.label} (Z-A)
                    </div>
                  </SelectItem>
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
