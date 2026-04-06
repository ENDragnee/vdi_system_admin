import { authOptions } from "@/lib/auth";
import AuthClientPage from "./auth-client";
import { roleRedirector } from "@/lib/redirector";
import { getServerSession } from "next-auth";

export default async function AuthPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    await roleRedirector();
  }

  return <AuthClientPage />;
}
