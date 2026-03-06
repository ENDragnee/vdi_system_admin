"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { SignInView } from "@/components/auth-sign-in-view";
import { AuthErrorDisplay } from "@/components/auth-error-display";
import { useRouter } from "next/navigation";

export default function AuthClientPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const formEmail = formData.get("email") as string;
    const formPassword = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        email: formEmail,
        password: formPassword,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else if (res?.ok) {
        router.push('/dashboard');
        router.refresh();
      }

    } catch (err) {
      setError(
        `Authentication error: ${err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // start timer
    const timer = setTimeout(() => {
      setError("");
    }, 3000);

    // cleanup when component unmounts
    return () => clearTimeout(timer);
  }, [error]);

  return (
    <>
      <AuthErrorDisplay error={error} />
      <SignInView onSubmit={handleEmailAuth} isLoading={isLoading} />
    </>
  );
}
