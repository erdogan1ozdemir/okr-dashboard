import Link from "next/link";
import { loadDataset, currentUser } from "@/lib/data";
import { isoWeekKey } from "@/lib/weeks";
import { PageHeader, Panel, Chip, Tick, Field, NoteBox, Button } from "@/components/ui";
import { brandOf } from "@/lib/data/select";

export default async function Page() {
  const d = await loadDataset();
  const me = await currentUser();
  const today = isoWeekKey();
  const period = d.periods.find((p) => p.isCurrent)!;
  const dels = d.deliverables.filter((x) => x.userId === me.id && x.periodId === period.id);
  const total = d.steps.filter((s) => dels.some((x) => x.id === s.deliverableId)).length;
  const done = d.steps.filter((s) => dels.some((x) => x.id === s.deliverableId) && s.status === "done").length;
  return (
    <>
      <PageHeader title="Teslimler" sub={`${period.name} · ${dels.length} teslim · ${done}/${total} adım tamam. Yalnızca sana görünür.`} actions={<Button primary>Yeni teslim</Button>} />
      <div className="space-y-4">
        {dels.map((x) => {
          const steps = d.steps.filter((s) => s.deliverableId === x.id);
          const sd = steps.filter((s) => s.status === "done").length;
          const okr = d.okrs.find((o) => o.id === x.okrId);
          const brand = x.brandId ? brandOf(d, x.brandId) : null;
          return (
            <Panel key={x.id} title={x.title} meta={<div className="flex gap-2">{okr && <Chip>T{okr.taskNo}</Chip>}{brand && <Link href={`/markalar/${brand.slug}`}><Chip>{brand.name}</Chip></Link>}<Chip tone={sd === steps.length ? "good" : "accent"}>{sd}/{steps.length}</Chip></div>}>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Hedef">{x.goal ?? "-"}</Field>
                <Field label="Way of doing"><p className="text-sm">{x.wayOfDoing ?? "-"}</p></Field>
                <Field label="Not"><NoteBox placeholder="Engel, karar, kime bağlı" defaultValue={x.note} rows={2} /></Field>
              </div>
              <ul className="mt-4 divide-y">
                {steps.map((s) => {
                  const late = s.status === "planned" && s.targetWeek < today;
                  const now = s.targetWeek === today;
                  return (
                    <li key={s.id} className={`flex items-start gap-3 py-2 ${now ? "bg-orange-50" : ""}`}>
                      <Tick on={s.status === "done"} />
                      <div className="flex-1"><span className={s.status === "done" ? "line-through text-neutral-400" : ""}>{s.title}</span>{s.note && <span className="ml-2 text-sm text-neutral-500">· {s.note}</span>}</div>
                      <Chip tone={late ? "crit" : now ? "accent" : "neutral"}>{s.targetWeek}{late ? " · gecikmiş" : now ? " · bu hafta" : ""}</Chip>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          );
        })}
      </div>
    </>
  );
}
