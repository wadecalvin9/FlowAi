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

    // Check if user is admin
    const { data: userData } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

    if (!userData?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const settings = await request.json()

    // Upsert site settings
    const { data, error } = await supabase
      .from("site_settings")
      .upsert(
        {
          id: settings.id || crypto.randomUUID(),
          site_name: settings.site_name,
          primary_color: settings.primary_color,
          secondary_color: settings.secondary_color,
          background_color: settings.background_color,
          text_color: settings.text_color,
          accent_color: settings.accent_color,
          logo_url: settings.logo_url,
          favicon_url: settings.favicon_url,
          welcome_message: settings.welcome_message,
          footer_text: settings.footer_text,
          font_family: settings.font_family,
          enable_dark_mode: settings.enable_dark_mode,
          max_message_length: settings.max_message_length,
          enable_guest_access: settings.enable_guest_access,
          openrouter_api_key: settings.openrouter_api_key,
          openai_api_key: settings.openai_api_key,
          anthropic_api_key: settings.anthropic_api_key,
          gemini_api_key: settings.gemini_api_key,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .select()
      .single()

    if (error) {
      console.error("Settings save error:", error)
      return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Settings API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
