"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ChevronDown, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { requestManagementApiService } from "@/services/request-api";
import { RequestFilterOptionsDto } from "@/types/request";

type Priority = "low" | "medium" | "high" | "urgent";
type Status = "todo" | "in-progress" | "completed";

interface RequestFilterOptions {
  priority?: Priority[];
  status?: Status[];
  requestType?: number[]; // Changed from string[] to number[]
  assignedStaff?: number[]; // Changed from string[] to number[]
  searchTerm?: string;
  dueDate?: {
    overdue?: boolean;
    dueToday?: boolean;
    dueThisWeek?: boolean;
    noDueDate?: boolean;
    // Phase 3: Advanced date range filtering
    dateRange?: {
      from?: string;
      to?: string;
    };
  };
}

interface RequestSortOption {
  field: 'createdAt' | 'updatedAt' | 'priority' | 'status' | 'seniorName' | 'dueDate';
  direction: "asc" | "desc";
}

interface RequestFiltersProps {
  filters: RequestFilterOptions;
  sort: RequestSortOption;
  onFiltersChange: (filters: RequestFilterOptions) => void;
  onSortChange: (sort: RequestSortOption) => void;
  onMyTicketsClick?: () => void;
  onUnassignedClick?: () => void;
  isMyTicketsActive?: boolean;
  isUnassignedActive?: boolean;
}

export function RequestFilters({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  onMyTicketsClick,
  onUnassignedClick,
  isMyTicketsActive,
  isUnassignedActive,
}: RequestFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<RequestFilterOptionsDto>({
    staffOptions: [],
    requestTypeOptions: [],
  });
  const [loading, setLoading] = useState(true);

  const priorityOptions: Priority[] = ["urgent", "high", "medium", "low"];
  const statusOptions: Status[] = [
    "todo",
    "in-progress",
    "completed"
  ];

  const sortOptions = [
    { field: "createdAt", label: "Created Date" },
    { field: "updatedAt", label: "Updated Date" },
    { field: "dueDate", label: "Due Date" },
    { field: "seniorName", label: "Senior Name" },
    { field: "priority", label: "Priority" },
    { field: "status", label: "Status" },
  ] as const;

  // Load filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setLoading(true);
        const options = await requestManagementApiService.getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFilterOptions();
  }, []);

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

  const handleRequestTypeChange = (requestTypeId: number, checked: boolean) => {
    const currentRequestTypes = filters.requestType || [];
    const newRequestTypes = checked
      ? [...currentRequestTypes, requestTypeId]
      : currentRequestTypes.filter((rt) => rt !== requestTypeId);

    onFiltersChange({
      ...filters,
      requestType: newRequestTypes.length > 0 ? newRequestTypes : undefined,
    });
  };

  const handleStaffChange = (staffId: number, checked: boolean) => {
    const currentStaff = filters.assignedStaff || [];
    const newStaff = checked
      ? [...currentStaff, staffId]
      : currentStaff.filter((s) => s !== staffId);

    onFiltersChange({
      ...filters,
      assignedStaff: newStaff.length > 0 ? newStaff : undefined,
    });
  };

  const handleDueDateChange = (filterType: keyof NonNullable<RequestFilterOptions['dueDate']>, checked: boolean) => {
    const currentDueDate = filters.dueDate || {};
    const newDueDate = {
      ...currentDueDate,
      [filterType]: checked ? true : undefined,
    };

    // Remove undefined values
    Object.keys(newDueDate).forEach(key => {
      if (newDueDate[key as keyof typeof newDueDate] === undefined) {
        delete newDueDate[key as keyof typeof newDueDate];
      }
    });

    onFiltersChange({
      ...filters,
      dueDate: Object.keys(newDueDate).length > 0 ? newDueDate : undefined,
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
    filters.dueDate ? Object.keys(filters.dueDate).length : 0,
  ].reduce((sum: number, count) => sum + (count || 0), 0);

  return (
    <div className="flex flex-row justify-between items-center gap-4 pb-2 bg-white border-b border-gray-200">
      {/* Quick Filters */}
      <div className="flex gap-2 lg:gap-3 items-center">
      <span className="text-sm text-gray-500">Quick Filters:</span>
      {(onMyTicketsClick || onUnassignedClick) && (
        <>
          {onMyTicketsClick && (
            <Button
              variant={isMyTicketsActive ? "default" : "outline"}
              size="sm"
              onClick={onMyTicketsClick}
              className={`flex items-center gap-2 ${
                isMyTicketsActive 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "hover:bg-gray-50"
              }`}
            >
              <User className="h-4 w-4" />
              My Assigned Requests
            </Button>
          )}
          {onUnassignedClick && (
            <Button
              variant={isUnassignedActive ? "default" : "outline"}
              size="sm"
              onClick={onUnassignedClick}
              className={`flex items-center gap-2 ${
                isUnassignedActive 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "hover:bg-gray-50"
              }`}
            >
              Unassigned Requests
            </Button>
          )}
        </>
      )}
      </div>

      <div className="flex gap-2 lg:gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search requests..."
            value={filters.searchTerm || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, searchTerm: e.target.value })
            }
            className="min-w-40 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Advanced Filters */}
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

              <div className="space-y-4 max-h-96 overflow-y-auto">
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
                  {loading ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {filterOptions.requestTypeOptions.map((requestType) => (
                        <div
                          key={requestType.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`request-type-${requestType.id}`}
                            checked={
                              filters.requestType?.includes(requestType.id) || false
                            }
                            onCheckedChange={(checked) =>
                              handleRequestTypeChange(
                                requestType.id,
                                checked as boolean
                              )
                            }
                            className="border-gray-300"
                          />
                          <div className="flex flex-col">
                            <Label
                              htmlFor={`request-type-${requestType.id}`}
                              className="text-sm text-gray-700 font-normal cursor-pointer"
                            >
                              {requestType.name}
                            </Label>
                            {requestType.description && (
                              <span className="text-xs text-gray-500">
                                {requestType.description}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Staff Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    Assigned Staff
                  </Label>
                  {loading ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {filterOptions.staffOptions.map((staff) => (
                        <div
                          key={staff.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`staff-${staff.id}`}
                            checked={
                              filters.assignedStaff?.includes(staff.id) || false
                            }
                            onCheckedChange={(checked) =>
                              handleStaffChange(staff.id, checked as boolean)
                            }
                            className="border-gray-300"
                          />
                          <div className="flex flex-col">
                            <Label
                              htmlFor={`staff-${staff.id}`}
                              className="text-sm text-gray-700 font-normal cursor-pointer"
                            >
                              {staff.fullName}
                            </Label>
                            <span className="text-xs text-gray-500">
                              {staff.jobTitle}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Due Date Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    Due Date
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="overdue"
                        checked={filters.dueDate?.overdue || false}
                        onCheckedChange={(checked) =>
                          handleDueDateChange('overdue', checked as boolean)
                        }
                        className="border-gray-300"
                      />
                      <Label
                        htmlFor="overdue"
                        className="text-sm text-gray-700 font-normal cursor-pointer"
                      >
                        Overdue
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="due-today"
                        checked={filters.dueDate?.dueToday || false}
                        onCheckedChange={(checked) =>
                          handleDueDateChange('dueToday', checked as boolean)
                        }
                        className="border-gray-300"
                      />
                      <Label
                        htmlFor="due-today"
                        className="text-sm text-gray-700 font-normal cursor-pointer"
                      >
                        Due Today
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="due-this-week"
                        checked={filters.dueDate?.dueThisWeek || false}
                        onCheckedChange={(checked) =>
                          handleDueDateChange('dueThisWeek', checked as boolean)
                        }
                        className="border-gray-300"
                      />
                      <Label
                        htmlFor="due-this-week"
                        className="text-sm text-gray-700 font-normal cursor-pointer"
                      >
                        Due This Week
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="no-due-date"
                        checked={filters.dueDate?.noDueDate || false}
                        onCheckedChange={(checked) =>
                          handleDueDateChange('noDueDate', checked as boolean)
                        }
                        className="border-gray-300"
                      />
                      <Label
                        htmlFor="no-due-date"
                        className="text-sm text-gray-700 font-normal cursor-pointer"
                      >
                        No Due Date
                      </Label>
                    </div>
                    
                    {/* Phase 3: Advanced Date Range Filter */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <Label className="text-xs font-medium text-gray-700 mb-2 block">
                        Due Date Range
                      </Label>
                      <div className="space-y-2">
                        <div>
                          <Label htmlFor="due-from" className="text-xs text-gray-600">
                            From:
                          </Label>
                          <Input
                            id="due-from"
                            type="date"
                            value={filters.dueDate?.dateRange?.from || ""}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              onFiltersChange({
                                ...filters,
                                dueDate: {
                                  ...filters.dueDate,
                                  dateRange: {
                                    ...filters.dueDate?.dateRange,
                                    from: newValue || undefined,
                                  },
                                },
                              });
                            }}
                            className="mt-1 text-xs h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="due-to" className="text-xs text-gray-600">
                            To:
                          </Label>
                          <Input
                            id="due-to"
                            type="date"
                            value={filters.dueDate?.dateRange?.to || ""}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              onFiltersChange({
                                ...filters,
                                dueDate: {
                                  ...filters.dueDate,
                                  dateRange: {
                                    ...filters.dueDate?.dateRange,
                                    to: newValue || undefined,
                                  },
                                },
                              });
                            }}
                            className="mt-1 text-xs h-8"
                            min={filters.dueDate?.dateRange?.from || undefined}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters Button */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear ({activeFilterCount})
          </Button>
        )}

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <Select
            value={`${sort.field}-${sort.direction}`}
            onValueChange={(value) => {
              const [field, direction] = value.split('-') as [RequestSortOption['field'], RequestSortOption['direction']];
              onSortChange({ field, direction });
            }}
          >
            <SelectTrigger className="w-[180px] text-sm border-gray-300">
              <SelectValue placeholder="Select sort option" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option, index) => (
                <SelectGroup key={option.field}>
                  {index > 0 && <SelectSeparator />}
                  <SelectLabel>
                    {option.label}
                  </SelectLabel>
                  <SelectItem value={`${option.field}-desc`}>
                    Newest first
                  </SelectItem>
                  <SelectItem value={`${option.field}-asc`}>
                    Oldest first
                  </SelectItem>
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Display - only show if we have them and they're not taking too much space */}
        {activeFilterCount > 0 && (
          <div className="hidden xl:flex items-center gap-1">
            <span className="text-xs text-gray-500">Active:</span>
            {activeFilterCount > 3 ? (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} filters
              </Badge>
            ) : (
              <>
                {filters.priority?.length && (
                  <Badge variant="secondary" className="text-xs">
                    Priority ({filters.priority.length})
                  </Badge>
                )}
                {filters.status?.length && (
                  <Badge variant="secondary" className="text-xs">
                    Status ({filters.status.length})
                  </Badge>
                )}
                {filters.requestType?.length && (
                  <Badge variant="secondary" className="text-xs">
                    Type ({filters.requestType.length})
                  </Badge>
                )}
                {filters.assignedStaff?.length && (
                  <Badge variant="secondary" className="text-xs">
                    Staff ({filters.assignedStaff.length})
                  </Badge>
                )}

                {filters.dueDate && Object.keys(filters.dueDate).length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Due Date ({Object.keys(filters.dueDate).length})
                  </Badge>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
