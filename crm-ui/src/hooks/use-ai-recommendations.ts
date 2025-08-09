import { useState, useCallback } from 'react';
import { SeniorRequestDto } from '@/types/request';
import { aiRecommendationsService } from '@/services/ai-recommendations-service';
import { useCurrentUser } from '@/contexts/user-context';
import { toast } from '@/hooks/use-toast';

interface UseAIRecommendationsReturn {
  recommendations: SeniorRequestDto[];
  loading: boolean;
  error: string | null;
  hasRecommendations: boolean;
  fetchRecommendations: () => Promise<void>;
  clearRecommendations: () => void;
  clearError: () => void;
}

/**
 * Custom hook for managing AI-powered task recommendations
 */
export function useAIRecommendations(): UseAIRecommendationsReturn {
  const [recommendations, setRecommendations] = useState<SeniorRequestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useCurrentUser();

  const fetchRecommendations = useCallback(async () => {
    if (!currentUser) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let data: SeniorRequestDto[];
      
      if (currentUser.role === 'ADMIN') {
        data = await aiRecommendationsService.getAllRecommendedRequests();
      } else {
        data = await aiRecommendationsService.getMyRecommendedRequests();
      }

      setRecommendations(data);
      
      if (data.length === 0) {
        toast({
          title: "No recommendations",
          description: "No AI-recommended tasks found at this time.",
          variant: "default"
        });
      } else {
        toast({
          title: "Recommendations loaded",
          description: `Found ${data.length} AI-recommended tasks.`,
          variant: "default"
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recommendations';
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

  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    recommendations,
    loading,
    error,
    hasRecommendations: recommendations.length > 0,
    fetchRecommendations,
    clearRecommendations,
    clearError,
  };
}
