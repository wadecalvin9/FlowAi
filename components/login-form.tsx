"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Bot, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "@/lib/actions"
import { useEffect } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full text-white font-medium h-12 shadow-lg hover:shadow-xl transition-all duration-200"
      style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Sign In
        </>
      )}
    </Button>
  )
}

export default function LoginForm() {
  const [state, formAction] = useActionState(signIn, null)
  const router = useRouter()

  useEffect(() => {
    if (state?.success) {
      router.push("/")
      router.refresh()
    }
  }, [state?.success, router])

  return (
    <Card className="w-full max-w-md mx-auto glass-effect border-0 shadow-2xl animate-scale-in">
      <CardHeader className="space-y-4 text-center pb-6">
        <div
          className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
        >
          <Bot className="w-8 h-8 text-white" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome back</CardTitle>
          <CardDescription className="text-gray-600 mt-2">Sign in to access your AI conversations</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-slide-up">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80"
            />
          </div>

          <SubmitButton />
        </form>

        <div className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="font-medium" style={{ color: "var(--primary)" }}>
            Sign up
          </Link>
        </div>

        <div className="text-center">
          <Link href="/guest" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Continue as guest
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
