import { AuthenticatedApiClient } from './authenticated-api-client';
import { 
  AIRecommendationDto, 
  BatchRecommendationRequestDto, 
  BatchRecommendationResultDto, 
  TaskPriorityDto 
} from '@/types/ai-recommendations';

/**
 * API service for AI-powered recommendations
 */
export class AIRecommendationsApiService extends AuthenticatedApiClient {
  private static instance: AIRecommendationsApiService;

  public static getInstance(): AIRecommendationsApiService {
    if (!AIRecommendationsApiService.instance) {
      AIRecommendationsApiService.instance = new AIRecommendationsApiService();
    }
    return AIRecommendationsApiService.instance;
  }

  /**
   * Get all AI recommendations (admin only)
   * @returns Promise<AIRecommendationDto[]> List of all AI recommendations
   */
  async getAllRecommendations(): Promise<AIRecommendationDto[]> {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/aifeatures/recommend/all`;
    console.log('🌐 API Call: getAllRecommendations ->', apiUrl);
    
    const result = await this.request<AIRecommendationDto[]>(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ API Response: getAllRecommendations returned', result?.length || 0, 'items');
    return result;
  }

  /**
   * Get AI recommendations for a specific user
   * @param userId - The user ID to get recommendations for
   * @returns Promise<AIRecommendationDto[]> List of user's AI recommendations
   */
  async getMyRecommendations(userId: number): Promise<AIRecommendationDto[]> {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/aifeatures/recommend/my/${userId}`;
    console.log('🌐 API Call: getMyRecommendations ->', apiUrl, 'for userId:', userId);
    
    const result = await this.request<AIRecommendationDto[]>(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ API Response: getMyRecommendations returned', result?.length || 0, 'items');
    return result;
  }

  /**
   * Generate a single AI recommendation for a request
   * @param requestId - The request ID to generate recommendation for
   * @returns Promise<AIRecommendationDto> The generated recommendation
   */
  async generateRecommendation(requestId: number): Promise<AIRecommendationDto> {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/aifeatures/recommend/generate/${requestId}`;
    
    return this.request<AIRecommendationDto>(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  /**
   * Process batch recommendations for multiple requests
   * @param batchRequest - The batch request configuration
   * @returns Promise<BatchRecommendationResultDto> The batch processing results
   */
  async processBatchRecommendations(batchRequest: BatchRecommendationRequestDto): Promise<BatchRecommendationResultDto> {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/aifeatures/recommend/batch`;
    
    return this.request<BatchRecommendationResultDto>(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batchRequest)
    });
  }

  /**
   * Rank task priorities using AI
   * @param taskIds - Array of task IDs to rank
   * @returns Promise<TaskPriorityDto[]> Ranked task priorities
   */
  async rankTaskPriorities(taskIds: number[]): Promise<TaskPriorityDto[]> {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/aifeatures/recommend/priorities`;
    
    return this.request<TaskPriorityDto[]>(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskIds)
    });
  }

  // Legacy methods for backward compatibility (will be deprecated)
  
  /**
   * @deprecated Use getAllRecommendations() instead
   */
  async getAllRecommendedRequests(): Promise<AIRecommendationDto[]> {
    return this.getAllRecommendations();
  }

  /**
   * @deprecated Use getMyRecommendations(userId) instead
   */
  async getMyRecommendedRequests(): Promise<AIRecommendationDto[]> {
    // For backward compatibility, try to get current user ID
    // This is a simplification - in practice you'd get the user ID from context
    throw new Error('getMyRecommendedRequests() is deprecated. Use getMyRecommendations(userId) instead.');
  }
}

// Export singleton instance
export const aiRecommendationsService = AIRecommendationsApiService.getInstance();
