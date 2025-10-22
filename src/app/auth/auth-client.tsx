"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, signInSocial, signUp } from "@/lib/actions/auth-actions";
import { SignInView } from "@/components/auth-sign-in-view";
import { SignUpView } from "@/components/auth-sign-up-view";
import { AuthErrorDisplay } from "@/components/auth-error-display";

interface AuthClientPageProps {
  isSignIn: boolean;
}

export default function AuthClientPage({
  isSignIn: initialIsSignIn,
}: AuthClientPageProps) {
  const [isSignIn, setIsSignIn] = useState(initialIsSignIn);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSocialAuth = async (provider: "google" | "apple") => {
    setIsLoading(true);
    setError("");

    try {
      await signInSocial(provider);
    } catch (err) {
      setError(
        `Error authenticating with ${provider}: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const formEmail = formData.get("email") as string;
    const formPassword = formData.get("password") as string;
    console.log("heei fp", formPassword);

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const formName = firstName && lastName ? `${firstName} ${lastName}` : "";

    try {
      if (isSignIn) {
        const result = await signIn(formEmail, formPassword);
        if (!result.user) {
          setError("Invalid email or password");
        } else {
          // Navigate client-side immediately after successful sign in
          router.push("/shop");
        }
      } else {
        const result = await signUp(formEmail, formPassword, formName);
        if (!result.user) {
          setError("Failed to create account");
        } else {
          // Navigate client-side immediately after successful sign up
          router.push("/shop");
        }
      }
    } catch (err) {
      setError(
        `Authentication error: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Keep local isSignIn in sync with prop when the URL/search params change
  useEffect(() => {
    setIsSignIn(initialIsSignIn);
  }, [initialIsSignIn]);

  return (
    <>
      {isSignIn ? (
        <SignInView onSubmit={handleEmailAuth} isLoading={isLoading} handleSocial={handleSocialAuth} />
      ) : (
        <SignUpView onSubmit={handleEmailAuth} isLoading={isLoading} handleSocial={handleSocialAuth}/>
      )}

      <AuthErrorDisplay error={error} />
    </>
  );
}
