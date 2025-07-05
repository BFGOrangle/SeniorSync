import { useState, useEffect, useCallback } from "react";
import {
  Reminder,
  CreateReminderDto,
  UpdateReminderDto,
  ReminderUtils,
} from "@/types/reminder";
import {
  reminderApi,
  fetchRemindersForRequest,
  createReminderForRequest,
  updateReminder as updateReminderApi,
  deleteReminder as deleteReminderApi,
  ReminderApiError,
  ReminderValidationError,
} from "@/services/reminder-api";

interface UseRemindersOptions {
  requestId?: number;
  autoFetch?: boolean;
}

interface UseRemindersReturn {
  reminders: Reminder[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchReminders: () => Promise<void>;
  createReminder: (
    reminderData: Omit<CreateReminderDto, "requestId">
  ) => Promise<Reminder>;
  updateReminder: (reminderData: UpdateReminderDto) => Promise<Reminder>;
  deleteReminder: (reminderId: number) => Promise<void>;

  // Local state management (for UI optimizations)
  addReminderLocally: (reminder: Reminder) => void;
  updateReminderLocally: (
    reminderId: number,
    updates: Partial<Reminder>
  ) => void;
  removeReminderLocally: (reminderId: number) => void;

  // Utility functions
  clearError: () => void;
  refresh: () => Promise<void>;
}

export function useReminders({
  requestId,
  autoFetch = true,
}: UseRemindersOptions = {}): UseRemindersReturn {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch reminders from the API
  const fetchReminders = useCallback(async () => {
    if (!requestId) {
      setReminders([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedReminders = await fetchRemindersForRequest(requestId);
      setReminders(fetchedReminders);
    } catch (err) {
      const errorMessage =
        err instanceof ReminderApiError
          ? err.errors.map((e) => e.message).join(", ")
          : "Failed to fetch reminders";
      setError(errorMessage);
      console.error("Error fetching reminders:", err);
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  // Create a new reminder
  const createReminder = useCallback(
    async (
      reminderData: Omit<CreateReminderDto, "requestId">
    ): Promise<Reminder> => {
      if (!requestId) {
        throw new Error("Request ID is required to create a reminder");
      }

      setError(null);

      try {
        const newReminder = await createReminderForRequest(
          requestId,
          reminderData
        );

        // Update local state
        setReminders((prev) => [...prev, newReminder]);

        return newReminder;
      } catch (err) {
        const errorMessage =
          err instanceof ReminderValidationError
            ? err.validationErrors
                .map((e) => `${e.field}: ${e.message}`)
                .join(", ")
            : err instanceof ReminderApiError
            ? err.errors.map((e) => e.message).join(", ")
            : "Failed to create reminder";
        setError(errorMessage);
        throw err;
      }
    },
    [requestId]
  );

  // Update an existing reminder
  const updateReminder = useCallback(
    async (reminderData: UpdateReminderDto): Promise<Reminder> => {
      setError(null);

      try {
        const updatedReminder = await updateReminderApi(reminderData);

        // Update local state
        setReminders((prev) =>
          prev.map((reminder) =>
            reminder.id === updatedReminder.id ? updatedReminder : reminder
          )
        );

        return updatedReminder;
      } catch (err) {
        const errorMessage =
          err instanceof ReminderValidationError
            ? err.validationErrors
                .map((e) => `${e.field}: ${e.message}`)
                .join(", ")
            : err instanceof ReminderApiError
            ? err.errors.map((e) => e.message).join(", ")
            : "Failed to update reminder";
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  // Delete a reminder
  const deleteReminder = useCallback(
    async (reminderId: number): Promise<void> => {
      setError(null);

      try {
        await deleteReminderApi(reminderId);

        // Update local state
        setReminders((prev) =>
          prev.filter((reminder) => reminder.id !== reminderId)
        );
      } catch (err) {
        const errorMessage =
          err instanceof ReminderApiError
            ? err.errors.map((e) => e.message).join(", ")
            : "Failed to delete reminder";
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  // Local state management functions (for optimistic updates)
  const addReminderLocally = useCallback((reminder: Reminder) => {
    setReminders((prev) => [...prev, reminder]);
  }, []);

  const updateReminderLocally = useCallback(
    (reminderId: number, updates: Partial<Reminder>) => {
      setReminders((prev) =>
        prev.map((reminder) =>
          reminder.id === reminderId ? { ...reminder, ...updates } : reminder
        )
      );
    },
    []
  );

  const removeReminderLocally = useCallback((reminderId: number) => {
    setReminders((prev) =>
      prev.filter((reminder) => reminder.id !== reminderId)
    );
  }, []);

  // Utility functions
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    await fetchReminders();
  }, [fetchReminders]);

  // Auto-fetch on mount and when requestId changes
  useEffect(() => {
    if (autoFetch && requestId) {
      fetchReminders();
    }
  }, [autoFetch, requestId, fetchReminders]);

  return {
    reminders,
    isLoading,
    error,

    // Actions
    fetchReminders,
    createReminder,
    updateReminder,
    deleteReminder,

    // Local state management
    addReminderLocally,
    updateReminderLocally,
    removeReminderLocally,

    // Utility functions
    clearError,
    refresh,
  };
}

// Helper hook for managing reminders in a request modal context
export function useRequestReminders(requestId: number) {
  return useReminders({
    requestId,
    autoFetch: true,
  });
}
