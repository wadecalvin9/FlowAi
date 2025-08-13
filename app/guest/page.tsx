import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bot, MessageSquare, UserCheck, Sparkles, Clock, Shield } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function GuestPage() {
  const supabase = createClient()
  const { data: siteSettings } = await supabase
    .from("site_settings")
    .select(`
      site_name,
      welcome_message,
      footer_text,
      logo_url
    `)
    .single()

  // Use default values if no settings exist
  const siteName = siteSettings?.site_name || "AI Assistant"
  const welcomeMessage = siteSettings?.welcome_message || "Welcome to our AI Assistant"
  const footerText = siteSettings?.footer_text || "Powered by AI Technology"
  const logoUrl = siteSettings?.logo_url

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
                <p className="text-xs text-gray-500">Guest Mode</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline" size="sm" className="hover:bg-white/50 bg-transparent">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-8 mb-12">
          <div className="space-y-4 animate-fade-in">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
            >
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Welcome, <span className="gradient-text">Guest!</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Try {siteName} without creating an account. Experience the power of AI conversation instantly.
            </p>
          </div>

          {/* Guest Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "linear-gradient(135deg, var(--accent), var(--secondary))" }}
                >
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Instant Access</h3>
                <p className="text-sm text-gray-600">Start chatting immediately without any setup</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}
                >
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Private & Secure</h3>
                <p className="text-sm text-gray-600">Your conversations are not stored or tracked</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "linear-gradient(135deg, var(--secondary), var(--primary))" }}
                >
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Full AI Power</h3>
                <p className="text-sm text-gray-600">Access to all available AI models and features</p>
              </CardContent>
            </Card>
          </div>

          {/* Limitation Notice */}
          <div className="glass-effect rounded-xl p-6 max-w-2xl mx-auto animate-slide-up">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900 mb-2">Guest Mode Limitations</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Your chat history won't be saved in guest mode. Create an account to save conversations and access
                  additional features.
                </p>
                <Link href="/auth/signup" className="text-sm font-medium" style={{ color: "var(--primary)" }}>
                  Create a free account →
                </Link>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scale-in">
            <Link href="/chat?mode=guest">
              <Button
                size="lg"
                className="w-full sm:w-auto text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Start Chatting
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 py-4 text-lg font-medium hover:bg-white/50 transition-all duration-200 bg-transparent"
              >
                Create Account
              </Button>
            </Link>
          </div>
        </div>

        <footer className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-600">{footerText}</p>
        </footer>
      </main>
    </div>
  )
}
