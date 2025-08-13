import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { messages } = await request.json()

    // Add IDs and timestamps to messages
    const messagesWithIds = messages.map((msg: any) => ({
      id: crypto.randomUUID(),
      conversation_id: msg.conversation_id,
      role: msg.role,
      content: msg.content,
      model_used: msg.model_used,
      created_at: new Date().toISOString(),
    }))

    const { data, error } = await supabase.from("messages").insert(messagesWithIds).select()

    if (error) {
      console.error("Messages creation error:", error)
      return NextResponse.json({ error: "Failed to save messages" }, { status: 500 })
    }

    // Update conversation's updated_at timestamp
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", messages[0].conversation_id)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Messages API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
