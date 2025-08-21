export interface SeniorProfileRequestFilterOptions {
  priority?: ("low" | "medium" | "high" | "urgent")[];
  status?: ("todo" | "in-progress" | "completed")[];
  requestType?: number[];
  assignedStaff?: number[];
  searchTerm?: string;
  dateRange?: {
    from?: string;
    to?: string;
  };
}

export interface SeniorProfileRequestsModalProps {
  senior: import("@/types/senior").SeniorDto | null;
  isOpen: boolean;
  onClose: () => void;
  initialFilters?: Partial<SeniorProfileRequestFilterOptions>;
}

export interface SeniorProfileRequestCounts {
  total: number;
  open: number;
  completed: number;
  highPriority: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byType: Record<number, number>;
}

export interface SeniorProfileQuickFiltersProps {
  counts: SeniorProfileRequestCounts;
  filters: SeniorProfileRequestFilterOptions;
  onFilterChange: (filters: Partial<SeniorProfileRequestFilterOptions>) => void;
}

export interface SeniorProfileRequestFiltersProps {
  filters: SeniorProfileRequestFilterOptions;
  counts: SeniorProfileRequestCounts;
  onFiltersChange: (filters: SeniorProfileRequestFilterOptions) => void;
  togglePriority: (priority: string) => void;
  toggleStatus: (status: string) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

export interface SeniorProfileFilterSummaryProps {
  totalCount: number;
  filteredCount: number;
  activeFilterCount: number;
  onClearFilters: () => void;
  onViewAllInRequestManagement: () => void;
}
