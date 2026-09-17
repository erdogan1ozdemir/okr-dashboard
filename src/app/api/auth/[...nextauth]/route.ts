import type { NextRequest } from "next/server";
/* auth modülü tembel yüklenir: DATABASE_URL yokken (kurgusal veri modu) derleme sırasında adapter kurulmaz */
export async function GET(req: NextRequest) { const { handlers } = await import("@/auth"); return handlers.GET(req); }
export async function POST(req: NextRequest) { const { handlers } = await import("@/auth"); return handlers.POST(req); }
