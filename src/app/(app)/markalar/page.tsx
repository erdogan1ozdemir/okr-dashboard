import Link from "next/link";
import { loadDataset, currentUser } from "@/lib/data";
import { isoWeekKey, shiftWeek } from "@/lib/weeks";
import { PageHeader, Panel, Chip, Empty } from "@/components/ui";
import { ROLE_LABEL, RHYTHM_LABEL, RISK_LABEL, brandOf, contacted, expected, lastNote, personName, splitMyBrands, fmtDate } from "@/lib/data/select";
import type { Assignment } from "@/lib/data/types";

const riskTone = { calm: "good", watch: "warn", up: "crit" } as const;

export default async function Page() {
  const d = await loadDataset();
  const me = await currentUser();
  const week = isoWeekKey();
  const { owned, advisory, teamBrands, others } = splitMyBrands(d, me.id);
  const team = d.teams.find((t) => t.id === me.teamId);

  const Card = ({ a }: { a: Assignment }) => {
    const b = brandOf(d, a.brandId)!;
    const last4 = [-3, -2, -1, 0].map((n) => { const w = shiftWeek(week, n); return { w, on: contacted(d, me.id, b.id, w), need: expected(a, w) }; });
    const ln = lastNote(d, b.id);
    const teamMates = d.assignments.filter((x) => x.brandId === b.id && x.userId !== me.id);
    return (
      <Panel className="brand-card">
        <div className="flex items-start justify-between gap-2">
          <div><Link href={`/markalar/${b.slug}`} className="text-lg font-semibold">{b.name}</Link><div className="text-xs text-neutral-500">{ROLE_LABEL[a.role]} · {RHYTHM_LABEL[a.rhythm]}{a.rhythmDay ? ` · ${a.rhythmDay}` : ""}</div></div>
          <Chip tone={riskTone[b.riskLevel]}>{RISK_LABEL[b.riskLevel]}</Chip>
        </div>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-neutral-500">Son 4 hafta teması</dt><dd className="flex gap-1">{last4.map((x) => <span key={x.w} title={x.w} className={`h-4 w-4 rounded ${x.on ? "bg-green-500" : x.need ? "bg-neutral-200" : "border border-dashed"}`} />)}</dd></div>
          <div className="flex justify-between"><dt className="text-neutral-500">Birlikte bakan</dt><dd>{teamMates.map((x) => personName(d, x.userId)).join(", ") || "-"}</dd></div>
          <div className="flex justify-between"><dt className="text-neutral-500">Son not</dt><dd>{ln ? `${fmtDate(ln.createdAt)} · ${personName(d, ln.authorId)}` : "-"}</dd></div>
        </dl>
        {ln && <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{ln.body}</p>}
        <div className="mt-3 text-right"><Link href={`/markalar/${b.slug}`} className="text-sm text-orange-700">Marka detayı →</Link></div>
      </Panel>
    );
  };

  return (
    <>
      <PageHeader title="Markalarım" sub="Notlar marka detayında yazılır ve okunur; kartlar özet gösterir." />
      <h2 className="mb-3 font-medium">Sahiplik <Chip tone="accent">haftalık temas sende</Chip></h2>
      {owned.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{owned.map((a) => <Card key={a.brandId} a={a} />)}</div> : <Empty>Sahip olduğun marka yok.</Empty>}
      <h2 className="mb-3 mt-8 font-medium">Danışmanlık <Chip>temas ilgili kişide</Chip></h2>
      {advisory.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{advisory.map((a) => <Card key={a.brandId} a={a} />)}</div> : <Empty>Danışmanlık verdiğin marka yok.</Empty>}
      <details className="mt-8 rounded border p-4"><summary className="cursor-pointer font-medium">{team?.name ?? "Ekibimin"} diğer markaları ({teamBrands.length})</summary>
        <ul className="mt-3 divide-y text-sm">{teamBrands.map((b) => <li key={b.id} className="flex justify-between py-2"><Link href={`/markalar/${b.slug}`}>{b.name}</Link><span className="text-neutral-500">{d.assignments.filter((x) => x.brandId === b.id && x.role === "primary").map((x) => personName(d, x.userId)).join(", ")}</span></li>)}</ul>
      </details>
      <details className="mt-3 rounded border p-4"><summary className="cursor-pointer font-medium">{"Inbound'un diğer markaları"} ({others.length})</summary>
        <ul className="mt-3 divide-y text-sm">{others.map((b) => <li key={b.id} className="flex justify-between py-2"><Link href={`/markalar/${b.slug}`}>{b.name}</Link><span className="text-neutral-500">{b.serviceTeamIds.map((t) => d.teams.find((x) => x.id === t)?.name).join(" · ")}</span></li>)}</ul>
      </details>
    </>
  );
}
