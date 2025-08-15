"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Zap,
  BarChart3
} from "lucide-react";
import { useAIRecommendations } from "@/hooks/use-ai-recommendations";
import { AIRecommendationUtils } from "@/types/ai-recommendations";
import { AIRecommendationsView } from "@/components/ai-recommendations-view";
import { cn } from "@/lib/utils";

interface AIRecommendationsProps {
  className?: string;
  showAdvancedFeatures?: boolean;
}

/**
 * Main AI Recommendations component - wrapper around the new AIRecommendationsView
 * Maintains backward compatibility while providing access to new features
 */
export function AIRecommendations({ 
  className, 
  showAdvancedFeatures = true 
}: AIRecommendationsProps) {
  const {
    recommendations,
    loading,
    error,
    hasRecommendations,
    fetchRecommendations,
    clearRecommendations,
    clearError,
  } = useAIRecommendations();

  // For backward compatibility, provide a simplified interface
  const [showNewInterface, setShowNewInterface] = useState(false);
  const [showAll, setShowAll] = useState(false);

  if (showNewInterface || showAdvancedFeatures) {
    return (
      <AIRecommendationsView 
        className={className}
        showBatchProcessing={showAdvancedFeatures}
        showPriorityRanking={showAdvancedFeatures}
      />
    );
  }

  // Legacy interface for backward compatibility
  const sortedRecommendations = AIRecommendationUtils.sortRecommendations(recommendations);
  const displayedRecommendations = showAll ? sortedRecommendations : sortedRecommendations.slice(0, 5);

  const handleGetRecommendations = async () => {
    await fetchRecommendations();
  };

  const handleRefresh = async () => {
    await fetchRecommendations();
  };

  const handleClear = () => {
    clearRecommendations();
    setShowAll(false);
  };

  const getStatistics = () => {
    const total = recommendations.length;
    const completed = recommendations.filter(r => r.status === 'COMPLETED').length;
    const highPriority = recommendations.filter(r => (r.priorityScore || 0) >= 80).length;
    const critical = recommendations.filter(r => r.urgencyLevel === 'CRITICAL').length;

    return { total, completed, highPriority, critical };
  };

  const stats = getStatistics();

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <CardTitle className="text-xl font-semibold">
              AI Task Recommendations
            </CardTitle>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Sparkles className="h-3 w-3 mr-1" />
              Smart Priority
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {hasRecommendations && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  disabled={loading}
                >
                  Clear
                </Button>
                {showAdvancedFeatures && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewInterface(true)}
                    className="flex items-center gap-1"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Advanced
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600">
          AI-powered task recommendations based on priority, urgency, and your workflow patterns.
        </p>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={clearError}
                className="ml-2"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!hasRecommendations && !loading && (
          <div className="text-center py-8">
            <div className="mx-auto w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Brain className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Get AI-Powered Task Recommendations
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Let our AI analyze your tasks and suggest the most important ones to focus on based on priority, deadlines, and your work patterns.
            </p>
            <div className="space-y-2">
              <Button
                onClick={handleGetRecommendations}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Get Recommended Tasks
              </Button>
              {showAdvancedFeatures && (
                <div>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewInterface(true)}
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Try Advanced Features
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-purple-600 animate-pulse" />
            </div>
            <p className="text-gray-600">
              AI is analyzing your tasks and generating recommendations...
            </p>
          </div>
        )}

        {hasRecommendations && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-purple-700">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">High Priority</p>
                      <p className="text-2xl font-bold text-orange-700">{stats.highPriority}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Critical</p>
                      <p className="text-2xl font-bold text-red-700">{stats.critical}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recommended Tasks
                </h3>
                <div className="flex items-center gap-2">
                  {recommendations.length > 5 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAll(!showAll)}
                    >
                      {showAll ? 'Show Less' : `Show All (${recommendations.length})`}
                    </Button>
                  )}
                  {showAdvancedFeatures && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewInterface(true)}
                      className="flex items-center gap-1"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Advanced View
                    </Button>
                  )}
                </div>
              </div>

              <ScrollArea className="max-h-[600px]">
                <div className="space-y-3">
                  {displayedRecommendations.map((recommendation, index) => (
                    <LegacyRecommendationCard
                      key={recommendation.id}
                      recommendation={recommendation}
                      rank={index + 1}
                    />
                  ))}
                </div>
              </ScrollArea>

              {!showAll && recommendations.length > 5 && (
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500">
                    Showing top 5 of {recommendations.length} recommendations
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Simple legacy card component for backward compatibility
interface LegacyRecommendationCardProps {
  recommendation: import("@/types/ai-recommendations").AIRecommendationDto;
  rank: number;
}

function LegacyRecommendationCard({ recommendation, rank }: LegacyRecommendationCardProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800";
    if (rank === 3) return "bg-gradient-to-r from-orange-300 to-orange-400 text-orange-900";
    return "bg-gradient-to-r from-blue-500 to-purple-500 text-white";
  };

  return (
    <Card className={cn(
      "border-l-4 transition-all duration-200",
      rank === 1 ? "border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50" :
      rank === 2 ? "border-l-gray-400 bg-gradient-to-r from-gray-50 to-gray-100" :
      rank === 3 ? "border-l-orange-400 bg-gradient-to-r from-orange-50 to-orange-100" :
      "border-l-blue-500 bg-gradient-to-r from-blue-50 to-purple-50"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className={cn("flex items-center gap-1 text-xs", getRankColor(rank))}>
              <TrendingUp className="h-3 w-3" />
              #{rank}
            </Badge>
            
            <Badge 
              variant="outline" 
              className={cn("text-xs", AIRecommendationUtils.getStatusColor(recommendation.status))}
            >
              {recommendation.status}
            </Badge>
            
            {recommendation.urgencyLevel && (
              <Badge 
                variant="outline" 
                className={cn("text-xs", AIRecommendationUtils.getUrgencyColor(recommendation.urgencyLevel))}
              >
                {AIRecommendationUtils.formatUrgencyLevel(recommendation.urgencyLevel)}
              </Badge>
            )}
          </div>
          
          {recommendation.priorityScore && (
            <Badge 
              variant="outline" 
              className={cn("text-xs", AIRecommendationUtils.getPriorityScoreColor(recommendation.priorityScore))}
            >
              {AIRecommendationUtils.formatPriorityScore(recommendation.priorityScore)}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-900">
            Request #{recommendation.requestId}
          </div>
          
          {recommendation.recommendationText && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {recommendation.recommendationText}
            </p>
          )}
          
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(recommendation.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
