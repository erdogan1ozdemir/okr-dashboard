import { loadDataset, currentUser } from "@/lib/data";
import { monthKey } from "@/lib/weeks";
import { PageHeader, Panel, Chip, Tick, NoteBox } from "@/components/ui";
import { monthLabel } from "@/lib/data/select";

export default async function Page() {
  const d = await loadDataset();
  const me = await currentUser();
  const now = monthKey();
  const months = Array.from(new Set(d.monthly.filter((m) => m.userId === me.id).map((m) => m.month))).sort();
  return (
    <>
      <PageHeader title="Aylık yükümlülükler" sub={"OKR'larından gelen aylık maddeler, sunumlar ve tekrar eden işler. Yalnızca sana görünür."} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {months.map((m) => {
          const items = d.monthly.filter((x) => x.userId === me.id && x.month === m);
          const done = items.filter((x) => x.done).length;
          return (
            <Panel key={m} title={monthLabel(m)} className={m === now ? "ring-2 ring-orange-300" : ""}
              meta={<div className="flex gap-2">{m === now && <Chip tone="accent">bu ay</Chip>}<Chip tone={done === items.length ? "good" : "neutral"}>{done}/{items.length}</Chip></div>}>
              <ul className="divide-y">
                {items.map((x) => (
                  <li key={x.id} className="py-2">
                    <div className="flex items-start gap-2"><Tick on={x.done} /><div className="flex-1 text-sm">{x.title}<div className="text-xs text-neutral-500">{[x.taskRef, x.scope].filter(Boolean).join(" · ")}</div></div></div>
                    <div className="mt-1 pl-7"><NoteBox placeholder="Not: kime, hangi markada, ne zaman" defaultValue={x.note} rows={1} /></div>
                  </li>
                ))}
              </ul>
            </Panel>
          );
        })}
      </div>
    </>
  );
}
