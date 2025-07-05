import { useState, useCallback, useEffect } from 'react'
import { IncomingMessageDto, ReplyDto, ReplyOption, MessageDto, ConversationDto, ChatMessage } from '@/types/chatbot'
import { chatbotApiService } from '@/services/chatbot-api'
import { messageApi } from '@/services/message-api'

export function useSeniorChatbot(seniorId: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeConversation, setActiveConversation] = useState<ConversationDto | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load existing messages if there's an active conversation
  const loadExistingMessages = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Check for active conversation
      const conversation = await messageApi.getActiveConversation(seniorId, 'lodging_request')
      setActiveConversation(conversation)
      
      if (conversation && conversation.currentState !== 'COMPLETED') {
        // Load existing messages for active conversation
        const existingMessages = await messageApi.getMessagesBySenior(seniorId, 'lodging_request')
        
        const chatMessages: ChatMessage[] = existingMessages.map((msg: MessageDto) => ({
          id: msg.id,
          role: msg.direction === 'IN' ? 'user' : 'assistant',
          content: msg.content,
          createdAt: new Date(msg.createdAt)
        }))
        
        setMessages(chatMessages)
        
        // Fetch current reply options for the conversation state
        try {
          const currentReplyOptions = await chatbotApiService.getCurrentReplyOptions(seniorId, 'lodging_request')
          return currentReplyOptions // Return them so the component can use them
        } catch (optionsError) {
          console.error('Failed to load current reply options:', optionsError)
          return []
        }
      } else {
        // No active conversation, show welcome message
        const welcomeMessage: ChatMessage = {
          id: 0,
          role: 'assistant',
          content: "👋 Welcome to Holly, your friendly assistant! I'm here to help you log a request. Our AAC staff will respond as soon as possible!",
          createdAt: new Date(),
        }
        setMessages([welcomeMessage])
        return []
      }
    } catch (err) {
      console.error('Failed to load existing messages:', err)
      // Show welcome message on error
      const welcomeMessage: ChatMessage = {
        id: 0,
        role: 'assistant',
        content: "👋 Welcome to Holly, your friendly assistant! I'm here to help you log a request. Our AAC staff will respond as soon as possible!",
        createdAt: new Date(),
      }
      setMessages([welcomeMessage])
      return []
    } finally {
      setIsLoading(false)
      setIsInitialized(true)
    }
  }, [seniorId])

  const sendMessage = useCallback(async (replyOption: ReplyOption) => {
    setIsLoading(true)
    setError(null)

    try {
      // Add user message to chat if it has content
      if (replyOption.text.trim()) {
        const userMessage: ChatMessage = {
          id: Date.now(),
          role: 'user',
          content: replyOption.text,
          createdAt: new Date(),
        }
        
        setMessages(prev => [...prev, userMessage])
      }

      // Send to backend
      const request: IncomingMessageDto = {
        campaignName: 'lodging_request',
        seniorId,
        replyOption,
      }

      const response: ReplyDto = await chatbotApiService.sendMessage(request)

      // Add assistant response to chat
      const assistantMessage: ChatMessage = {
        id: response.message_id,
        role: 'assistant',
        content: response.message_content,
        createdAt: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])

      // Check if request was completed and reset to welcome state
      if (response.message_content.includes("Thanks! Your request has been lodged")) {
        // Clear messages after a brief delay and show welcome message
        setTimeout(() => {
          const welcomeMessage: ChatMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: "👋 Welcome to Holly, your friendly assistant! I'm here to help you log a request. Our AAC staff will respond as soon as possible!",
            createdAt: new Date(),
          }
          setMessages([welcomeMessage])
          setActiveConversation(null)
        }, 2000)
      }

      // Return reply options for the UI to handle
      return response.replyOptions
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [seniorId])

  const initializeChat = useCallback(async () => {
    if (!isInitialized) {
      const replyOptions = await loadExistingMessages()
      return replyOptions // Return reply options for the component to use
    }
    return []
  }, [loadExistingMessages, isInitialized])

  const clearMessages = useCallback(() => {
    const welcomeMessage: ChatMessage = {
      id: Date.now(),
      role: 'assistant',
      content: "👋 Welcome to Holly, your friendly assistant! I'm here to help you log a request. Our AAC staff will respond as soon as possible!",
      createdAt: new Date(),
    }
    setMessages([welcomeMessage])
    setActiveConversation(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    activeConversation,
    sendMessage,
    initializeChat,
    clearMessages,
  }
}