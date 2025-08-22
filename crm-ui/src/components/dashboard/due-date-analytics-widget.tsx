'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Calendar, Clock, TrendingUp } from 'lucide-react';
import { useDueDateAnalytics } from '@/hooks/use-due-date-analytics';
import { useRequests } from '@/hooks/use-requests';
import { cn } from '@/lib/utils';

interface DueDateAnalyticsWidgetProps {
  className?: string;
}

export function DueDateAnalyticsWidget({ className }: DueDateAnalyticsWidgetProps) {
  const { requests, loading, error } = useRequests();
  const { analytics, breakdown, getUrgentCount } = useDueDateAnalytics(requests);
  
  const urgentCount = getUrgentCount();
  const withDueDate = analytics.total - analytics.noDueDate;

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Due Date Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              <div className="h-3 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Due Date Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600">
            Error loading due date analytics
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasUrgentItems = urgentCount > 0;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Due Date Analytics
          {hasUrgentItems && (
            <Badge variant="destructive" className="ml-auto">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {urgentCount} Urgent
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.total}</div>
            <div className="text-xs text-gray-500">Total Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{withDueDate}</div>
            <div className="text-xs text-gray-500">With Due Date</div>
          </div>
          <div className="text-center">
            <div className={cn(
              "text-2xl font-bold",
              hasUrgentItems ? "text-red-600" : "text-green-600"
            )}>
              {urgentCount}
            </div>
            <div className="text-xs text-gray-500">Urgent</div>
          </div>
        </div>

        {/* Breakdown */}
        {breakdown.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Breakdown
            </div>
            {breakdown.map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", item.color)} />
                    <span>{item.label}</span>
                    {item.urgent && (
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.count}
                    </Badge>
                    <span className="text-xs text-gray-500 min-w-[3rem] text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <Progress 
                  value={item.percentage} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {analytics.total === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No requests found</div>
          </div>
        )}

        {/* No Due Dates */}
        {analytics.total > 0 && withDueDate === 0 && (
          <div className="text-center py-4 text-gray-500">
            <Calendar className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No requests have due dates</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
