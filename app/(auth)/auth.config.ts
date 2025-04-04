// app/(auth)/auth.config.ts
import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    // Add forgot password page
    forgotPassword: '/forgot-password',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      return true
    },
  },
  providers: [], // You'll configure these in auth.ts
}
