/** Ekranlar için ortak seçiciler. Saf fonksiyonlar; veri katmanından bağımsız. */
import type { Dataset, Brand, Note, Assignment, Person } from "./types";
import { meetingExpected } from "@/lib/weeks";
import { canViewPersonal } from "@/lib/authz";

export const ROLE_LABEL = { primary: "1. sorumlu", secondary: "2. sorumlu", general: "Genel sorumlu", advisor: "Danışman" } as const;
export const NOTE_LABEL = { contact: "İletişim", important: "Önemli", commercial: "Ticari", event: "Markada olan", signal: "Sinyal", meeting: "Toplantı", general: "Genel" } as const;
export const RISK_LABEL = { calm: "Sakin", watch: "İzlemede", up: "Yükseldi" } as const;
export const RHYTHM_LABEL = { weekly: "Haftalık", biweekly: "İki haftada bir", monthly: "Aylık", none: "Sabit ritim yok" } as const;
export const TITLE_LABEL = { jr_consultant: "Jr. Consultant", consultant: "Consultant", sr_consultant: "Sr. Consultant", lead: "Lead", manager: "Manager", director: "Director", gmy: "GMY", ceo: "CEO" } as const;

export const byId = <T extends { id: string }>(xs: T[]) => new Map(xs.map((x) => [x.id, x]));

export function personName(d: Dataset, id: string | null | undefined) {
  return d.people.find((p) => p.id === id)?.name ?? "-";
}

export function myAssignments(d: Dataset, userId: string) {
  return d.assignments.filter((a) => a.userId === userId);
}

/** Sahiplik: primary / secondary / general · Danışmanlık: advisor */
export function splitMyBrands(d: Dataset, userId: string) {
  const mine = myAssignments(d, userId);
  const owned = mine.filter((a) => a.role !== "advisor");
  const advisory = mine.filter((a) => a.role === "advisor");
  const mineIds = new Set(mine.map((a) => a.brandId));
  const me = d.people.find((p) => p.id === userId);
  const teamBrands = d.brands.filter((b) => !mineIds.has(b.id) && me?.teamId && b.serviceTeamIds.includes(me.teamId));
  const teamIds = new Set(teamBrands.map((b) => b.id));
  const others = d.brands.filter((b) => !mineIds.has(b.id) && !teamIds.has(b.id));
  return { owned, advisory, teamBrands, others };
}

export function brandOf(d: Dataset, id: string): Brand | undefined { return d.brands.find((b) => b.id === id); }

export function notesForBrand(d: Dataset, brandId: string): Note[] {
  const childIds = d.brands.filter((b) => b.parentId === brandId).map((b) => b.id);
  return d.notes.filter((n) => n.brandId === brandId || childIds.includes(n.brandId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function lastNote(d: Dataset, brandId: string): Note | undefined { return notesForBrand(d, brandId)[0]; }

export function contacted(d: Dataset, userId: string, brandId: string, week: string) {
  return d.contactLog.some((c) => c.userId === userId && c.brandId === brandId && c.week === week && c.contacted);
}

export function expected(a: Assignment, week: string) {
  return meetingExpected(a.rhythm, a.rhythmAnchor, week);
}

export function stepsForWeek(d: Dataset, userId: string, week: string) {
  const mine = new Set(d.deliverables.filter((x) => x.userId === userId).map((x) => x.id));
  const dels = byId(d.deliverables);
  return d.steps
    .filter((s) => mine.has(s.deliverableId) && (s.targetWeek === week || (s.targetWeek < week && s.status === "planned")))
    .map((s) => ({ ...s, deliverable: dels.get(s.deliverableId)!, late: s.targetWeek < week }))
    .sort((a, b) => Number(b.late) - Number(a.late));
}

export function eventsForWeek(d: Dataset, userId: string, week: string, mondayIso: string, nextMondayIso: string) {
  return d.events.filter((e) => e.userId === userId && e.startsAt >= mondayIso && e.startsAt < nextMondayIso).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/** OKR ekranında kişi seçici: görüntüleyenin görebildiği kişiler */
export function viewablePeople(d: Dataset, viewer: Person) {
  return d.people.filter((p) => canViewPersonal(viewer, p));
}

export function vaultSections(d: Dataset, brand: Brand) {
  const common = d.vaultFields.filter((f) => f.teamId === null).sort((a, b) => a.sortOrder - b.sortOrder);
  const teams = d.teams.filter((t) => brand.serviceTeamIds.includes(t.id)).map((t) => ({
    team: t, fields: d.vaultFields.filter((f) => f.teamId === t.id).sort((a, b) => a.sortOrder - b.sortOrder),
  }));
  const value = (fieldId: string) => d.vaultValues.find((v) => v.brandId === brand.id && v.fieldId === fieldId);
  return { common, teams, value };
}

export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  return new Date(iso).toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul", ...opts });
}
export function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit" });
}
export function weekLabel(week: string, range: { monday: Date; friday: Date }) {
  const a = range.monday, b = range.friday;
  const m = (x: Date) => x.toLocaleDateString("tr-TR", { month: "short", timeZone: "UTC" });
  return a.getUTCMonth() === b.getUTCMonth() ? `${a.getUTCDate()}-${b.getUTCDate()} ${m(b)}` : `${a.getUTCDate()} ${m(a)} - ${b.getUTCDate()} ${m(b)}`;
}
export function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("tr-TR", { month: "long", year: "numeric", timeZone: "UTC" });
}
