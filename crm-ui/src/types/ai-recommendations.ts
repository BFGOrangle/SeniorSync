// AI Recommendations types matching the backend DTOs

export interface AIRecommendationDto {
  id: number;
  requestId: number;
  userId?: number;
  priorityScore?: number; // 0-100 scale
  priorityReason?: string;
  urgencyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendationText?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface BatchRecommendationRequestDto {
  requestIds: number[];
  userId?: number;
  includePriorityRanking: boolean;
}

export interface BatchRecommendationResultDto {
  recommendations: AIRecommendationDto[];
  failures: AIRecommendationDto[];
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}

export interface TaskPriorityDto {
  taskId: number;
  priorityScore: number; // 1-10 scale
  priorityReason?: string;
  urgencyLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string; // ISO string
}

// Frontend-specific types for UI display
export interface AIRecommendationDisplayItem {
  id: number;
  requestId: number;
  recommendation: AIRecommendationDto;
  // Extended request information for display
  requestTitle?: string;
  requestDescription?: string;
  requestStatus?: string;
  requestPriority?: number;
  seniorId?: number;
  seniorName?: string;
  assignedStaffId?: number;
  assignedStaffName?: string;
  requestCreatedAt?: string;
  requestUpdatedAt?: string;
}

// Processing status for tracking async operations
export interface AIRecommendationProcessingStatus {
  requestId: number;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

// Utility functions for AI recommendations
export const AIRecommendationUtils = {
  // Get urgency level color
  getUrgencyColor(urgencyLevel?: string): string {
    switch (urgencyLevel) {
      case 'CRITICAL':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'HIGH':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'MEDIUM':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'LOW':
        return 'text-green-700 bg-green-100 border-green-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  },

  // Get priority score color
  getPriorityScoreColor(score?: number): string {
    if (!score) return 'text-gray-700 bg-gray-100 border-gray-200';
    
    if (score >= 90) return 'text-red-700 bg-red-100 border-red-200';
    if (score >= 70) return 'text-orange-700 bg-orange-100 border-orange-200';
    if (score >= 50) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    return 'text-green-700 bg-green-100 border-green-200';
  },

  // Get status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'PROCESSING':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'PENDING':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'FAILED':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  },

  // Sort recommendations by priority and urgency
  sortRecommendations(recommendations: AIRecommendationDto[]): AIRecommendationDto[] {
    return [...recommendations].sort((a, b) => {
      // First sort by priority score (higher first)
      const scoreDiff = (b.priorityScore || 0) - (a.priorityScore || 0);
      if (scoreDiff !== 0) return scoreDiff;

      // Then by urgency level
      const urgencyOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      const urgencyDiff = (urgencyOrder[b.urgencyLevel || 'LOW'] || 1) - 
                         (urgencyOrder[a.urgencyLevel || 'LOW'] || 1);
      if (urgencyDiff !== 0) return urgencyDiff;

      // Finally by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  // Format priority score for display
  formatPriorityScore(score?: number): string {
    if (!score) return 'N/A';
    return `${score}/100`;
  },

  // Format urgency level for display
  formatUrgencyLevel(urgencyLevel?: string): string {
    if (!urgencyLevel) return 'Unknown';
    return urgencyLevel.charAt(0) + urgencyLevel.slice(1).toLowerCase();
  },

  // Check if recommendation is actionable
  isActionable(recommendation: AIRecommendationDto): boolean {
    return recommendation.status === 'COMPLETED' && 
           !!recommendation.recommendationText && 
           recommendation.recommendationText.trim().length > 0;
  },

  // Get display priority level from score
  getDisplayPriorityLevel(score?: number): 'Low' | 'Medium' | 'High' | 'Critical' {
    if (!score) return 'Low';
    
    if (score >= 90) return 'Critical';
    if (score >= 70) return 'High';
    if (score >= 50) return 'Medium';
    return 'Low';
  }
};
