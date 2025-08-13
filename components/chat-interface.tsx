"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bot, Send, User, ArrowLeft, MessageSquare, AlertCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import MessageContent from "./message-content"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  model?: string
}

interface AIModel {
  id: string
  name: string
  model_id: string
  provider: string
}

interface ChatInterfaceProps {
  user: SupabaseUser | null
  isGuest: boolean
  availableModels: AIModel[]
  conversationId?: string
  initialMessages?: Message[]
  conversationTitle?: string
}

export default function ChatInterface({
  user,
  isGuest,
  availableModels,
  conversationId,
  initialMessages = [],
  conversationTitle,
}: ChatInterfaceProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>(availableModels[0]?.id || "")
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null)
  const [streamingMessage, setStreamingMessage] = useState<string>("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [streamBuffer, setStreamBuffer] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if ((isStreaming && streamingMessage) || isThinking) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
      })
    }
  }, [streamingMessage, isStreaming, isThinking])

  const saveConversation = async (userMessage: Message, aiMessage: Message) => {
    if (isGuest || !user) return

    try {
      let conversationIdToUse = currentConversationId

      if (!conversationIdToUse) {
        const response = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? "..." : ""),
            user_uuid: user.id,
          }),
        })

        if (response.ok) {
          const conversation = await response.json()
          conversationIdToUse = conversation.id
          setCurrentConversationId(conversationIdToUse)
        }
      }

      if (conversationIdToUse) {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                conversation_id: conversationIdToUse,
                role: userMessage.role,
                content: userMessage.content,
                model_used: null,
              },
              {
                conversation_id: conversationIdToUse,
                role: aiMessage.role,
                content: aiMessage.content,
                model_used: aiMessage.model,
              },
            ],
          }),
        })

        if (!conversationId) {
          router.replace(`/chat/${conversationIdToUse}`)
        }
      }
    } catch (error) {
      console.error("Failed to save conversation:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (!selectedModel) {
      toast({
        title: "No model selected",
        description: "Please select an AI model to continue.",
        variant: "destructive",
      })
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setIsThinking(true)
    setIsStreaming(false)
    setStreamingMessage("")
    setStreamBuffer("")

    setTimeout(() => scrollToBottom(), 50)

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          modelId: selectedModel,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to get AI response")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ""
      let modelName = ""
      let hasStartedStreaming = false

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)

              try {
                const parsed = JSON.parse(data)

                if (parsed.type === "content") {
                  if (!hasStartedStreaming) {
                    setIsThinking(false)
                    setIsStreaming(true)
                    hasStartedStreaming = true
                  }

                  fullContent += parsed.content

                  const shouldBuffer =
                    fullContent.endsWith("**") ||
                    fullContent.endsWith("***") ||
                    fullContent.endsWith("---") ||
                    fullContent.endsWith("###") ||
                    fullContent.endsWith("```") ||
                    fullContent.match(/\|[\s-]*$/) // incomplete table

                  if (!shouldBuffer) {
                    setStreamingMessage(fullContent)
                    requestAnimationFrame(() => scrollToBottom())
                  }
                } else if (parsed.type === "done") {
                  modelName = parsed.model
                  setStreamingMessage(fullContent)
                } else if (parsed.type === "error") {
                  throw new Error(parsed.error)
                }
              } catch (e) {
                continue
              }
            }
          }
        }
      }

      setIsStreaming(false)
      setStreamingMessage("")
      setStreamBuffer("")

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fullContent,
        timestamp: new Date(),
        model: modelName,
      }

      setMessages((prev) => [...prev, aiResponse])

      if (!isGuest && user) {
        await saveConversation(userMessage, aiResponse)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setIsThinking(false)
      setIsStreaming(false)
      setStreamingMessage("")
      setStreamBuffer("")

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Please try again."}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsThinking(false)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="glass-effect border-b border-gray-200/50 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link href={isGuest ? "/guest" : "/"}>
              <Button variant="ghost" size="sm" className="hover:bg-white/50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
              >
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900 text-sm sm:text-base">{conversationTitle || "AI Chat"}</h1>
                {isGuest && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Guest</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {availableModels.length > 0 ? (
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-32 sm:w-40 h-9">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-3 h-3" />
                        <span className="truncate">{model.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">No models</span>
              </div>
            )}
            {!isGuest && (
              <Link href="/history">
                <Button variant="outline" size="sm" className="hover:bg-white/50 bg-transparent">
                  <MessageSquare className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">History</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
              >
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Start a conversation</h3>
              <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                {availableModels.length > 0
                  ? "Ask me anything! I can help with questions, writing, coding, and more."
                  : "No AI models are currently available. Please contact an administrator."}
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`flex max-w-[85%] sm:max-w-[80%] ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                } items-start space-x-3`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                    message.role === "user" ? "text-white ml-3" : "bg-white border-2 border-gray-200 text-gray-600 mr-3"
                  }`}
                  style={
                    message.role === "user"
                      ? { background: "linear-gradient(135deg, var(--primary), var(--secondary))" }
                      : {}
                  }
                >
                  {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <Card
                  className={`p-4 shadow-lg border-0 ${message.role === "user" ? "text-white" : "bg-white"}`}
                  style={
                    message.role === "user"
                      ? { background: "linear-gradient(135deg, var(--primary), var(--secondary))" }
                      : {}
                  }
                >
                  <MessageContent content={message.content} isUser={message.role === "user"} />
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-opacity-20">
                    <span className={`text-xs ${message.role === "user" ? "text-purple-100" : "text-gray-500"}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {message.model && (
                      <span className={`text-xs ${message.role === "user" ? "text-purple-100" : "text-gray-500"}`}>
                        {message.model}
                      </span>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-start space-x-3 max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-600 flex items-center justify-center mr-3 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <Card className="p-4 bg-white shadow-lg border-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">AI is thinking...</span>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {isStreaming && streamingMessage && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-start space-x-3 max-w-[85%] sm:max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-600 flex items-center justify-center mr-3 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <Card className="p-4 bg-white shadow-lg border-0">
                  <MessageContent content={streamingMessage} isUser={false} />
                  <div className="flex items-center mt-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        <div
                          className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">Streaming...</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="glass-effect border-t border-gray-200/50 px-4 py-4 sticky bottom-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex space-x-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={availableModels.length > 0 ? "Type your message..." : "No AI models available..."}
              disabled={isLoading || availableModels.length === 0}
              className="flex-1 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim() || availableModels.length === 0}
              className="h-12 px-6 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
