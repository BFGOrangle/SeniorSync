import { useEffect, useMemo } from 'react';
import { SeniorRequestDisplayView } from '@/types/request';
import { Reminder } from '@/types/reminder';
import { useRequests } from '@/hooks/use-requests';
import { useReminders } from '@/hooks/use-reminders';
import { useCurrentUser } from '@/contexts/user-context';

export type DashboardMode = 'personal' | 'center';

export interface DailyOverviewData {
  todaysReminders: Reminder[];
  todaysRequests: SeniorRequestDisplayView[];
  loading: boolean;
  error: string | null;
}

export function useDailyOverview(mode: DashboardMode = 'personal'): DailyOverviewData {
  const { requests, loading: requestsLoading, error: requestsError } = useRequests();
  const { reminders, isLoading: remindersLoading, error: remindersError, fetchReminders } = useReminders({ autoFetch: false });
  const { currentUser } = useCurrentUser();

  // Fetch all reminders on mount and when mode changes
  useEffect(() => {
    fetchReminders();
  }, [fetchReminders, mode]);

  const todayData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Filter reminders for today
    let todaysReminders = reminders.filter(reminder => {
      if (!reminder.reminderDateTime) return false;
      const reminderDate = new Date(reminder.reminderDateTime);
      const reminderDateOnly = new Date(reminderDate.getFullYear(), reminderDate.getMonth(), reminderDate.getDate());
      return reminderDateOnly.getTime() === today.getTime();
    });

    // Filter requests due today
    let todaysRequests = requests.filter(request => {
      if (!request.dueDate) return false;
      const dueDate = new Date(request.dueDate);
      const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      return dueDateOnly.getTime() === today.getTime();
    });

    // Apply mode-based filtering
    if (mode === 'personal' && currentUser?.backendStaffId) {
      // Filter reminders assigned to current user
      todaysReminders = todaysReminders.filter(reminder => 
        reminder.staffAssigneeId === currentUser.backendStaffId
      );

      // Filter requests assigned to current user
      todaysRequests = todaysRequests.filter(request => 
        request.assignedStaffId === currentUser.backendStaffId
      );
    }
    // For 'center' mode, show all reminders and requests (already filtered by center in backend)

    return {
      todaysReminders,
      todaysRequests,
    };
  }, [reminders, requests, mode, currentUser?.backendStaffId]);

  return {
    ...todayData,
    loading: requestsLoading || remindersLoading,
    error: requestsError?.message || remindersError || null,
  };
}
