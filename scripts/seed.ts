/**
 * Tohum verisi: ekipler, bir OKR dönemi ve KURGUSAL marka / kişi örnekleri.
 * Gerçek listeler admin ekranından girilir. Çalıştırma: npm run db:seed
 */
import "dotenv/config";
import { db } from "@/db";
import { teams, users, brands, brandServices, brandAssignments, brandVault, brandSignals, brandMatchRules, okrPeriods } from "@/db/schema";

async function main() {
  const teamRows = await db.insert(teams).values([
    { name: "Marketing Intelligence", slug: "marketing-intelligence" },
    { name: "Performance Marketing", slug: "performance-marketing" },
    { name: "Media", slug: "media" },
    { name: "SEO & GEO", slug: "seo-geo" },
  ]).onConflictDoNothing().returning();
  const seo = teamRows.find((t) => t.slug === "seo-geo")!;
  const perf = teamRows.find((t) => t.slug === "performance-marketing")!;

  const [admin] = await db.insert(users).values({
    email: process.env.SEED_ADMIN_EMAIL ?? "admin@inbound.com.tr", name: "İlk Admin", title: "manager", teamId: seo.id, isAdmin: true,
  }).onConflictDoNothing().returning();
  const [u2] = await db.insert(users).values({ email: "deniz.kaya@inbound.com.tr", name: "Deniz Kaya", title: "consultant", teamId: seo.id }).onConflictDoNothing().returning();
  const [u3] = await db.insert(users).values({ email: "efe.demir@inbound.com.tr", name: "Efe Demir", title: "sr_consultant", teamId: perf.id }).onConflictDoNothing().returning();

  await db.insert(okrPeriods).values({ name: "2026 Q4", startDate: "2026-09-01", endDate: "2026-12-31", isCurrent: true }).onConflictDoNothing();

  const [kuzey] = await db.insert(brands).values({ name: "Kuzey Mobilya", slug: "kuzey-mobilya", sector: "Mobilya", website: "https://example.com" }).onConflictDoNothing().returning();
  const [mavi] = await db.insert(brands).values({ name: "Mavi Kahve", slug: "mavi-kahve", sector: "Gıda" }).onConflictDoNothing().returning();
  const [maviKurumsal] = await db.insert(brands).values({ name: "Mavi Kahve Kurumsal", slug: "mavi-kahve-kurumsal", parentId: mavi.id }).onConflictDoNothing().returning();

  await db.insert(brandServices).values([
    { brandId: kuzey.id, teamId: seo.id }, { brandId: kuzey.id, teamId: perf.id }, { brandId: mavi.id, teamId: seo.id },
  ]).onConflictDoNothing();
  await db.insert(brandAssignments).values([
    { brandId: kuzey.id, userId: admin.id, role: "primary", rhythm: "weekly", rhythmDay: "Çarşamba 11:30" },
    { brandId: kuzey.id, userId: u2.id, role: "secondary", rhythm: "weekly" },
    { brandId: kuzey.id, userId: u3.id, role: "general" },
    { brandId: mavi.id, userId: u2.id, role: "primary", rhythm: "biweekly", rhythmDay: "Cuma 15:00", rhythmAnchor: "2026-09-11" },
    { brandId: mavi.id, userId: admin.id, role: "advisor" },
  ]).onConflictDoNothing();
  await db.insert(brandVault).values({
    brandId: kuzey.id, backlinkBudgetMonthly: "60.000 TL", contentBudgetMonthly: "40.000 TL", infraTeam: "Örnek Yazılım",
    itTeam: "Marka iç IT", brandManager: "Selin Aydın", internalTeamSize: "3 kişi", reportingRhythm: "Aylık sunum", updatedBy: admin.id,
  }).onConflictDoNothing();
  await db.insert(brandSignals).values([
    { brandId: kuzey.id, title: "Teknik taleplerin bekleme süresi", sortOrder: 1, createdBy: admin.id },
    { brandId: kuzey.id, title: "Toplantı ertelemeleri", sortOrder: 2, createdBy: admin.id },
  ]);
  await db.insert(brandMatchRules).values([
    { brandId: kuzey.id, kind: "title", value: "kuzey" }, { brandId: kuzey.id, kind: "domain", value: "kuzeymobilya.example" },
    { brandId: mavi.id, kind: "title", value: "mavi kahve" },
  ]);
  console.log("tohum verisi yüklendi", { alt: maviKurumsal.slug });
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
