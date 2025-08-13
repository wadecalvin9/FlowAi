import { createClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { messages, modelId } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Messages are required", { status: 400 })
    }

    if (!modelId) {
      return new Response("Model ID is required", { status: 400 })
    }

    // Get the AI model details
    const { data: aiModel } = await supabase
      .from("ai_models")
      .select("*")
      .eq("id", modelId)
      .eq("is_active", true)
      .single()

    if (!aiModel) {
      return new Response("Model not found or inactive", { status: 404 })
    }

    // Get the OpenRouter API key from site settings
    const { data: siteSettings } = await supabase.from("site_settings").select("openrouter_api_key").single()

    if (!siteSettings?.openrouter_api_key) {
      return new Response("OpenRouter API key not configured", { status: 500 })
    }

    // Format messages for OpenRouter API
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Call OpenRouter API with streaming
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
        stream: true,
      }),
    })

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.json().catch(() => ({}))
      console.error("OpenRouter API error:", errorData)
      return new Response("AI service error", { status: openRouterResponse.status })
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = openRouterResponse.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ type: "error", error: "No response stream" })}\n\n`),
          )
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              // Send completion signal
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ type: "done", model: aiModel.name })}\n\n`),
              )
              break
            }

            const chunk = decoder.decode(value)
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim()

                if (data === "[DONE]") {
                  continue
                }

                try {
                  const parsed = JSON.parse(data)

                  if (
                    parsed.choices &&
                    parsed.choices[0] &&
                    parsed.choices[0].delta &&
                    parsed.choices[0].delta.content
                  ) {
                    const content = parsed.choices[0].delta.content
                    // Send content chunk as SSE
                    controller.enqueue(
                      new TextEncoder().encode(`data: ${JSON.stringify({ type: "content", content })}\n\n`),
                    )
                  }
                } catch (e) {
                  // Skip invalid JSON
                  continue
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error)
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ type: "error", error: "Stream processing error" })}\n\n`,
            ),
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("Chat stream API error:", error)
    return new Response("Internal server error", { status: 500 })
  }
}
