import { useState, useEffect, useMemo } from 'react';
import { SeniorRequestDisplayView } from '@/types/request';
import { Reminder } from '@/types/reminder';
import { useRequests } from '@/hooks/use-requests';
import { useReminders } from '@/hooks/use-reminders';

export interface DailyOverviewData {
  todaysReminders: Reminder[];
  todaysRequests: SeniorRequestDisplayView[];
  loading: boolean;
  error: string | null;
}

export function useDailyOverview(): DailyOverviewData {
  const { requests, loading: requestsLoading, error: requestsError } = useRequests();
  const { reminders, isLoading: remindersLoading, error: remindersError } = useReminders({ autoFetch: true });

  const todayData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Filter reminders for today
    const todaysReminders = reminders.filter(reminder => {
      if (!reminder.reminderDateTime) return false;
      const reminderDate = new Date(reminder.reminderDateTime);
      const reminderDateOnly = new Date(reminderDate.getFullYear(), reminderDate.getMonth(), reminderDate.getDate());
      return reminderDateOnly.getTime() === today.getTime();
    });

    // Filter requests due today
    const todaysRequests = requests.filter(request => {
      if (!request.dueDate) return false;
      const dueDate = new Date(request.dueDate);
      const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      return dueDateOnly.getTime() === today.getTime();
    });

    return {
      todaysReminders,
      todaysRequests,
    };
  }, [reminders, requests]);

  return {
    ...todayData,
    loading: requestsLoading || remindersLoading,
    error: requestsError?.message || remindersError || null,
  };
}
