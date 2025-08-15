import { useState, useCallback, useEffect } from 'react';
import { 
  AIRecommendationDto, 
  BatchRecommendationRequestDto,
  BatchRecommendationResultDto,
  TaskPriorityDto,
  AIRecommendationProcessingStatus 
} from '@/types/ai-recommendations';
import { aiRecommendationsService } from '@/services/ai-recommendations-service';
import { aiRecommendationsCache } from '@/services/ai-recommendations-cache';
import { useCurrentUser } from '@/contexts/user-context';
import { toast } from '@/hooks/use-toast';

interface UseAIRecommendationsReturn {
  recommendations: AIRecommendationDto[];
  loading: boolean;
  error: string | null;
  hasRecommendations: boolean;
  processingStatuses: Map<number, AIRecommendationProcessingStatus>;
  
  // Core operations
  fetchRecommendations: () => Promise<void>;
  generateRecommendationsForRequests: (requestIds: number[]) => Promise<void>; // ✅ New method
  generateRecommendation: (requestId: number) => Promise<AIRecommendationDto | null>;
  processBatchRecommendations: (requestIds: number[], includePriorityRanking?: boolean) => Promise<BatchRecommendationResultDto | null>;
  rankTaskPriorities: (taskIds: number[]) => Promise<TaskPriorityDto[] | null>;
  
  // Cache operations
  clearRecommendations: () => void;
  clearError: () => void;
  refreshRecommendation: (requestId: number) => Promise<void>;
  
  // Status tracking
  getProcessingStatus: (requestId: number) => AIRecommendationProcessingStatus | null;
  isProcessing: (requestId: number) => boolean;
}

/**
 * Enhanced hook for managing AI-powered recommendations with caching and real-time updates
 */
export function useAIRecommendations(): UseAIRecommendationsReturn {
  const [recommendations, setRecommendations] = useState<AIRecommendationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStatuses, setProcessingStatuses] = useState<Map<number, AIRecommendationProcessingStatus>>(new Map());
  const { currentUser } = useCurrentUser();

  // Listen to cache updates
  useEffect(() => {
    const unsubscribe = aiRecommendationsCache.addListener((cachedRecommendations) => {
      setRecommendations(cachedRecommendations);
    });

    return unsubscribe;
  }, []);

  const fetchRecommendations = useCallback(async () => {
    if (!currentUser) {
      console.log('🚫 fetchRecommendations: No current user');
      setError('User not authenticated');
      return;
    }

    console.log('🔄 fetchRecommendations: Starting for user', currentUser.id, 'role:', currentUser.role);
    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = aiRecommendationsCache.getCachedRecommendations(
        currentUser.role === 'ADMIN' ? undefined : currentUser.id
      );

      if (cached) {
        console.log('💾 fetchRecommendations: Found cached data', cached.length, 'items');
        setRecommendations(cached);
        setLoading(false);
        return;
      }

      console.log('🌐 fetchRecommendations: No cache, calling API...');

      // Fetch from API
      let data: AIRecommendationDto[];
      
      if (currentUser.role === 'ADMIN') {
        console.log('👑 fetchRecommendations: Calling getAllRecommendations (admin)');
        data = await aiRecommendationsService.getAllRecommendations();
        aiRecommendationsCache.cacheRecommendations(data);
      } else {
        console.log('👤 fetchRecommendations: Calling getMyRecommendations for user', currentUser.id);
        data = await aiRecommendationsService.getMyRecommendations(currentUser.id);
        aiRecommendationsCache.cacheRecommendations(data, currentUser.id);
      }

      console.log('✅ fetchRecommendations: API returned', data.length, 'recommendations');
      setRecommendations(data);
      
      if (data.length === 0) {
        console.log('ℹ️ No recommendations found in database. This is normal if no AI recommendations have been generated yet.');
        toast({
          title: "No recommendations yet",
          description: "No AI recommendations found. Try generating recommendations for existing requests first.",
          variant: "default"
        });
      } else {
        toast({
          title: "Recommendations loaded",
          description: `Found ${data.length} AI recommendations.`,
          variant: "default"
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recommendations';
      console.error('❌ fetchRecommendations: Error occurred', err);
      console.error('❌ Error details:', {
        message: errorMessage,
        stack: err instanceof Error ? err.stack : 'No stack trace',
        name: err instanceof Error ? err.name : 'Unknown error type'
      });
      setError(errorMessage);
      
      toast({
        title: "Failed to load recommendations",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const generateRecommendationsForRequests = useCallback(async (requestIds: number[]): Promise<void> => {
    if (!currentUser) {
      setError('User not authenticated');
      return;
    }

    console.log('🚀 generateRecommendationsForRequests: Starting generation for', requestIds.length, 'requests');
    setLoading(true);
    setError(null);

    try {
      const batchRequest: BatchRecommendationRequestDto = {
        requestIds,
        userId: currentUser.id,
        includePriorityRanking: true
      };

      console.log('📝 Calling processBatchRecommendations with:', batchRequest);
      const result = await aiRecommendationsService.processBatchRecommendations(batchRequest);
      
      console.log('✅ Generated', result.successCount, 'recommendations,', result.failureCount, 'failures');

      // Update cache with successful recommendations
      result.recommendations.forEach(rec => {
        aiRecommendationsCache.updateRecommendation(rec);
      });

      // Update recommendations state
      setRecommendations(prev => {
        const updated = [...prev];
        result.recommendations.forEach(rec => {
          const index = updated.findIndex(r => r.requestId === rec.requestId);
          if (index >= 0) {
            updated[index] = rec;
          } else {
            updated.push(rec);
          }
        });
        return updated;
      });

      toast({
        title: "Recommendations generated",
        description: `Generated ${result.successCount} AI recommendations successfully.${result.failureCount > 0 ? ` ${result.failureCount} failed.` : ''}`,
        variant: result.failureCount > 0 ? "destructive" : "default"
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate recommendations';
      console.error('❌ generateRecommendationsForRequests: Error occurred', err);
      setError(errorMessage);
      
      toast({
        title: "Failed to generate recommendations",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const generateRecommendation = useCallback(async (requestId: number): Promise<AIRecommendationDto | null> => {
    setError(null);
    
    // Update processing status
    const status: AIRecommendationProcessingStatus = {
      requestId,
      status: 'processing',
      startedAt: new Date()
    };
    
    setProcessingStatuses(prev => new Map(prev.set(requestId, status)));
    aiRecommendationsCache.updateProcessingStatus(requestId, status);

    try {
      const recommendation = await aiRecommendationsService.generateRecommendation(requestId);
      
      // Update cache and local state
      aiRecommendationsCache.updateRecommendation(recommendation);
      setRecommendations(prev => {
        const updated = prev.filter(r => r.requestId !== requestId);
        return [...updated, recommendation];
      });

      // Update processing status
      const completedStatus: AIRecommendationProcessingStatus = {
        requestId,
        status: 'completed',
        startedAt: status.startedAt,
        completedAt: new Date()
      };
      
      setProcessingStatuses(prev => new Map(prev.set(requestId, completedStatus)));
      aiRecommendationsCache.updateProcessingStatus(requestId, completedStatus);

      toast({
        title: "Recommendation generated",
        description: `AI recommendation generated for request ${requestId}`,
        variant: "default"
      });

      return recommendation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate recommendation';
      
      // Update processing status
      const failedStatus: AIRecommendationProcessingStatus = {
        requestId,
        status: 'failed',
        startedAt: status.startedAt,
        completedAt: new Date(),
        error: errorMessage
      };
      
      setProcessingStatuses(prev => new Map(prev.set(requestId, failedStatus)));
      aiRecommendationsCache.updateProcessingStatus(requestId, failedStatus);

      toast({
        title: "Failed to generate recommendation",
        description: errorMessage,
        variant: "destructive"
      });

      return null;
    }
  }, []);

  const processBatchRecommendations = useCallback(async (
    requestIds: number[], 
    includePriorityRanking: boolean = true
  ): Promise<BatchRecommendationResultDto | null> => {
    if (!currentUser) {
      setError('User not authenticated');
      return null;
    }

    setError(null);
    
    // Mark all as processing
    requestIds.forEach(requestId => {
      const status: AIRecommendationProcessingStatus = {
        requestId,
        status: 'processing',
        startedAt: new Date()
      };
      setProcessingStatuses(prev => new Map(prev.set(requestId, status)));
      aiRecommendationsCache.updateProcessingStatus(requestId, status);
    });

    try {
      const batchRequest: BatchRecommendationRequestDto = {
        requestIds,
        userId: currentUser.id,
        includePriorityRanking
      };

      const result = await aiRecommendationsService.processBatchRecommendations(batchRequest);
      
      // Update cache with successful recommendations
      result.recommendations.forEach(rec => {
        aiRecommendationsCache.updateRecommendation(rec);
        
        const completedStatus: AIRecommendationProcessingStatus = {
          requestId: rec.requestId,
          status: 'completed',
          startedAt: new Date(), // We don't have the start time from the result
          completedAt: new Date()
        };
        setProcessingStatuses(prev => new Map(prev.set(rec.requestId, completedStatus)));
      });

      // Update processing status for failures
      result.failures.forEach(failure => {
        const failedStatus: AIRecommendationProcessingStatus = {
          requestId: failure.requestId,
          status: 'failed',
          startedAt: new Date(),
          completedAt: new Date(),
          error: 'Batch processing failed'
        };
        setProcessingStatuses(prev => new Map(prev.set(failure.requestId, failedStatus)));
      });

      // Update recommendations state
      setRecommendations(prev => {
        const updated = [...prev];
        result.recommendations.forEach(rec => {
          const index = updated.findIndex(r => r.requestId === rec.requestId);
          if (index >= 0) {
            updated[index] = rec;
          } else {
            updated.push(rec);
          }
        });
        return updated;
      });

      toast({
        title: "Batch processing completed",
        description: `Processed ${result.totalProcessed} requests. ${result.successCount} successful, ${result.failureCount} failed.`,
        variant: result.failureCount > 0 ? "destructive" : "default"
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process batch recommendations';
      
      // Mark all as failed
      requestIds.forEach(requestId => {
        const failedStatus: AIRecommendationProcessingStatus = {
          requestId,
          status: 'failed',
          startedAt: new Date(),
          completedAt: new Date(),
          error: errorMessage
        };
        setProcessingStatuses(prev => new Map(prev.set(requestId, failedStatus)));
      });

      toast({
        title: "Batch processing failed",
        description: errorMessage,
        variant: "destructive"
      });

      return null;
    }
  }, [currentUser]);

  const rankTaskPriorities = useCallback(async (taskIds: number[]): Promise<TaskPriorityDto[] | null> => {
    setError(null);

    try {
      const priorities = await aiRecommendationsService.rankTaskPriorities(taskIds);
      
      toast({
        title: "Task priorities ranked",
        description: `Successfully ranked ${priorities.length} tasks by priority.`,
        variant: "default"
      });

      return priorities;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rank task priorities';
      setError(errorMessage);
      
      toast({
        title: "Failed to rank priorities",
        description: errorMessage,
        variant: "destructive"
      });

      return null;
    }
  }, []);

  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
    setError(null);
    setProcessingStatuses(new Map());
    aiRecommendationsCache.clearCache();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshRecommendation = useCallback(async (requestId: number) => {
    // Remove from cache to force refresh
    aiRecommendationsCache.removeRecommendation(requestId);
    
    // Generate new recommendation
    await generateRecommendation(requestId);
  }, [generateRecommendation]);

  const getProcessingStatus = useCallback((requestId: number): AIRecommendationProcessingStatus | null => {
    return processingStatuses.get(requestId) || aiRecommendationsCache.getProcessingStatus(requestId);
  }, [processingStatuses]);

  const isProcessing = useCallback((requestId: number): boolean => {
    const status = getProcessingStatus(requestId);
    return status?.status === 'processing';
  }, [getProcessingStatus]);

  return {
    recommendations,
    loading,
    error,
    hasRecommendations: recommendations.length > 0,
    processingStatuses,
    fetchRecommendations,
    generateRecommendationsForRequests,
    generateRecommendation,
    processBatchRecommendations,
    rankTaskPriorities,
    clearRecommendations,
    clearError,
    refreshRecommendation,
    getProcessingStatus,
    isProcessing,
  };
}
