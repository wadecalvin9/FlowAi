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

    const modelData = await request.json()

    const { data, error } = await supabase
      .from("ai_models")
      .insert([
        {
          id: crypto.randomUUID(),
          name: modelData.name,
          model_id: modelData.model_id,
          provider: modelData.provider,
          api_key: modelData.api_key,
          is_active: modelData.is_active,
          supports_images: modelData.supports_images,
          supports_generation: modelData.supports_generation,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Model creation error:", error)
      return NextResponse.json({ error: "Failed to create model" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Models API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
