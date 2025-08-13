import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient()

    // Get site settings (excluding sensitive data like API keys for public access)
    const { data: settings, error } = await supabase
      .from("site_settings")
      .select(`
        id,
        site_name,
        primary_color,
        secondary_color,
        background_color,
        text_color,
        accent_color,
        logo_url,
        favicon_url,
        welcome_message,
        footer_text,
        font_family,
        enable_dark_mode,
        max_message_length,
        enable_guest_access,
        updated_at
      `)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Settings fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
    }

    // Return default settings if none exist
    const defaultSettings = {
      id: crypto.randomUUID(),
      site_name: "AI Assistant",
      primary_color: "#7c3aed",
      secondary_color: "#2563eb",
      background_color: "#ffffff",
      text_color: "#000000",
      accent_color: "#10b981",
      welcome_message: "Welcome to our AI Assistant",
      footer_text: "Powered by AI Technology",
      font_family: "Inter",
      enable_dark_mode: true,
      max_message_length: 4000,
      enable_guest_access: true,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json(settings || defaultSettings)
  } catch (error) {
    console.error("Settings API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
