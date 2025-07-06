import { AuthenticatedApiClient } from './authenticated-api-client';
import { IncomingMessageDto, ReplyDto, ReplyOption } from '@/types/chatbot';

class ChatbotApiService extends AuthenticatedApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088';

  async sendMessage(message: IncomingMessageDto): Promise<ReplyDto> {
    return this.post<ReplyDto>(`${this.baseUrl}/api/chatbot/reply`, message);
  }

  async getCurrentReplyOptions(seniorId: number, campaignName = 'lodging_request'): Promise<ReplyOption[]> {
    return this.get<ReplyOption[]>(`${this.baseUrl}/api/chatbot/senior/${seniorId}/current-reply-options?campaignName=${campaignName}`);
  }
}

export const chatbotApiService = new ChatbotApiService();