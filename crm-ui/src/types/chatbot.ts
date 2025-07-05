// Chatbot types for senior request logging
export interface ReplyOption {
  text: string;
  fsmEvent: string;
}

export interface IncomingMessageDto {
  campaignName: string;
  seniorId: number;
  replyOption: ReplyOption;
}

export interface ReplyDto {
  message_id: number;
  senior_id: number;
  message_content: string;
  replyOptions: ReplyOption[];
}

// Message types for chatbot functionality
export interface MessageDto {
  id: number;
  conversationId: number;
  direction: 'IN' | 'OUT';
  content: string;
  event?: string;
  createdAt: string;
}

export interface ConversationDto {
  id: number;
  seniorId: number;
  campaignName: string;
  currentState: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

export interface ChatbotState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}