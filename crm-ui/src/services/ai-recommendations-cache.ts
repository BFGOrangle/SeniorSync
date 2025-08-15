import { 
  AIRecommendationDto, 
  AIRecommendationProcessingStatus,
  AIRecommendationUtils 
} from '@/types/ai-recommendations';

/**
 * Cache service for AI recommendations to optimize performance and provide real-time updates
 */
export class AIRecommendationsCacheService {
  private static instance: AIRecommendationsCacheService;
  
  // Cache storage
  private recommendationsCache = new Map<number, AIRecommendationDto>(); // requestId -> recommendation
  private userRecommendationsCache = new Map<number, number[]>(); // userId -> requestIds[]
  private lastFetchTime = new Map<string, number>(); // cacheKey -> timestamp
  
  // Processing status tracking
  private processingStatuses = new Map<number, AIRecommendationProcessingStatus>(); // requestId -> status
  
  // Cache configuration
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 1000;
  
  // Event listeners for cache updates
  private listeners = new Set<(recommendations: AIRecommendationDto[]) => void>();

  public static getInstance(): AIRecommendationsCacheService {
    if (!AIRecommendationsCacheService.instance) {
      AIRecommendationsCacheService.instance = new AIRecommendationsCacheService();
    }
    return AIRecommendationsCacheService.instance;
  }

  private constructor() {
    // Clean up cache periodically
    setInterval(() => this.cleanupExpiredCache(), 60000); // Every minute
  }

  /**
   * Add a listener for cache updates
   */
  addListener(listener: (recommendations: AIRecommendationDto[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of cache updates
   */
  private notifyListeners(): void {
    const allRecommendations = Array.from(this.recommendationsCache.values());
    this.listeners.forEach(listener => {
      try {
        listener(allRecommendations);
      } catch (error) {
        console.error('Error notifying cache listener:', error);
      }
    });
  }

  /**
   * Get recommendations from cache if valid, otherwise return null
   */
  getCachedRecommendations(userId?: number): AIRecommendationDto[] | null {
    const cacheKey = userId ? `user-${userId}` : 'all';
    const lastFetch = this.lastFetchTime.get(cacheKey);
    
    if (!lastFetch || Date.now() - lastFetch > this.CACHE_TTL_MS) {
      return null;
    }

    let recommendations: AIRecommendationDto[];

    if (userId) {
      const userRequestIds = this.userRecommendationsCache.get(userId);
      if (!userRequestIds) return null;
      
      recommendations = userRequestIds
        .map(requestId => this.recommendationsCache.get(requestId))
        .filter((rec): rec is AIRecommendationDto => rec !== undefined);
    } else {
      recommendations = Array.from(this.recommendationsCache.values());
    }

    // Return null if we have no recommendations, even if the cache timestamp is valid
    // This ensures the caller will fetch fresh data from the API
    return recommendations.length > 0 ? recommendations : null;
  }

  /**
   * Store recommendations in cache
   */
  cacheRecommendations(recommendations: AIRecommendationDto[], userId?: number): void {
    // Enforce cache size limit
    if (this.recommendationsCache.size + recommendations.length > this.MAX_CACHE_SIZE) {
      this.cleanupOldestEntries();
    }

    // Store individual recommendations
    recommendations.forEach(rec => {
      this.recommendationsCache.set(rec.requestId, rec);
    });

    // Update user-specific cache if applicable
    if (userId) {
      const requestIds = recommendations.map(rec => rec.requestId);
      this.userRecommendationsCache.set(userId, requestIds);
      this.lastFetchTime.set(`user-${userId}`, Date.now());
    } else {
      this.lastFetchTime.set('all', Date.now());
    }

    this.notifyListeners();
  }

  /**
   * Get a specific recommendation by request ID
   */
  getRecommendation(requestId: number): AIRecommendationDto | null {
    return this.recommendationsCache.get(requestId) || null;
  }

  /**
   * Update a specific recommendation in cache
   */
  updateRecommendation(recommendation: AIRecommendationDto): void {
    this.recommendationsCache.set(recommendation.requestId, recommendation);
    this.notifyListeners();
  }

  /**
   * Remove a recommendation from cache
   */
  removeRecommendation(requestId: number): void {
    this.recommendationsCache.delete(requestId);
    
    // Remove from user caches
    this.userRecommendationsCache.forEach((requestIds, userId) => {
      const filteredIds = requestIds.filter(id => id !== requestId);
      if (filteredIds.length !== requestIds.length) {
        this.userRecommendationsCache.set(userId, filteredIds);
      }
    });

    this.notifyListeners();
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.recommendationsCache.clear();
    this.userRecommendationsCache.clear();
    this.lastFetchTime.clear();
    this.processingStatuses.clear();
    this.notifyListeners();
  }

  /**
   * Get processing status for a request
   */
  getProcessingStatus(requestId: number): AIRecommendationProcessingStatus | null {
    return this.processingStatuses.get(requestId) || null;
  }

  /**
   * Update processing status for a request
   */
  updateProcessingStatus(requestId: number, status: AIRecommendationProcessingStatus): void {
    this.processingStatuses.set(requestId, status);
    
    // If processing is complete, we might want to refresh the recommendation
    if (status.status === 'completed') {
      // Invalidate cache for this request to trigger a refresh
      this.removeRecommendation(requestId);
    }
  }

  /**
   * Get all requests currently being processed
   */
  getProcessingRequests(): number[] {
    return Array.from(this.processingStatuses.entries())
      .filter(([, status]) => status.status === 'processing')
      .map(([requestId]) => requestId);
  }

  /**
   * Get sorted recommendations with caching optimization
   */
  getSortedRecommendations(userId?: number): AIRecommendationDto[] {
    const cached = this.getCachedRecommendations(userId);
    if (cached) {
      return AIRecommendationUtils.sortRecommendations(cached);
    }
    return [];
  }

  /**
   * Check if cache is valid for specific user/all
   */
  isCacheValid(userId?: number): boolean {
    const cacheKey = userId ? `user-${userId}` : 'all';
    const lastFetch = this.lastFetchTime.get(cacheKey);
    return lastFetch ? (Date.now() - lastFetch < this.CACHE_TTL_MS) : false;
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): {
    totalRecommendations: number;
    userCaches: number;
    processingRequests: number;
    cacheKeys: string[];
    oldestEntry?: string;
    newestEntry?: string;
  } {
    const cacheKeys = Array.from(this.lastFetchTime.keys());
    const timestamps = Array.from(this.lastFetchTime.values());
    
    return {
      totalRecommendations: this.recommendationsCache.size,
      userCaches: this.userRecommendationsCache.size,
      processingRequests: this.getProcessingRequests().length,
      cacheKeys,
      oldestEntry: timestamps.length > 0 ? new Date(Math.min(...timestamps)).toISOString() : undefined,
      newestEntry: timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : undefined,
    };
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    
    // Remove expired fetch times and associated caches
    Array.from(this.lastFetchTime.entries()).forEach(([cacheKey, timestamp]) => {
      if (now - timestamp > this.CACHE_TTL_MS) {
        this.lastFetchTime.delete(cacheKey);
        
        if (cacheKey.startsWith('user-')) {
          const userId = parseInt(cacheKey.substring(5));
          this.userRecommendationsCache.delete(userId);
        }
      }
    });

    // Clean up orphaned recommendations (not referenced by any user cache)
    const referencedRequestIds = new Set<number>();
    this.userRecommendationsCache.forEach(requestIds => {
      requestIds.forEach(id => referencedRequestIds.add(id));
    });

    // If we have an 'all' cache that's still valid, keep all recommendations
    if (this.lastFetchTime.has('all')) {
      return;
    }

    // Remove unreferenced recommendations
    Array.from(this.recommendationsCache.keys()).forEach(requestId => {
      if (!referencedRequestIds.has(requestId)) {
        this.recommendationsCache.delete(requestId);
      }
    });
  }

  /**
   * Remove oldest cache entries to make room for new ones
   */
  private cleanupOldestEntries(): void {
    const entriesToRemove = Math.max(1, Math.floor(this.MAX_CACHE_SIZE * 0.1)); // Remove 10%
    
    // Sort by timestamp (oldest first)
    const sortedEntries = Array.from(this.lastFetchTime.entries())
      .sort(([, a], [, b]) => a - b);
    
    sortedEntries.slice(0, entriesToRemove).forEach(([cacheKey]) => {
      this.lastFetchTime.delete(cacheKey);
      
      if (cacheKey.startsWith('user-')) {
        const userId = parseInt(cacheKey.substring(5));
        const requestIds = this.userRecommendationsCache.get(userId) || [];
        this.userRecommendationsCache.delete(userId);
        
        // Remove associated recommendations if not referenced elsewhere
        requestIds.forEach(requestId => {
          this.recommendationsCache.delete(requestId);
        });
      }
    });
  }
}

// Export singleton instance
export const aiRecommendationsCache = AIRecommendationsCacheService.getInstance();
