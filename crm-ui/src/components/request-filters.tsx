import React, { useState } from "react";
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

type Priority = "low" | "medium" | "high" | "urgent";
type Status = "pending" | "in-progress" | "completed";

interface RequestFilterOptions {
  priority?: Priority[];
  status?: Status[];
  requestType?: string[];
  assignedStaff?: string[];
  searchTerm?: string;
}

interface RequestSortOption {
  field: 'createdAt' | 'updatedAt' | 'priority' | 'status' | 'seniorName';
  direction: "asc" | "desc";
}

interface RequestFiltersProps {
  filters: RequestFilterOptions;
  sort: RequestSortOption;
  onFiltersChange: (filters: RequestFilterOptions) => void;
  onSortChange: (sort: RequestSortOption) => void;
}

export function RequestFilters({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
}: RequestFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const priorityOptions: Priority[] = ["urgent", "high", "medium", "low"];
  const statusOptions: Status[] = [
    "pending",
    "in-progress",
    "completed"
  ];

  const sortOptions = [
    { field: "createdAt", label: "Created Date" },
    { field: "updatedAt", label: "Updated Date" },
    { field: "seniorName", label: "Senior Name" },
    { field: "priority", label: "Priority" },
    { field: "status", label: "Status" },
  ] as const;

  // Sample request types and staff - in real app these would come from props or API
  const requestTypes = [
    "Medical Assistance",
    "Transportation", 
    "Home Care",
    "Emergency Support",
    "Other"
  ];

  const staffMembers = [
    "Sarah Johnson",
    "Michael Chen",
    "Emily Rodriguez",
    "David Wilson",
    "Lisa Anderson"
  ];

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

  const handleStaffChange = (staff: string, checked: boolean) => {
    const currentStaff = filters.assignedStaff || [];
    const newStaff = checked
      ? [...currentStaff, staff]
      : currentStaff.filter((s) => s !== staff);

    onFiltersChange({
      ...filters,
      assignedStaff: newStaff.length > 0 ? newStaff : undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = [
    filters.priority?.length,
    filters.status?.length,
    filters.requestType?.length,
    filters.assignedStaff?.length,
    filters.searchTerm ? 1 : 0,
  ].reduce((sum: number, count) => sum + (count || 0), 0);

  return (
    <div className="flex items-center gap-4 p-4 bg-white border-b border-gray-200">
      <div className="flex-1 flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search requests..."
            value={filters.searchTerm || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, searchTerm: e.target.value })
            }
            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="border-gray-300 hover:bg-gray-50 relative"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown className="h-4 w-4 ml-2" />
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Filters</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </Button>
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
                    {requestTypes.map((requestType) => (
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

                {/* Staff Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    Assigned Staff
                  </Label>
                  <div className="space-y-2">
                    {staffMembers.map((staff) => (
                      <div
                        key={staff}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`staff-${staff}`}
                          checked={
                            filters.assignedStaff?.includes(staff) || false
                          }
                          onCheckedChange={(checked) =>
                            handleStaffChange(staff, checked as boolean)
                          }
                          className="border-gray-300"
                        />
                        <Label
                          htmlFor={`staff-${staff}`}
                          className="text-sm text-gray-700 font-normal cursor-pointer"
                        >
                          {staff}
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
                RequestSortOption["field"],
                "asc" | "desc"
              ];
              onSortChange({ field, direction });
            }}
          >
            <SelectTrigger className="w-48 border-gray-300 hover:bg-gray-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <React.Fragment key={option.field}>
                  <SelectItem value={`${option.field}-desc`}>
                    <div className="flex items-center gap-2">
                      <SortDesc className="h-4 w-4" />
                      {option.label} (Newest)
                    </div>
                  </SelectItem>
                  <SelectItem value={`${option.field}-asc`}>
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      {option.label} (Oldest)
                    </div>
                  </SelectItem>
                </React.Fragment>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
