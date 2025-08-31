'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, Clock, User, FileText, Bell } from 'lucide-react';
import { useDailyOverview } from '@/hooks/use-daily-overview';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DailyOverviewWidgetProps {
  className?: string;
}

export function DailyOverviewWidget({ className }: DailyOverviewWidgetProps) {
  const { todaysReminders, todaysRequests, loading, error } = useDailyOverview();

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Overview
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
            Daily Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600">
            Error loading daily overview: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalItems = todaysReminders.length + todaysRequests.length;
  const hasUrgentRequests = todaysRequests.some(req => req.frontendPriority === 'urgent');

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Daily Overview
          {hasUrgentRequests && (
            <Badge variant="destructive" className="ml-auto">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Urgent
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{todaysReminders.length}</div>
            <div className="text-xs text-gray-500">Reminders Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{todaysRequests.length}</div>
            <div className="text-xs text-gray-500">Requests Due Today</div>
          </div>
        </div>

        {/* Today's Reminders */}
        {todaysReminders.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Bell className="h-4 w-4" />
              Today's Reminders
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {todaysReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-blue-900 truncate">
                      {reminder.title}
                    </div>
                    {reminder.description && (
                      <div className="text-xs text-blue-700 truncate">
                        {reminder.description}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-blue-600 ml-2">
                    {format(new Date(reminder.reminderDateTime), 'HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Due Requests */}
        {todaysRequests.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              Requests Due Today
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {todaysRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-orange-900 truncate">
                        {request.requestTypeName || 'Request'}
                      </div>
                      {request.frontendPriority === 'urgent' && (
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-orange-700">
                      <User className="h-3 w-3" />
                      <span className="truncate">{request.seniorName || 'Unknown Senior'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end ml-2">
                    <Badge 
                      variant={request.frontendPriority === 'urgent' ? 'destructive' : 'secondary'} 
                      className="text-xs"
                    >
                      {request.frontendPriority}
                    </Badge>
                    <div className="text-xs text-orange-600 mt-1">
                      {request.dueDate && format(new Date(request.dueDate), 'HH:mm')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalItems === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No reminders or requests due today</div>
            <div className="text-xs mt-1">Enjoy your day!</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
