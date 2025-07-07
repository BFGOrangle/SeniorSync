import { AuthenticatedApiClient } from './authenticated-api-client';
import { MessageDto, ConversationDto } from '@/types/chatbot';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088';

class MessageApiService extends AuthenticatedApiClient {
  async getMessagesByConversation(conversationId: number): Promise<MessageDto[]> {
    return this.get<MessageDto[]>(`${API_BASE_URL}/api/chatbot/messages/conversation/${conversationId}`);
  }

  async getMessagesBySenior(seniorId: number, campaignName = 'lodging_request'): Promise<MessageDto[]> {
    return this.get<MessageDto[]>(`${API_BASE_URL}/api/chatbot/messages/senior/${seniorId}?campaignName=${campaignName}`);
  }

  async getActiveConversation(seniorId: number, campaignName = 'lodging_request'): Promise<ConversationDto | null> {
    try {
      return await this.get<ConversationDto>(`${API_BASE_URL}/api/chatbot/messages/senior/${seniorId}/active-conversation?campaignName=${campaignName}`);
    } catch (error: any) {
      if (error.status === 404) {
        return null; // No active conversation
      }
      throw error;
    }
  }

  async clearConversationMessages(conversationId: number): Promise<void> {
    return this.delete<void>(`${API_BASE_URL}/api/chatbot/messages/conversation/${conversationId}/clear`);
  }
}

export const messageApi = new MessageApiService();