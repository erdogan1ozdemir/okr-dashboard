import { NextResponse } from "next/server";
import { sendWeeklyDigests } from "@/lib/email/weekly-digest";

/** Cuma 16:00 (Europe/Istanbul) çağrılır. Vercel: vercel.json cron; Railway: cron servisi. */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "kurgusal veri modunda e-posta gönderilmez" }, { status: 503 });
  const sent = await sendWeeklyDigests();
  return NextResponse.json({ sent });
}
export const GET = POST;
