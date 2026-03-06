import DashboardPage from "./page-client";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth?view=signin");
  }

  return <DashboardPage session={session} />;
}
