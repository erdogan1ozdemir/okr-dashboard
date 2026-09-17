import Link from "next/link";
import { loadDataset, currentUser } from "@/lib/data";
import { isoWeekKey, shiftWeek, weekRange } from "@/lib/weeks";
import { PageHeader, Panel, Chip, Tick, Empty, NoteBox, Button } from "@/components/ui";
import { ROLE_LABEL, RHYTHM_LABEL, brandOf, contacted, expected, myAssignments, stepsForWeek, eventsForWeek, fmtTime, fmtDate, weekLabel } from "@/lib/data/select";

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum"];

export default async function Page({ searchParams }: { searchParams: Promise<{ w?: string }> }) {
  const { w } = await searchParams;
  const d = await loadDataset();
  const me = await currentUser();
  const today = isoWeekKey();
  const week = w && /^\d{4}-W\d{2}$/.test(w) ? w : today;
  const range = weekRange(week);
  const entry = d.weekEntries.find((e) => e.userId === me.id && e.week === week) ?? { effortDays: {} as Record<string, boolean>, note: "" };
  const effortDone = DAYS.filter((_, i) => entry.effortDays[String(i)]).length;

  const mine = myAssignments(d, me.id).map((a) => ({ a, brand: brandOf(d, a.brandId)!, need: expected(a, week), on: contacted(d, me.id, a.brandId, week),
    note: d.notes.find((n) => n.brandId === a.brandId && n.authorId === me.id && n.week === week) }));
  const owned = mine.filter((x) => x.a.role !== "advisor");
  const advisory = mine.filter((x) => x.a.role === "advisor");
  const cNeed = owned.filter((x) => x.need).length, cDone = owned.filter((x) => x.need && x.on).length;

  const steps = stepsForWeek(d, me.id, week);
  const late = steps.filter((s) => s.late).length;
  const events = eventsForWeek(d, me.id, week, range.monday.toISOString(), new Date(range.sunday.getTime() + 864e5).toISOString());

  return (
    <>
      <PageHeader
        title="Bu hafta"
        sub={`${weekLabel(week, range)} · ${week}${week === today ? " · içinde olduğun hafta" : ""}`}
        actions={<>
          <Link className="rounded border px-2 py-1 text-sm" href={`?w=${shiftWeek(week, -1)}`}>‹ Önceki</Link>
          <Link className="rounded border px-2 py-1 text-sm" href={`?w=${today}`}>Bu haftaya dön</Link>
          <Link className="rounded border px-2 py-1 text-sm" href={`?w=${shiftWeek(week, 1)}`}>Sonraki ›</Link>
        </>}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Panel title="Teamwork efor girişi" meta={<Chip tone={effortDone === 5 ? "good" : "neutral"}>{effortDone}/5</Chip>}>
            <div className="flex gap-2">
              {DAYS.map((dn, i) => {
                const on = !!entry.effortDays[String(i)];
                const date = new Date(range.monday.getTime() + i * 864e5);
                return (
                  <button key={dn} type="button" className={`day flex-1 rounded border py-2 text-center ${on ? "border-green-600 bg-green-50" : ""}`}>
                    <div className="text-xs text-neutral-500">{dn} {date.getUTCDate()}</div>
                    <div className="text-sm">{on ? "girildi" : "-"}</div>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title="Marka teması ve haftalık notlar" meta={<Chip tone={cDone >= cNeed ? "good" : "neutral"}>{cDone}/{cNeed} temas</Chip>}>
            <ul className="divide-y">
              {owned.map(({ a, brand, need, on, note }) => (
                <li key={a.brandId} className="py-3">
                  <div className="flex items-start gap-3">
                    <Tick on={on} />
                    <div className="flex-1">
                      <Link href={`/markalar/${brand.slug}`} className="font-medium">{brand.name}</Link>
                      <div className="text-xs text-neutral-500">{ROLE_LABEL[a.role]} · {RHYTHM_LABEL[a.rhythm]}{a.rhythmDay ? ` · ${a.rhythmDay}` : ""}{!need && a.rhythm === "biweekly" ? " · ara hafta" : ""}</div>
                    </div>
                    {!need && a.rhythm !== "none" && <Chip>ara hafta</Chip>}
                  </div>
                  <div className="mt-2 pl-8">
                    <NoteBox placeholder={`${brand.name} · bu haftanın notu`} defaultValue={note?.body} rows={2} />
                  </div>
                </li>
              ))}
            </ul>
            {advisory.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-neutral-500">Danışmanlık verdiğin markalar · hedefe sayılmaz ({advisory.length})</summary>
                <ul className="divide-y">
                  {advisory.map(({ a, brand, on, note }) => (
                    <li key={a.brandId} className="py-3">
                      <div className="flex items-center gap-3"><Tick on={on} /><Link href={`/markalar/${brand.slug}`} className="font-medium">{brand.name}</Link><Chip>danışman</Chip></div>
                      <div className="mt-2 pl-8"><NoteBox placeholder={`${brand.name} · not`} defaultValue={note?.body} rows={2} /></div>
                    </li>
                  ))}
                </ul>
              </details>
            )}
            <div className="mt-3 flex justify-end"><Button>Notları kaydet</Button></div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Bu haftaya düşen teslim adımları" meta={<Chip tone={late ? "crit" : "neutral"}>{late ? `${late} gecikmiş` : `${steps.length} adım`}</Chip>}>
            {steps.length === 0 ? <Empty>Bu haftaya planlanmış teslim adımı yok.</Empty> : (
              <ul className="divide-y">
                {steps.map((s) => (
                  <li key={s.id} className="flex items-start gap-3 py-3">
                    <Tick on={s.status === "done"} />
                    <div className="flex-1">
                      <div className={s.status === "done" ? "line-through text-neutral-400" : ""}>{s.title}</div>
                      <div className="mt-1 flex flex-wrap gap-2"><Chip>{s.deliverable.title}</Chip>{s.late && <Chip tone="crit">gecikmiş · {s.targetWeek}</Chip>}</div>
                      {s.note && <p className="mt-1 text-sm text-neutral-600">{s.note}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Bu haftanın toplantıları" meta={<Chip>{events.length}</Chip>}>
            {events.length === 0 ? <Empty>{"Takvimden gelen toplantı yok. Ayarlar'dan takvim bağlantısını kontrol edebilirsin."}</Empty> : (
              <ul className="divide-y">
                {events.map((e) => {
                  const b = e.brandId ? brandOf(d, e.brandId) : null;
                  return (
                    <li key={e.id} className="py-3">
                      <div className="flex items-baseline gap-3">
                        <span className="w-24 shrink-0 text-xs text-neutral-500">{fmtDate(e.startsAt, { weekday: "short", day: "numeric" })} · {fmtTime(e.startsAt)}</span>
                        <span className="font-medium">{e.title}</span>
                        {b ? <Chip>{b.name}</Chip> : <Chip tone="warn">marka seç</Chip>}
                      </div>
                      <div className="mt-2 pl-27"><NoteBox placeholder="Toplantı sonrası kısa not" defaultValue={e.postNote} rows={1} /></div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel title="Hafta notu">
            <NoteBox placeholder="Bu hafta ne oldu, neye takıldın, kime dönmen gerekiyor." defaultValue={entry.note} rows={4} />
            <div className="mt-3 flex justify-end"><Button>Kaydet</Button></div>
          </Panel>
        </div>
      </div>
    </>
  );
}
