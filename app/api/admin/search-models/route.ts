import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { query, apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 400 })
    }

    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
      }
      throw new Error("Failed to fetch models from OpenRouter")
    }

    const data = await response.json()
    let models = data.data || []

    // Filter models based on search query if provided
    if (query) {
      const searchTerm = query.toLowerCase()
      models = models.filter(
        (model: any) =>
          model.name?.toLowerCase().includes(searchTerm) ||
          model.id?.toLowerCase().includes(searchTerm) ||
          model.description?.toLowerCase().includes(searchTerm),
      )
    }

    // Transform the models to match our expected format
    const transformedModels = models.map((model: any) => ({
      id: model.id,
      name: model.name || model.id,
      description: model.description || `${model.name || model.id} - AI language model`,
      supports_images: model.architecture?.modality?.includes("image") || false,
      context_length: model.context_length || 4096,
      pricing: model.pricing,
    }))

    return NextResponse.json({ models: transformedModels })
  } catch (error) {
    console.error("Search models error:", error)
    return NextResponse.json({ error: "Failed to search models" }, { status: 500 })
  }
}
