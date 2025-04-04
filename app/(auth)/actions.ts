"use server"

import { z } from "zod"

import { createPasswordResetToken, createUser, getUser, resetPassword as dbResetPassword } from "@/db/queries"
import { sendPasswordResetEmail } from "@/lib/email"
import { authConfig } from "./auth.config.ts"
import { signIn } from "./auth"

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export interface LoginActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data"
}

export const login = async (_: LoginActionState, formData: FormData): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    })

    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    })

    return { status: "success" }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" }
    }

    return { status: "failed" }
  }
}

export interface RegisterActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "user_exists" | "invalid_data"
}

export const register = async (_: RegisterActionState, formData: FormData): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    })

    const [user] = await getUser(validatedData.email)

    if (user) {
      return { status: "user_exists" } as RegisterActionState
    } else {
      await createUser(validatedData.email, validatedData.password)
      await signIn("credentials", {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      })

      return { status: "success" }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" }
    }

    return { status: "failed" }
  }
}

export async function requestPasswordReset(email: string) {
  try {
    // Check if user exists
    const users = await getUser(email)

    if (users.length === 0) {
      // Don't reveal that the user doesn't exist for security reasons
      // Instead, pretend we sent an email
      return { success: true }
    }

    // Generate a reset token
    const resetToken = await createPasswordResetToken(email)

    // Create the reset link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const resetLink = `${appUrl}/reset-password/${resetToken}`

    // Send the password reset email
    const emailSent = await sendPasswordResetEmail(email, resetLink)

    if (!emailSent) {
      console.error("Failed to send password reset email")
      // For development, still log the link so we can test
      console.log(`Password reset link: ${resetLink}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error requesting password reset:", error)
    return { success: false, message: "Failed to process password reset request" }
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    // Validate token and reset password
    await dbResetPassword(token, newPassword)
    return { success: true }
  } catch (error) {
    console.error("Error resetting password:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to reset password",
    }
  }
}

