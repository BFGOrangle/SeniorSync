// Mention information
export interface MentionedStaff {
  id: number;
  name: string;
  email?: string;
}

// Backend API types for comment management
export interface RequestCommentDto {
  id: number;
  comment: string;
  commentType: string;
  commenterId: number;
  requestId: number;
  commenterName: string;
  createdAt: string; // ISO string (OffsetDateTime from backend)
  updatedAt: string; // ISO string
  mentionedStaffIds?: number[]; // Staff IDs mentioned in this comment
  mentionedStaff?: MentionedStaff[]; // Full staff information for mentions
}

export interface CreateCommentDto {
  requestId: number;
  comment: string;
  commentType: string;
  commenterId: number;
  mentionedStaffIds?: number[]; // Staff IDs to mention
}

// Frontend types for UI compatibility
export interface RequestComment {
  id: number;
  comment: string;
  commentType: CommentType;
  commenterId: number;
  commenterName: string; // Populated from staff/senior data
  requestId: number;
  createdAt: string;
  updatedAt?: string;
  mentionedStaffIds?: number[]; // Staff IDs mentioned in this comment
  mentionedStaff?: MentionedStaff[]; // Full staff information for mentions
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
  static fromDto(dto: RequestCommentDto): RequestComment {
    return {
      id: dto.id,
      comment: dto.comment,
      commentType: dto.commentType as CommentType,
      commenterId: dto.commenterId,
      commenterName: dto.commenterName, // Use commenterName from DTO
      requestId: dto.requestId,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      mentionedStaffIds: dto.mentionedStaffIds,
      mentionedStaff: dto.mentionedStaff,
    };
  }

  // Convert frontend data to CreateCommentDto
  static toCreateDto(
    requestId: number,
    comment: string,
    commentType: CommentType,
    commenterId: number,
    mentionedStaffIds?: number[]
  ): CreateCommentDto {
    return {
      requestId,
      comment,
      commentType,
      commenterId,
      mentionedStaffIds,
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

  // Parse @ mentions from comment text
  static parseMentions(comment: string): string[] {
    const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(comment)) !== null) {
      const mention = match[1];
      if (!mentions.includes(mention)) {
        mentions.push(mention);
      }
    }
    
    return mentions;
  }

  // Format comment with mentions highlighted
  static formatCommentWithMentions(comment: string, mentionedStaff?: MentionedStaff[]): string {
    if (!mentionedStaff || mentionedStaff.length === 0) {
      return comment;
    }

    let formattedComment = comment;
    
    // Create a map of mention patterns to staff info
    const mentionMap = new Map<string, MentionedStaff>();
    mentionedStaff.forEach(staff => {
      // Try to match by name variations
      const nameVariations = [
        staff.name.toLowerCase().replace(/\s+/g, '.'),
        staff.name.toLowerCase().replace(/\s+/g, '_'),
        staff.name.toLowerCase().replace(/\s+/g, ''),
      ];
      
      nameVariations.forEach(variation => {
        mentionMap.set(variation, staff);
      });
    });

    // Replace mentions with highlighted versions
    const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
    formattedComment = formattedComment.replace(mentionRegex, (match, username) => {
      const staff = mentionMap.get(username.toLowerCase());
      if (staff) {
        return `<span class="mention" data-staff-id="${staff.id}">@${staff.name}</span>`;
      }
      return match;
    });

    return formattedComment;
  }

  // Extract staff IDs from mention text and staff list
  static extractMentionedStaffIds(comment: string, staffOptions: Array<{id: number, fullName: string}>): number[] {
    const mentions = this.parseMentions(comment);
    const staffIds: number[] = [];
    
    mentions.forEach(mention => {
      const staff = staffOptions.find(s => {
        const nameVariations = [
          s.fullName.toLowerCase().replace(/\s+/g, '.'),
          s.fullName.toLowerCase().replace(/\s+/g, '_'),
          s.fullName.toLowerCase().replace(/\s+/g, ''),
        ];
        return nameVariations.includes(mention.toLowerCase());
      });
      
      if (staff && !staffIds.includes(staff.id)) {
        staffIds.push(staff.id);
      }
    });
    
    return staffIds;
  }
}
