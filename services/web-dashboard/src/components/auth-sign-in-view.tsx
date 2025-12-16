"use client"

import type React from "react"
import Link from "next/link"
import { SignInForm } from "@/components/signin-form"
import { AuthErrorDisplay } from "@/components/auth-error-display"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SignInViewProps {
  onSubmit: (e: React.FormEvent) => Promise<void>
  isLoading: boolean
  handleSocial: (provider: "google" | "apple") => Promise<void>
  error?: string
}

export function SignInView({ onSubmit, isLoading, handleSocial, error }: SignInViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <AuthErrorDisplay error={error || ""} />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your account</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Sign In</CardTitle>
            <CardDescription className="text-slate-400">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <SignInForm onSubmit={onSubmit} isLoading={isLoading} handleSocial={handleSocial} />
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm">
          <span className="text-slate-400">Don't have an account? </span>
          <Link href="/auth?view=signup" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
