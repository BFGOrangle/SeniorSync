// API service for AI recommended senior requests - simplified version
import { AuthenticatedApiClient } from "./authenticated-api-client";
import { SeniorRequestDto } from "../types/request";

// Filter interface for AI recommendations
export interface AIRecommendationFilters {
  assignedStaffId?: number;
  requestTypeId?: number;
  priorityRange?: {
    min: number;
    max: number;
  };
}

// Base API URL configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088";

// API service class
export class SeniorRequestsAIService extends AuthenticatedApiClient {
  private static instance: SeniorRequestsAIService;

  private constructor() {
    super();
  }

  public static getInstance(): SeniorRequestsAIService {
    if (!SeniorRequestsAIService.instance) {
      SeniorRequestsAIService.instance = new SeniorRequestsAIService();
    }
    return SeniorRequestsAIService.instance;
  }

  /**
   * Get all AI recommended requests for all staff members
   */
  async getAllAIRecommendedRequests(
    filters?: AIRecommendationFilters
  ): Promise<SeniorRequestDto[]> {
    console.log("🤖 Getting all AI recommended requests with filters:", filters);
    
    const apiUrl = `${API_BASE_URL}/api/aifeatures/recommend/getAllAIRecommendedRequests`;
    
    const result = await this.request<SeniorRequestDto[]>(apiUrl, {
      method: "POST",
      body: JSON.stringify(filters || {}),
    });

    console.log("✅ Retrieved AI recommended requests:", result.length);
    return result;
  }

  /**
   * Get AI recommended requests for the current logged-in staff member
   */
  async getMyAIRecommendedRequests(
    filters?: AIRecommendationFilters
  ): Promise<SeniorRequestDto[]> {
    console.log("👤 Getting my AI recommended requests with filters:", filters);
    
    const apiUrl = `${API_BASE_URL}/api/aifeatures/recommend/getMyAIRecommendedRequests`;
    
    const result = await this.request<SeniorRequestDto[]>(apiUrl, {
      method: "POST",
      body: JSON.stringify(filters || {}),
    });

    console.log("✅ Retrieved my AI recommended requests:", result.length);
    return result;
  }
}

// Export singleton instance
export const seniorRequestsAIService = SeniorRequestsAIService.getInstance();
