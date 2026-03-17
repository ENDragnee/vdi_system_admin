// proxy.ts
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(request: NextRequestWithAuth) {
    const token = request.nextauth.token;
    const isApiRoute = request.nextUrl.pathname.startsWith("/api");

    // Centralized Role-Based Access Control (RBAC)
    if (
      request.nextUrl.pathname.startsWith("/admin") ||
      request.nextUrl.pathname.startsWith("/api/admin")
    ) {
      if (token && token.role !== "ADMIN") {
        if (isApiRoute) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/access-denied", request.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|webmanifest|xml|txt)$).*)",
    "/admin/:path*",
    "/dashboard/:path*",
    "/api/protected/:path*",
    "/api/admin/:path*",
  ],
};
