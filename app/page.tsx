import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LogOut, Bot, MessageSquare, Settings, Sparkles, Users, Shield, Zap } from "lucide-react"
import { signOut } from "@/lib/actions"
import Link from "next/link"

export default async function Home() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: siteSettings } = await supabase
    .from("site_settings")
    .select(`
      site_name,
      welcome_message,
      footer_text,
      enable_guest_access,
      logo_url
    `)
    .single()

  // Use default values if no settings exist
  const siteName = siteSettings?.site_name || "AI Assistant"
  const welcomeMessage = siteSettings?.welcome_message || "Welcome to our AI Assistant"
  const footerText = siteSettings?.footer_text || "Powered by AI Technology"
  const enableGuestAccess = siteSettings?.enable_guest_access ?? true
  const logoUrl = siteSettings?.logo_url

  if (!user) {
    // Show public landing page for unauthenticated users
    return (
      <div className="min-h-screen">
        {/* Public Header */}
        <header className="glass-effect border-b border-gray-200/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
                >
                  {logoUrl ? (
                    <img src={logoUrl || "/placeholder.svg"} alt={siteName} className="w-6 h-6 object-contain" />
                  ) : (
                    <Bot className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">{siteName}</h1>
                  <p className="text-xs text-gray-500">Powered by Advanced AI</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="bg-transparent">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="sm"
                    className="text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Public Landing Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Hero Section */}
          <div className="text-center space-y-8 mb-16">
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {welcomeMessage.includes("AI") ? (
                  <>
                    {welcomeMessage.split("AI")[0]}
                    <span className="gradient-text">AI{welcomeMessage.split("AI")[1]}</span>
                  </>
                ) : (
                  <>
                    {welcomeMessage} <span className="gradient-text">AI Conversation</span>
                  </>
                )}
              </h2>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Chat with powerful AI models, save your conversations, and explore the limitless possibilities of
                artificial intelligence.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scale-in">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
              </Link>
              {enableGuestAccess && (
                <Link href="/guest">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto px-8 py-4 text-lg font-medium hover:bg-gray-50 transition-all duration-200 bg-transparent"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Try as Guest
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200"
                  style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Advanced AI Models</h3>
                <p className="text-gray-600 leading-relaxed">
                  Access cutting-edge language models including GPT-4, Claude, and Llama through our integrated
                  platform.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200"
                  style={{ background: "linear-gradient(135deg, var(--secondary), var(--accent))" }}
                >
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Private</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your conversations are encrypted and stored securely.{" "}
                  {enableGuestAccess && "Guest mode available for anonymous usage."}
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200"
                  style={{ background: "linear-gradient(135deg, var(--accent), var(--primary))" }}
                >
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get instant responses with our optimized infrastructure and real-time streaming capabilities.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Rich Conversations</h3>
                <p className="text-gray-600 leading-relaxed">
                  Enjoy formatted responses with code blocks, tables, and rich text for enhanced readability.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Save Your History</h3>
                <p className="text-gray-600 leading-relaxed">
                  Access your conversation history from anywhere and continue where you left off across all your
                  devices.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Features</h3>
                <p className="text-gray-600 leading-relaxed">
                  Enjoy intelligent conversation management, model selection, and personalized AI interactions.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16 sm:mt-20">
            <div className="glass-effect rounded-2xl p-8 sm:p-12 max-w-4xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Ready to Experience the Future?</h3>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already exploring the possibilities of AI-powered conversations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-white px-12 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
                  >
                    Create Free Account
                  </Button>
                </Link>
                {enableGuestAccess && (
                  <Link href="/guest">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto px-12 py-4 text-lg font-medium hover:bg-gray-50 transition-all duration-200 bg-transparent"
                    >
                      Start as Guest
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </main>

        <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600">{footerText}</p>
          </div>
        </footer>
      </div>
    )
  }

  // Get user data from our users table for authenticated users
  const { data: userData } = await supabase.from("users").select("username, is_admin").eq("id", user.id).single()

  // Get active models count
  const { count: modelsCount } = await supabase.from("ai_models").select("*", { count: "exact" }).eq("is_active", true)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-effect border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
              >
                {logoUrl ? (
                  <img src={logoUrl || "/placeholder.svg"} alt={siteName} className="w-6 h-6 object-contain" />
                ) : (
                  <Bot className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">{siteName}</h1>
                <p className="text-xs text-gray-500">Powered by Advanced AI</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <span>Welcome, {userData?.username || user.email?.split("@")[0]}</span>
              </div>
              {userData?.is_admin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <form action={signOut}>
                <Button type="submit" variant="outline" size="sm">
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-16">
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Welcome back to <span className="gradient-text">{siteName}</span>
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Continue your AI conversations and explore new possibilities with our advanced language models.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-center animate-slide-up">
            <div className="flex flex-col items-center">
              <div className="text-2xl sm:text-3xl font-bold gradient-text">{modelsCount || 0}</div>
              <div className="text-sm text-gray-600">AI Models</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl sm:text-3xl font-bold gradient-text">∞</div>
              <div className="text-sm text-gray-600">Conversations</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl sm:text-3xl font-bold gradient-text">24/7</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scale-in">
            <Link href="/chat">
              <Button
                size="lg"
                className="w-full sm:w-auto text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Start Chatting
              </Button>
            </Link>
            <Link href="/history">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 py-4 text-lg font-medium hover:bg-gray-50 transition-all duration-200 bg-transparent"
              >
                View History
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
            <CardContent className="p-6 sm:p-8">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Advanced AI Models</h3>
              <p className="text-gray-600 leading-relaxed">
                Access cutting-edge language models including GPT-4, Claude, and Llama through our integrated platform.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
            <CardContent className="p-6 sm:p-8">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200"
                style={{ background: "linear-gradient(135deg, var(--secondary), var(--accent))" }}
              >
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Private</h3>
              <p className="text-gray-600 leading-relaxed">
                Your conversations are encrypted and stored securely.{" "}
                {enableGuestAccess && "Guest mode available for anonymous usage."}
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
            <CardContent className="p-6 sm:p-8">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--primary))" }}
              >
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant responses with our optimized infrastructure and real-time streaming capabilities.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
            <CardContent className="p-6 sm:p-8">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Rich Conversations</h3>
              <p className="text-gray-600 leading-relaxed">
                Enjoy formatted responses with code blocks, tables, and rich text for enhanced readability.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
            <CardContent className="p-6 sm:p-8">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Save Your History</h3>
              <p className="text-gray-600 leading-relaxed">
                Access your conversation history from anywhere and continue where you left off across all your devices.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
            <CardContent className="p-6 sm:p-8">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Features</h3>
              <p className="text-gray-600 leading-relaxed">
                Enjoy intelligent conversation management, model selection, and personalized AI interactions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 sm:mt-20">
          <div className="glass-effect rounded-2xl p-8 sm:p-12 max-w-4xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Ready to Continue Your Journey?</h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Dive back into your AI conversations and discover new possibilities.
            </p>
            <Link href="/chat">
              <Button
                size="lg"
                className="text-white px-12 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
              >
                Continue Chatting
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">{footerText}</p>
        </div>
      </footer>
    </div>
  )
}
