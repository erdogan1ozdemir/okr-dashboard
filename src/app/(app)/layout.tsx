import Link from "next/link";
import { redirect } from "next/navigation";
import { MOCK_MODE, currentUser } from "@/lib/data";
import { getViewer } from "@/lib/viewer";
import { TITLE_LABEL } from "@/lib/data/select";

/* Tüm ekranlar istek anında üretilir; veritabanı bağlandığında statik önbellek olmasın */
export const dynamic = "force-dynamic";

const NAV = [
  ["/bu-hafta", "Bu hafta"], ["/aylik", "Aylık yükümlülükler"], ["/teslimler", "Teslimler"], ["/okr", "OKR'lar"],
  ["/markalar", "Markalarım"], ["/inbound-markalar", "Inbound markaları"],
] as const;

/** Giriş gerektiren ekranların kabuğu. Kurgusal veri modunda giriş atlanır. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = MOCK_MODE ? await currentUser() : await getViewer();
  if (!viewer) redirect("/giris");
  return (
    <div className="app-shell min-h-screen">
      <header className="app-bar flex items-center gap-6 border-b px-6 py-3">
        <Link href="/bu-hafta" className="font-semibold">Inbound Pano</Link>
        <nav className="app-nav flex gap-4 text-sm">
          {NAV.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
          {viewer.isAdmin && <Link href="/admin">Yönetim</Link>}
        </nav>
        <div className="ml-auto flex items-center gap-4 text-sm">
          {MOCK_MODE && <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Kurgusal veri</span>}
          <span className="text-neutral-500">{viewer.name} · {TITLE_LABEL[viewer.title]}</span>
          <Link href="/ayarlar">Ayarlar</Link>
        </div>
      </header>
      <main className="px-6 py-6">{children}</main>
    </div>
  );
}
