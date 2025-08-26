// Backend API types for reminder management
export interface ReminderDto {
  id: number;
  title: string;
  description: string;
  reminderDate: string; // ISO string (OffsetDateTime from backend)
  requestId: number;
  staffAssigneeId: number | null; // Added missing field from backend
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CreateReminderDto {
  title: string;
  description: string;
  requestId: number;
  reminderDate: string; // ISO string
  staffAssigneeId?: number | null; // Added missing field from backend (optional for frontend)
}

export interface UpdateReminderDto {
  id: number;
  title: string;
  description: string;
  reminderDate: string; // ISO string
  staffAssigneeId?: number | null; // Added missing field from backend (optional for frontend)
}

// Frontend types for UI compatibility
export interface Reminder {
  id: number; // Changed from string to number to match backend
  title: string;
  description?: string;
  reminderDateTime: string; // ISO string (mapped from reminderDate)
  isCompleted: boolean; // Frontend-only field for UI state
  createdAt?: string;
  requestId: number; // Added to link to request
  staffAssigneeId?: number | null; // Added to track assignee
}

// Utility functions for reminder management
export class ReminderUtils {
  // Convert backend ReminderDto to frontend Reminder
  static fromDto(dto: ReminderDto): Reminder {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      reminderDateTime: dto.reminderDate,
      isCompleted: false, // Default value, could be enhanced later
      createdAt: dto.createdAt,
      requestId: dto.requestId,
      staffAssigneeId: dto.staffAssigneeId,
    };
  }

  // Convert frontend Reminder to CreateReminderDto
  static toCreateDto(
    reminder: Partial<Reminder> & { requestId: number }
  ): CreateReminderDto {
    return {
      title: reminder.title || "",
      description: reminder.description || "",
      requestId: reminder.requestId,
      reminderDate: reminder.reminderDateTime || "",
      staffAssigneeId: reminder.staffAssigneeId,
    };
  }

  // Convert frontend Reminder to UpdateReminderDto
  static toUpdateDto(reminder: Reminder): UpdateReminderDto {
    return {
      id: reminder.id,
      title: reminder.title,
      description: reminder.description || "",
      reminderDate: reminder.reminderDateTime,
      staffAssigneeId: reminder.staffAssigneeId,
    };
  }
}
