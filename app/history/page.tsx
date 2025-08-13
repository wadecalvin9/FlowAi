import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MessageSquare, Calendar, Bot } from "lucide-react"
import Link from "next/link"
import ConversationActions from "@/components/conversation-actions"

export default async function HistoryPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's conversations with message count and latest message
  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      id,
      title,
      created_at,
      updated_at,
      messages (
        id,
        content,
        role,
        created_at
      )
    `)
    .eq("user_uuid", user.id)
    .order("updated_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <h1 className="font-semibold text-gray-900">Chat History</h1>
            </div>
          </div>

          <Link href="/chat">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              New Chat
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {!conversations || conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No conversations yet</h2>
            <p className="text-gray-600 mb-6">Start chatting with AI to see your conversation history here.</p>
            <Link href="/chat">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Start Your First Chat
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Your Conversations</h2>
              <span className="text-sm text-gray-600">{conversations.length} conversations</span>
            </div>

            <div className="grid gap-4">
              {conversations.map((conversation: any) => {
                const lastMessage = conversation.messages?.sort(
                  (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                )[0]

                return (
                  <Card key={conversation.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-medium text-gray-900 mb-1">
                            {conversation.title || "Untitled Conversation"}
                          </CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(conversation.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{conversation.messages?.length || 0} messages</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ConversationActions conversationId={conversation.id} title={conversation.title} />
                          <Link href={`/chat/${conversation.id}`}>
                            <Button variant="outline" size="sm">
                              Continue
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardHeader>

                    {lastMessage && (
                      <CardContent className="pt-0">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <Bot className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {lastMessage.content?.slice(0, 150)}
                              {lastMessage.content?.length > 150 && "..."}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
