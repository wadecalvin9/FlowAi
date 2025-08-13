import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ChatInterface from "@/components/chat-interface"

export default async function ChatPage({
  searchParams,
}: {
  searchParams: { mode?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isGuest = searchParams.mode === "guest"

  // If not guest mode and no user, redirect to login
  if (!isGuest && !user) {
    redirect("/auth/login")
  }

  // Get available AI models
  const { data: models } = await supabase.from("ai_models").select("*").eq("is_active", true).order("name")

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <ChatInterface user={user} isGuest={isGuest} availableModels={models || []} />
    </div>
  )
}
