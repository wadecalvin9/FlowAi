import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { messages, modelId } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 })
    }

    if (!modelId) {
      return NextResponse.json({ error: "Model ID is required" }, { status: 400 })
    }

    // Get the AI model details
    const { data: aiModel } = await supabase
      .from("ai_models")
      .select("*")
      .eq("id", modelId)
      .eq("is_active", true)
      .single()

    if (!aiModel) {
      return NextResponse.json({ error: "Model not found or inactive" }, { status: 404 })
    }

    // Get the OpenRouter API key from site settings
    const { data: siteSettings } = await supabase.from("site_settings").select("openrouter_api_key").single()

    if (!siteSettings?.openrouter_api_key) {
      return NextResponse.json({ error: "OpenRouter API key not configured" }, { status: 500 })
    }

    // Format messages for OpenRouter API
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Call OpenRouter API
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${siteSettings.openrouter_api_key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "AI Assistant",
      },
      body: JSON.stringify({
        model: aiModel.model_id,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 4000,
        stream: false,
      }),
    })

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.json().catch(() => ({}))
      console.error("OpenRouter API error:", errorData)

      if (openRouterResponse.status === 401) {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
      } else if (openRouterResponse.status === 429) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
      } else {
        return NextResponse.json({ error: "AI service temporarily unavailable" }, { status: 503 })
      }
    }

    const data = await openRouterResponse.json()

    if (!data.choices || data.choices.length === 0) {
      return NextResponse.json({ error: "No response from AI model" }, { status: 500 })
    }

    const aiMessage = data.choices[0].message.content

    return NextResponse.json({
      content: aiMessage,
      model: aiModel.name,
      usage: data.usage,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
