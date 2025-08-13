import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminDashboard from "@/components/admin-dashboard"

export default async function AdminPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: userData } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

  if (!userData?.is_admin) {
    redirect("/")
  }

  // Get current site settings
  const { data: siteSettings } = await supabase.from("site_settings").select("*").single()

  // Get all AI models
  const { data: aiModels } = await supabase.from("ai_models").select("*").order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <AdminDashboard user={user} siteSettings={siteSettings} aiModels={aiModels || []} />
    </div>
  )
}
