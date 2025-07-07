"use client"

import { useEffect, useState } from 'react'
import { Bot, Send, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChatContainer, ChatMessages } from '@/components/ui/chat'
import { SeniorDetailsHeader } from '@/components/senior-details-header'
import { useSeniorChatbot } from '@/hooks/use-senior-chatbot'
import { ReplyOption, ChatMessage } from '@/types/chatbot'

interface SeniorChatbotProps {
  seniorId: number
}

export function SeniorChatbot({ seniorId }: SeniorChatbotProps) {
  const { 
    messages, 
    isLoading, 
    error, 
    activeConversation, 
    sendMessage, 
    initializeChat, 
    clearMessages 
  } = useSeniorChatbot(seniorId)
  
  const [currentReplyOptions, setCurrentReplyOptions] = useState<ReplyOption[]>([])
  const [textInput, setTextInput] = useState('')
  const [isStarted, setIsStarted] = useState(false)
  const [needsTextInput, setNeedsTextInput] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      const replyOptions = await initializeChat()
      if (replyOptions && replyOptions.length > 0) {
        setCurrentReplyOptions(replyOptions)
        // Check if we need text input
        const hasEmptyTextOptions = replyOptions.some(opt => opt.text === '')
        setNeedsTextInput(hasEmptyTextOptions)
        // If we have reply options, we're already started
        if (activeConversation && activeConversation.currentState !== 'START') {
          setIsStarted(true)
        }
      }
    }
    initialize()
  }, [initializeChat, activeConversation])

  // Check if we have an active conversation and set appropriate state
  useEffect(() => {
    if (activeConversation && activeConversation.currentState !== 'START') {
      setIsStarted(true)
    }
  }, [activeConversation])

  const handleOptionClick = async (option: ReplyOption) => {
    try {
      const newReplyOptions = await sendMessage(option)
      setCurrentReplyOptions(newReplyOptions || [])
      setTextInput('')
      
      // Check if we need text input (when reply options have empty text)
      const hasEmptyTextOptions = newReplyOptions?.some(opt => opt.text === '')
      setNeedsTextInput(hasEmptyTextOptions || false)
      
      if (!isStarted && option.fsmEvent === 'BEGIN') {
        setIsStarted(true)
      }

      // Check if request was completed, reset state after delay
      if (newReplyOptions?.length === 0 || 
          (newReplyOptions?.length === 1 && newReplyOptions[0].fsmEvent === 'BEGIN')) {
        setTimeout(() => {
          setIsStarted(false)
          setCurrentReplyOptions([])
          setNeedsTextInput(false)
        }, 2000)
      }
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return

    // Use the fsmEvent from the empty text option if available
    const emptyTextOption = currentReplyOptions.find(opt => opt.text === '')
    const textOption: ReplyOption = {
      text: textInput,
      fsmEvent: emptyTextOption?.fsmEvent || 'USER_INPUT'
    }

    try {
      const newReplyOptions = await sendMessage(textOption)
      setCurrentReplyOptions(newReplyOptions || [])
      setTextInput('')
      
      // Check if we need text input for next interaction
      const hasEmptyTextOptions = newReplyOptions?.some(opt => opt.text === '')
      setNeedsTextInput(hasEmptyTextOptions || false)
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const handleStartConversation = () => {
    const startOption: ReplyOption = {
      text: 'Okay',
      fsmEvent: 'BEGIN'
    }
    handleOptionClick(startOption)
  }

  // Convert ChatMessage to Message format for UI components
  const convertToUIMessage = (chatMessage: ChatMessage) => ({
    ...chatMessage,
    id: chatMessage.id.toString()
  })

  // Filter out empty text options for button display
  const buttonOptions = currentReplyOptions.filter(opt => opt.text !== '')

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
            
            {/* Show active conversation indicator */}
            {activeConversation && (
              <div className="flex items-center gap-2">
                <div className="text-sm bg-green-500 px-3 py-1 rounded-full">
                  Active: {activeConversation.currentState}
                </div>
              </div>
            )}
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
              {!isStarted ? (
                <div className="flex justify-center">
                  <Button
                    onClick={handleStartConversation}
                    size="lg"
                    className="text-xl md:text-2xl px-12 py-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    ) : null}
                    {activeConversation ? 'Create New Request?' : "Okay, Let's Start!"}
                  </Button>
                </div>
              ) : (
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
                            {option.text}
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
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}