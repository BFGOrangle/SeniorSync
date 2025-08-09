import { AuthenticatedApiClient } from './authenticated-api-client';
import { SeniorRequestDto } from '@/types/request';

/**
 * API service for AI-powered recommended requests
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
   * Get AI-recommended requests for the current user
   * @returns Promise<SeniorRequestDto[]> List of recommended requests ranked by AI
   */
  async getMyRecommendedRequests(): Promise<SeniorRequestDto[]> {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/aifeatures/recommend/getMyAIRecommendedRequests`;
    
    return this.request<SeniorRequestDto[]>(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  /**
   * Get all AI-recommended requests (admin only)
   * @returns Promise<SeniorRequestDto[]> List of all recommended requests
   */
  async getAllRecommendedRequests(): Promise<SeniorRequestDto[]> {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/aifeatures/recommend/getAllAIRecommendedRequests`;
    
    return this.request<SeniorRequestDto[]>(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}

// Export singleton instance
export const aiRecommendationsService = AIRecommendationsApiService.getInstance();
