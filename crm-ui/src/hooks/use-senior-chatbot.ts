import { useState, useCallback, useRef } from 'react'
import { IncomingMessageDto, ReplyDto, ReplyOption, MessageDto, ConversationDto, ChatMessage, SupportedLanguage } from '@/types/chatbot'
import { chatbotApiService } from '@/services/chatbot-api'
import { messageApi } from '@/services/message-api'

export function useSeniorChatbot(seniorId: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeConversation, setActiveConversation] = useState<ConversationDto | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en')
  
  // Prevent concurrent initialization attempts
  const initializationInProgress = useRef(false)

  // Centralized conversation initialization to prevent duplicate events
  const initializeNewConversation = useCallback(async (languageCode: SupportedLanguage = 'en'): Promise<ReplyOption[]> => {
    try {
      console.log('Initializing new conversation for senior:', seniorId, 'with language:', languageCode)
      
      const beginOption: ReplyOption = {
        displayText: '',
        value: '',
        fsmEvent: 'FIRSTCHATOPEN' // Use consistent event
      }

      const response = await chatbotApiService.sendMessage({
        campaignName: 'lodging_request',
        seniorId,
        replyOption: beginOption
      }, languageCode)

      // Add Holly's initial response to messages
      const assistantMessage: ChatMessage = {
        id: response.message_id,
        role: 'assistant', 
        content: response.prompt,
        createdAt: new Date()
      }

      setMessages([assistantMessage])
      return response.replyOptions
    } catch (initError) {
      console.error('Failed to initialize new conversation:', initError)
      setError('Failed to start conversation. Please try again.')
      return []
    }
  }, [seniorId])

  // Load existing messages if there's an active conversation
  const loadExistingMessages = useCallback(async (languageCode: SupportedLanguage = 'en'): Promise<ReplyOption[]> => {
    // Prevent concurrent initialization
    if (initializationInProgress.current) {
      console.log('Initialization already in progress, skipping...')
      return []
    }
    
    initializationInProgress.current = true
    
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
        
        // Fetch current reply options for the conversation state with language
        try {
          const currentChatbotReplyResponse = await chatbotApiService.getCurrentReplyOptions(seniorId, 'lodging_request', languageCode)
          return currentChatbotReplyResponse.replyOptions || []
        } catch (optionsError) {
          console.error('Failed to load current reply options:', optionsError)
          return []
        }
      } else {
        // No active conversation, auto-trigger conversation initialization
        return await initializeNewConversation(languageCode)
      }
    } catch (err) {
      console.error('Failed to load existing messages:', err)
      // On error, try to initialize new conversation (single path)
      return await initializeNewConversation(languageCode)
    } finally {
      setIsLoading(false)
      setIsInitialized(true)
      initializationInProgress.current = false
    }
  }, [seniorId, initializeNewConversation])

  const sendMessage = useCallback(async (replyOption: ReplyOption, languageCode: SupportedLanguage = selectedLanguage) => {
    setIsLoading(true)
    setError(null)

    try {
      // Add user message to chat if it has content
      if (replyOption.value.trim()) {
        const userMessage: ChatMessage = {
          id: Date.now(),
          role: 'user',
          content: replyOption.displayText,
          createdAt: new Date(),
        }
        
        setMessages(prev => [...prev, userMessage])
      }

      // Send to backend with language
      const request: IncomingMessageDto = {
        campaignName: 'lodging_request',
        seniorId,
        replyOption,
      }

      const response: ReplyDto = await chatbotApiService.sendMessage(request, languageCode)

      // Add assistant response to chat
      const assistantMessage: ChatMessage = {
        id: response.message_id,
        role: 'assistant',
        content: response.prompt,
        createdAt: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])

      // Check if request was completed and reset conversation
      if (response.prompt.includes("Thanks! Your request has been lodged") || 
          response.prompt.includes("谢谢！您的请求已提交") ||
          response.prompt.includes("Terima kasih! Permintaan anda telah dihantar") ||
          response.prompt.includes("நன்றி! உங்கள் கோரிக்கை சமர்ப்பிக்கப்பட்டது")) {
        // Reset conversation state after a brief delay
        setTimeout(() => {
          setMessages([])
          setActiveConversation(null)
          setIsInitialized(false) // Allow re-initialization
          initializationInProgress.current = false // Reset guard
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
  }, [seniorId, selectedLanguage])

  const initializeChat = useCallback(async (languageCode: SupportedLanguage = selectedLanguage) => {
    if (!isInitialized && !initializationInProgress.current) {
      const replyOptions = await loadExistingMessages(languageCode)
      return replyOptions
    }
    return []
  }, [loadExistingMessages, isInitialized, selectedLanguage])

  const changeLanguage = useCallback(async (newLanguage: SupportedLanguage): Promise<ReplyDto> => {
    setSelectedLanguage(newLanguage)
    setIsLoading(true)
    
    try {
      // If there's an active conversation, fetch new reply options in the new language
      if (activeConversation) {
        const currentChatbotReplyResponse = await chatbotApiService.getCurrentReplyOptions(seniorId, 'lodging_request', newLanguage)
        return currentChatbotReplyResponse
      }
      
      // No active conversation - return empty ReplyDto structure
      return {
        message_id: 0,
        senior_id: seniorId,
        prompt: '',
        replyOptions: []
      }
    } catch (err) {
      console.error('Failed to load reply options for new language:', err)
      setError('Failed to change language. Please try again.')
      
      // Return empty ReplyDto structure on error
      return {
        message_id: 0,
        senior_id: seniorId,
        prompt: '',
        replyOptions: []
      }
    } finally {
      setIsLoading(false)
    }
  }, [seniorId, activeConversation])

  const clearMessages = useCallback(() => {
    setMessages([])
    setActiveConversation(null)
    setIsInitialized(false)
    initializationInProgress.current = false
  }, [])

  return {
    messages,
    isLoading,
    error,
    activeConversation,
    selectedLanguage,
    sendMessage,
    initializeChat,
    changeLanguage,
    clearMessages,
    setMessages,
  }
}