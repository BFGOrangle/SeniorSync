import {
  RequestCommentDto,
  CreateCommentDto,
  RequestComment,
  CommentUtils
} from '@/types/comment';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088';
const COMMENTS_ENDPOINT = `${API_BASE_URL}/api/comments`;

// Custom error classes
export class CommentApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public errors: Array<{ message: string; timestamp: string; field?: string; rejectedValue?: any }> = []
  ) {
    super(`Comment API Error: ${status} ${statusText}`);
    this.name = 'CommentApiError';
  }
}

export class CommentValidationError extends CommentApiError {
  constructor(public validationErrors: Array<{ message: string; field: string; rejectedValue?: any; timestamp: string }>) {
    super(400, 'Validation Error', validationErrors);
    this.name = 'CommentValidationError';
  }
}

// HTTP client for comment management
class CommentApiClient {
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
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

      // Handle empty responses
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof CommentApiError) {
        throw error;
      }
      
      // Handle network errors and other unexpected errors
      throw new CommentApiError(
        0,
        'Network Error',
        [{ message: error instanceof Error ? error.message : 'Network request failed', timestamp: new Date().toISOString() }]
      );
    }
  }

  // Get comments for a specific request
  async getCommentsByRequestId(requestId: number): Promise<RequestComment[]> {
    const commentDtos = await this.request<RequestCommentDto[]>(`${COMMENTS_ENDPOINT}/${requestId}`);
    return commentDtos.map(dto => CommentUtils.fromDto(dto));
  }

  // Create a new comment
  async createComment(commentData: CreateCommentDto): Promise<RequestComment> {
    const commentDto = await this.request<RequestCommentDto>(COMMENTS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
    return CommentUtils.fromDto(commentDto);
  }

  // Delete a comment
  async deleteComment(commentId: number): Promise<void> {
    await this.request<void>(`${COMMENTS_ENDPOINT}/${commentId}`, {
      method: 'DELETE',
    });
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
  commenterId: number
): Promise<RequestComment> {
  try {
    const createData: CreateCommentDto = {
      requestId,
      comment,
      commentType,
      commenterId,
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
