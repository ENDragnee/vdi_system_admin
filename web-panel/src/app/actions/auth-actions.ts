"use server";

import { getActionSession } from "@/lib/auth";
import { ROLES } from "@/lib/redirector"; // Assuming ROLES constant is exported

export async function getRedirectPath() {
  try {
    const user = await getActionSession();
    const userRoles = user.role || [];

    // Check roles in order of priority
    if (userRoles.includes(ROLES.ADMIN)) return "/admin/dashboard";
    if (userRoles.includes(ROLES.FACULTY)) return "/faculty/dashboard";
    return "/dashboard"; // Default
  } catch (error) {
    return "/auth/signin"; // Fallback if session is invalid
  }
}
