"use client"

import type React from "react"

import Link from "next/link"
import { SignUpForm } from "@/components/signup-form"
import { AuthErrorDisplay } from "@/components/auth-error-display"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Server } from "lucide-react"

interface SignUpViewProps {
  onSubmit: (e: React.FormEvent) => Promise<void>
  isLoading: boolean
  handleSocial: (provider: "google" | "apple") => Promise<void>
  error?: string
}

export function SignUpView({ onSubmit, isLoading, handleSocial, error }: SignUpViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <AuthErrorDisplay error={error || ""} />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <Server className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-400">Join the future of fashion</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Sign Up</CardTitle>
            <CardDescription className="text-slate-400">Create a new account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm onSubmit={onSubmit} isLoading={isLoading} handleSocial={handleSocial} />
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm">
          <span className="text-slate-400">Already have an account? </span>
          <Link
            href="/auth?view=signin"
            className="font-medium text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
