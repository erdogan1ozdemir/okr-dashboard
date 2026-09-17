/**
 * Haftalık özet: her Cuma kişiye açık teslim adımları, temas eksikleri, markalarındaki yeni notlar
 * ve gelecek haftanın toplantıları. Resend ile gönderilir. Çağıran: /api/cron/weekly-digest.
 */
import { Resend } from "resend";
import { db } from "@/db";
import { users, digestPrefs, brandAssignments, brands, deliverableSteps, deliverables, brandContactLog, brandNotes, calendarEvents } from "@/db/schema";
import { and, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { isoWeekKey, shiftWeek, weekRange } from "@/lib/weeks";

export async function buildDigest(userId: string) {
  const week = isoWeekKey();
  const next = shiftWeek(week, 1);
  const [me] = await db.select().from(users).where(eq(users.id, userId));
  const my = await db.select({ brandId: brandAssignments.brandId, name: brands.name, role: brandAssignments.role })
    .from(brandAssignments).innerJoin(brands, eq(brands.id, brandAssignments.brandId))
    .where(and(eq(brandAssignments.userId, userId), eq(brandAssignments.isActive, true)));
  const brandIds = my.map((b) => b.brandId);

  const openSteps = await db.select({ title: deliverableSteps.title, week: deliverableSteps.targetWeek, deliverable: deliverables.title })
    .from(deliverableSteps).innerJoin(deliverables, eq(deliverables.id, deliverableSteps.deliverableId))
    .where(and(eq(deliverables.userId, userId), eq(deliverableSteps.status, "planned"), sql`${deliverableSteps.targetWeek} <= ${next}`));

  const contacted = new Set((await db.select({ b: brandContactLog.brandId }).from(brandContactLog)
    .where(and(eq(brandContactLog.userId, userId), eq(brandContactLog.week, week), eq(brandContactLog.contacted, true)))).map((r) => r.b));
  const missingContact = my.filter((b) => (b.role === "primary" || b.role === "secondary") && !contacted.has(b.brandId));

  const since = weekRange(week).monday;
  const newNotes = brandIds.length ? await db.select({ brand: brands.name, body: brandNotes.body, author: users.name })
    .from(brandNotes).innerJoin(brands, eq(brands.id, brandNotes.brandId)).innerJoin(users, eq(users.id, brandNotes.authorId))
    .where(and(inArray(brandNotes.brandId, brandIds), gte(brandNotes.createdAt, since), sql`${brandNotes.authorId} <> ${userId}`)).limit(20) : [];

  const nr = weekRange(next);
  const meetings = await db.select({ title: calendarEvents.title, at: calendarEvents.startsAt })
    .from(calendarEvents).where(and(eq(calendarEvents.userId, userId), gte(calendarEvents.startsAt, nr.monday), lt(calendarEvents.startsAt, new Date(nr.sunday.getTime() + 864e5))));

  return { me, week, next, openSteps, missingContact, newNotes, meetings };
}

export async function sendWeeklyDigests() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const recipients = await db.select({ id: users.id, email: users.email, name: users.name })
    .from(users).leftJoin(digestPrefs, eq(digestPrefs.userId, users.id))
    .where(and(eq(users.isActive, true), sql`coalesce(${digestPrefs.weeklyEmail}, true) = true`));
  let sent = 0;
  for (const r of recipients) {
    const d = await buildDigest(r.id);
    const lines = [
      `Merhaba ${r.name ?? ""},`, "",
      `Açık teslim adımları (${d.openSteps.length}):`, ...d.openSteps.map((s) => `- ${s.deliverable} · ${s.title} · ${s.week}`),
      "", `Bu hafta temas girilmeyen markalar: ${d.missingContact.map((b) => b.name).join(", ") || "yok"}`,
      "", `Markalarında yeni notlar (${d.newNotes.length}):`, ...d.newNotes.map((n) => `- ${n.brand} · ${n.author}: ${n.body.slice(0, 140)}`),
      "", `Gelecek haftanın toplantıları (${d.meetings.length}):`, ...d.meetings.map((m) => `- ${m.at.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })} · ${m.title}`),
    ];
    await resend.emails.send({
      from: process.env.DIGEST_FROM ?? "pano@inbound.com.tr", to: r.email,
      subject: `Haftalık özet · ${d.week}`, text: lines.join("\n"),
    });
    sent++;
  }
  return sent;
}
