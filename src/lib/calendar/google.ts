/**
 * Google Calendar: kullanıcının gelecek 14 gündeki etkinliklerini çeker ve markaya eşler.
 * Refresh token accounts tablosundan okunur; access token gerektiğinde yenilenir.
 * Marka eşlemesi: brand_match_rules (başlık kelimesi ya da katılımcı alan adı).
 * Eşleşmeyen etkinlikler brandId=null ile kaydedilir; kullanıcı Bu hafta ekranında marka seçer.
 */
import { db } from "@/db";
import { accounts, brandMatchRules, calendarEvents } from "@/db/schema";
import { and, eq } from "drizzle-orm";

interface GEvent {
  id: string; summary?: string; htmlLink?: string;
  start?: { dateTime?: string; date?: string }; end?: { dateTime?: string; date?: string };
  attendees?: { email: string }[];
}

async function accessTokenFor(userId: string): Promise<string | null> {
  const [acc] = await db.select().from(accounts).where(and(eq(accounts.userId, userId), eq(accounts.provider, "google"))).limit(1);
  if (!acc?.refresh_token) return null;
  const fresh = acc.expires_at && acc.expires_at * 1000 > Date.now() + 60_000;
  if (fresh && acc.access_token) return acc.access_token;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AUTH_GOOGLE_ID!, client_secret: process.env.AUTH_GOOGLE_SECRET!,
      grant_type: "refresh_token", refresh_token: acc.refresh_token,
    }),
  });
  if (!res.ok) return null;
  const j = await res.json();
  await db.update(accounts)
    .set({ access_token: j.access_token, expires_at: Math.floor(Date.now() / 1000) + (j.expires_in ?? 3600) })
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, "google")));
  return j.access_token;
}

export async function syncCalendar(userId: string, days = 14): Promise<{ synced: number; unmatched: number }> {
  const token = await accessTokenFor(userId);
  if (!token) return { synced: 0, unmatched: 0 };
  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + days * 864e5).toISOString();
  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.search = new URLSearchParams({ timeMin, timeMax, singleEvents: "true", orderBy: "startTime", maxResults: "100" }).toString();
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return { synced: 0, unmatched: 0 };
  const items: GEvent[] = (await res.json()).items ?? [];
  const rules = await db.select().from(brandMatchRules);

  let unmatched = 0;
  for (const ev of items) {
    if (!ev.start?.dateTime) continue; // tüm gün etkinlikleri atla
    const title = ev.summary ?? "";
    const attendees = (ev.attendees ?? []).map((a) => a.email.toLowerCase());
    const brandId = matchBrand(title, attendees, rules);
    if (!brandId) unmatched++;
    await db.insert(calendarEvents).values({
      userId, externalId: ev.id, brandId, title, link: ev.htmlLink ?? null,
      startsAt: new Date(ev.start.dateTime), endsAt: ev.end?.dateTime ? new Date(ev.end.dateTime) : null, attendees,
    }).onConflictDoUpdate({
      target: [calendarEvents.userId, calendarEvents.externalId],
      set: { title, startsAt: new Date(ev.start.dateTime), attendees, syncedAt: new Date() },
    });
  }
  return { synced: items.length, unmatched };
}

function matchBrand(title: string, attendees: string[], rules: { brandId: string; kind: string; value: string }[]): string | null {
  const t = title.toLocaleLowerCase("tr-TR");
  for (const r of rules) {
    if (r.kind === "title" && t.includes(r.value.toLocaleLowerCase("tr-TR"))) return r.brandId;
    if (r.kind === "domain" && attendees.some((a) => a.endsWith("@" + r.value.toLowerCase()))) return r.brandId;
  }
  return null;
}
