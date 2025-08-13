"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const username = formData.get("username")

  if (!email || !password || !username) {
    return { error: "Email, password, and username are required" }
  }

  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    })

    if (error) {
      return { error: error.message }
    }

    if (data.user) {
      const { error: userError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          email: email.toString(),
          username: username.toString(),
          is_admin: false,
          // password_hash is now nullable and not provided
        },
      ])

      if (userError) {
        console.error("User creation error:", userError)
        return { error: "Failed to create user profile" }
      }

      return { success: "Check your email to confirm your account." }
    }

    return { error: "Failed to create account" }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    if (data.user) {
      const { data: existingUser } = await supabase.from("users").select("id").eq("id", data.user.id).single()

      if (!existingUser) {
        // Create user record if it doesn't exist
        const { error: userError } = await supabase.from("users").insert([
          {
            id: data.user.id,
            email: data.user.email || email.toString(),
            username: data.user.email?.split("@")[0] || "user",
            is_admin: false,
          },
        ])

        if (userError) {
          console.error("User creation error on signin:", userError)
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/auth/login")
}
