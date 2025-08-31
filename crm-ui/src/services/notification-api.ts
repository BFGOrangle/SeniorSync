import { AuthenticatedApiClient, BaseApiError } from './authenticated-api-client';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088';
const NOTIFICATIONS_ENDPOINT = `${API_BASE_URL}/api/notifications`;

// Notification types
export interface MentionNotificationRequest {
  requestId: number;
  commentId: number;
  mentionedStaffIds: number[];
  commenterName: string;
  commentText: string;
  requestTitle?: string;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  emailsSent: number;
  failedEmails?: string[];
}

// Service-specific error classes
export class NotificationApiError extends BaseApiError {
  constructor(
    status: number,
    statusText: string,
    errors: Array<{ message: string; timestamp: string; field?: string; rejectedValue?: any }> = []
  ) {
    super(status, statusText, errors);
    this.name = 'NotificationApiError';
  }
}

// HTTP client for notification management
class NotificationApiClient extends AuthenticatedApiClient {
  // Override error handling for notification-specific errors
  protected async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any;
    
    try {
      errorData = await response.json();
    } catch {
      throw new NotificationApiError(
        response.status,
        response.statusText,
        [{ message: 'An unexpected error occurred', timestamp: new Date().toISOString() }]
      );
    }
    
    // Handle other errors
    throw new NotificationApiError(
      response.status,
      response.statusText,
      errorData.errors || [{ message: errorData.message || 'Unknown error', timestamp: new Date().toISOString() }]
    );
  }

  // Send mention notifications
  async sendMentionNotifications(notificationData: MentionNotificationRequest): Promise<NotificationResponse> {
    return await this.post<NotificationResponse>(`${NOTIFICATIONS_ENDPOINT}/mentions`, notificationData);
  }
}

// Export singleton instance
export const notificationApi = new NotificationApiClient();

// Export helper functions for use in components
export async function sendMentionEmails(
  requestId: number,
  commentId: number,
  mentionedStaffIds: number[],
  commenterName: string,
  commentText: string,
  requestTitle?: string
): Promise<NotificationResponse> {
  try {
    const notificationData: MentionNotificationRequest = {
      requestId,
      commentId,
      mentionedStaffIds,
      commenterName,
      commentText,
      requestTitle,
    };
    
    return await notificationApi.sendMentionNotifications(notificationData);
  } catch (error) {
    console.error('Failed to send mention notifications:', error);
    throw error;
  }
}