import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;

  if (!sessionToken && (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/partner"))) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/partner/:path*", "/admin/:path*"],
};
