import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import ChatInterface from "@/components/chat-interface"

export default async function ConversationPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get the conversation and verify ownership
  const { data: conversation } = await supabase
    .from("conversations")
    .select(`
      id,
      title,
      user_uuid,
      messages (
        id,
        role,
        content,
        model_used,
        created_at
      )
    `)
    .eq("id", params.id)
    .eq("user_uuid", user.id)
    .single()

  if (!conversation) {
    notFound()
  }

  // Get available AI models
  const { data: models } = await supabase.from("ai_models").select("*").eq("is_active", true).order("name")

  // Transform messages to the expected format
  const initialMessages =
    conversation.messages
      ?.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at),
        model: msg.model_used,
      })) || []

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <ChatInterface
        user={user}
        isGuest={false}
        availableModels={models || []}
        conversationId={conversation.id}
        initialMessages={initialMessages}
        conversationTitle={conversation.title}
      />
    </div>
  )
}
