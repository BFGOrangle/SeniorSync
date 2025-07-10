"use client"

import { useEffect, useState } from 'react'
import { Bot, Send, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChatContainer, ChatMessages } from '@/components/ui/chat'
import { LanguageSelector } from '@/components/ui/language-selector'
import { SeniorDetailsHeader } from '@/components/senior-details-header'
import { useSeniorChatbot } from '@/hooks/use-senior-chatbot'
import { ReplyOption, ChatMessage, SupportedLanguage } from '@/types/chatbot'

interface SeniorChatbotProps {
  seniorId: number
}

export function SeniorChatbot({ seniorId }: SeniorChatbotProps) {
  const { 
    messages, 
    isLoading, 
    error, 
    activeConversation, 
    selectedLanguage,
    sendMessage, 
    initializeChat,
    changeLanguage,
    setMessages,
  } = useSeniorChatbot(seniorId)
  
  const [currentReplyOptions, setCurrentReplyOptions] = useState<ReplyOption[]>([])
  const [textInput, setTextInput] = useState('')
  const [needsTextInput, setNeedsTextInput] = useState(false)
  const [showLanguageSelector, setShowLanguageSelector] = useState(true)
  const [hasStartedChat, setHasStartedChat] = useState(false)

  useEffect(() => {
    // Don't auto-initialize chat - let user select language first
    // This effect is now only for handling language changes after chat has started
    if (hasStartedChat) {
      const initialize = async () => {
        const replyOptions = await initializeChat(selectedLanguage)
        if (replyOptions && replyOptions.length > 0) {
          setCurrentReplyOptions(replyOptions)
          // Check if we need text input
          const hasEmptyTextOptions = replyOptions.some(opt => opt.value === '')
          setNeedsTextInput(hasEmptyTextOptions)
        }
      }
      
      initialize()
    }
  }, [initializeChat, selectedLanguage, hasStartedChat])

  const handleOptionClick = async (option: ReplyOption) => {
    try {
      const newReplyOptions = await sendMessage(option, selectedLanguage)
      setCurrentReplyOptions(newReplyOptions || [])
      setTextInput('')
      
      // Check if we need text input (when reply options have empty text)
      const hasEmptyTextOptions = newReplyOptions?.some(opt => opt.value === '')
      setNeedsTextInput(hasEmptyTextOptions || false)
    } catch (err) {
      console.error(err);
    }
  }

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return

    // Use the fsmEvent from the empty text option if available
    const emptyTextOption = currentReplyOptions.find(opt => opt.value === '')
    const textOption: ReplyOption = {
      displayText: textInput,
      value: textInput,
      fsmEvent: emptyTextOption?.fsmEvent || 'USER_INPUT'
    }

    try {
      const newReplyOptions = await sendMessage(textOption, selectedLanguage)
      setCurrentReplyOptions(newReplyOptions || [])
      setTextInput('')
      
      // Check if we need text input for next interaction
      const hasEmptyTextOptions = newReplyOptions?.some(opt => opt.value === '')
      setNeedsTextInput(hasEmptyTextOptions || false)
    } catch (err) {
      // Error is handled by the hook
      console.error(err)
    }
  }

  const handleLanguageChange = async (newLanguage: SupportedLanguage) => {
    try {
      const chatbotResponse = await changeLanguage(newLanguage);
      
      // changeLanguage now always returns ReplyDto, so we can directly access replyOptions
      const newReplyOptions = chatbotResponse.replyOptions || [];
      const newReplyPrompt = chatbotResponse.prompt;

      // Update the last assistant message with the new prompt if it exists
      if (newReplyPrompt && messages.length > 0) {
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          
          // Find the last assistant message and update its content
          for (let i = updatedMessages.length - 1; i >= 0; i--) {
            if (updatedMessages[i].role === 'assistant') {
              updatedMessages[i] = {
                ...updatedMessages[i],
                content: newReplyPrompt
              };
              break;
            }
          }
          
          return updatedMessages;
        });
      }

      if (newReplyOptions.length > 0) {
        setCurrentReplyOptions(newReplyOptions)
        const hasEmptyTextOptions = newReplyOptions.some(opt => opt.value === '')
        setNeedsTextInput(hasEmptyTextOptions)
      }
    } catch (err) {
      console.error('Failed to change language:', err)
    }
  }

  const handleStartChat = async (language: SupportedLanguage) => {
    await changeLanguage(language)
    setShowLanguageSelector(false)
    setHasStartedChat(true)
    
    // Initialize chat with selected language
    const replyOptions = await initializeChat(language)
    if (replyOptions && replyOptions.length > 0) {
      setCurrentReplyOptions(replyOptions)
      const hasEmptyTextOptions = replyOptions.some((opt: ReplyOption) => opt.value === '')
      setNeedsTextInput(hasEmptyTextOptions)
    }
  }

  // Convert ChatMessage to Message format for UI components
  const convertToUIMessage = (chatMessage: ChatMessage) => ({
    ...chatMessage,
    id: chatMessage.id.toString()
  })

  // Filter out empty text options for button display
  const buttonOptions = currentReplyOptions.filter(opt => opt.value !== '')

  // Language selection screen - shown before chat starts
  if (showLanguageSelector && !hasStartedChat) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <SeniorDetailsHeader seniorId={seniorId} />
        
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-2xl md:text-3xl font-bold text-center justify-center">
              <Bot className="h-8 w-8 md:h-10 md:w-10" />
              Holly - Your Request Assistant
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Choose Your Language / 选择语言 / Pilih Bahasa / மொழியைத் தேர்ந்தெடுக்கவும்
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Please select your preferred language to start chatting with Holly. 
                  You can change the language at any time during the conversation.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <Button
                  onClick={() => handleStartChat('en')}
                  size="lg"
                  className="h-16 text-lg font-semibold flex items-center gap-3 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  <span className="text-2xl">🇺🇸</span>
                  English
                </Button>
                
                <Button
                  onClick={() => handleStartChat('zh-CN')}
                  size="lg"
                  className="h-16 text-lg font-semibold flex items-center gap-3 bg-red-600 hover:bg-red-700"
                  disabled={isLoading}
                >
                  <span className="text-2xl">🇨🇳</span>
                  简体中文
                </Button>
                
                <Button
                  onClick={() => handleStartChat('ms')}
                  size="lg"
                  className="h-16 text-lg font-semibold flex items-center gap-3 bg-yellow-600 hover:bg-yellow-700"
                  disabled={isLoading}
                >
                  <span className="text-2xl">🇲🇾</span>
                  Bahasa Melayu
                </Button>
                
                <Button
                  onClick={() => handleStartChat('ta')}
                  size="lg"
                  className="h-16 text-lg font-semibold flex items-center gap-3 bg-orange-600 hover:bg-orange-700"
                  disabled={isLoading}
                >
                  <span className="text-2xl">🇮🇳</span>
                  தமிழ்
                </Button>
              </div>
              
              {isLoading && (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Starting chat...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Senior Details Header */}
      <SeniorDetailsHeader seniorId={seniorId} />

      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-2xl md:text-3xl font-bold">
              <Bot className="h-8 w-8 md:h-10 md:w-10" />
              Holly - Your Request Assistant
            </CardTitle>
            
            <div className="flex items-center gap-4">
              {/* Language Selector - only visible after chat has started */}
              {hasStartedChat && (
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={handleLanguageChange}
                  className="ml-2 text-black border-white/20 hover:bg-white/10"
                />
              )}
              
              {/* Show active conversation indicator */}
              {activeConversation && (
                <div className="text-sm bg-green-500 px-3 py-1 rounded-full">
                  Active: {activeConversation.currentState}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-lg">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <ChatContainer className="h-[500px] md:h-[600px] border rounded-lg bg-gray-50">
              <ChatMessages messages={messages.map(convertToUIMessage)}>
                <div className="space-y-4 p-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        <p className="text-lg md:text-xl leading-relaxed font-medium">
                          {message.content}
                        </p>
                        {message.createdAt && (
                          <p className={`text-sm mt-2 ${
                            message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.createdAt.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-800 border border-gray-200 p-4 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                          <span className="text-lg font-medium">Holly is typing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ChatMessages>
            </ChatContainer>

            {/* Reply Options or Text Input */}
            <div className="space-y-4">
              {/* Show button options if any */}
              {buttonOptions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-lg font-semibold text-gray-700 text-center">
                    Please choose an option:
                  </p>
                  <div className="grid gap-3">
                    {buttonOptions.map((option, index) => (
                      <Button
                        key={index}
                        onClick={() => handleOptionClick(option)}
                        variant="outline"
                        size="lg"
                        className="text-lg md:text-xl p-6 h-auto border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 text-gray-800 font-semibold rounded-xl shadow-sm transition-all duration-200"
                        disabled={isLoading}
                      >
                        {option.displayText}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Show text input if needed */}
              {needsTextInput && (
                <div className="space-y-3">
                  <p className="text-lg font-semibold text-gray-700 text-center">
                    Please type your response:
                  </p>
                  <div className="flex gap-3">
                    <Input
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Type your message here..."
                      className="text-lg md:text-xl p-4 h-auto border-2 border-blue-300 rounded-xl focus:border-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleTextSubmit}
                      size="lg"
                      className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                      disabled={isLoading || !textInput.trim()}
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}