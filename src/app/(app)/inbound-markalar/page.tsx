import Link from "next/link";
import { loadDataset } from "@/lib/data";
import { PageHeader, Panel, Chip } from "@/components/ui";
import { RISK_LABEL, lastNote, personName, fmtDate } from "@/lib/data/select";

const riskTone = { calm: "good", watch: "warn", up: "crit" } as const;

export default async function Page({ searchParams }: { searchParams: Promise<{ ekip?: string; q?: string }> }) {
  const { ekip, q } = await searchParams;
  const d = await loadDataset();
  const list = d.brands.filter((b) => !b.parentId && (!ekip || b.serviceTeamIds.includes(ekip)) && (!q || b.name.toLocaleLowerCase("tr-TR").includes(q.toLocaleLowerCase("tr-TR"))));
  return (
    <>
      <PageHeader title="Inbound markaları" sub={`${d.brands.filter((b) => !b.parentId).length} marka · ${d.teams.length} ekip`}
        actions={<form className="flex gap-2"><input name="q" defaultValue={q} placeholder="Marka ara" className="rounded border px-2 py-1 text-sm" />
          <select name="ekip" defaultValue={ekip ?? ""} className="rounded border px-2 py-1 text-sm"><option value="">Tüm ekipler</option>{d.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
          <button className="rounded border px-3 py-1 text-sm">Filtrele</button></form>} />
      <Panel>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs uppercase text-neutral-500"><th className="p-2">Marka</th><th className="p-2">Hizmet veren ekipler</th><th className="p-2">Sorumlular</th><th className="p-2">Risk</th><th className="p-2">Son not</th></tr></thead>
          <tbody className="divide-y">
            {list.map((b) => {
              const subs = d.brands.filter((x) => x.parentId === b.id);
              const ln = lastNote(d, b.id);
              const owners = d.assignments.filter((a) => a.brandId === b.id && a.role !== "advisor");
              return (
                <tr key={b.id} className="align-top">
                  <td className="p-2"><Link href={`/markalar/${b.slug}`} className="font-medium">{b.name}</Link>{subs.length > 0 && <div className="text-xs text-neutral-500">{subs.map((s) => s.name).join(" · ")}</div>}<div className="text-xs text-neutral-500">{b.sector}</div></td>
                  <td className="p-2"><div className="flex flex-wrap gap-1">{b.serviceTeamIds.map((t) => <Chip key={t}>{d.teams.find((x) => x.id === t)?.name}</Chip>)}</div></td>
                  <td className="p-2">{owners.map((a) => <div key={a.userId}>{personName(d, a.userId)} <span className="text-xs text-neutral-500">· {d.teams.find((t) => t.id === d.people.find((p) => p.id === a.userId)?.teamId)?.name}</span></div>)}</td>
                  <td className="p-2"><Chip tone={riskTone[b.riskLevel]}>{RISK_LABEL[b.riskLevel]}</Chip></td>
                  <td className="p-2 max-w-md">{ln ? <><div className="text-xs text-neutral-500">{fmtDate(ln.createdAt)} · {personName(d, ln.authorId)}</div><p className="line-clamp-2">{ln.body}</p></> : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
