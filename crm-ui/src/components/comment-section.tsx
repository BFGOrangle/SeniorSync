import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertCircle,
  MessageCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Lock,
  Plus,
  Trash2,
  X,
  Send,
} from "lucide-react";
import { RequestComment, CommentType, CommentUtils, COMMENT_TYPE_CONFIG } from "@/types/comment";
import { useRequestComments } from "@/hooks/use-comments";
import { useCurrentUser } from "@/contexts/user-context";
import { cn } from "@/lib/utils";

interface CommentSectionProps {
  requestId: number;
  className?: string;
}

// Icon mapping for comment types
const iconMap = {
  MessageCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Lock,
};

export function CommentSection({ requestId, className }: CommentSectionProps) {
  const { currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id || 1; // Fallback to 1 if no user
  const {
    comments,
    isLoading,
    error,
    createComment,
    deleteComment,
    clearError,
  } = useRequestComments(requestId);

  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [selectedCommentType, setSelectedCommentType] = useState<CommentType>('GENERAL');

  const getCommentIcon = (commentType: CommentType) => {
    const config = COMMENT_TYPE_CONFIG[commentType];
    const IconComponent = iconMap[config.icon as keyof typeof iconMap];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />;
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await createComment(newComment.trim(), selectedCommentType, currentUserId);
      
      // Reset form
      setNewComment("");
      setSelectedCommentType('GENERAL');
      setIsAddingComment(false);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const canDeleteComment = (comment: RequestComment): boolean => {
    // Users can only delete their own comments
    return comment.commenterId === currentUserId;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Comments & Follow-ups</h3>
          <Badge variant="secondary" className="text-xs">
            {comments.length}
          </Badge>
        </div>
        <Button
          size="sm"
          onClick={() => setIsAddingComment(!isAddingComment)}
          className="h-8"
          variant={isAddingComment ? "outline" : "default"}
        >
          {isAddingComment ? "Cancel" : "Add Comment"}
        </Button>
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearError}
            className="ml-auto h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Add comment form */}
      {isAddingComment && (
        <div className="bg-gray-50 p-4 rounded-md border space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Comment Type</label>
            <Select value={selectedCommentType} onValueChange={(value) => setSelectedCommentType(value as CommentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(COMMENT_TYPE_CONFIG).map(([type, config]) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      {getCommentIcon(type as CommentType)}
                      <div className="flex flex-col">
                        <span className="font-medium">{config.label}</span>
                        <span className="text-xs text-gray-500">{config.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Comment</label>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Enter your comment or follow-up action..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAddingComment(false);
                setNewComment("");
                setSelectedCommentType('GENERAL');
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              <Send className="h-4 w-4 mr-1" />
              Add Comment
            </Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          Loading comments...
        </div>
      )}

      {/* Comments list */}
      {!isLoading && comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => {
            const config = CommentUtils.getTypeConfig(comment.commentType);
            
            return (
              <div
                key={comment.id}
                className={cn(
                  "p-4 rounded-md border",
                  config.bgColor,
                  config.borderColor
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(comment.commenterName || `User ${comment.commenterId}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.commenterName || `Staff Member ${comment.commenterId}`}
                      </span>
                      <Badge variant="outline" className={cn("text-xs", config.color)}>
                        <div className="flex items-center gap-1">
                          {getCommentIcon(comment.commentType)}
                          {config.label}
                        </div>
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {CommentUtils.getRelativeTime(comment.createdAt)}
                    </span>
                    {canDeleteComment(comment) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {comment.comment}
                </p>

                <div className="mt-2 text-xs text-gray-500">
                  {CommentUtils.formatTimestamp(comment.createdAt)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No comments yet for this request.</p>
            <p className="text-xs mt-1">
              Add a comment to track progress or follow-up actions.
            </p>
          </div>
        )
      )}
    </div>
  );
}
