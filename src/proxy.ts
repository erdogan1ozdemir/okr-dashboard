/* Next.js 16: oturum kontrolü. DATABASE_URL yoksa (kurgusal veri modu) giriş istenmez. */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  if (!process.env.DATABASE_URL) return NextResponse.next();
  const { auth } = await import("@/auth");
  return (auth as unknown as (r: NextRequest) => Promise<Response>)(req);
}
export const config = { matcher: ["/((?!api/auth|api/cron|giris|_next|favicon.ico).*)"] };
