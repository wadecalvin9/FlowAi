"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface SiteSettings {
  id: string
  site_name: string
  primary_color: string
  secondary_color: string
  background_color: string
  text_color: string
  accent_color: string
  logo_url?: string
  favicon_url?: string
  welcome_message: string
  footer_text: string
  font_family: string
  enable_dark_mode: boolean
  max_message_length: number
  enable_guest_access: boolean
  openrouter_api_key: string
  updated_at: string
}

interface SettingsContextType {
  settings: SiteSettings | null
  loading: boolean
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  loading: true,
  refreshSettings: async () => {},
})

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)

        if (data && typeof document !== "undefined") {
          const root = document.documentElement
          root.style.setProperty("--primary", data.primary_color || "oklch(0.205 0 0)")
          root.style.setProperty("--secondary", data.secondary_color || "oklch(0.97 0 0)")
          root.style.setProperty("--accent", data.accent_color || "oklch(0.97 0 0)")
          root.style.setProperty("--background", data.background_color || "oklch(1 0 0)")
          root.style.setProperty("--foreground", data.text_color || "oklch(0.145 0 0)")

          // Update document title and favicon
          document.title = `${data.site_name || "AI Assistant"} - AI Assistant`
          if (data.favicon_url) {
            const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
            if (favicon) favicon.href = data.favicon_url
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
      if (typeof document !== "undefined") {
        const root = document.documentElement
        root.style.setProperty("--primary", "oklch(0.205 0 0)")
        root.style.setProperty("--secondary", "oklch(0.97 0 0)")
        root.style.setProperty("--accent", "oklch(0.97 0 0)")
        root.style.setProperty("--background", "oklch(1 0 0)")
        root.style.setProperty("--foreground", "oklch(0.145 0 0)")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const refreshSettings = async () => {
    await fetchSettings()
  }

  return <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>{children}</SettingsContext.Provider>
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
