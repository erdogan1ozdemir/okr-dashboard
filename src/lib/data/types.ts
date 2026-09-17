/** Ekranların kullandığı görünüm modelleri. Veritabanı ve sahte veri katmanı aynı tipleri üretir. */
import type { Title } from "@/lib/authz";

export type AssignmentRole = "primary" | "secondary" | "general" | "advisor";
export type NoteType = "contact" | "important" | "commercial" | "event" | "signal" | "meeting" | "general";
export type RiskLevel = "calm" | "watch" | "up";
export type Rhythm = "weekly" | "biweekly" | "monthly" | "none";

export interface Team { id: string; name: string; slug: string }
export interface Person { id: string; name: string; email: string; title: Title; teamId: string | null; isAdmin: boolean }

export interface Brand {
  id: string; name: string; slug: string; parentId: string | null; sector: string | null;
  website: string | null; contractStart: string | null; riskLevel: RiskLevel;
  serviceTeamIds: string[];
}
export interface Assignment {
  brandId: string; userId: string; role: AssignmentRole; rhythm: Rhythm; rhythmDay: string | null; rhythmAnchor: string | null;
}
export interface Signal { id: string; brandId: string; title: string }
export interface Contact { id: string; brandId: string; name: string; role: string | null; email: string | null; phone: string | null; topics: string | null; introducedBy: string | null }
export interface VaultFieldDef { id: string; teamId: string | null; key: string; label: string; type: "text" | "currency" | "number" | "textarea"; sortOrder: number }
export interface VaultValue { brandId: string; fieldId: string; value: string; updatedBy: string | null; updatedAt: string }
export interface RiskChange { brandId: string; level: RiskLevel; reason: string | null; setBy: string; setAt: string }

export interface Note {
  id: string; brandId: string; authorId: string; type: NoteType; body: string; week: string | null;
  signalId: string | null; eventId: string | null; createdAt: string;
}
export interface ContactLog { userId: string; brandId: string; week: string; contacted: boolean }

export interface OkrPeriod { id: string; name: string; startDate: string; endDate: string; isCurrent: boolean }
export interface Okr { id: string; userId: string; periodId: string; taskNo: string | null; cluster: string; expectations: string[]; objectives: string[] }
export interface Deliverable { id: string; userId: string; periodId: string; okrId: string | null; brandId: string | null; title: string; goal: string | null; wayOfDoing: string | null; note: string | null }
export interface Step { id: string; deliverableId: string; title: string; targetWeek: string; status: "planned" | "done" | "dropped"; note: string | null }
export interface MonthlyObligation { id: string; userId: string; month: string; title: string; taskRef: string | null; scope: string | null; done: boolean; note: string | null }
export interface WeekEntry { userId: string; week: string; effortDays: Record<string, boolean>; note: string | null }
export interface CalendarEvent { id: string; userId: string; brandId: string | null; title: string; startsAt: string; endsAt: string | null; attendees: string[]; postNote: string | null }

export interface Dataset {
  teams: Team[]; people: Person[]; brands: Brand[]; assignments: Assignment[]; signals: Signal[]; contacts: Contact[];
  vaultFields: VaultFieldDef[]; vaultValues: VaultValue[]; riskHistory: RiskChange[]; notes: Note[]; contactLog: ContactLog[];
  periods: OkrPeriod[]; okrs: Okr[]; deliverables: Deliverable[]; steps: Step[]; monthly: MonthlyObligation[];
  weekEntries: WeekEntry[]; events: CalendarEvent[];
}
