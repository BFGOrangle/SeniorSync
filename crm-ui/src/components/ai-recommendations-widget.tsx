"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from "lucide-react";
import { useAIRecommendedRequests } from "@/hooks/use-ai-recommended-requests";
import { cn } from "@/lib/utils";

interface AIRecommendationsWidgetProps {
  className?: string;
  maxItems?: number;
  showTitle?: boolean;
  compact?: boolean;
  showAllRequests?: boolean;
  onViewAll?: () => void;
}

/**
 * Compact AI Recommendations widget for dashboard or sidebar integration
 */
export function AIRecommendationsWidget({
  className,
  maxItems = 5,
  showTitle = true,
  compact = false,
  showAllRequests = false,
  onViewAll
}: AIRecommendationsWidgetProps) {
  const {
    recommendations,
    loading,
    error,
    hasRecommendations,
    fetchAllAIRecommendedRequests,
    fetchMyAIRecommendedRequests,
  } = useAIRecommendedRequests();

  // Replace expanded state with pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Track previous showAllRequests value to detect changes
  const [prevShowAllRequests, setPrevShowAllRequests] = useState(showAllRequests);
  
  // Ref for scroll area to control scroll position
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-fetch when component mounts or showAllRequests changes
  useEffect(() => {
    // Force refresh if showAllRequests prop has changed
    const forceRefresh = prevShowAllRequests !== showAllRequests;
    
    if (showAllRequests) {
      fetchAllAIRecommendedRequests(undefined, forceRefresh);
    } else {
      fetchMyAIRecommendedRequests(undefined, forceRefresh);
    }
    
    // Update the previous value
    setPrevShowAllRequests(showAllRequests);
  }, [showAllRequests, fetchAllAIRecommendedRequests, fetchMyAIRecommendedRequests, prevShowAllRequests]);
  
  // Calculate pagination - force maxItems to be 5
  const itemsPerPage = 5;
  const totalItems = recommendations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedRecommendations = recommendations.slice(startIndex, endIndex);

  // Add pagination handlers with scroll reset
  const handlePreviousPage = () => {
    setCurrentPage(prev => {
      const newPage = Math.max(prev - 1, 1);
      // Reset scroll to top after state update
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (viewport) {
            viewport.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }, 0);
      return newPage;
    });
  };

  const handleNextPage = () => {
    setCurrentPage(prev => {
      const newPage = Math.min(prev + 1, totalPages);
      // Reset scroll to top after state update
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (viewport) {
            viewport.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }, 0);
      return newPage;
    });
  };

  // Reset to first page when recommendations change
  useEffect(() => {
    setCurrentPage(1);
    // Reset scroll when data changes
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [recommendations]);

  const getQuickStats = () => {
    const total = recommendations.length;
    const highPriority = recommendations.filter((r) => r.priority >= 4).length; // High priority: 4-5
    const mediumPriority = recommendations.filter((r) => r.priority === 3).length;
    const completed = recommendations.filter((r) => r.status === 'COMPLETED').length;

    return { total, highPriority, mediumPriority, completed };
  };

  const stats = getQuickStats();

  if (!hasRecommendations && !loading && !error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              AI Recommendations
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Get intelligent task recommendations
            </p>
            <Button
              size="sm"
              onClick={() => showAllRequests ? fetchAllAIRecommendedRequests() : fetchMyAIRecommendedRequests()}
              disabled={loading}
              className="h-7 text-xs"
            >
              Generate Recommendations
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
                  <div className="text-lg font-bold text-yellow-600">{stats.mediumPriority}</div>
                  <div className="text-xs text-gray-500">Medium</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{stats.completed}</div>
                  <div className="text-xs text-gray-500">Done</div>
                </div>
              </div>
            )}

            {/* Recommendations List */}
            <ScrollArea className={cn("w-full", compact ? "h-40" : "h-60")} ref={scrollAreaRef}>
              <div className="space-y-2 pr-3">
                {displayedRecommendations.map((recommendation, index) => (
                  <AIRecommendationItem
                    key={recommendation.id}
                    recommendation={recommendation}
                    rank={startIndex + index + 1}
                    compact={compact}
                  />
                ))}
              </div>
            </ScrollArea>

            {/* Pagination Controls - Replace the old "Show More" section */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="h-7 px-2 text-xs"
                  >
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    Previous
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="h-7 px-2 text-xs"
                  >
                    Next
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>Page {currentPage} of {totalPages}</span>
                  <span className="text-gray-400">•</span>
                  <span>{startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AIRecommendationItemProps {
  recommendation: import("@/types/request").SeniorRequestDto;
  rank: number;
  compact?: boolean;
}

function AIRecommendationItem({ 
  recommendation, 
  rank, 
  compact = false 
}: AIRecommendationItemProps) {
  const getRankIcon = (rank: number) => {
    return (
      <span className="text-xs font-bold text-gray-700 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center">
        {rank}
      </span>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-50';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-50';
      case 'TODO': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
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
            Request #{recommendation.id}
          </span>
          
          <Badge variant="outline" className="text-xs h-4 px-1">
            Priority {recommendation.priority}
          </Badge>
        </div>
        
        {!compact && recommendation.description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {recommendation.description}
          </p>
        )}
        
        <div className="flex items-center gap-1 mt-1">
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs h-4 px-1",
              getStatusColor(recommendation.status)
            )}
          >
            {recommendation.status}
          </Badge>
          
          <span className="text-xs text-gray-400">
            {new Date(recommendation.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
