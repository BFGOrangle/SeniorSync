"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Zap,
  User,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAIRecommendedRequests } from "@/hooks/use-ai-recommended-requests";
import { SeniorRequestDto, RequestUtils } from "@/types/request";
import { useCurrentUser } from "@/contexts/user-context";
import { cn } from "@/lib/utils";

interface AIRecommendedRequestsProps {
  className?: string;
  showAllRequests?: boolean; // If true, shows all requests, if false shows only user's requests
}

/**
 * New AI Recommended Requests component - simplified version matching the new backend
 */
export function AIRecommendedRequests({ 
  className, 
  showAllRequests = false 
}: AIRecommendedRequestsProps) {
  const {
    recommendations,
    loading,
    error,
    hasRecommendations,
    fetchAllAIRecommendedRequests,
    fetchMyAIRecommendedRequests,
    clearRecommendations,
    clearError,
    refresh,
  } = useAIRecommendedRequests();

  const { currentUser } = useCurrentUser();
  const router = useRouter();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Track previous showAllRequests value to detect changes
  const [prevShowAllRequests, setPrevShowAllRequests] = useState(showAllRequests);

  // Determine if user can see all requests (admin/manager)
  const canViewAllRequests = currentUser?.role === 'ADMIN';

  // Auto-fetch on mount and when showAllRequests changes
  useEffect(() => {
    if (currentUser) {
      // Force refresh if showAllRequests prop has changed
      const forceRefresh = prevShowAllRequests !== showAllRequests;
      
      if (showAllRequests && canViewAllRequests) {
        fetchAllAIRecommendedRequests(undefined, forceRefresh);
      } else {
        fetchMyAIRecommendedRequests(undefined, forceRefresh);
      }
      
      // Update the previous value
      setPrevShowAllRequests(showAllRequests);
    }
  }, [currentUser, showAllRequests, canViewAllRequests, fetchAllAIRecommendedRequests, fetchMyAIRecommendedRequests, prevShowAllRequests]);

  // Reset to first page when recommendations change
  useEffect(() => {
    setCurrentPage(1);
  }, [recommendations]);

  const handleRefresh = async () => {
    // Use the new refresh method that forces a fresh API call
    await refresh();
  };

  const handleGetRecommendations = async () => {
    if (showAllRequests && canViewAllRequests) {
      await fetchAllAIRecommendedRequests();
    } else {
      await fetchMyAIRecommendedRequests();
    }
  };

  const handleClear = () => {
    clearRecommendations();
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalItems = recommendations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecommendations = recommendations.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Get statistics
  const getStatistics = () => {
    const total = recommendations.length;
    const completed = recommendations.filter(r => r.status === 'COMPLETED').length;
    const highPriority = recommendations.filter(r => r.priority >= 4).length;
    const urgent = recommendations.filter(r => r.priority === 5).length;

    return { total, completed, highPriority, urgent };
  };

  const stats = getStatistics();

  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <CardTitle className="text-xl font-semibold">
              {showAllRequests ? "All AI Recommended Requests" : "My AI Recommended Requests"}
            </CardTitle>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Ranked
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
          AI-ranked requests based on priority, urgency, and workload distribution.
        </p>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col">
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
              No AI Recommendations Available
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {showAllRequests 
                ? "There are currently no requests in the system to analyze and rank."
                : "You have no requests assigned to you currently. AI recommendations will appear when you have assigned requests."
              }
            </p>
            <Button
              onClick={handleGetRecommendations}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              {showAllRequests ? "Check for New Requests" : "Refresh My Assignments"}
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-purple-600 animate-pulse" />
            </div>
            <p className="text-gray-600">
              AI is analyzing and ranking requests...
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
                      <p className="text-sm font-medium text-gray-600">Urgent</p>
                      <p className="text-2xl font-bold text-red-700">{stats.urgent}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations List */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Ranked Requests
                  {totalItems > 0 && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
                    </span>
                  )}
                </h3>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageClick(page)}
                          className={cn(
                            "w-8 h-8 p-0",
                            currentPage === page && "bg-purple-600 hover:bg-purple-700"
                          )}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3">
                {currentRecommendations.map((request, index) => (
                  <AIRankedRequestCard
                    key={request.id}
                    request={request}
                    rank={startIndex + index + 1}
                    onClick={() => {
                      const basePath = currentUser?.role === 'ADMIN' ? '/admin' : '/staff';
                      router.push(`${basePath}/requests/${request.id}`);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}

// Request card component for AI ranked requests
interface AIRankedRequestCardProps {
  request: SeniorRequestDto;
  rank: number;
  onClick?: () => void;
}

function AIRankedRequestCard({ request, rank, onClick }: AIRankedRequestCardProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800";
    if (rank === 3) return "bg-gradient-to-r from-orange-300 to-orange-400 text-orange-900";
    return "bg-gradient-to-r from-blue-500 to-purple-500 text-white";
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 5) return "text-red-700 bg-red-100 border-red-200";
    if (priority >= 4) return "text-orange-700 bg-orange-100 border-orange-200";
    if (priority >= 3) return "text-yellow-700 bg-yellow-100 border-yellow-200";
    return "text-green-700 bg-green-100 border-green-200";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return "text-green-700 bg-green-100 border-green-200";
      case 'IN_PROGRESS':
        return "text-blue-700 bg-blue-100 border-blue-200";
      case 'TODO':
        return "text-yellow-700 bg-yellow-100 border-yellow-200";
      default:
        return "text-gray-700 bg-gray-100 border-gray-200";
    }
  };

  return (
    <Card 
      className={cn(
        "group border-l-4 transition-colors duration-200 hover:shadow-md cursor-pointer",
        rank === 1 ? "border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50" :
        rank === 2 ? "border-l-gray-400 bg-gradient-to-r from-gray-50 to-gray-100" :
        rank === 3 ? "border-l-orange-400 bg-gradient-to-r from-orange-50 to-orange-100" :
        "border-l-blue-500 bg-gradient-to-r from-blue-50 to-purple-50"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className={cn("flex items-center gap-1 text-xs", getRankColor(rank))}>
              <TrendingUp className="h-3 w-3" />
              #{rank}
            </Badge>
            
            <Badge 
              variant="outline" 
              className={cn("text-xs", getStatusColor(request.status))}
            >
              {RequestUtils.backendToFrontendStatus(request.status)}
            </Badge>
            
            <Badge 
              variant="outline" 
              className={cn("text-xs", getPriorityColor(request.priority))}
            >
              Priority {request.priority}
            </Badge>
          </div>

          <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
            <ExternalLink className="h-4 w-4" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
            {request.title}
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {request.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Date created:</span>
              {new Date(request.createdAt).toLocaleDateString()}
            </div>
            {request.dueDate && (() => {
              const due = new Date(request.dueDate);
              const now = new Date();
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
              const diffTime = dueDay.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              let label = "";
              let colorClass = "bg-gray-100 text-gray-700";
              if (diffDays < 0) {
                label = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`;
                colorClass = "bg-red-100 text-red-700";
              } else if (diffDays === 0) {
                label = "Due today";
                colorClass = "bg-orange-100 text-orange-700";
              } else if (diffDays === 1) {
                label = "Due tomorrow";
                colorClass = "bg-yellow-100 text-yellow-700";
              } else if (diffDays <= 7) {
                label = `Due in ${diffDays} days`;
                colorClass = "bg-blue-100 text-blue-700";
              }
              // If due in <= 7 days (or overdue), show only badge
              if (diffDays <= 7) {
                return (
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colorClass}`}>{label}</span>
                  </div>
                );
              }
              // If due in > 7 days, show only the date
              return (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-orange-500" />
                  <span>Due date:</span>
                  {new Date(request.dueDate).toLocaleDateString()}
                </div>
              );
            })()}
            {request.assignedStaffName && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {request.assignedStaffName}
              </div>
            )}
            {request.requestTypeName && (
              <div className="text-purple-600">
                {request.requestTypeName}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
