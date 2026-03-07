import { NextRequest, NextResponse } from "next/server";
import { getAdminCredentials } from "@/lib/env";
import { ADMIN_SESSION_COOKIE, encodeAdminSession } from "@/lib/admin-session";

function unauthorized(request: NextRequest) {
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const { username, password } = getAdminCredentials();
  if (!username || !password) {
    return new NextResponse(
      "Admin credentials are not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD.",
      { status: 500 },
    );
  }

  const expectedToken = encodeAdminSession(username, password);
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (sessionCookie === expectedToken) {
    return NextResponse.next();
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) {
    return unauthorized(request);
  }

  try {
    const encoded = authorization.slice(6);
    const decoded = atob(encoded);
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex < 0) {
      return unauthorized(request);
    }

    const providedUser = decoded.slice(0, separatorIndex);
    const providedPass = decoded.slice(separatorIndex + 1);
    if (providedUser !== username || providedPass !== password) {
      return unauthorized(request);
    }
  } catch {
    return unauthorized(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
