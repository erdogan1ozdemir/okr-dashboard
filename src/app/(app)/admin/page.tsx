import { loadDataset } from "@/lib/data";
import { PageHeader, Panel, Chip, Button } from "@/components/ui";
import { TITLE_LABEL, ROLE_LABEL, personName } from "@/lib/data/select";

/** Yönetim. TODO(altyapı): formlar server action'lara bağlanacak. */
export default async function Page() {
  const d = await loadDataset();
  return (
    <>
      <PageHeader title="Yönetim" sub="Ekipler, markalar, kişiler ve unvanlar, vault alanları, sorumluluk atamaları." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Ekipler" meta={<Button>Ekip ekle</Button>}><ul className="divide-y text-sm">{d.teams.map((t) => <li key={t.id} className="flex justify-between py-2"><span>{t.name}</span><span className="text-neutral-500">{d.people.filter((p) => p.teamId === t.id).length} kişi · {d.brands.filter((b) => b.serviceTeamIds.includes(t.id)).length} marka</span></li>)}</ul></Panel>
        <Panel title="Kişiler ve unvanlar" meta={<Button>Kişi ekle</Button>}><ul className="divide-y text-sm">{d.people.map((p) => <li key={p.id} className="flex justify-between py-2"><span>{p.name} <span className="text-neutral-500">· {p.email}</span></span><span className="flex gap-2"><Chip>{TITLE_LABEL[p.title]}</Chip><Chip>{d.teams.find((t) => t.id === p.teamId)?.name}</Chip>{p.isAdmin && <Chip tone="accent">admin</Chip>}</span></li>)}</ul></Panel>
        <Panel title="Markalar ve ekip eşlemesi" meta={<Button>Marka ekle</Button>}><ul className="divide-y text-sm">{d.brands.map((b) => <li key={b.id} className="flex justify-between py-2"><span>{b.parentId ? "↳ " : ""}{b.name}</span><span className="flex gap-1">{b.serviceTeamIds.map((t) => <Chip key={t}>{d.teams.find((x) => x.id === t)?.name}</Chip>)}</span></li>)}</ul></Panel>
        <Panel title="Sorumluluk atamaları" meta={<Button>Atama ekle</Button>}><ul className="divide-y text-sm">{d.assignments.map((a) => <li key={a.brandId + a.userId} className="flex justify-between py-2"><span>{d.brands.find((b) => b.id === a.brandId)?.name} · {personName(d, a.userId)}</span><Chip>{ROLE_LABEL[a.role]}</Chip></li>)}</ul></Panel>
        <Panel title="Vault alan tanımları" meta={<Button>Alan ekle</Button>} className="lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{[{ id: null, name: "Ortak" }, ...d.teams].map((t) => <div key={t.id ?? "ortak"}><div className="mb-1 font-medium">{t.name}</div><ul className="text-sm">{d.vaultFields.filter((f) => f.teamId === t.id).map((f) => <li key={f.id}>{f.label} <span className="text-xs text-neutral-500">· {f.type}</span></li>)}</ul></div>)}</div>
        </Panel>
      </div>
    </>
  );
}
