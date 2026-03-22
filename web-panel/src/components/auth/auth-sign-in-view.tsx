"use client"

import type React from "react"
import { SignInForm } from "./signin-form"
import { AuthErrorDisplay } from "./auth-error-display"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SignInViewProps {
  onSubmit: (e: React.FormEvent) => Promise<void>
  isLoading: boolean
  error?: string
}

export function SignInView({ onSubmit, isLoading, error }: SignInViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center 
      bg-gradient-to-b from-background via-background to-muted/30 
      dark:from-background dark:via-background dark:to-primary/5 
      p-4 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent/10 dark:bg-accent/5 rounded-full blur-3xl animate-pulse delay-300"></div>
      </div>

      <div className="w-full max-w-md relative">
        <AuthErrorDisplay error={error || ""} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 
            bg-gradient-to-br from-primary to-accent rounded-lg mb-4 shadow-lg"
          >
            <span className="text-primary-foreground font-bold text-lg">D</span>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome Back
          </h1>

          <p className="text-foreground/70">
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <Card className="bg-card/80 dark:bg-card/50 backdrop-blur-sm 
          border-border/50 hover:border-primary/50 
          transition-all duration-300 shadow-lg"
        >
          <CardHeader>
            <CardTitle className="text-foreground">Sign In</CardTitle>
            <CardDescription className="text-foreground/70">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <SignInForm onSubmit={onSubmit} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
