"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export function SignInForm({
  onSubmit,
  isLoading = false,
}: {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  isLoading?: boolean
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            placeholder="you@example.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            disabled={isLoading}
            required
            className="bg-background/50 border-border text-foreground 
              placeholder:text-muted-foreground 
              focus-visible:ring-primary focus-visible:border-primary"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-foreground">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs hover:underline underline-offset-4 
                text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>

          <Input
            id="password"
            name="password"
            placeholder="••••••••"
            type="password"
            autoCapitalize="none"
            autoComplete="current-password"
            disabled={isLoading}
            required
            className="bg-background/50 border-border text-foreground 
              placeholder:text-muted-foreground 
              focus-visible:ring-primary focus-visible:border-primary"
          />
        </div>
      </div>

      {/* Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-primary to-accent 
          hover:shadow-lg hover:shadow-primary/30 
          text-primary-foreground font-bold h-12 
          transition-all duration-300"
      >
        {isLoading ? "Signing In..." : "Sign In"}
      </Button>
    </form>
  )
}
