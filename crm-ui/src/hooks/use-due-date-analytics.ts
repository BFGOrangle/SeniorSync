import { useMemo } from 'react';
import { SeniorRequestDisplayView } from '@/types/request';
import { DueDateAnalytics, DueDateBreakdown } from '@/types/due-date-analytics';

export function useDueDateAnalytics(requests: SeniorRequestDisplayView[]): {
  analytics: DueDateAnalytics;
  breakdown: DueDateBreakdown[];
  getUrgentCount: () => number;
} {
  const analytics = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay()));
    const endOfNextWeek = new Date(endOfWeek);
    endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);

    const stats: DueDateAnalytics = {
      overdue: 0,
      dueToday: 0,
      dueTomorrow: 0,
      dueThisWeek: 0,
      dueNextWeek: 0,
      noDueDate: 0,
      total: requests.length,
    };

    requests.forEach(request => {
      if (!request.dueDate) {
        stats.noDueDate++;
        return;
      }

      const dueDate = new Date(request.dueDate);
      const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

      if (dueDateOnly < today) {
        stats.overdue++;
      } else if (dueDateOnly.getTime() === today.getTime()) {
        stats.dueToday++;
      } else if (dueDateOnly.getTime() === tomorrow.getTime()) {
        stats.dueTomorrow++;
      } else if (dueDateOnly > tomorrow && dueDateOnly <= endOfWeek) {
        stats.dueThisWeek++;
      } else if (dueDateOnly > endOfWeek && dueDateOnly <= endOfNextWeek) {
        stats.dueNextWeek++;
      }
    });

    return stats;
  }, [requests]);

  const breakdown = useMemo((): DueDateBreakdown[] => {
    const total = analytics.total || 1; // Avoid division by zero

    return [
      {
        category: 'overdue' as const,
        label: 'Overdue',
        count: analytics.overdue,
        percentage: Math.round((analytics.overdue / total) * 100),
        color: 'bg-red-500',
        urgent: true,
      },
      {
        category: 'dueToday' as const,
        label: 'Due Today',
        count: analytics.dueToday,
        percentage: Math.round((analytics.dueToday / total) * 100),
        color: 'bg-orange-500',
        urgent: true,
      },
      {
        category: 'dueTomorrow' as const,
        label: 'Due Tomorrow',
        count: analytics.dueTomorrow,
        percentage: Math.round((analytics.dueTomorrow / total) * 100),
        color: 'bg-yellow-500',
      },
      {
        category: 'dueThisWeek' as const,
        label: 'Due This Week',
        count: analytics.dueThisWeek,
        percentage: Math.round((analytics.dueThisWeek / total) * 100),
        color: 'bg-blue-500',
      },
      {
        category: 'dueNextWeek' as const,
        label: 'Due Next Week',
        count: analytics.dueNextWeek,
        percentage: Math.round((analytics.dueNextWeek / total) * 100),
        color: 'bg-purple-500',
      },
      {
        category: 'noDueDate' as const,
        label: 'No Due Date',
        count: analytics.noDueDate,
        percentage: Math.round((analytics.noDueDate / total) * 100),
        color: 'bg-gray-400',
      },
    ].filter(item => item.count > 0); // Only show categories with data
  }, [analytics]);

  const getUrgentCount = useMemo(() => {
    return () => analytics.overdue + analytics.dueToday;
  }, [analytics.overdue, analytics.dueToday]);

  return {
    analytics,
    breakdown,
    getUrgentCount,
  };
}
