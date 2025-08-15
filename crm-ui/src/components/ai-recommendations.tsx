"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Clock
} from "lucide-react";
import { useAIRecommendations } from "@/hooks/use-ai-recommendations";
import { RecommendedRequestCard } from "@/components/recommended-request-card";
import { ErrorMessageCallout } from "@/components/error-message-callout";
import { cn } from "@/lib/utils";

interface AIRecommendationsProps {
  className?: string;
}

export function AIRecommendations({ className }: AIRecommendationsProps) {
  const {
    recommendations,
    loading,
    error,
    hasRecommendations,
    fetchRecommendations,
    clearRecommendations,
    clearError,
  } = useAIRecommendations();

  const [showAll, setShowAll] = useState(false);

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

  const displayedRecommendations = showAll ? recommendations : recommendations.slice(0, 5);

  const getStatusStats = () => {
    const stats = recommendations.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { label: 'To Do', count: stats.TODO || 0, color: 'text-gray-600' },
      { label: 'In Progress', count: stats.IN_PROGRESS || 0, color: 'text-blue-600' },
      { label: 'Completed', count: stats.COMPLETED || 0, color: 'text-green-600' },
    ];
  };

  const getPriorityStats = () => {
    const highPriority = recommendations.filter(req => req.priority >= 4).length;
    const mediumPriority = recommendations.filter(req => req.priority === 3).length;
    const lowPriority = recommendations.filter(req => req.priority <= 2).length;

    return [
      { label: 'High Priority', count: highPriority, color: 'text-red-600' },
      { label: 'Medium Priority', count: mediumPriority, color: 'text-orange-600' },
      { label: 'Low Priority', count: lowPriority, color: 'text-green-600' },
    ];
  };

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
          <div className="mb-4">
            <ErrorMessageCallout
              errorHeader="AI Recommendations Error"
              errorMessage={`Failed to load AI recommendations: ${error}. Please try again or refresh the recommendations.`}
            />
            <div className="flex justify-end mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearError}
              >
                Dismiss
              </Button>
            </div>
          </div>
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
            <Button
              onClick={handleGetRecommendations}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Get Recommended Tasks
            </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Recommendations</p>
                      <p className="text-2xl font-bold text-purple-700">{recommendations.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">High Priority</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {recommendations.filter(req => req.priority >= 4).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ready to Start</p>
                      <p className="text-2xl font-bold text-green-700">
                        {recommendations.filter(req => req.status === 'TODO').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status and Priority Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Status Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {getStatusStats().map((stat) => (
                      <div key={stat.label} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{stat.label}</span>
                        <span className={cn("text-sm font-medium", stat.color)}>
                          {stat.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Priority Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {getPriorityStats().map((stat) => (
                      <div key={stat.label} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{stat.label}</span>
                        <span className={cn("text-sm font-medium", stat.color)}>
                          {stat.count}
                        </span>
                      </div>
                    ))}
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
                {recommendations.length > 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? 'Show Less' : `Show All (${recommendations.length})`}
                  </Button>
                )}
              </div>

              <ScrollArea className="max-h-[600px]">
                <div className="space-y-3">
                  {displayedRecommendations.map((request, index) => (
                    <RecommendedRequestCard
                      key={request.id}
                      request={request}
                      rank={index + 1}
                      onView={(request) => {
                        console.log('Viewing recommended request:', request);
                      }}
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
