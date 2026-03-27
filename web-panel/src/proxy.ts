// middleware.ts (or proxy.ts)
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// 1. Define your Role-Based Access Control (RBAC) rules here.
// Routes are evaluated top-to-bottom. Put more specific paths at the top.
const routeAccessRules = [
  { prefix: "/admin", allowedRoles: ["ADMIN"] },
  { prefix: "/api/admin", allowedRoles: ["ADMIN"] },

  // Example: Faculty routes allow both ADMIN and FACULTY
  { prefix: "/faculty", allowedRoles: ["ADMIN", "FACULTY"] },
  { prefix: "/api/faculty", allowedRoles: ["ADMIN", "FACULTY"] },

  // Example: Lab management
  { prefix: "/labs", allowedRoles: ["ADMIN", "FACULTY"] },

  // Generic protected routes that require ANY valid user
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
      authorized: ({ token }) => !!token && token.invalid !== true,
    },
  },
);

// 6. Define ALL paths that require authentication here.
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/faculty/:path*",
    "/api/faculty/:path*",
    "/labs/:path*",
    "/dashboard/:path*",
    "/api/protected/:path*",
  ],
};
