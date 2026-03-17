import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthClientPage from "./auth-client";
import { getServerSession } from "next-auth";

export default async function AuthPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return <AuthClientPage />;
}
