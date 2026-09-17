import Link from "next/link";
import { notFound } from "next/navigation";
import { loadDataset, currentUser } from "@/lib/data";
import { isoWeekKey } from "@/lib/weeks";
import { PageHeader, Panel, Chip, Tabs, Field, Empty, NoteBox, Button } from "@/components/ui";
import { ROLE_LABEL, RHYTHM_LABEL, RISK_LABEL, NOTE_LABEL, notesForBrand, personName, vaultSections, fmtDate, fmtTime } from "@/lib/data/select";

const riskTone = { calm: "good", watch: "warn", up: "crit" } as const;
const TABS: [string, string][] = [["ozet", "Özet"], ["notlar", "Notlar"], ["vault", "Vault"], ["kisiler", "Kişiler"], ["zaman", "Zaman çizelgesi"], ["devir", "Devir özeti"]];

export default async function BrandPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ tab?: string; yazar?: string; tur?: string }> }) {
  const { slug } = await params;
  const { tab = "ozet", yazar, tur } = await searchParams;
  const d = await loadDataset();
  const me = await currentUser();
  const brand = d.brands.find((b) => b.slug === slug);
  if (!brand) notFound();
  const parent = brand.parentId ? d.brands.find((b) => b.id === brand.parentId) : null;
  const children = d.brands.filter((b) => b.parentId === brand.id);
  const assignments = d.assignments.filter((a) => a.brandId === brand.id);
  const notes = notesForBrand(d, brand.id);
  const signals = d.signals.filter((s) => s.brandId === brand.id);
  const contacts = d.contacts.filter((c) => c.brandId === brand.id);
  const risk = d.riskHistory.filter((r) => r.brandId === brand.id).sort((a, b) => b.setAt.localeCompare(a.setAt));
  const vault = vaultSections(d, brand);
  const base = `/markalar/${brand.slug}`;
  const week = isoWeekKey();

  const NoteItem = ({ n }: { n: (typeof notes)[number] }) => (
    <li className="py-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
        <Chip tone={n.type === "signal" ? "warn" : n.type === "commercial" ? "accent" : "neutral"}>{NOTE_LABEL[n.type]}</Chip>
        <span>{fmtDate(n.createdAt, { day: "numeric", month: "short", year: "numeric" })}</span>{n.week && <span>· {n.week}</span>}<span>· {personName(d, n.authorId)}</span>
        {n.signalId && <span>· {signals.find((s) => s.id === n.signalId)?.title}</span>}
        {n.brandId !== brand.id && <Chip>{d.brands.find((b) => b.id === n.brandId)?.name}</Chip>}
      </div>
      <p className="mt-1 whitespace-pre-line text-sm">{n.body}</p>
    </li>
  );

  return (
    <>
      <PageHeader title={brand.name} sub={[parent && `${parent.name} alt markası`, brand.sector, brand.website, brand.contractStart && `sözleşme ${brand.contractStart}`].filter(Boolean).join(" · ")}
        actions={<><Chip tone={riskTone[brand.riskLevel]}>Risk: {RISK_LABEL[brand.riskLevel]}</Chip><Button primary>Not ekle</Button></>} />
      <Tabs base={base} current={tab} items={TABS} />

      {tab === "ozet" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Hizmet veren ekipler ve sorumlular">
            {d.teams.filter((t) => brand.serviceTeamIds.includes(t.id)).map((t) => (
              <div key={t.id} className="mb-3"><div className="font-medium">{t.name}</div>
                <ul className="text-sm">{assignments.filter((a) => d.people.find((p) => p.id === a.userId)?.teamId === t.id).map((a) => <li key={a.userId}>{personName(d, a.userId)} <span className="text-neutral-500">· {ROLE_LABEL[a.role]} · {RHYTHM_LABEL[a.rhythm]}{a.rhythmDay ? ` · ${a.rhythmDay}` : ""}</span></li>)}</ul></div>
            ))}
            {children.length > 0 && <Field label="Alt markalar">{children.map((c) => <Link key={c.id} href={`/markalar/${c.slug}`} className="mr-2 underline">{c.name}</Link>)}</Field>}
          </Panel>
          <Panel title="İzlenen sinyaller" meta={<Chip tone={riskTone[brand.riskLevel]}>{RISK_LABEL[brand.riskLevel]}</Chip>}>
            {signals.length === 0 ? <Empty>Sinyal tanımlı değil.</Empty> : <ul className="space-y-2 text-sm">{signals.map((s) => { const sn = notes.filter((n) => n.signalId === s.id); return <li key={s.id}>• {s.title}{sn[0] && <div className="ml-3 text-xs text-neutral-500">{fmtDate(sn[0].createdAt)} · {sn[0].body.slice(0, 90)}</div>}</li>; })}</ul>}
            {risk[0] && <p className="mt-3 text-xs text-neutral-500">Son risk değişikliği: {fmtDate(risk[0].setAt)} · {personName(d, risk[0].setBy)} · {risk[0].reason}</p>}
          </Panel>
          <Panel title="Son notlar" meta={<Link href={`${base}?tab=notlar`} className="text-sm text-orange-700">Tümü →</Link>}>
            <ul className="divide-y">{notes.slice(0, 5).map((n) => <NoteItem key={n.id} n={n} />)}</ul>
          </Panel>
        </div>
      )}

      {tab === "notlar" && (
        <Panel title="Notlar" meta={<form className="flex gap-2 text-sm">
            <select name="yazar" defaultValue={yazar ?? ""} className="rounded border px-2 py-1"><option value="">Tüm yazarlar</option><option value={me.id}>Benim notlarım</option>{d.people.filter((p) => p.id !== me.id).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            <select name="tur" defaultValue={tur ?? ""} className="rounded border px-2 py-1"><option value="">Tüm türler</option>{Object.entries(NOTE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <input type="hidden" name="tab" value="notlar" /><button className="rounded border px-2 py-1">Filtrele</button></form>}>
          <div className="mb-4 rounded border p-3">
            <div className="mb-2 flex gap-2 text-sm"><select className="rounded border px-2 py-1">{Object.entries(NOTE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select><Chip>{week}</Chip></div>
            <NoteBox placeholder="Yeni not: markayla konuşulan, olan, önemli ya da ticari bir şey" rows={3} /><div className="mt-2 text-right"><Button primary>Kaydet</Button></div>
          </div>
          <ul className="divide-y">{notes.filter((n) => (!yazar || n.authorId === yazar) && (!tur || n.type === tur)).map((n) => <NoteItem key={n.id} n={n} />)}</ul>
        </Panel>
      )}

      {tab === "vault" && (
        <div className="space-y-4">
          <Panel title="Ortak bilgiler">
            <dl className="grid gap-4 md:grid-cols-2">{vault.common.map((f) => { const v = vault.value(f.id); return <Field key={f.id} label={f.label}><div>{v?.value || <span className="text-neutral-400">girilmemiş</span>}</div>{v && <div className="text-xs text-neutral-500">{personName(d, v.updatedBy)} · {fmtDate(v.updatedAt)}</div>}</Field>; })}</dl>
          </Panel>
          {vault.teams.map(({ team, fields }) => (
            <Panel key={team.id} title={`${team.name} alanları`} meta={<Button>Düzenle</Button>}>
              {fields.length === 0 ? <Empty>{"Bu ekip için alan tanımlanmamış. Yönetim'den eklenebilir."}</Empty> :
              <dl className="grid gap-4 md:grid-cols-2">{fields.map((f) => { const v = vault.value(f.id); return <Field key={f.id} label={f.label}><div className={f.type === "textarea" ? "whitespace-pre-line" : ""}>{v?.value || <span className="text-neutral-400">girilmemiş</span>}</div>{v && <div className="text-xs text-neutral-500">{personName(d, v.updatedBy)} · {fmtDate(v.updatedAt)}</div>}</Field>; })}</dl>}
            </Panel>
          ))}
        </div>
      )}

      {tab === "kisiler" && (
        <Panel title="Markadaki iletişim kişileri" meta={<Button>Kişi ekle</Button>}>
          {contacts.length === 0 ? <Empty>Kişi eklenmemiş.</Empty> : <table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase text-neutral-500"><th className="p-2">Ad</th><th className="p-2">Rol</th><th className="p-2">İletişim</th><th className="p-2">Konu</th><th className="p-2">Tanıştıran</th></tr></thead>
            <tbody className="divide-y">{contacts.map((c) => <tr key={c.id}><td className="p-2 font-medium">{c.name}</td><td className="p-2">{c.role}</td><td className="p-2">{[c.email, c.phone].filter(Boolean).join(" · ")}</td><td className="p-2">{c.topics}</td><td className="p-2">{personName(d, c.introducedBy)}</td></tr>)}</tbody></table>}
        </Panel>
      )}

      {tab === "zaman" && (
        <Panel title="Zaman çizelgesi">
          <ul className="divide-y text-sm">
            {[...notes.map((n) => ({ at: n.createdAt, kind: NOTE_LABEL[n.type], who: personName(d, n.authorId), text: n.body })),
              ...risk.map((r) => ({ at: r.setAt, kind: `Risk → ${RISK_LABEL[r.level]}`, who: personName(d, r.setBy), text: r.reason ?? "" })),
              ...d.vaultValues.filter((v) => v.brandId === brand.id).map((v) => ({ at: v.updatedAt, kind: "Vault", who: personName(d, v.updatedBy), text: `${d.vaultFields.find((f) => f.id === v.fieldId)?.label}: ${v.value}` })),
              ...d.events.filter((e) => e.brandId === brand.id).map((e) => ({ at: e.startsAt, kind: "Toplantı", who: personName(d, e.userId), text: `${e.title}${e.postNote ? ` · ${e.postNote}` : ""}` })),
            ].sort((a, b) => b.at.localeCompare(a.at)).map((x, i) => (
              <li key={i} className="flex gap-3 py-2"><span className="w-28 shrink-0 text-xs text-neutral-500">{fmtDate(x.at, { day: "numeric", month: "short" })} {fmtTime(x.at)}</span><Chip>{x.kind}</Chip><span className="flex-1">{x.text}</span><span className="text-xs text-neutral-500">{x.who}</span></li>
            ))}
          </ul>
        </Panel>
      )}

      {tab === "devir" && (
        <div className="space-y-4">
          <Panel title="Bu markayı 10 dakikada anla">
            <p className="text-sm text-neutral-600">Sistem üretir: vault, sorumlular, sinyaller, son 3 ayın öne çıkan notları ve açık işler. Yeni katılan kişi için.</p>
            <dl className="mt-4 grid gap-4 md:grid-cols-3">
              <Field label="Kim bakıyor">{assignments.map((a) => <div key={a.userId}>{personName(d, a.userId)} · {ROLE_LABEL[a.role]}</div>)}</Field>
              <Field label="Muhataplar">{contacts.map((c) => <div key={c.id}>{c.name} · {c.role}</div>)}</Field>
              <Field label="Ritim">{assignments.filter((a) => a.rhythm !== "none").map((a) => <div key={a.userId}>{RHYTHM_LABEL[a.rhythm]} · {a.rhythmDay}</div>)}</Field>
            </dl>
          </Panel>
          <Panel title="Bilinmesi gerekenler">
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {notes.filter((n) => n.type === "important" || n.type === "commercial" || n.type === "event").slice(0, 8).map((n) => <li key={n.id}>{n.body} <span className="text-xs text-neutral-500">({fmtDate(n.createdAt)}, {personName(d, n.authorId)})</span></li>)}
            </ul>
          </Panel>
          <Panel title="Açık işler ve riskler">
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {signals.map((s) => <li key={s.id}>{s.title}</li>)}
              {d.steps.filter((s) => s.status === "planned" && d.deliverables.find((x) => x.id === s.deliverableId)?.brandId === brand.id).map((s) => <li key={s.id}>{s.title} · {s.targetWeek}</li>)}
            </ul>
          </Panel>
        </div>
      )}
    </>
  );
}
