/**
 * Yapısal bileşenler. Görsel tasarım Claude Design'dan gelecek; burada yalnızca düzen ve anlam var.
 * Sınıf adları anlamlı tutuldu (panel, chip, tick) ki tasarım aşamasında hedeflenebilsin.
 */
import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="page-header flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {sub && <p className="text-sm text-neutral-500 mt-1">{sub}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, meta, children, className = "" }: { title?: string; meta?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`panel rounded-lg border bg-white ${className}`}>
      {title && (
        <header className="panel-header flex items-center justify-between gap-3 border-b px-4 py-3">
          <h2 className="font-medium">{title}</h2>
          {meta}
        </header>
      )}
      <div className="panel-body p-4">{children}</div>
    </section>
  );
}

export function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "warn" | "crit" | "accent" }) {
  const tones = {
    neutral: "bg-neutral-100 text-neutral-700", good: "bg-green-100 text-green-800",
    warn: "bg-amber-100 text-amber-800", crit: "bg-red-100 text-red-800", accent: "bg-orange-100 text-orange-800",
  };
  return <span className={`chip inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

/** Onay kutusu görünümü. TODO(altyapı): server action ile bağlanacak; şimdilik yalnızca durum gösterir. */
export function Tick({ on, label }: { on: boolean; label?: string }) {
  return (
    <span className="tick inline-flex items-center gap-2">
      <span aria-hidden className={`grid h-5 w-5 place-items-center rounded border ${on ? "border-green-600 bg-green-600 text-white" : "border-neutral-300"}`}>{on ? "✓" : ""}</span>
      {label && <span className={on ? "line-through text-neutral-400" : ""}>{label}</span>}
    </span>
  );
}

export function Tabs({ base, current, items }: { base: string; current: string; items: [string, string][] }) {
  return (
    <nav className="tabs flex gap-1 border-b mb-6 overflow-x-auto">
      {items.map(([key, label]) => (
        <Link key={key} href={`${base}?tab=${key}`} aria-current={current === key ? "page" : undefined}
          className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 -mb-px ${current === key ? "border-orange-500 font-semibold" : "border-transparent text-neutral-500"}`}>
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="field">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty rounded border border-dashed p-4 text-sm text-neutral-500">{children}</p>;
}

export function NoteBox({ placeholder, defaultValue, rows = 3 }: { placeholder: string; defaultValue?: string | null; rows?: number }) {
  // TODO(altyapı): server action + otomatik kayıt; şimdilik salt görünüm
  return <textarea className="w-full rounded border p-2 text-sm" rows={rows} placeholder={placeholder} defaultValue={defaultValue ?? ""} readOnly />;
}

export function Button({ children, primary = false }: { children: ReactNode; primary?: boolean }) {
  return <button type="button" className={`rounded border px-3 py-1.5 text-sm ${primary ? "border-orange-600 bg-orange-600 text-white" : ""}`}>{children}</button>;
}
