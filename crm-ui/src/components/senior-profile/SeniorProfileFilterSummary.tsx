'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ExternalLink } from "lucide-react";

interface SeniorProfileFilterSummaryProps {
  totalCount: number;
  filteredCount: number;
  activeFilterCount: number;
  onClearFilters: () => void;
  onViewAllInRequestManagement: () => void;
}

export function SeniorProfileFilterSummary({
  totalCount,
  filteredCount,
  activeFilterCount,
  onClearFilters,
  onViewAllInRequestManagement,
}: SeniorProfileFilterSummaryProps) {
  const hasFilters = activeFilterCount > 0;
  const isFiltered = filteredCount !== totalCount;

  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Showing {filteredCount} of {totalCount} requests
          </span>
          {hasFilters && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
            </Badge>
          )}
        </div>
        
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 px-2 py-1 h-auto"
          >
            <X className="h-3 w-3 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {isFiltered && (
        <Button
          variant="outline"
          size="sm"
          onClick={onViewAllInRequestManagement}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 border-blue-300"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View all in Request Management
        </Button>
      )}
    </div>
  );
}
