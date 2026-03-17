// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isApiRoute = req.nextUrl.pathname.startsWith('/api');

    // Example of Centralized Role-Based Access Control (RBAC)
    if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/admin')) {
      if (token && token.role !== 'ADMIN') {
        // If it's an API route, return 401 Unauthorized
        if (isApiRoute) {
          return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        // If it's a Page route, redirect to a generic denied page
        return NextResponse.redirect(new URL('/access-denied', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // This callback dictates if the middleware function above even runs.
      // Returning true means the user must be logged in.
      authorized: ({ token }) => !!token,
    },
  }
);

// Define exactly which routes this middleware protects
export const config = {
  matcher: [
    // Protect all admin UI pages
    "/admin/:path*", 
    // Protect user dashboard UI
    "/dashboard/:path*", 
    // Protect specific APIs (no more redundant code in the API files!)
    "/api/protected/:path*",
    "/api/admin/:path*"
  ],
};
