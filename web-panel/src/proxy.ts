/**
 * middleware.ts / proxy.ts
 * 
 * Centralized Role-Based Access Control (RBAC) Middleware.
 * Leverages `next-auth/middleware` to intercept requests on matcher paths,
 * parses the authenticated user JWT session, and validates custom permissions.
 */
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

interface AccessRule {
  prefix: string;        // URL path prefix to check against
  allowedRoles: string[]; // Set of roles that have read/write access
}

// Access rules are evaluated top-to-bottom. 
// Place more specific or restrictive paths at the very top of the list.
const routeAccessRules: AccessRule[] = [
  { prefix: "/admin", allowedRoles: ["ADMIN"] },
  { prefix: "/api/admin", allowedRoles: ["ADMIN"] },

  // Faculty workspace & management access
  { prefix: "/faculty", allowedRoles: ["ADMIN", "FACULTY"] },
  { prefix: "/api/faculty", allowedRoles: ["ADMIN", "FACULTY"] },

  // Physical/Virtual Lab configuration routes
  { prefix: "/labs", allowedRoles: ["ADMIN", "FACULTY"] },

  // Standard user workspace access (any valid user)
  { prefix: "/dashboard", allowedRoles: ["ADMIN", "FACULTY", "USER"] },
];

export default withAuth(
  function proxy(request: NextRequestWithAuth) {
    const token = request.nextauth.token;
    const pathname = request.nextUrl.pathname;
    const isApiRoute = pathname.startsWith("/api");

    const userRoles = (token?.role as string[]) || [];

    const matchingRule = routeAccessRules.find((rule) =>
      pathname.startsWith(rule.prefix),
    );

    if (matchingRule) {
      const hasAccess = matchingRule.allowedRoles.some((requiredRole) =>
        userRoles.includes(requiredRole),
      );

      if (!hasAccess) {
        if (isApiRoute) {
          return NextResponse.json(
            { error: "Forbidden: Insufficient permissions" },
            { status: 403 },
          );
        }

        return NextResponse.redirect(new URL("/access-denied", request.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }: { token: any }) => !!token && token.invalid !== true,
    },
  },
);

// Define explicit route matchers for intercepting incoming HTTP requests requiring authentication
export const config = {
  matcher: [
    "/api/admin/:path*",
    "/faculty/:path*",
    "/labs/:path*",
    "/dashboard/:path*",
    "/api/protected/:path*",
  ],
};
