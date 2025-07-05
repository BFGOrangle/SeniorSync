import { useState, useEffect, useCallback } from 'react';
import { 
  RequestComment, 
  CreateCommentDto, 
  CommentType,
  CommentUtils 
} from '@/types/comment';
import {
  commentApi,
  fetchCommentsForRequest,
  createCommentForRequest,
  deleteComment as deleteCommentApi,
  CommentApiError,
  CommentValidationError
} from '@/services/comment-api';

interface UseCommentsOptions {
  requestId?: number;
  autoFetch?: boolean;
}

interface UseCommentsReturn {
  comments: RequestComment[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchComments: () => Promise<void>;
  createComment: (comment: string, commentType: CommentType, commenterId: number) => Promise<RequestComment>;
  deleteComment: (commentId: number) => Promise<void>;
  
  // Local state management (for UI optimizations)
  addCommentLocally: (comment: RequestComment) => void;
  removeCommentLocally: (commentId: number) => void;
  
  // Utility functions
  clearError: () => void;
  refresh: () => Promise<void>;
}

export function useComments({ 
  requestId, 
  autoFetch = true 
}: UseCommentsOptions = {}): UseCommentsReturn {
  const [comments, setComments] = useState<RequestComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments from the API
  const fetchComments = useCallback(async () => {
    if (!requestId) {
      setComments([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedComments = await fetchCommentsForRequest(requestId);
      // Sort comments by creation date (newest first)
      const sortedComments = fetchedComments.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setComments(sortedComments);
    } catch (err) {
      const errorMessage = err instanceof CommentApiError 
        ? err.errors.map(e => e.message).join(', ')
        : 'Failed to fetch comments';
      setError(errorMessage);
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  // Create a new comment
  const createComment = useCallback(async (
    comment: string,
    commentType: CommentType,
    commenterId: number
  ): Promise<RequestComment> => {
    if (!requestId) {
      throw new Error('Request ID is required to create a comment');
    }

    setError(null);
    
    try {
      const newComment = await createCommentForRequest(requestId, comment, commentType, commenterId);
      
      // Add to local state (at the beginning since we sort by newest first)
      setComments(prev => [newComment, ...prev]);
      
      return newComment;
    } catch (err) {
      const errorMessage = err instanceof CommentValidationError
        ? err.validationErrors.map(e => `${e.field}: ${e.message}`).join(', ')
        : err instanceof CommentApiError
        ? err.errors.map(e => e.message).join(', ')
        : 'Failed to create comment';
      setError(errorMessage);
      throw err;
    }
  }, [requestId]);

  // Delete a comment
  const deleteComment = useCallback(async (commentId: number): Promise<void> => {
    setError(null);
    
    try {
      await deleteCommentApi(commentId);
      
      // Update local state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      const errorMessage = err instanceof CommentApiError
        ? err.errors.map(e => e.message).join(', ')
        : 'Failed to delete comment';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Local state management functions (for optimistic updates)
  const addCommentLocally = useCallback((comment: RequestComment) => {
    setComments(prev => [comment, ...prev]);
  }, []);

  const removeCommentLocally = useCallback((commentId: number) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  }, []);

  // Utility functions
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    await fetchComments();
  }, [fetchComments]);

  // Auto-fetch on mount and when requestId changes
  useEffect(() => {
    if (autoFetch && requestId) {
      fetchComments();
    }
  }, [autoFetch, requestId, fetchComments]);

  return {
    comments,
    isLoading,
    error,
    
    // Actions
    fetchComments,
    createComment,
    deleteComment,
    
    // Local state management
    addCommentLocally,
    removeCommentLocally,
    
    // Utility functions
    clearError,
    refresh,
  };
}

// Helper hook for managing comments in a request context
export function useRequestComments(requestId: number) {
  return useComments({ 
    requestId, 
    autoFetch: true 
  });
}
