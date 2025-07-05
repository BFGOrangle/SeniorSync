import { IncomingMessageDto, ReplyDto, ReplyOption } from '@/types/chatbot';

class ChatbotApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088';

  async sendMessage(message: IncomingMessageDto): Promise<ReplyDto> {
    const response = await fetch(`${this.baseUrl}/api/chatbot/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getCurrentReplyOptions(seniorId: number, campaignName = 'lodging_request'): Promise<ReplyOption[]> {
    const response = await fetch(`${this.baseUrl}/api/chatbot/senior/${seniorId}/current-reply-options?campaignName=${campaignName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const chatbotApiService = new ChatbotApiService();