import { AuthenticatedApiClient, BaseApiError } from './authenticated-api-client';
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

// Service-specific error classes (extending base)
export class ReminderApiError extends BaseApiError {
  constructor(
    status: number,
    statusText: string,
    errors: Array<{
      message: string;
      timestamp: string;
      field?: string;
      rejectedValue?: any;
    }> = []
  ) {
    super(status, statusText, errors);
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

// HTTP client for reminder management extending authenticated base
class ReminderApiClient extends AuthenticatedApiClient {
  // Override error handling for reminder-specific errors
  protected async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any;
    
    try {
      errorData = await response.json();
    } catch {
      throw new ReminderApiError(
        response.status,
        response.statusText,
        [{ message: 'An unexpected error occurred', timestamp: new Date().toISOString() }]
      );
    }

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

  // Get all reminders or reminders for a specific request
  async getReminders(requestId?: number): Promise<Reminder[]> {
    const url = requestId
      ? `${REMINDERS_ENDPOINT}/request/${requestId}`
      : `${REMINDERS_ENDPOINT}`;
    const reminderDtos = await this.get<ReminderDto[]>(url);
    return reminderDtos.map((dto) => ReminderUtils.fromDto(dto));
  }

  // Create a new reminder
  async createReminder(reminderData: CreateReminderDto): Promise<Reminder> {
    const reminderDto = await this.post<ReminderDto>(REMINDERS_ENDPOINT, reminderData);
    return ReminderUtils.fromDto(reminderDto);
  }

  // Update an existing reminder
  async updateReminder(reminderData: UpdateReminderDto): Promise<Reminder> {
    const reminderDto = await this.put<ReminderDto>(REMINDERS_ENDPOINT, reminderData);
    return ReminderUtils.fromDto(reminderDto);
  }

  // Delete a reminder
  async deleteReminder(reminderId: number): Promise<void> {
    await this.delete<void>(`${REMINDERS_ENDPOINT}/${reminderId}`);
  }
}

// Export singleton instance
export const reminderApi = new ReminderApiClient();

// Export helper functions for use in components
export async function fetchRemindersForRequest(
  requestId?: number
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
  reminderData: Omit<CreateReminderDto, "requestId">,
  staffAssigneeId?: number | null
): Promise<Reminder> {
  try {
    const createData: CreateReminderDto = {
      ...reminderData,
      requestId,
      staffAssigneeId,
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
