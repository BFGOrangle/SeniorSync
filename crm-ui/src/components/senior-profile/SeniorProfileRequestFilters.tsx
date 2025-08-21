'use client';

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { SeniorProfileRequestFilterOptions } from "@/types/senior-profile-requests";

interface SeniorProfileRequestFiltersProps {
  filters: SeniorProfileRequestFilterOptions;
  onFiltersChange: (filters: SeniorProfileRequestFilterOptions) => void;
  availableRequestTypes?: { id: number; name: string }[];
  availableStaff?: { id: number; name: string }[];
}

export function SeniorProfileRequestFilters({
  filters,
  onFiltersChange,
  availableRequestTypes = [],
  availableStaff = [],
}: SeniorProfileRequestFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm || "");

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
    onFiltersChange({
      ...filters,
      searchTerm: value.trim() || undefined,
    });
  };

  // Handle request type toggle
  const handleRequestTypeToggle = (typeId: number) => {
    const currentTypes = filters.requestType || [];
    const newTypes = currentTypes.includes(typeId)
      ? currentTypes.filter(id => id !== typeId)
      : [...currentTypes, typeId];
    
    onFiltersChange({
      ...filters,
      requestType: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  // Handle assigned staff toggle
  const handleAssignedStaffToggle = (staffId: number) => {
    const currentStaff = filters.assignedStaff || [];
    const newStaff = currentStaff.includes(staffId)
      ? currentStaff.filter(id => id !== staffId)
      : [...currentStaff, staffId];
    
    onFiltersChange({
      ...filters,
      assignedStaff: newStaff.length > 0 ? newStaff : undefined,
    });
  };

  // Handle date range change
  const handleDateRangeChange = (field: "from" | "to", value: string) => {
    const currentDateRange = filters.dateRange || {};
    const newDateRange = {
      ...currentDateRange,
      [field]: value || undefined,
    };
    
    // Remove empty date range
    const hasDateRange = newDateRange.from || newDateRange.to;
    
    onFiltersChange({
      ...filters,
      dateRange: hasDateRange ? newDateRange : undefined,
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setLocalSearchTerm("");
    onFiltersChange({});
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.priority && filters.priority.length > 0) count++;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.requestType && filters.requestType.length > 0) count++;
    if (filters.assignedStaff && filters.assignedStaff.length > 0) count++;
    if (filters.searchTerm) count++;
    if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="border-b border-gray-200">
      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search requests by title, description, type, or assigned staff..."
            value={localSearchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {localSearchTerm && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            <Filter className="h-4 w-4" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-700 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
            {/* Request Types */}
            {availableRequestTypes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableRequestTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleRequestTypeToggle(type.id)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        filters.requestType?.includes(type.id)
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {type.name}
                      {filters.requestType?.includes(type.id) && (
                        <X className="inline ml-1 h-3 w-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Assigned Staff */}
            {availableStaff.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Staff
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableStaff.map((staff) => (
                    <button
                      key={staff.id}
                      onClick={() => handleAssignedStaffToggle(staff.id)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        filters.assignedStaff?.includes(staff.id)
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {staff.name}
                      {filters.assignedStaff?.includes(staff.id) && (
                        <X className="inline ml-1 h-3 w-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input
                    type="date"
                    value={filters.dateRange?.from || ""}
                    onChange={(e) => handleDateRangeChange("from", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    value={filters.dateRange?.to || ""}
                    onChange={(e) => handleDateRangeChange("to", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
