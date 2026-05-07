import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    if (!isAuth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Role-based access control
    const path = req.nextUrl.pathname;
    const role = token?.role;

    // Admin only routes
    if (path.startsWith("/staff") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Reports access (Admin and Lawyers only)
    if (path.startsWith("/reports") && !["ADMIN", "LAWYER"].includes(role as string)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Billing access (Admin and Lawyers only)
    if (path.startsWith("/billing") && !["ADMIN", "LAWYER"].includes(role as string)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return null;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/cases/:path*",
    "/appointments/:path*",
    "/documents/:path*",
    "/billing/:path*",
    "/reports/:path*",
    "/staff/:path*",
    "/login",
  ],
};