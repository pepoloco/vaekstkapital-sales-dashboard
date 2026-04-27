import { NextResponse } from "next/server"

const ALLOWED_DOMAINS = ["vkfunddistribution.com", "vaekstkholdings.com"]
const ALLOWED_EMAILS  = ["sok@vaekstkapital.dk"]

function isAllowed(email: string): boolean {
  const e = email.toLowerCase().trim()
  if (ALLOWED_EMAILS.includes(e)) return true
  const domain = e.split("@")[1] ?? ""
  return ALLOWED_DOMAINS.includes(domain)
}

export async function POST(req: Request) {
  let email = "", password = ""
  try {
    const body = await req.json()
    email    = body.email    ?? ""
    password = body.password ?? ""
  } catch {
    return NextResponse.json({ error: "Ugyldigt request" }, { status: 400 })
  }

  const AUTH_PASSWORD = process.env.AUTH_PASSWORD ?? "copenhagensofiaaarhus"
  const AUTH_SECRET   = process.env.AUTH_SECRET   ?? "vk-internal-2024"

  if (!email || !password) {
    return NextResponse.json({ error: "Email og adgangskode er påkrævet" }, { status: 400 })
  }
  if (password !== AUTH_PASSWORD) {
    return NextResponse.json({ error: "Forkert adgangskode" }, { status: 401 })
  }
  if (!isAllowed(email)) {
    return NextResponse.json({ error: "Denne email har ikke adgang til dashboardet" }, { status: 403 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set("vk_session", AUTH_SECRET, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   60 * 60 * 24 * 7,  // 7 days
    path:     "/",
  })
  return res
}
