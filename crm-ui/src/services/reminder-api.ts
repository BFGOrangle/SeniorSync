import {
  ReminderDto,
  CreateReminderDto,
  UpdateReminderDto,
  Reminder,
  ReminderUtils,
} from "@/types/reminder";

// Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088";
const REMINDERS_ENDPOINT = `${API_BASE_URL}/api/reminders`;

// Custom error classes
export class ReminderApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public errors: Array<{
      message: string;
      timestamp: string;
      field?: string;
      rejectedValue?: any;
    }> = []
  ) {
    super(`Reminder API Error: ${status} ${statusText}`);
    this.name = "ReminderApiError";
  }
}

export class ReminderValidationError extends ReminderApiError {
  constructor(
    public validationErrors: Array<{
      message: string;
      field: string;
      rejectedValue?: any;
      timestamp: string;
    }>
  ) {
    super(400, "Validation Error", validationErrors);
    this.name = "ReminderValidationError";
  }
}

// HTTP client for reminder management
class ReminderApiClient {
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle validation errors
        if (response.status === 400 && errorData.errors) {
          throw new ReminderValidationError(errorData.errors);
        }

        // Handle other errors
        throw new ReminderApiError(
          response.status,
          response.statusText,
          errorData.errors || [
            {
              message: errorData.message || "Unknown error",
              timestamp: new Date().toISOString(),
            },
          ]
        );
      }

      // Handle empty responses
      if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      ) {
        return null as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ReminderApiError) {
        throw error;
      }

      // Handle network errors and other unexpected errors
      throw new ReminderApiError(0, "Network Error", [
        {
          message:
            error instanceof Error ? error.message : "Network request failed",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }

  // Get all reminders or reminders for a specific request
  async getReminders(requestId?: number): Promise<Reminder[]> {
    const url = requestId
      ? `${REMINDERS_ENDPOINT}/request/${requestId}`
      : `${REMINDERS_ENDPOINT}`;
    const reminderDtos = await this.request<ReminderDto[]>(url);
    return reminderDtos.map((dto) => ReminderUtils.fromDto(dto));
  }

  // Create a new reminder
  async createReminder(reminderData: CreateReminderDto): Promise<Reminder> {
    const reminderDto = await this.request<ReminderDto>(REMINDERS_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(reminderData),
    });
    return ReminderUtils.fromDto(reminderDto);
  }

  // Update an existing reminder
  async updateReminder(reminderData: UpdateReminderDto): Promise<Reminder> {
    const reminderDto = await this.request<ReminderDto>(REMINDERS_ENDPOINT, {
      method: "PUT",
      body: JSON.stringify(reminderData),
    });
    return ReminderUtils.fromDto(reminderDto);
  }

  // Delete a reminder
  async deleteReminder(reminderId: number): Promise<void> {
    await this.request<void>(`${REMINDERS_ENDPOINT}/${reminderId}`, {
      method: "DELETE",
    });
  }
}

// Export singleton instance
export const reminderApi = new ReminderApiClient();

// Export helper functions for use in components
export async function fetchRemindersForRequest(
  requestId: number
): Promise<Reminder[]> {
  try {
    return await reminderApi.getReminders(requestId);
  } catch (error) {
    console.error("Failed to fetch reminders for request:", requestId, error);
    throw error;
  }
}

export async function createReminderForRequest(
  requestId: number,
  reminderData: Omit<CreateReminderDto, "requestId">
): Promise<Reminder> {
  try {
    const createData: CreateReminderDto = {
      ...reminderData,
      requestId,
    };
    return await reminderApi.createReminder(createData);
  } catch (error) {
    console.error("Failed to create reminder:", error);
    throw error;
  }
}

export async function updateReminder(
  reminderData: UpdateReminderDto
): Promise<Reminder> {
  try {
    return await reminderApi.updateReminder(reminderData);
  } catch (error) {
    console.error("Failed to update reminder:", error);
    throw error;
  }
}

export async function deleteReminder(reminderId: number): Promise<void> {
  try {
    await reminderApi.deleteReminder(reminderId);
  } catch (error) {
    console.error("Failed to delete reminder:", error);
    throw error;
  }
}
