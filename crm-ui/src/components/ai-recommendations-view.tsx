"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Brain, 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  MessageSquare,
  Loader2,
  Target,
  Star,
  FileText
} from "lucide-react";
import { SeniorRequestDto } from "@/types/request";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface AIRecommendationsViewProps {
  className?: string;
  showBatchProcessing?: boolean;
  showPriorityRanking?: boolean;
  maxDisplayItems?: number;
}

export function AIRecommendationsView({ 
  className,
  showBatchProcessing = true,
  showPriorityRanking = true,
  maxDisplayItems = 10 
}: AIRecommendationsViewProps) {
  const {
    recommendations,
    loading,
    error,
    hasRecommendations,
    fetchRecommendations,
    generateRecommendationsForRequests,
    processBatchRecommendations,
    rankTaskPriorities,
    clearRecommendations,
    clearError,
    refreshRecommendation,
    getProcessingStatus,
  } = useAIRecommendations();

  const [showAll, setShowAll] = useState(false);
  const [selectedRequestIds, setSelectedRequestIds] = useState<number[]>([]);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [priorityRanking, setPriorityRanking] = useState(false);

  // Load existing recommendations when component mounts
  useEffect(() => {
    console.log('🔄 AIRecommendationsView: Component mounted, fetching existing recommendations');
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Sort recommendations by priority and urgency
  const sortedRecommendations = AIRecommendationUtils.sortRecommendations(recommendations);
  const displayedRecommendations = showAll ? sortedRecommendations : sortedRecommendations.slice(0, maxDisplayItems);

  const handleGetRecommendations = async () => {
    // Changed: Instead of fetching cached recommendations, 
    // we'll generate recommendations for existing senior requests
    console.log('🚀 Generating new AI recommendations...');
    
    try {
      // First, get actual request IDs from the backend
      console.log('📋 Fetching existing senior requests...');
      const { requestManagementApiService } = await import('@/services/request-api');
      const requests = await requestManagementApiService.getRequests();
      
      if (requests.length === 0) {
        toast({
          title: "No requests found",
          description: "No senior requests found. Please create some requests first before generating AI recommendations.",
          variant: "destructive"
        });
        return;
      }

      // Take first 10 requests for demo (or all if less than 10)
      const requestIds = requests.slice(0, 10).map((req: SeniorRequestDto) => req.id);
      console.log('📝 Generating recommendations for', requestIds.length, 'request IDs:', requestIds);
      
      await generateRecommendationsForRequests(requestIds);
      
    } catch (error) {
      console.error('❌ Failed to generate recommendations:', error);
      toast({
        title: "Failed to generate recommendations",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    }
  };

  const handleRefresh = async () => {
    await fetchRecommendations();
  };

  const handleClear = () => {
    clearRecommendations();
    setShowAll(false);
    setSelectedRequestIds([]);
  };

  const handleBatchProcess = async () => {
    if (selectedRequestIds.length === 0) return;
    
    setBatchProcessing(true);
    try {
      await processBatchRecommendations(selectedRequestIds, true);
      setSelectedRequestIds([]);
    } finally {
      setBatchProcessing(false);
    }
  };

  const handlePriorityRanking = async () => {
    if (selectedRequestIds.length === 0) return;
    
    setPriorityRanking(true);
    try {
      await rankTaskPriorities(selectedRequestIds);
    } finally {
      setPriorityRanking(false);
    }
  };

  const handleSelectRequest = (requestId: number, selected: boolean) => {
    if (selected) {
      setSelectedRequestIds(prev => [...prev, requestId]);
    } else {
      setSelectedRequestIds(prev => prev.filter(id => id !== requestId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRequestIds(recommendations.map(r => r.requestId));
    } else {
      setSelectedRequestIds([]);
    }
  };

  const getStatistics = () => {
    const total = recommendations.length;
    const completed = recommendations.filter(r => r.status === 'COMPLETED').length;
    const processing = recommendations.filter(r => r.status === 'PROCESSING').length;
    const pending = recommendations.filter(r => r.status === 'PENDING').length;
    const failed = recommendations.filter(r => r.status === 'FAILED').length;
    
    const highPriority = recommendations.filter(r => (r.priorityScore || 0) >= 80).length;
    const mediumPriority = recommendations.filter(r => (r.priorityScore || 0) >= 50 && (r.priorityScore || 0) < 80).length;
    const lowPriority = recommendations.filter(r => (r.priorityScore || 0) < 50).length;

    const critical = recommendations.filter(r => r.urgencyLevel === 'CRITICAL').length;
    const high = recommendations.filter(r => r.urgencyLevel === 'HIGH').length;
    const medium = recommendations.filter(r => r.urgencyLevel === 'MEDIUM').length;
    const low = recommendations.filter(r => r.urgencyLevel === 'LOW').length;

    return {
      total,
      status: { completed, processing, pending, failed },
      priority: { high: highPriority, medium: mediumPriority, low: lowPriority },
      urgency: { critical, high, medium, low }
    };
  };

  const stats = getStatistics();

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <CardTitle className="text-xl font-semibold">
              AI Recommendations
            </CardTitle>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Sparkles className="h-3 w-3 mr-1" />
              Smart Analysis
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
          AI-powered analysis and recommendations with priority scoring and urgency assessment.
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
              Generate AI Recommendations
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Generate intelligent AI recommendations with priority scoring and urgency assessment for existing senior requests.
            </p>
            <Button
              onClick={handleGetRecommendations}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Generate AI Recommendations
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-purple-600 animate-pulse" />
            </div>
            <p className="text-gray-600">
              AI is analyzing requests and generating recommendations...
            </p>
          </div>
        )}

        {hasRecommendations && (
          <div className="space-y-6">
            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
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
                      <p className="text-2xl font-bold text-green-700">{stats.status.completed}</p>
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
                      <p className="text-2xl font-bold text-orange-700">{stats.priority.high}</p>
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
                      <p className="text-2xl font-bold text-red-700">{stats.urgency.critical}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Batch Operations */}
            {showBatchProcessing && (
              <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Batch Operations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Checkbox
                      id="select-all"
                      checked={selectedRequestIds.length === recommendations.length && recommendations.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                      Select All ({selectedRequestIds.length} selected)
                    </label>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleBatchProcess}
                      disabled={selectedRequestIds.length === 0 || batchProcessing}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {batchProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                      Process Batch ({selectedRequestIds.length})
                    </Button>
                    
                    {showPriorityRanking && (
                      <Button
                        onClick={handlePriorityRanking}
                        disabled={selectedRequestIds.length === 0 || priorityRanking}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {priorityRanking ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <BarChart3 className="h-4 w-4" />
                        )}
                        Rank Priorities
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Recommendations ({recommendations.length})
                </h3>
                {recommendations.length > maxDisplayItems && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? 'Show Less' : `Show All (${recommendations.length})`}
                  </Button>
                )}
              </div>

              <ScrollArea className="max-h-[800px]">
                <div className="space-y-4">
                  {displayedRecommendations.map((recommendation, index) => (
                    <AIRecommendationCard
                      key={recommendation.id}
                      recommendation={recommendation}
                      rank={index + 1}
                      isSelected={selectedRequestIds.includes(recommendation.requestId)}
                      onSelect={(selected) => handleSelectRequest(recommendation.requestId, selected)}
                      onRefresh={() => refreshRecommendation(recommendation.requestId)}
                      processingStatus={getProcessingStatus(recommendation.requestId)}
                      showBatchSelect={showBatchProcessing}
                    />
                  ))}
                </div>
              </ScrollArea>

              {!showAll && recommendations.length > maxDisplayItems && (
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500">
                    Showing top {maxDisplayItems} of {recommendations.length} recommendations
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

interface AIRecommendationCardProps {
  recommendation: AIRecommendationDto;
  rank: number;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onRefresh?: () => void;
  processingStatus?: AIRecommendationProcessingStatus | null;
  showBatchSelect?: boolean;
}

function AIRecommendationCard({
  recommendation,
  rank,
  isSelected,
  onSelect,
  onRefresh,
  processingStatus,
  showBatchSelect = false
}: AIRecommendationCardProps) {
  const getRankBadgeColor = (rank: number) => {
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
      "border-l-blue-500 bg-gradient-to-r from-blue-50 to-purple-50",
      isSelected && "ring-2 ring-blue-500 ring-offset-2"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {showBatchSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
              />
            )}
            
            <Badge className={cn("flex items-center gap-1 text-xs", getRankBadgeColor(rank))}>
              <Star className="h-3 w-3" />
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
          
          <div className="flex items-center gap-2">
            {recommendation.priorityScore && (
              <Badge 
                variant="outline" 
                className={cn("text-xs", AIRecommendationUtils.getPriorityScoreColor(recommendation.priorityScore))}
              >
                {AIRecommendationUtils.formatPriorityScore(recommendation.priorityScore)}
              </Badge>
            )}
            
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText className="h-4 w-4" />
          <span>Request #{recommendation.requestId}</span>
          {recommendation.userId && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <span>User #{recommendation.userId}</span>
            </>
          )}
        </div>

        {recommendation.recommendationText && (
          <div className="bg-white/70 rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">AI Recommendation</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {recommendation.recommendationText}
            </p>
          </div>
        )}

        {recommendation.priorityReason && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Priority Analysis</span>
            </div>
            <p className="text-sm text-blue-700">
              {recommendation.priorityReason}
            </p>
          </div>
        )}

        {processingStatus?.status === 'processing' && (
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
              <span className="text-sm text-yellow-800">Processing...</span>
            </div>
            {processingStatus.startedAt && (
              <p className="text-xs text-yellow-600 mt-1">
                Started: {processingStatus.startedAt.toLocaleTimeString()}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Created: {new Date(recommendation.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Updated: {new Date(recommendation.updatedAt).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
