"use client"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { SubmitButton } from "@/components/custom/submit-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestPasswordReset } from "../actions"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    try {
      const email = formData.get("email") as string
      const result = await requestPasswordReset(email)

      if (result.success) {
        setIsSubmitted(true)
      } else {
        toast.error(result.message || "Failed to send reset email")
      }
    } catch (error) {
      console.error("Error requesting password reset:", error)
      toast.error("An unexpected error occurred")
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-8">
          <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
            <h3 className="text-xl font-semibold dark:text-zinc-50">Check your email</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              If an account exists with {email}, we've sent a password reset link.
            </p>
          </div>
          <div className="flex flex-col gap-4 px-4 sm:px-16">
            <Button asChild>
              <Link href="/login">Return to login</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-8">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Forgot Password</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        <form className="flex flex-col gap-4 px-4 sm:px-16" action={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-zinc-600 font-normal dark:text-zinc-400">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              className="bg-muted text-md md:text-sm border-none"
              type="email"
              placeholder="example@sorvx.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email Address"
            />
          </div>
          <SubmitButton>Send Reset Link</SubmitButton>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            Remember your password?{" "}
            <Link href="/login" className="font-semibold text-gray-800 hover:underline dark:text-zinc-200">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

