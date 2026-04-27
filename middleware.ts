import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SESSION_COOKIE = "vk_session"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  const secret = process.env.AUTH_SECRET ?? "vk-internal-2024"
  const session = request.cookies.get(SESSION_COOKIE)

  if (session?.value !== secret) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    const res = NextResponse.redirect(url)
    res.cookies.delete(SESSION_COOKIE)
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
}
