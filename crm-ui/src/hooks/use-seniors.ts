import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  SeniorDto, 
  CreateSeniorDto, 
  UpdateSeniorDto, 
  SeniorFilterDto, 
  SeniorView,
  SeniorSearchParams
} from '@/types/senior';
import { PaginatedResponse } from "@/types/common";
import { 
  seniorApiService, 
  SeniorApiError, 
  SeniorValidationError, 
  seniorUtils 
} from '@/services/senior-api';
import { useToast } from '@/hooks/use-toast';
import { CareLevelDto } from '@/types/care-level';

// Hook for paginated seniors with filtering
export function useSeniorsPaginated(initialFilter?: SeniorFilterDto) {
  const [filter, setFilter] = useState<SeniorFilterDto>({
    page: 0,
    size: 10,
    ...initialFilter
  });
  const [paginatedResponse, setPaginatedResponse] = useState<PaginatedResponse<SeniorDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<SeniorApiError | null>(null);
  const { toast } = useToast();

  // Fetch data with current filter/pagination
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await seniorApiService.getSeniorsPaginated(filter);
      setPaginatedResponse(response);
    } catch (err) {
      const apiError = err instanceof SeniorApiError ? err : new SeniorApiError(0, 'Unknown Error', [{ message: 'Unknown error', timestamp: new Date().toISOString() }]);
      setError(apiError);
      toast({
        title: 'Error Loading Seniors',
        description: apiError.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // CRUD operations with pagination-aware updates
  const createSenior = useCallback(async (seniorData: CreateSeniorDto): Promise<SeniorDto | null> => {
    try {
      const newSenior = await seniorApiService.createSenior(seniorData);
      // After creation, go to first page to see the new item (assuming newest first)
      setFilter(prev => ({ ...prev, page: 0 }));
      toast({
        title: 'Success',
        description: `Senior ${seniorUtils.getFullName(newSenior)} has been created successfully.`,
      });
      return newSenior;
    } catch (error) {
      if (error instanceof SeniorValidationError) {
        toast({
          title: 'Validation Error',
          description: error.validationErrors.map(e => e.message).join(', '),
          variant: 'destructive',
        });
      } else if (error instanceof SeniorApiError) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
      return null;
    }
  }, [toast]);

  const updateSenior = useCallback(async (seniorData: UpdateSeniorDto): Promise<SeniorDto | null> => {
    try {
      const updatedSenior = await seniorApiService.updateSenior(seniorData);
      await fetchData(); // Refresh current page
      toast({
        title: 'Success',
        description: `Senior ${seniorUtils.getFullName(updatedSenior)} has been updated successfully.`,
      });
      return updatedSenior;
    } catch (error) {
      if (error instanceof SeniorValidationError) {
        toast({
          title: 'Validation Error',
          description: error.validationErrors.map(e => e.message).join(', '),
          variant: 'destructive',
        });
      } else if (error instanceof SeniorApiError) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
      return null;
    }
  }, [fetchData, toast]);

  const deleteSenior = useCallback(async (id: number, seniorName: string): Promise<boolean> => {
    try {
      await seniorApiService.deleteSenior(id);
      
      // Smart pagination handling after deletion
      if (paginatedResponse) {
        const isLastItemOnPage = paginatedResponse.numberOfElements === 1;
        const isNotFirstPage = paginatedResponse.number > 0;
        
        if (isLastItemOnPage && isNotFirstPage) {
          // Go to previous page if we just deleted the last item on a non-first page
          setFilter(prev => ({ ...prev, page: prev.page! - 1 }));
        } else {
          // Refresh current page
          await fetchData();
        }
      }
      
      toast({
        title: 'Success',
        description: `Senior ${seniorName} has been deleted successfully.`,
      });
      return true;
    } catch (error) {
      if (error instanceof SeniorApiError) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
      return false;
    }
  }, [fetchData, paginatedResponse, toast]);

  // Pagination controls
  const goToPage = useCallback((page: number) => {
    setFilter(prev => ({ ...prev, page }));
  }, []);

  const changePageSize = useCallback((size: number) => {
    setFilter(prev => ({ ...prev, page: 0, size })); // Reset to first page when changing size
  }, []);

  const applyFilter = useCallback((newFilter: Omit<SeniorFilterDto, 'page' | 'size'>) => {
    setFilter(prev => ({ 
      ...prev, 
      ...newFilter, 
      page: 0 // Reset to first page when filtering
    }));
  }, []);

  const clearFilter = useCallback(() => {
    setFilter({ page: 0, size: 20 });
  }, []);

  const applySorting = useCallback((sortBy: string, direction: 'asc' | 'desc' = 'asc') => {
    setFilter(prev => ({
      ...prev,
      sort: [seniorUtils.buildSortParam(sortBy, direction)],
      page: 0 // Reset to first page when sorting
    }));
  }, []);

  // Computed values
  const seniors = paginatedResponse?.content || [];
  const paginationInfo = paginatedResponse ? seniorUtils.getPaginationInfo(paginatedResponse) : null;

  return {
    // Data
    seniors,
    paginatedResponse,
    paginationInfo,
    loading,
    error,
    
    // CRUD operations
    createSenior,
    updateSenior,
    deleteSenior,
    
    // Pagination controls
    goToPage,
    changePageSize,
    applyFilter,
    clearFilter,
    applySorting,
    refetch: fetchData,
    
    // Current state
    currentFilter: filter
  };
}

// Hook for high-performance search with pagination
export function useSeniorSearchPaginated() {
  const [searchParams, setSearchParams] = useState<SeniorSearchParams>({
    page: 0,
    size: 10 // Smaller page size for search results
  });
  const [paginatedResults, setPaginatedResults] = useState<PaginatedResponse<SeniorView> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SeniorApiError | null>(null);
  const { toast } = useToast();

  const search = useCallback(async (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) {
      setPaginatedResults(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const newSearchParams = {
        ...searchParams,
        firstName,
        lastName,
        page: 0 // Reset to first page for new search
      };
      
      setSearchParams(newSearchParams);
      const results = await seniorApiService.searchSeniorsByName(newSearchParams);
      setPaginatedResults(results);
    } catch (err) {
      const apiError = err instanceof SeniorApiError ? err : new SeniorApiError(0, 'Search Failed', [{ message: 'Search failed', timestamp: new Date().toISOString() }]);
      setError(apiError);
      toast({
        title: 'Search Error',
        description: apiError.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchParams, toast]);

  const goToSearchPage = useCallback(async (page: number) => {
    if (!paginatedResults) return;
    
    try {
      setLoading(true);
      const newParams = { ...searchParams, page };
      setSearchParams(newParams);
      const results = await seniorApiService.searchSeniorsByName(newParams);
      setPaginatedResults(results);
    } catch (err) {
      const apiError = err instanceof SeniorApiError ? err : new SeniorApiError(0, 'Search Failed', [{ message: 'Search failed', timestamp: new Date().toISOString() }]);
      setError(apiError);
    } finally {
      setLoading(false);
    }
  }, [searchParams, paginatedResults]);

  const clearSearch = useCallback(() => {
    setPaginatedResults(null);
    setError(null);
    setSearchParams({ page: 0, size: 10 });
  }, []);

  return {
    searchResults: paginatedResults?.content || [],
    paginatedResults,
    paginationInfo: paginatedResults ? seniorUtils.getPaginationInfo(paginatedResults) : null,
    loading,
    error,
    search,
    goToSearchPage,
    clearSearch
  };
}

// Legacy hook - now uses pagination under the hood
export function useSeniors(initialFilter?: SeniorFilterDto) {
  console.warn('useSeniors is deprecated. Use useSeniorsPaginated for better performance.');
  
  const {
    seniors,
    loading,
    error,
    createSenior,
    updateSenior,
    deleteSenior,
    applyFilter,
    clearFilter,
    currentFilter
  } = useSeniorsPaginated(initialFilter);

  return {
    seniors,
    loading,
    error,
    createSenior,
    updateSenior,
    deleteSenior,
    applyFilter,
    clearFilter,
    currentFilter,
    refetch: () => {} // Legacy compatibility
  };
}

// Hook for form state management with validation
export function useSeniorForm(initialData?: Partial<CreateSeniorDto>, careLevels: CareLevelDto[] = []) {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    contactPhone: initialData?.contactPhone || '',
    contactEmail: initialData?.contactEmail || '',
    address: initialData?.address || '',
    careLevelId: initialData?.careLevelId || null,
    characteristics: typeof initialData?.characteristics === 'string' ? initialData?.characteristics : '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = useCallback((data: typeof formData) => {
    const newErrors: Record<string, string> = {};

    if (!data.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!data.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (data.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    if (data.contactPhone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.contactPhone.replace(/\D/g, ''))) {
      newErrors.contactPhone = 'Please enter a valid phone number';
    }

    return newErrors;
  }, []);

  // Update the updateField function to handle number conversion for careLevelId
  const updateField = useCallback((field: keyof typeof formData, value: string) => {
    if (field === 'careLevelId') {
      setFormData(prev => ({ ...prev, [field]: value ? Number(value) : null }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  useEffect(() => {
    const newErrors = validate(formData);
    setErrors(newErrors);
  }, [formData, validate]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 && formData.firstName.trim() && formData.lastName.trim();
  }, [errors, formData.firstName, formData.lastName]);

  const reset = useCallback((newData?: Partial<typeof formData>) => {
    setFormData({
      firstName: newData?.firstName || '',
      lastName: newData?.lastName || '',
      dateOfBirth: newData?.dateOfBirth || '',
      contactPhone: newData?.contactPhone || '',
      contactEmail: newData?.contactEmail || '',
      address: newData?.address || '',
      careLevelId: newData?.careLevelId || null,
      characteristics: typeof newData?.characteristics === 'string' ? newData?.characteristics : '',
    });
    setErrors({});
    setTouched({});
  }, []);

const toCreateDto = useCallback((characteristicsTags: string[] = []): CreateSeniorDto => {
  return seniorUtils.formDataToCreateDto(formData, characteristicsTags);
}, [formData]);

const toUpdateDto = useCallback((id: number, characteristicsTags: string[] = []): UpdateSeniorDto => {
  return {
    id,
    ...seniorUtils.formDataToCreateDto(formData, characteristicsTags)
  };
}, [formData]);

  return {
    formData,
    errors,
    touched,
    isValid,
    updateField,
    reset,
    toCreateDto,
    toUpdateDto
  };
}

export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((operation: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [operation]: loading }));
  }, []);

  const isLoading = useCallback((operation: string) => {
    return loadingStates[operation] || false;
  }, [loadingStates]);

  const isAnyLoading = useMemo(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  return { setLoading, isLoading, isAnyLoading };
}