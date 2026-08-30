import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "session";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(value);
}

const publicPaths = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(token, secret());
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  if (isPublic && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isPublic && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/advisor",
    "/habits",
    "/settings",
    "/welcome",
    "/bill/:path*",
    "/api/run",
    "/login",
    "/register",
  ],
};
