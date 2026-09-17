import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/viewer";

const NAV = [
  ["/bu-hafta", "Bu hafta"],
  ["/aylik", "Aylık yükümlülükler"],
  ["/teslimler", "Teslimler"],
  ["/okr", "OKR'lar"],
  ["/markalar", "Markalarım"],
  ["/inbound-markalar", "Inbound markaları"],
] as const;

/** Giriş gerektiren tüm ekranların ortak kabuğu. Görsel tasarım Claude Design'dan gelecek; şimdilik yalın. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  if (!viewer) redirect("/giris");
  return (
    <div className="min-h-screen">
      <header className="border-b px-6 py-3 flex items-center gap-6">
        <span className="font-semibold">Inbound Pano</span>
        <nav className="flex gap-4 text-sm">
          {NAV.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
          {viewer.isAdmin && <Link href="/admin">Yönetim</Link>}
        </nav>
        <span className="ml-auto text-sm text-neutral-500">{viewer.name ?? viewer.email}</span>
        <Link href="/ayarlar" className="text-sm">Ayarlar</Link>
      </header>
      <main className="px-6 py-6">{children}</main>
    </div>
  );
}
