import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};

// API routes that don't need auth
const PUBLIC_API = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/google",
  "/api/auth/google/callback",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public API routes through
  if (PUBLIC_API.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth_token")?.value;
  const session = token ? await verifyToken(token) : null;

  // Protect /dashboard pages — redirect to login
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Protect /api routes — return 401
  if (pathname.startsWith("/api")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}
