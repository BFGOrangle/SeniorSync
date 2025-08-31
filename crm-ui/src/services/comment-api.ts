import { AuthenticatedApiClient, BaseApiError } from './authenticated-api-client';
import {
  RequestCommentDto,
  CreateCommentDto,
  RequestComment,
  CommentUtils
} from '@/types/comment';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088';
const COMMENTS_ENDPOINT = `${API_BASE_URL}/api/comments`;

// Service-specific error classes (extending base)
export class CommentApiError extends BaseApiError {
  constructor(
    status: number,
    statusText: string,
    errors: Array<{ message: string; timestamp: string; field?: string; rejectedValue?: any }> = []
  ) {
    super(status, statusText, errors);
    this.name = 'CommentApiError';
  }
}

export class CommentValidationError extends CommentApiError {
  constructor(public validationErrors: Array<{ message: string; field: string; rejectedValue?: any; timestamp: string }>) {
    super(400, 'Validation Error', validationErrors);
    this.name = 'CommentValidationError';
  }
}

// HTTP client for comment management extending authenticated base
class CommentApiClient extends AuthenticatedApiClient {
  // Override error handling for comment-specific errors
  protected async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any;
    
    try {
      errorData = await response.json();
    } catch {
      throw new CommentApiError(
        response.status,
        response.statusText,
        [{ message: 'An unexpected error occurred', timestamp: new Date().toISOString() }]
      );
    }

    // Handle validation errors
    if (response.status === 400 && errorData.errors) {
      throw new CommentValidationError(errorData.errors);
    }
    
    // Handle other errors
    throw new CommentApiError(
      response.status,
      response.statusText,
      errorData.errors || [{ message: errorData.message || 'Unknown error', timestamp: new Date().toISOString() }]
    );
  }

  // Get comments for a specific request
  async getCommentsByRequestId(requestId: number): Promise<RequestComment[]> {
    const commentDtos = await this.get<RequestCommentDto[]>(`${COMMENTS_ENDPOINT}/${requestId}`);
    return commentDtos.map(dto => CommentUtils.fromDto(dto));
  }

  // Create a new comment
  async createComment(commentData: CreateCommentDto): Promise<RequestComment> {
    const commentDto = await this.post<RequestCommentDto>(COMMENTS_ENDPOINT, commentData);
    return CommentUtils.fromDto(commentDto);
  }

  // Delete a comment
  async deleteComment(commentId: number): Promise<void> {
    await this.delete<void>(`${COMMENTS_ENDPOINT}/${commentId}`);
  }
}

// Export singleton instance
export const commentApi = new CommentApiClient();

// Export helper functions for use in components
export async function fetchCommentsForRequest(requestId: number): Promise<RequestComment[]> {
  try {
    return await commentApi.getCommentsByRequestId(requestId);
  } catch (error) {
    console.error('Failed to fetch comments for request:', requestId, error);
    throw error;
  }
}

export async function createCommentForRequest(
  requestId: number,
  comment: string,
  commentType: string,
  commenterId: number,
  mentionedStaffIds?: number[]
): Promise<RequestComment> {
  try {
    const createData: CreateCommentDto = {
      requestId,
      comment,
      commentType,
      commenterId,
      mentionedStaffIds,
    };
    return await commentApi.createComment(createData);
  } catch (error) {
    console.error('Failed to create comment:', error);
    throw error;
  }
}

export async function deleteComment(commentId: number): Promise<void> {
  try {
    await commentApi.deleteComment(commentId);
  } catch (error) {
    console.error('Failed to delete comment:', error);
    throw error;
  }
}
