import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - no auth needed
  if (
    pathname === "/" ||
    pathname.startsWith("/api/cafes/") ||
    pathname.startsWith("/api/orders") ||
    pathname.startsWith("/api/webhooks/") ||
    pathname.startsWith("/api/auth/") ||
    pathname === "/login" ||
    // Customer cafe pages
    (!pathname.startsWith("/dashboard") &&
      !pathname.startsWith("/admin") &&
      !pathname.startsWith("/api/dashboard") &&
      !pathname.startsWith("/api/admin"))
  ) {
    return NextResponse.next();
  }

  // For protected routes, check for the session cookie
  // (actual auth validation happens in layouts/API routes via auth())
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3)$).*)",
  ],
};
