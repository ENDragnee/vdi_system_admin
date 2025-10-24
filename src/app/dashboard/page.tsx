import { auth } from "@/lib/auth";
import DashboardPage from "./page-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth?view=signin");
  }

  return <DashboardPage session={session} />;
}
