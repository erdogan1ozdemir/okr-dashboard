import { loadDataset, currentUser } from "@/lib/data";
import { PageHeader, Panel, Chip, Empty } from "@/components/ui";
import { viewablePeople, TITLE_LABEL } from "@/lib/data/select";
import { canViewPersonal } from "@/lib/authz";

export default async function Page({ searchParams }: { searchParams: Promise<{ kisi?: string; donem?: string }> }) {
  const { kisi, donem } = await searchParams;
  const d = await loadDataset();
  const me = await currentUser();
  const people = viewablePeople(d, me);
  const target = people.find((p) => p.id === kisi) ?? me;
  if (!canViewPersonal(me, target)) return <Empty>{"Bu kişinin OKR'larını görme yetkin yok."}</Empty>;
  const period = d.periods.find((p) => p.id === donem) ?? d.periods.find((p) => p.isCurrent)!;
  const okrs = d.okrs.filter((o) => o.userId === target.id && o.periodId === period.id);
  const dels = d.deliverables.filter((x) => x.userId === target.id && x.periodId === period.id);
  return (
    <>
      <PageHeader title="OKR'lar" sub={`${target.name} · ${TITLE_LABEL[target.title]} · ${period.name} (${period.startDate} - ${period.endDate})`}
        actions={<>
          <select className="rounded border px-2 py-1 text-sm" defaultValue={period.id}>{d.periods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
          {people.length > 1 && <select className="rounded border px-2 py-1 text-sm" defaultValue={target.id}>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>}
        </>} />
      <Panel>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs uppercase text-neutral-500"><th className="p-2">Task no</th><th className="p-2">Cluster</th><th className="p-2">Expectations</th><th className="p-2">Objectives</th><th className="p-2">Bağlı teslim</th></tr></thead>
          <tbody className="divide-y">
            {okrs.map((o) => (
              <tr key={o.id} className="align-top">
                <td className="p-2 font-semibold">{o.taskNo}</td>
                <td className="p-2">{o.cluster}</td>
                <td className="p-2">{o.expectations.map((e, i) => <p key={i}>{e}</p>)}</td>
                <td className="p-2">{o.objectives.map((e, i) => <p key={i}>{e}</p>)}</td>
                <td className="p-2">{dels.filter((x) => x.okrId === o.id).map((x) => <Chip key={x.id}>{x.title}</Chip>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <p className="mt-4 text-xs text-neutral-500">Görünürlük: yalnızca sen{people.length > 1 ? " ve yetkili yöneticiler" : ""}.</p>
    </>
  );
}
