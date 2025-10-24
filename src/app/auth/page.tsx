import { auth } from "@/lib/auth";
import AuthClientPage from "./auth-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface AuthPageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const isSignIn = params.view !== "signup";

  return <AuthClientPage isSignIn={isSignIn} />;
}
