"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

import { SubmitButton } from "@/components/custom/submit-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "../../actions"

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    try {
      const password = formData.get("password") as string
      const confirmPassword = formData.get("confirmPassword") as string

      if (password !== confirmPassword) {
        toast.error("Passwords do not match")
        return
      }

      if (password.length < 6) {
        toast.error("Password must be at least 6 characters")
        return
      }

      const result = await resetPassword(params.token, password)

      if (result.success) {
        setIsSubmitted(true)
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        toast.error(result.message || "Failed to reset password")
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      toast.error("An unexpected error occurred")
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-8">
          <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
            <h3 className="text-xl font-semibold dark:text-zinc-50">Password Reset Successful</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Your password has been reset successfully. You will be redirected to the login page.
            </p>
          </div>
          <div className="flex flex-col gap-4 px-4 sm:px-16">
            <Button asChild>
              <Link href="/login">Go to login</Link>
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
          <h3 className="text-xl font-semibold dark:text-zinc-50">Reset Password</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Enter your new password below.</p>
        </div>
        <form className="flex flex-col gap-4 px-4 sm:px-16" action={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-zinc-600 font-normal dark:text-zinc-400">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                className="bg-muted text-md md:text-sm border-none pr-10"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                aria-label="New Password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword" className="text-zinc-600 font-normal dark:text-zinc-400">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                className="bg-muted text-md md:text-sm border-none pr-10"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={6}
                aria-label="Confirm New Password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <SubmitButton>Reset Password</SubmitButton>
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

