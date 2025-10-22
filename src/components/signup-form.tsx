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
  handleSocial,
}: {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  isLoading?: boolean
  handleSocial: (provider: "google" | "apple") => Promise<void>
}) {
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
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-slate-200">
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
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-slate-200">
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
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-200">
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
            className={`bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${
              errors.email ? "border-red-500" : ""
            }`}
          />
          {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-200">
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
            className={`bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${
              errors.password ? "border-red-500" : ""
            }`}
          />
          {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-slate-200">
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
            className={`bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 ${
              errors.confirmPassword ? "border-red-500" : ""
            }`}
          />
          {errors.confirmPassword && <p className="text-sm text-red-400">{errors.confirmPassword}</p>}
        </div>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          required
          className="mt-1 border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
        <label htmlFor="terms" className="text-sm leading-relaxed text-slate-400">
          I agree to the{" "}
          <a href="#" className="underline underline-offset-4 hover:text-slate-300 text-blue-400">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-4 hover:text-slate-300 text-blue-400">
            Privacy Policy
          </a>
        </label>
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12"
        disabled={isLoading || !isFormValid}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-800/50 px-2 text-slate-400 tracking-wider">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          onClick={() => handleSocial("google")}
          variant="outline"
          disabled={isLoading}
          className="border-slate-600 hover:border-blue-600 hover:bg-blue-600/10 bg-transparent text-slate-200"
        >
          Google
        </Button>
        <Button
          type="button"
          onClick={() => handleSocial("apple")}
          variant="outline"
          disabled={isLoading}
          className="border-slate-600 hover:border-blue-600 hover:bg-blue-600/10 bg-transparent text-slate-200"
        >
          Apple
        </Button>
      </div>
    </form>
  )
}
