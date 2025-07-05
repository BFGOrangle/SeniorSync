// Backend API types for comment management
export interface RequestCommentDto {
  id: number;
  comment: string;
  commentType: string;
  commenterId: number;
  requestId: number;
  createdAt: string; // ISO string (OffsetDateTime from backend)
  updatedAt: string; // ISO string
}

export interface CreateCommentDto {
  requestId: number;
  comment: string;
  commentType: string;
  commenterId: number;
}

// Frontend types for UI compatibility
export interface RequestComment {
  id: number;
  comment: string;
  commentType: CommentType;
  commenterId: number;
  commenterName?: string; // Populated from staff/senior data
  requestId: number;
  createdAt: string;
  updatedAt?: string;
}

// Comment types based on business logic
export type CommentType = 
  | 'GENERAL'        // General comment/note
  | 'FOLLOW_UP'      // Follow-up action required
  | 'UPDATE'         // Status/progress update
  | 'ISSUE'          // Problem or concern
  | 'RESOLUTION'     // Resolution or solution
  | 'INTERNAL';      // Internal staff note

// Comment type configurations for UI
export const COMMENT_TYPE_CONFIG: Record<CommentType, {
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  GENERAL: {
    label: 'General Note',
    description: 'General comment or observation',
    icon: 'MessageCircle',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  FOLLOW_UP: {
    label: 'Follow-up Required',
    description: 'Action item or follow-up needed',
    icon: 'Clock',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  UPDATE: {
    label: 'Progress Update',
    description: 'Status or progress update',
    icon: 'TrendingUp',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  ISSUE: {
    label: 'Issue/Concern',
    description: 'Problem or concern raised',
    icon: 'AlertTriangle',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  RESOLUTION: {
    label: 'Resolution',
    description: 'Solution or resolution provided',
    icon: 'CheckCircle',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  INTERNAL: {
    label: 'Internal Note',
    description: 'Internal staff communication',
    icon: 'Lock',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
};

// Utility functions for comment management
export class CommentUtils {
  // Convert backend RequestCommentDto to frontend RequestComment
  static fromDto(dto: RequestCommentDto, commenterName?: string): RequestComment {
    return {
      id: dto.id,
      comment: dto.comment,
      commentType: dto.commentType as CommentType,
      commenterId: dto.commenterId,
      commenterName,
      requestId: dto.requestId,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }

  // Convert frontend data to CreateCommentDto
  static toCreateDto(
    requestId: number,
    comment: string,
    commentType: CommentType,
    commenterId: number
  ): CreateCommentDto {
    return {
      requestId,
      comment,
      commentType,
      commenterId,
    };
  }

  // Get comment type configuration
  static getTypeConfig(commentType: CommentType) {
    return COMMENT_TYPE_CONFIG[commentType] || COMMENT_TYPE_CONFIG.GENERAL;
  }

  // Format comment timestamp for display
  static formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } else if (diffInHours < 168) { // 7 days
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
    } catch {
      return 'Invalid date';
    }
  }

  // Get relative time string
  static getRelativeTime(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
      
      const diffInHours = diffInMinutes / 60;
      if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
      
      const diffInDays = diffInHours / 24;
      if (diffInDays < 7) return `${Math.floor(diffInDays)}d ago`;
      
      const diffInWeeks = diffInDays / 7;
      if (diffInWeeks < 4) return `${Math.floor(diffInWeeks)}w ago`;
      
      const diffInMonths = diffInDays / 30;
      return `${Math.floor(diffInMonths)}mo ago`;
    } catch {
      return 'Unknown';
    }
  }
}
