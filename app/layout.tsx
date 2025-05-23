import type React from "react"
import type { Metadata } from "next"
import { Toaster } from "sonner"

import { Navbar } from "@/components/custom/navbar"
import { ThemeProvider } from "@/components/custom/theme-provider"

import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://chat.sorvx.com"),
  title: "Sorvx AI",
  description: "Sorvx AI IS a Chatbot For Solving Problems Made By Sorvx Labs",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Toaster position="top-center" />
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'