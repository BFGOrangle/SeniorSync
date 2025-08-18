"use client";

import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Shield, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SpamDetectionIndicatorProps {
  isSpam?: boolean | null;
  confidenceScore?: number | null;
  detectionReason?: string;
  detectedAt?: string;
  detectionStatus?: 'pending' | 'completed';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function SpamDetectionIndicator({
  isSpam,
  confidenceScore,
  detectionReason,
  detectedAt,
  detectionStatus,
  size = 'sm',
  showText = false
}: SpamDetectionIndicatorProps) {
  // Determine the display state
  const getDisplayState = () => {
    if (detectionStatus === 'pending') {
      return {
        variant: 'outline' as const,
        className: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse',
        icon: <Loader2 className="h-3 w-3 animate-spin" />,
        text: 'Analyzing...',
        tooltip: 'AI spam detection in progress'
      };
    }

    if (isSpam === undefined || isSpam === null) {
      return {
        variant: 'outline' as const,
        className: 'bg-gray-50 text-gray-500 border-gray-200',
        icon: <Clock className="h-3 w-3" />,
        text: 'Pending',
        tooltip: 'Spam detection pending'
      };
    }

    if (isSpam) {
      // Spam detected
      return {
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800 border-red-300',
        icon: <AlertTriangle className="h-3 w-3" />,
        text: 'Likely spam',
        tooltip: `Flagged as spam (${Math.round((confidenceScore || 0) * 100)}% confidence): ${detectionReason || 'No reason provided'}`
      };
    } else {
      // Clean content
      return {
        variant: 'outline' as const,
        className: 'bg-green-50 text-green-700 border-green-200',
        icon: <Shield className="h-3 w-3" />,
        text: 'Unlikely spam',
        tooltip: `Clean content (${Math.round((confidenceScore || 0) * 100)}% confidence): ${detectionReason || 'No reason provided'}`
      };
    }
  };

  const state = getDisplayState();

  // Size configurations
  const sizeConfigs = {
    sm: {
      badgeClass: 'text-xs px-2 py-1',
      iconSize: 'h-3 w-3',
      gap: 'gap-1'
    },
    md: {
      badgeClass: 'text-sm px-3 py-1',
      iconSize: 'h-4 w-4',
      gap: 'gap-1.5'
    },
    lg: {
      badgeClass: 'text-sm px-4 py-2',
      iconSize: 'h-4 w-4',
      gap: 'gap-2'
    }
  };

  const sizeConfig = sizeConfigs[size];

  const badgeContent = (
    <Badge
      variant={state.variant}
      className={`${state.className} ${sizeConfig.badgeClass} items-center ${sizeConfig.gap} font-medium cursor-help`}
    >
      {state.icon}
      {showText && <span>{state.text}</span>}
    </Badge>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">
              {isSpam ? '🚨 Spam Detected' : isSpam === false ? '✅ Clean Content' : '⏳ Analysis Pending'}
            </div>
            <div className="text-sm">{state.tooltip}</div>
            {detectedAt && (
              <div className="text-xs text-muted-foreground">
                Analyzed: {new Date(detectedAt).toLocaleString()}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
