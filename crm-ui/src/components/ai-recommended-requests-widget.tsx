"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  AlertTriangle,
  ChevronRight,
  Sparkles,
  User,
  Clock
} from "lucide-react";
import { useAIRecommendedRequests } from "@/hooks/use-ai-recommended-requests";
import { SeniorRequestDto } from "@/types/request";
import { useCurrentUser } from "@/contexts/user-context";
import { cn } from "@/lib/utils";

interface AIRecommendedRequestsWidgetProps {
  className?: string;
  maxItems?: number;
  showTitle?: boolean;
  compact?: boolean;
  showAllRequests?: boolean;
  onViewAll?: () => void;
}

/**
 * Compact AI Recommended Requests widget for dashboard or sidebar integration
 */
export function AIRecommendedRequestsWidget({
  className,
  maxItems = 5,
  showTitle = true,
  compact = false,
  showAllRequests = false,
  onViewAll
}: AIRecommendedRequestsWidgetProps) {
  const {
    recommendations,
    loading,
    error,
    hasRecommendations,
    fetchAllAIRecommendedRequests,
    fetchMyAIRecommendedRequests,
    refresh,
  } = useAIRecommendedRequests();

  const { currentUser } = useCurrentUser();
  const [expanded, setExpanded] = useState(false);

  // Auto-fetch on mount
  useEffect(() => {
    if (currentUser) {
      if (showAllRequests && currentUser.role === 'ADMIN') {
        fetchAllAIRecommendedRequests();
      } else {
        fetchMyAIRecommendedRequests();
      }
    }
  }, [currentUser, showAllRequests, fetchAllAIRecommendedRequests, fetchMyAIRecommendedRequests]);

  const displayedRecommendations = expanded ? recommendations : recommendations.slice(0, maxItems);

  const getQuickStats = () => {
    const total = recommendations.length;
    const highPriority = recommendations.filter(r => r.priority >= 4).length;
    const urgent = recommendations.filter(r => r.priority === 5).length;
    const completed = recommendations.filter(r => r.status === 'COMPLETED').length;

    return { total, highPriority, urgent, completed };
  };

  const stats = getQuickStats();

  const handleRefresh = () => {
    // Use the new refresh method that forces a fresh API call
    refresh();
  };

  if (!hasRecommendations && !loading && !error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              AI Recommended Requests
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Get AI-ranked priority requests
            </p>
            <Button
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="h-7 text-xs"
            >
              Get Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      {showTitle && (
        <CardHeader className={cn("pb-3", compact && "py-3")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <CardTitle className={cn("text-sm font-medium", compact && "text-xs")}>
                {showAllRequests ? "All AI Recommendations" : "My AI Recommendations"}
              </CardTitle>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                <Sparkles className="h-2 w-2 mr-1" />
                {stats.total}
              </Badge>
            </div>
            
            {onViewAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewAll}
                className="h-6 w-6 p-0"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className={cn("pt-0", compact && "p-3")}>
        {error && (
          <div className="text-center py-2">
            <AlertTriangle className="h-4 w-4 text-red-500 mx-auto mb-1" />
            <p className="text-xs text-red-600">Failed to load recommendations</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-6 text-xs mt-1"
            >
              Retry
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <Brain className="h-6 w-6 text-purple-600 animate-pulse mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading...</p>
          </div>
        )}

        {hasRecommendations && (
          <div className="space-y-3">
            {/* Quick Stats */}
            {!compact && (
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{stats.total}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{stats.highPriority}</div>
                  <div className="text-xs text-gray-500">High</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{stats.urgent}</div>
                  <div className="text-xs text-gray-500">Urgent</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{stats.completed}</div>
                  <div className="text-xs text-gray-500">Done</div>
                </div>
              </div>
            )}

            {/* Recommendations List */}
            <ScrollArea className={cn("space-y-2", compact ? "max-h-40" : "max-h-60")}>
              <div className="space-y-2">
                {displayedRecommendations.map((request, index) => (
                  <AIRecommendedRequestItem
                    key={request.id}
                    request={request}
                    rank={index + 1}
                    compact={compact}
                  />
                ))}
              </div>
            </ScrollArea>

            {/* Show More */}
            {recommendations.length > maxItems && (
              <div className="text-center pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="h-6 text-xs"
                >
                  {expanded ? 'Show Less' : `+${recommendations.length - maxItems} more`}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AIRecommendedRequestItemProps {
  request: SeniorRequestDto;
  rank: number;
  compact?: boolean;
}

function AIRecommendedRequestItem({ 
  request, 
  rank, 
  compact = false 
}: AIRecommendedRequestItemProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <TrendingUp className="h-3 w-3 text-yellow-600" />;
    if (rank === 2) return <Zap className="h-3 w-3 text-orange-600" />;
    if (rank === 3) return <AlertTriangle className="h-3 w-3 text-red-600" />;
    return <span className="text-xs font-medium text-gray-500">#{rank}</span>;
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 5) return 'text-red-600 bg-red-50 border-red-200';
    if (priority >= 4) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (priority >= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-50 border-green-200';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'TODO': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={cn(
      "flex items-start gap-2 p-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors",
      compact && "p-1"
    )}>
      <div className="flex-shrink-0 mt-0.5">
        {getRankIcon(rank)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-1">
          <span className={cn("text-xs font-medium text-gray-900", compact && "text-xs")}>
            {request.title || `Request #${request.id}`}
          </span>
          
          <Badge 
            variant="outline" 
            className={cn("text-xs h-4 px-1", getPriorityColor(request.priority))}
          >
            P{request.priority}
          </Badge>
          
          <Badge 
            variant="outline" 
            className={cn("text-xs h-4 px-1", getStatusColor(request.status))}
          >
            {request.status === 'IN_PROGRESS' ? 'IN PROGRESS' : request.status}
          </Badge>
        </div>
        
        {!compact && request.description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {request.description}
          </p>
        )}
        
        <div className="flex items-center gap-2 mt-1">
          {request.assignedStaffName && (
            <div className="flex items-center gap-1">
              <User className="h-2 w-2 text-gray-400" />
              <span className="text-xs text-gray-400">{request.assignedStaffName}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Clock className="h-2 w-2 text-gray-400" />
            <span className="text-xs text-gray-400">
              {new Date(request.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
