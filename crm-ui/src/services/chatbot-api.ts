import { AuthenticatedApiClient } from './authenticated-api-client';
import { IncomingMessageDto, ReplyDto, SupportedLanguage } from '@/types/chatbot';

class ChatbotApiService extends AuthenticatedApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088';

  async sendMessage(message: IncomingMessageDto, languageCode: SupportedLanguage = 'en'): Promise<ReplyDto> {
    return this.post<ReplyDto>(`${this.baseUrl}/api/chatbot/reply?languageCode=${languageCode}`, message);
  }

  async getCurrentReplyOptions(seniorId: number, campaignName = 'lodging_request', languageCode: SupportedLanguage = 'en'): Promise<ReplyDto> {
    return this.get<ReplyDto>(`${this.baseUrl}/api/chatbot/senior/${seniorId}/current-reply-response?campaignName=${campaignName}&languageCode=${languageCode}`);
  }
}

export const chatbotApiService = new ChatbotApiService();