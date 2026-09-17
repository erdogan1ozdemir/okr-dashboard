import { notFound } from "next/navigation";
import { db } from "@/db";
import { brands } from "@/db/schema";
import { eq } from "drizzle-orm";

/** Marka detayı (vault). Sekmeler: Özet · Notlar · Vault · Kişiler · Zaman çizelgesi · Devir özeti. İskelet. */
export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [brand] = await db.select().from(brands).where(eq(brands.slug, slug)).limit(1);
  if (!brand) notFound();
  return (
    <section>
      <h1 className="text-2xl font-semibold">{brand.name}</h1>
      <p className="mt-2 text-neutral-600">Risk: {brand.riskLevel} · Sekmeler 3. aşamada eklenecek.</p>
    </section>
  );
}
