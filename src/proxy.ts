import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "kp_admin";
const PUBLIC_ADMIN = ["/admin/prihlaseni", "/admin/setup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_ADMIN.some((p) => pathname.startsWith(p))) return NextResponse.next();
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET;
  if (token && secret && secret.length >= 32) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret));
      return NextResponse.next();
    } catch {
      // propadlý nebo neplatný token
    }
  } else if (token && !secret && process.env.NODE_ENV !== "production") {
    return NextResponse.next(); // lokální vývoj bez SESSION_SECRET, ověří se na stránce
  }
  const url = request.nextUrl.clone();
  url.pathname = "/admin/prihlaseni";
  url.searchParams.set("zpet", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
