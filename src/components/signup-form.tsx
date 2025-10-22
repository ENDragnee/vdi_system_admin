"use client"

import type React from "react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export function SignUpForm({
  onSubmit,
  isLoading = false,
  handleSocial
}: { onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>; isLoading?: boolean; handleSocial: (provider: "google" | "apple") => Promise<void> }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors }

    if (name === "email") {
      if (!value) {
        newErrors.email = "Email is required"
      } else if (!isValidEmail(value)) {
        newErrors.email = "Please enter a valid email address"
      } else {
        delete newErrors.email
      }
    }

    if (name === "password") {
      if (!value) {
        newErrors.password = "Password is required"
      } else if (value.length < 8) {
        newErrors.password = "Password must be at least 8 characters"
      } else {
        delete newErrors.password
      }
      // Check if passwords match when password changes
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      } else if (formData.confirmPassword && value === formData.confirmPassword) {
        delete newErrors.confirmPassword
      }
    }

    if (name === "confirmPassword") {
      if (!value) {
        newErrors.confirmPassword = "Please confirm your password"
      } else if (value !== formData.password) {
        newErrors.confirmPassword = "Passwords do not match"
      } else {
        delete newErrors.confirmPassword
      }
    }

    setErrors(newErrors)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const isFormValid =
    formData.email && formData.password && formData.confirmPassword && Object.keys(errors).length === 0

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="uppercase text-xs tracking-wider font-medium">
              First Name
            </Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="John"
              type="text"
              autoCapitalize="none"
              autoComplete="given-name"
              autoCorrect="off"
              disabled={isLoading}
              required
              className="border-2 focus-visible:ring-[#D4FF00] focus-visible:border-[#D4FF00]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="uppercase text-xs tracking-wider font-medium">
              Last Name
            </Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Doe"
              type="text"
              autoCapitalize="none"
              autoComplete="family-name"
              autoCorrect="off"
              disabled={isLoading}
              required
              className="border-2 focus-visible:ring-[#D4FF00] focus-visible:border-[#D4FF00]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="uppercase text-xs tracking-wider font-medium">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            placeholder="name@example.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            disabled={isLoading}
            required
            value={formData.email}
            onChange={handleChange}
            className={`border-2 focus-visible:ring-[#D4FF00] focus-visible:border-[#D4FF00] ${
              errors.email ? "border-red-500" : ""
            }`}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="uppercase text-xs tracking-wider font-medium">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            placeholder="••••••••"
            type="password"
            autoCapitalize="none"
            autoComplete="new-password"
            disabled={isLoading}
            required
            value={formData.password}
            onChange={handleChange}
            className={`border-2 focus-visible:ring-[#D4FF00] focus-visible:border-[#D4FF00] ${
              errors.password ? "border-red-500" : ""
            }`}
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="uppercase text-xs tracking-wider font-medium">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            placeholder="••••••••"
            type="password"
            autoCapitalize="none"
            autoComplete="new-password"
            disabled={isLoading}
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`border-2 focus-visible:ring-[#D4FF00] focus-visible:border-[#D4FF00] ${
              errors.confirmPassword ? "border-red-500" : ""
            }`}
          />
          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
        </div>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          required
          className="mt-1 data-[state=checked]:bg-[#D4FF00] data-[state=checked]:border-[#D4FF00] data-[state=checked]:text-foreground"
        />
        <label htmlFor="terms" className="text-sm leading-relaxed text-muted-foreground">
          I agree to the{" "}
          <a href="#" className="underline underline-offset-4 hover:text-foreground">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-4 hover:text-foreground">
            Privacy Policy
          </a>
        </label>
      </div>

      <Button
        type="submit"
        className="w-full bg-[#D4FF00] hover:bg-[#D4FF00]/90 text-foreground font-bold uppercase tracking-wider h-12"
        disabled={isLoading || !isFormValid}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground tracking-wider">Or continue with</span>
        </div>
      </div>
    </form>
  )
}
