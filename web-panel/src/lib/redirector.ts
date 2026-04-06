import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";

// Define the role constants to match your database exactly
export const ROLES = {
  ADMIN: "ADMIN",
  FACULTY: "FACULTY",
  USER: "USER",
} as const;

export async function roleRedirector() {
  const session = await getServerSession(authOptions);

  // 1. Not logged in -> Go to sign in
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userRoles = session.user.role || [];

  // 2. Check roles in order of priority (Admin > Faculty > User)
  if (userRoles.includes(ROLES.ADMIN)) {
    redirect("/admin/dashboard");
  }

  if (userRoles.includes(ROLES.FACULTY)) {
    redirect("/faculty/dashboard");
  }

  if (userRoles.includes(ROLES.USER)) {
    redirect("/user/dashboard"); // Or wherever standard users go
  }

  // 3. Fallback if they have no valid roles but are logged in
  redirect("/unauthorized");
}
