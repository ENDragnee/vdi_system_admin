import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";

export async function protectRoute(allowedRole: "ADMIN" | "FACULTY") {
  const session = await getServerSession(authOptions);

  // 1. Not Authenticated
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userRoles = session.user.role || [];

  // 2. Specific Check for Admin (Admins can bypass Faculty checks if they have both roles)
  if (allowedRole === "ADMIN" && !userRoles.includes("ADMIN")) {
    redirect("/unauthorized");
  }

  // 3. Specific Check for Faculty
  if (allowedRole === "FACULTY") {
    // If they are an Admin, allow them to view Faculty routes for management purposes
    if (userRoles.includes("ADMIN")) return session;

    // Standard Faculty must have a Lab assigned
    if (!userRoles.includes("FACULTY")) redirect("/unauthorized");
    if (!session.user.labId) redirect("/unauthorized?error=no_lab");
  }

  return session;
}
