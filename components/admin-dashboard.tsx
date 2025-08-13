"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Settings,
  Bot,
  Key,
  Search,
  Plus,
  ArrowLeft,
  Save,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { useToast } from "@/hooks/use-toast"
import { useSettings } from "@/lib/settings-context"

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
  openai_api_key: string
  anthropic_api_key: string
  gemini_api_key: string
}

interface AIModel {
  id: string
  name: string
  model_id: string
  provider: string
  api_key: string
  is_active: boolean
  supports_images: boolean
  supports_generation: boolean
  created_at: string
}

interface AdminDashboardProps {
  user: SupabaseUser
  siteSettings: SiteSettings | null
  aiModels: AIModel[]
}

export default function AdminDashboard({ user, siteSettings, aiModels }: AdminDashboardProps) {
  const { toast } = useToast()
  const { refreshSettings } = useSettings()
  const [settings, setSettings] = useState<Partial<SiteSettings>>(
    siteSettings || {
      site_name: "AI Assistant",
      primary_color: "#7c3aed",
      secondary_color: "#2563eb",
      background_color: "#f8fafc",
      text_color: "#1f2937",
      accent_color: "#10b981",
      openrouter_api_key: "",
      openai_api_key: "",
      anthropic_api_key: "",
      gemini_api_key: "",
      welcome_message: "Welcome to our AI Assistant",
      footer_text: "Powered by AI Technology",
      font_family: "Arial",
      enable_dark_mode: false,
      max_message_length: 4000,
      enable_guest_access: false,
    },
  )
  const [models, setModels] = useState<AIModel[]>(aiModels)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showOpenAIKey, setShowOpenAIKey] = useState(false)
  const [showAnthropicKey, setShowAnthropicKey] = useState(false)
  const [showGeminiKey, setShowGeminiKey] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<"openrouter" | "openai" | "anthropic" | "gemini">(
    "openrouter",
  )

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        await refreshSettings()
        toast({
          title: "Settings saved",
          description: "Site settings have been updated successfully.",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSearchModels = async () => {
    let apiKey = ""
    let providerName = ""

    switch (selectedProvider) {
      case "openrouter":
        apiKey = settings.openrouter_api_key || ""
        providerName = "OpenRouter"
        break
      case "openai":
        apiKey = settings.openai_api_key || ""
        providerName = "OpenAI"
        break
      case "anthropic":
        apiKey = settings.anthropic_api_key || ""
        providerName = "Anthropic"
        break
      case "gemini":
        apiKey = settings.gemini_api_key || ""
        providerName = "Google Gemini"
        break
    }

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: `Please set your ${providerName} API key first.`,
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch("/api/admin/search-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          provider: selectedProvider,
          apiKey: apiKey,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.models || [])

        if (data.models?.length === 0) {
          toast({
            title: "No models found",
            description: "Try a different search term or check your API key.",
          })
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to search models")
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : `Failed to search ${providerName} models.`,
        variant: "destructive",
      })
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddModel = async (model: any) => {
    try {
      const response = await fetch("/api/admin/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: model.name,
          model_id: model.id,
          provider: selectedProvider,
          api_key:
            selectedProvider === "openrouter"
              ? settings.openrouter_api_key
              : selectedProvider === "openai"
                ? settings.openai_api_key
                : selectedProvider === "anthropic"
                  ? settings.anthropic_api_key
                  : settings.gemini_api_key,
          supports_images: model.supports_images || false,
          supports_generation: true,
          is_active: true,
        }),
      })

      if (response.ok) {
        const newModel = await response.json()
        setModels((prev) => [newModel, ...prev])
        toast({
          title: "Model Added",
          description: `${model.name} has been added successfully.`,
        })
      } else {
        throw new Error("Failed to add model")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add model. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleModel = async (modelId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/models/${modelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: isActive }),
      })

      if (response.ok) {
        setModels((prev) => prev.map((model) => (model.id === modelId ? { ...model, is_active: isActive } : model)))
        toast({
          title: "Model Updated",
          description: `Model has been ${isActive ? "activated" : "deactivated"}.`,
        })
      } else {
        throw new Error("Failed to update model")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update model. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteModel = async (modelId: string) => {
    try {
      const response = await fetch(`/api/admin/models/${modelId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setModels((prev) => prev.filter((model) => model.id !== modelId))
        toast({
          title: "Model Deleted",
          description: "Model has been removed successfully.",
        })
      } else {
        throw new Error("Failed to delete model")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete model. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-purple-600" />
              <h1 className="font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Badge variant="secondary">Admin</Badge>
            <span className="text-sm text-gray-600">{user.email}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings">Site Settings</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="models">AI Models</TabsTrigger>
            <TabsTrigger value="search">Add Models</TabsTrigger>
          </TabsList>

          {/* Site Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Site Customization</CardTitle>
                <CardDescription>Customize the appearance and branding of your AI website.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Site Name</Label>
                    <Input
                      id="site-name"
                      value={settings.site_name || ""}
                      onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                      placeholder="AI Assistant"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="welcome-message">Welcome Message</Label>
                    <Input
                      id="welcome-message"
                      value={settings.welcome_message || ""}
                      onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
                      placeholder="Welcome to our AI Assistant"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo-url">Logo URL</Label>
                    <Input
                      id="logo-url"
                      value={settings.logo_url || ""}
                      onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer-text">Footer Text</Label>
                    <Input
                      id="footer-text"
                      value={settings.footer_text || ""}
                      onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                      placeholder="Powered by AI Technology"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={settings.primary_color || "#7c3aed"}
                        onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.primary_color || "#7c3aed"}
                        onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                        placeholder="#7c3aed"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="secondary-color"
                        type="color"
                        value={settings.secondary_color || "#2563eb"}
                        onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.secondary_color || "#2563eb"}
                        onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                        placeholder="#2563eb"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="accent-color"
                        type="color"
                        value={settings.accent_color || "#10b981"}
                        onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.accent_color || "#10b981"}
                        onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                        placeholder="#10b981"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-message-length">Max Message Length</Label>
                    <Input
                      id="max-message-length"
                      type="number"
                      value={settings.max_message_length || 4000}
                      onChange={(e) =>
                        setSettings({ ...settings, max_message_length: Number.parseInt(e.target.value) || 4000 })
                      }
                      placeholder="4000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enable-guest-access">Enable Guest Access</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        id="enable-guest-access"
                        type="checkbox"
                        checked={settings.enable_guest_access || false}
                        onChange={(e) => setSettings({ ...settings, enable_guest_access: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-600">Allow users to chat without signing up</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-6">
            <div className="grid gap-6">
              {/* OpenRouter API Key */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="w-5 h-5" />
                    <span>OpenRouter Configuration</span>
                  </CardTitle>
                  <CardDescription>Configure your OpenRouter API key to access their model catalog.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="openrouter-api-key">OpenRouter API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="openrouter-api-key"
                        type={showApiKey ? "text" : "password"}
                        placeholder="sk-or-..."
                        value={settings.openrouter_api_key || ""}
                        onChange={(e) => setSettings({ ...settings, openrouter_api_key: e.target.value })}
                        className="flex-1"
                      />
                      <Button variant="outline" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Get your API key from{" "}
                      <a
                        href="https://openrouter.ai/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline"
                      >
                        OpenRouter Dashboard
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* OpenAI API Key */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="w-5 h-5" />
                    <span>OpenAI Configuration</span>
                  </CardTitle>
                  <CardDescription>Configure your OpenAI API key to access GPT models directly.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="openai-api-key">OpenAI API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="openai-api-key"
                        type={showOpenAIKey ? "text" : "password"}
                        placeholder="sk-..."
                        value={settings.openai_api_key || ""}
                        onChange={(e) => setSettings({ ...settings, openai_api_key: e.target.value })}
                        className="flex-1"
                      />
                      <Button variant="outline" size="icon" onClick={() => setShowOpenAIKey(!showOpenAIKey)}>
                        {showOpenAIKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Get your API key from{" "}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline"
                      >
                        OpenAI Platform
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Anthropic API Key */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="w-5 h-5" />
                    <span>Anthropic Configuration</span>
                  </CardTitle>
                  <CardDescription>Configure your Anthropic API key to access Claude models.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="anthropic-api-key">Anthropic API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="anthropic-api-key"
                        type={showAnthropicKey ? "text" : "password"}
                        placeholder="sk-ant-..."
                        value={settings.anthropic_api_key || ""}
                        onChange={(e) => setSettings({ ...settings, anthropic_api_key: e.target.value })}
                        className="flex-1"
                      />
                      <Button variant="outline" size="icon" onClick={() => setShowAnthropicKey(!showAnthropicKey)}>
                        {showAnthropicKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Get your API key from{" "}
                      <a
                        href="https://console.anthropic.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline"
                      >
                        Anthropic Console
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Google Gemini API Key */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="w-5 h-5" />
                    <span>Google Gemini Configuration</span>
                  </CardTitle>
                  <CardDescription>Configure your Google Gemini API key to access Gemini models.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gemini-api-key">Google Gemini API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="gemini-api-key"
                        type={showGeminiKey ? "text" : "password"}
                        placeholder="AIza..."
                        value={settings.gemini_api_key || ""}
                        onChange={(e) => setSettings({ ...settings, gemini_api_key: e.target.value })}
                        className="flex-1"
                      />
                      <Button variant="outline" size="icon" onClick={() => setShowGeminiKey(!showGeminiKey)}>
                        {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Get your API key from{" "}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline"
                      >
                        Google AI Studio
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save API Keys
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* AI Models Tab */}
          <TabsContent value="models" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5" />
                    <span>AI Models</span>
                  </div>
                  <Badge variant="outline">{models.length} models</Badge>
                </CardTitle>
                <CardDescription>Manage your available AI models and their settings.</CardDescription>
              </CardHeader>
              <CardContent>
                {models.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No models configured</h3>
                    <p className="text-gray-600 mb-4">Add AI models to enable chat functionality.</p>
                    <Button
                      onClick={() => {
                        const searchTab = document.querySelector('[value="search"]') as HTMLElement
                        searchTab?.click()
                      }}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Models
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {models.map((model) => (
                      <div
                        key={model.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-gray-900">{model.name}</h3>
                            <Badge variant={model.is_active ? "default" : "secondary"}>
                              {model.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {model.supports_images && <Badge variant="outline">Images</Badge>}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {model.model_id} • {model.provider}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Added {new Date(model.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={model.is_active}
                              onCheckedChange={(checked) => handleToggleModel(model.id, checked)}
                            />
                            <Label className="text-sm">Active</Label>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteModel(model.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Models Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Search AI Models</span>
                </CardTitle>
                <CardDescription>Search and add AI models from different providers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Provider Selection */}
                <div className="space-y-2">
                  <Label>AI Provider</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant={selectedProvider === "openrouter" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedProvider("openrouter")}
                    >
                      OpenRouter
                    </Button>
                    <Button
                      variant={selectedProvider === "openai" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedProvider("openai")}
                    >
                      OpenAI
                    </Button>
                    <Button
                      variant={selectedProvider === "anthropic" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedProvider("anthropic")}
                    >
                      Anthropic
                    </Button>
                    <Button
                      variant={selectedProvider === "gemini" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedProvider("gemini")}
                    >
                      Gemini
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Input
                    placeholder={
                      selectedProvider === "openrouter"
                        ? "Search models (e.g., gpt-4, claude, llama)..."
                        : selectedProvider === "openai"
                          ? "Search OpenAI models (e.g., gpt-4, gpt-3.5-turbo)..."
                          : selectedProvider === "anthropic"
                            ? "Search Anthropic models (e.g., claude-3, claude-3.5)..."
                            : "Search Gemini models (e.g., gemini-pro, gemini-2.0-flash)..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchModels()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearchModels} disabled={isSearching}>
                    {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>

                {/* API Key Warning */}
                {((selectedProvider === "openrouter" && !settings.openrouter_api_key) ||
                  (selectedProvider === "openai" && !settings.openai_api_key) ||
                  (selectedProvider === "anthropic" && !settings.anthropic_api_key) ||
                  (selectedProvider === "gemini" && !settings.gemini_api_key)) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      Please set your{" "}
                      {selectedProvider === "openrouter"
                        ? "OpenRouter"
                        : selectedProvider === "openai"
                          ? "OpenAI"
                          : selectedProvider === "anthropic"
                            ? "Anthropic"
                            : "Google Gemini"}{" "}
                      API key in the API Keys tab before searching for models.
                    </p>
                  </div>
                )}

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">
                      {selectedProvider === "openrouter"
                        ? "OpenRouter"
                        : selectedProvider === "openai"
                          ? "OpenAI"
                          : selectedProvider === "anthropic"
                            ? "Anthropic"
                            : "Google Gemini"}{" "}
                      Models ({searchResults.length} found)
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {searchResults.map((model) => {
                        const isAlreadyAdded = models.some((m) => m.model_id === model.id)
                        return (
                          <div
                            key={model.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{model.name}</h4>
                              <p className="text-sm text-gray-500">{model.id}</p>
                              {model.description && (
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{model.description}</p>
                              )}
                              {model.context_length && (
                                <p className="text-xs text-gray-400">
                                  Context: {model.context_length.toLocaleString()} tokens
                                </p>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              {model.supports_images && <Badge variant="outline">Images</Badge>}
                              <Badge variant="secondary" className="capitalize">
                                {selectedProvider}
                              </Badge>
                              {isAlreadyAdded ? (
                                <Badge variant="secondary">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Added
                                </Badge>
                              ) : (
                                <Button size="sm" onClick={() => handleAddModel(model)}>
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {searchQuery && searchResults.length === 0 && !isSearching && (
                  <div className="text-center py-8">
                    <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No models found</h3>
                    <p className="text-gray-600">Try a different search term or check your API key.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
