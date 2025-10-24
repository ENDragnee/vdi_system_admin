"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

export function SignInForm({
  onSubmit,
  isLoading = false,
  handleSocial,
}: {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  isLoading?: boolean
  handleSocial: (provider: "google" | "apple") => Promise<void>
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-200">
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
            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-blue-600 focus-visible:border-blue-600"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-slate-200">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs hover:underline underline-offset-4 text-slate-400 hover:text-slate-300"
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
            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-blue-600 focus-visible:border-blue-600"
          />
        </div>
      </div>

      {/* <div className="flex items-center space-x-2">
        <Checkbox id="remember" className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
        <label htmlFor="remember" className="text-sm text-slate-400">
          Remember me
        </label>
      </div> */}

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12"
        disabled={isLoading}
      >
        {isLoading ? "Signing In..." : "Sign In"}
      </Button>


    </form>
  )
}
