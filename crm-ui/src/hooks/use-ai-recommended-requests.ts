import { useState, useCallback, useRef } from 'react';
import { SeniorRequestDto } from '@/types/request';
import { seniorRequestsAIService, AIRecommendationFilters } from '@/services/senior-requests-ai-service';
import { useCurrentUser } from '@/contexts/user-context';
import { toast } from '@/hooks/use-toast';

interface UseAIRecommendedRequestsReturn {
  // Data
  recommendations: SeniorRequestDto[];
  loading: boolean;
  error: string | null;
  hasRecommendations: boolean;
  isFromCache: boolean;
  
  // Operations
  fetchAllAIRecommendedRequests: (filters?: AIRecommendationFilters, forceRefresh?: boolean) => Promise<void>;
  fetchMyAIRecommendedRequests: (filters?: AIRecommendationFilters, forceRefresh?: boolean) => Promise<void>;
  
  // State management
  clearRecommendations: () => void;
  clearError: () => void;
  
  // Cache management
  refresh: () => Promise<void>;
}

// Simple cache implementation
interface CacheEntry {
  data: SeniorRequestDto[];
  timestamp: number;
  filters?: AIRecommendationFilters;
  userId?: number;
}

class AIRecommendedRequestsCache {
  private static instance: AIRecommendedRequestsCache;
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  static getInstance(): AIRecommendedRequestsCache {
    if (!AIRecommendedRequestsCache.instance) {
      AIRecommendedRequestsCache.instance = new AIRecommendedRequestsCache();
    }
    return AIRecommendedRequestsCache.instance;
  }

  private generateCacheKey(type: 'all' | 'my', userId?: number, filters?: AIRecommendationFilters): string {
    const baseKey = type === 'all' ? 'all' : `user-${userId}`;
    const filtersKey = filters ? JSON.stringify(filters) : 'no-filters';
    return `${baseKey}-${filtersKey}`;
  }

  get(type: 'all' | 'my', userId?: number, filters?: AIRecommendationFilters): SeniorRequestDto[] | null {
    const key = this.generateCacheKey(type, userId, filters);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() - entry.timestamp > this.CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(type: 'all' | 'my', data: SeniorRequestDto[], userId?: number, filters?: AIRecommendationFilters): void {
    const key = this.generateCacheKey(type, userId, filters);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      filters,
      userId
    });
  }

  clear(): void {
    this.cache.clear();
  }

  clearForUser(userId: number): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.includes(`user-${userId}`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  clearAll(): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.startsWith('all-')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

/**
 * Enhanced hook for AI recommended requests with caching support
 */
export function useAIRecommendedRequests(): UseAIRecommendedRequestsReturn {
  const [recommendations, setRecommendations] = useState<SeniorRequestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const { currentUser } = useCurrentUser();
  
  // Cache instance
  const cache = useRef(AIRecommendedRequestsCache.getInstance()).current;
  
  // Track the last operation for refresh functionality
  const lastOperation = useRef<{
    type: 'all' | 'my';
    filters?: AIRecommendationFilters;
  } | null>(null);

  const fetchAllAIRecommendedRequests = useCallback(async (filters?: AIRecommendationFilters, forceRefresh: boolean = false) => {
    console.log('🤖 Fetching all AI recommended requests with filters:', filters, 'forceRefresh:', forceRefresh);
    
    // Store the operation for refresh functionality
    lastOperation.current = { type: 'all', filters };
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = cache.get('all', undefined, filters);
      if (cachedData) {
        console.log('💾 Using cached data for all AI recommended requests:', cachedData.length, 'items');
        setRecommendations(cachedData);
        setError(null);
        setIsFromCache(true);
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    setIsFromCache(false);

    try {
      console.log('🌐 Fetching from API: getAllAIRecommendedRequests');
      const data = await seniorRequestsAIService.getAllAIRecommendedRequests(filters);
      
      // Cache the results
      cache.set('all', data, undefined, filters);
      setRecommendations(data);
      
      console.log('✅ Retrieved AI recommended requests:', data.length);
      
      if (data.length === 0) {
        toast({
          title: "No recommendations found",
          description: "No AI recommendations are available at the moment.",
          variant: "default"
        });
      } else {
        if (forceRefresh) {
          toast({
            title: "Recommendations refreshed",
            description: `Refreshed ${data.length} AI recommended requests.`,
            variant: "default"
          });
        } else {
          toast({
            title: "Recommendations loaded",
            description: `Found ${data.length} AI recommended requests.`,
            variant: "default"
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch AI recommended requests';
      console.error('❌ Error fetching AI recommended requests:', err);
      setError(errorMessage);
      
      toast({
        title: "Failed to load recommendations",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [cache]);

  const fetchMyAIRecommendedRequests = useCallback(async (filters?: AIRecommendationFilters, forceRefresh: boolean = false) => {
    if (!currentUser) {
      setError('User not authenticated');
      return;
    }

    console.log('👤 Fetching my AI recommended requests with filters:', filters, 'forceRefresh:', forceRefresh);
    
    // Store the operation for refresh functionality
    lastOperation.current = { type: 'my', filters };
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = cache.get('my', currentUser.id, filters);
      if (cachedData) {
        console.log('💾 Using cached data for my AI recommended requests:', cachedData.length, 'items');
        setRecommendations(cachedData);
        setError(null);
        setIsFromCache(true);
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    setIsFromCache(false);

    try {
      console.log('🌐 Fetching from API: getMyAIRecommendedRequests');
      const data = await seniorRequestsAIService.getMyAIRecommendedRequests(filters);
      
      // Cache the results
      cache.set('my', data, currentUser.id, filters);
      setRecommendations(data);
      
      console.log('✅ Retrieved my AI recommended requests:', data.length);
      
      if (data.length === 0) {
        toast({
          title: "No recommendations found",
          description: "No AI recommendations are available for you at the moment.",
          variant: "default"
        });
      } else {
        if (forceRefresh) {
          toast({
            title: "Recommendations refreshed",
            description: `Refreshed ${data.length} AI recommended requests for you.`,
            variant: "default"
          });
        } else {
          toast({
            title: "Recommendations loaded",
            description: `Found ${data.length} AI recommended requests for you.`,
            variant: "default"
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch my AI recommended requests';
      console.error('❌ Error fetching my AI recommended requests:', err);
      setError(errorMessage);
      
      toast({
        title: "Failed to load recommendations",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, cache]);

  const refresh = useCallback(async () => {
    if (!lastOperation.current) {
      console.warn('No previous operation to refresh');
      return;
    }

    const { type, filters } = lastOperation.current;
    
    if (type === 'all') {
      await fetchAllAIRecommendedRequests(filters, true);
    } else {
      await fetchMyAIRecommendedRequests(filters, true);
    }
  }, [fetchAllAIRecommendedRequests, fetchMyAIRecommendedRequests]);

  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
    setError(null);
    cache.clear();
    lastOperation.current = null;
  }, [cache]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    recommendations,
    loading,
    error,
    hasRecommendations: recommendations.length > 0,
    isFromCache,
    fetchAllAIRecommendedRequests,
    fetchMyAIRecommendedRequests,
    clearRecommendations,
    clearError,
    refresh,
  };
}
