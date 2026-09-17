/**
 * Tohum verisi: ekipler, bir OKR dönemi ve KURGUSAL marka / kişi örnekleri.
 * Gerçek listeler admin ekranından girilir. Çalıştırma: npm run db:seed
 */
import "dotenv/config";
import { db } from "@/db";
import { teams, users, brands, brandServices, brandAssignments, vaultFieldDefs, brandVaultValues, brandSignals, brandMatchRules, okrPeriods } from "@/db/schema";

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
  const defs = await db.insert(vaultFieldDefs).values([
    { teamId: null, key: "brand_manager", label: "Marka yöneticisi", sortOrder: 1 },
    { teamId: null, key: "internal_team_size", label: "Markadaki ekip boyutu", sortOrder: 2 },
    { teamId: null, key: "it_team", label: "IT ekibi", sortOrder: 3 },
    { teamId: null, key: "infra_team", label: "Altyapı / geliştirme ajansı", sortOrder: 4 },
    { teamId: seo.id, key: "backlink_budget_monthly", label: "Aylık backlink bütçesi", type: "currency", sortOrder: 1 },
    { teamId: seo.id, key: "content_budget_monthly", label: "Aylık içerik bütçesi", type: "currency", sortOrder: 2 },
    { teamId: seo.id, key: "scope", label: "Hizmet kapsamı", type: "textarea", sortOrder: 3 },
    { teamId: perf.id, key: "ads_budget_monthly", label: "Aylık ortalama reklam bütçesi", type: "currency", sortOrder: 1 },
    { teamId: perf.id, key: "platforms", label: "Reklam platformları", sortOrder: 2 },
  ]).onConflictDoNothing().returning();
  const byKey = Object.fromEntries(defs.map((d) => [d.key, d.id]));
  await db.insert(brandVaultValues).values([
    { brandId: kuzey.id, fieldId: byKey.brand_manager, value: "Selin Aydın", updatedBy: admin.id },
    { brandId: kuzey.id, fieldId: byKey.backlink_budget_monthly, value: "60.000 TL", updatedBy: admin.id },
    { brandId: kuzey.id, fieldId: byKey.ads_budget_monthly, value: "250.000 TL", updatedBy: u3.id },
  ]).onConflictDoNothing();
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
