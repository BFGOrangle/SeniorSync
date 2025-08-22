import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNavigationHelper } from "@/lib/navigation-helper";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Clock, Eye, Star, TrendingUp, User, Calendar, AlertTriangle } from "lucide-react";
import { SeniorRequestDto } from "@/types/request";
import { SpamIndicatorBadge } from "@/components/spam-indicator-badge";
import { cn } from "@/lib/utils";

interface RecommendedRequestCardProps {
  request: SeniorRequestDto;
  rank: number; // Position in AI ranking (1-based)
  onView?: (request: SeniorRequestDto) => void;
  className?: string;
}

export function RecommendedRequestCard({
  request,
  rank,
  onView,
  className,
}: RecommendedRequestCardProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const { getRoutes } = useNavigationHelper();

  const handleView = async () => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    try {
      if (onView) {
        onView(request);
      }
      
      const routes = getRoutes();
      router.push(routes.requests(request.id.toString()));
    } finally {
      setIsNavigating(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "bg-red-100 text-red-800 border-red-200";
    if (priority === 3) return "bg-orange-100 text-orange-800 border-orange-200";
    if (priority === 2) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800";
    if (rank === 3) return "bg-gradient-to-r from-orange-300 to-orange-400 text-orange-900";
    return "bg-gradient-to-r from-blue-500 to-purple-500 text-white";
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Star className="h-3 w-3" />;
    return <TrendingUp className="h-3 w-3" />;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatDueDate = (dueDate: string | undefined) => {
    if (!dueDate) return null;

    const due = new Date(dueDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    
    const diffTime = dueDay.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let label: string;
    let colorClass: string;
    let icon = Calendar;

    if (diffDays < 0) {
      label = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`;
      colorClass = "text-red-600 bg-red-50 border-red-200";
      icon = AlertTriangle;
    } else if (diffDays === 0) {
      label = "Due today";
      colorClass = "text-orange-600 bg-orange-50 border-orange-200";
      icon = AlertTriangle;
    } else if (diffDays === 1) {
      label = "Due tomorrow";
      colorClass = "text-yellow-600 bg-yellow-50 border-yellow-200";
    } else if (diffDays <= 7) {
      label = `Due in ${diffDays} days`;
      colorClass = "text-blue-600 bg-blue-50 border-blue-200";
    } else {
      label = formatDate(dueDate);
      colorClass = "text-gray-600 bg-gray-50 border-gray-200";
    }

    const IconComponent = icon;

    return {
      label,
      colorClass,
      icon: IconComponent,
      isUrgent: diffDays <= 1,
      isOverdue: diffDays < 0,
    };
  };

  return (
    <Card className={cn(
      "hover:shadow-md transition-all duration-200 border-l-4",
      rank === 1 ? "border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50" :
      rank === 2 ? "border-l-gray-400 bg-gradient-to-r from-gray-50 to-gray-100" :
      rank === 3 ? "border-l-orange-400 bg-gradient-to-r from-orange-50 to-orange-100" :
      "border-l-blue-500 bg-gradient-to-r from-blue-50 to-purple-50",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {/* AI Ranking Badge */}
            <Badge 
              variant="secondary" 
              className={cn(
                "flex items-center gap-1 font-semibold px-2 py-1 text-xs",
                getRankColor(rank)
              )}
            >
              {getRankIcon(rank)}
              #{rank}
            </Badge>
            
            {/* Priority Badge */}
            <Badge 
              variant="outline" 
              className={cn("border text-xs", getPriorityColor(request.priority))}
            >
              Priority {request.priority}
            </Badge>
            
            {/* Status Badge */}
            <Badge 
              variant="outline" 
              className={cn("border text-xs", getStatusColor(request.status))}
            >
              {request.status.replace('_', ' ')}
            </Badge>
            
            {/* Spam Detection Badge */}
            <SpamIndicatorBadge
              isSpam={request.isSpam}
              confidenceScore={request.spamConfidenceScore}
              detectionReason={request.spamDetectionReason}
              detectedAt={request.spamDetectedAt}
              size="sm"
              showText={false}
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleView}
            disabled={isNavigating}
            className="flex items-center gap-1 text-xs"
          >
            <Eye className="h-3 w-3" />
            View
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">
            {request.title}
          </h3>
          
          {/* Description */}
          {request.description && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {request.description}
            </p>
          )}
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {/* Senior ID */}
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Senior #{request.seniorId}
            </div>
            
            {/* Assigned Staff */}
            {request.assignedStaffName && (
              <div className="flex items-center gap-1">
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-xs">
                    {request.assignedStaffName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-24">{request.assignedStaffName}</span>
              </div>
            )}
            
            {/* Created Date */}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(request.createdAt)}
            </div>

            {/* Due Date */}
            {request.dueDate && (
              <div className="flex items-center gap-1">
                {(() => {
                  const dueDateInfo = formatDueDate(request.dueDate);
                  if (!dueDateInfo) return null;
                  const IconComponent = dueDateInfo.icon;
                  return (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium flex items-center gap-1",
                        dueDateInfo.colorClass
                      )}
                    >
                      <IconComponent className="h-3 w-3" />
                      {dueDateInfo.label}
                    </Badge>
                  );
                })()}
              </div>
            )}
            
            {/* Updated/Completed Date */}
            {request.completedAt ? (
              <div className="flex items-center gap-1 text-green-600">
                <Clock className="h-3 w-3" />
                Completed {formatDate(request.completedAt)}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Updated {formatDate(request.updatedAt)}
              </div>
            )}
          </div>
          
          {/* AI Recommendation Indicator */}
          <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
            <TrendingUp className="h-3 w-3" />
            <span className="font-medium">AI Recommended</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
