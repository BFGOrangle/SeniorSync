import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpamIndicatorBadgeProps {
  isSpam?: boolean;
  confidenceScore?: number;
  detectionReason?: string;
  detectedAt?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function SpamIndicatorBadge({
  isSpam,
  confidenceScore,
  detectionReason,
  detectedAt,
  size = "sm",
  showText = true,
  className,
}: SpamIndicatorBadgeProps) {
  // If no spam detection data is available
  if (isSpam === undefined || isSpam === null) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}>
              <Badge
                variant="outline"
                className={cn(
                  "flex items-center gap-1 text-gray-500 border-gray-300",
                  size === "sm" && "text-xs px-1.5 py-0.5",
                  size === "md" && "text-xs px-2 py-1",
                  size === "lg" && "text-sm px-3 py-1.5",
                  className
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <HelpCircle className="h-3 w-3" />
                {showText && "Pending Check"}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p><strong>Spam Detection:</strong> Analysis pending...</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const getSpamIcon = () => {
    if (isSpam === true) return AlertTriangle;
    if (isSpam === false) return CheckCircle;
    return Shield;
  };

  const getSpamColor = () => {
    if (isSpam === true) {
      // High confidence spam - red, low confidence - orange
      if (confidenceScore && confidenceScore >= 0.8) {
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100";
      }
      return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100";
    }
    
    if (isSpam === false) {
      // High confidence clean - green, low confidence - yellow
      if (confidenceScore && confidenceScore >= 0.8) {
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100";
      }
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100";
    }
    
    return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100";
  };

  const getDisplayText = () => {
    if (!showText) return "";
    
    if (isSpam === true) {
      return confidenceScore && confidenceScore >= 0.8 ? "SPAM" : "Likely Spam";
    }
    
    if (isSpam === false) {
      return confidenceScore && confidenceScore >= 0.8 ? "Unlikely Spam" : "Possibly Spam";
    }
    
    return "Unknown";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatConfidence = (score?: number) => {
    if (score === undefined || score === null) return "N/A";
    return `${Math.round(score * 100)}%`;
  };

  const Icon = getSpamIcon();

  const tooltipContent = (
    <div className="space-y-2 text-sm">
      <div>
        <strong>Spam Detection:</strong> {isSpam ? "Flagged as Spam" : "Unlikely Spam"}
      </div>
      {confidenceScore !== undefined && (
        <div>
          <strong>Confidence Score:</strong> {formatConfidence(confidenceScore)}
        </div>
      )}
      {detectionReason && (
        <div>
          <strong>Detection Reason:</strong> {detectionReason}
        </div>
      )}
      {detectedAt && (
        <div>
          <strong>Analyzed:</strong> {formatDate(detectedAt)}
        </div>
      )}
    </div>
  );

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-1 cursor-help",
        getSpamColor(),
        size === "sm" && "text-xs px-1.5 py-0.5",
        size === "md" && "text-xs px-2 py-1", 
        size === "lg" && "text-sm px-3 py-1.5",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <Icon className={cn(
        size === "sm" && "h-3 w-3",
        size === "md" && "h-3.5 w-3.5",
        size === "lg" && "h-4 w-4"
      )} />
      {showText && getDisplayText()}
      {confidenceScore !== undefined && !showText && (
        <span className="text-xs opacity-75">
          {formatConfidence(confidenceScore)}
        </span>
      )}
    </Badge>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}>
            {badge}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
