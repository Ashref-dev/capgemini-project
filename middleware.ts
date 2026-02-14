import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Check if auth_token cookie exists
  const authToken = request.cookies.get("auth_token")?.value;

  // If no auth token and trying to access protected routes, redirect to sign-in
  if (!authToken && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
