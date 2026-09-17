/**
 * Veri modeli. Kişisel tablolar (okr, teslim, aylık, hafta) user_id ile kişiye bağlıdır ve
 * yalnızca sahibi + yetkili yöneticiler okur. Ortak tablolar (marka notu, vault, kişiler)
 * herkese açıktır; author_id yalnızca "kim yazdı" bilgisidir. Yetki kuralı src/lib/authz.ts'te.
 */
import {
  pgTable, pgEnum, text, timestamp, integer, boolean, date, jsonb, primaryKey, uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

/* ---------------------------------------------------------------- enum'lar */
export const titleEnum = pgEnum("title", [
  "jr_consultant", "consultant", "sr_consultant", "lead", "manager", "director", "gmy", "ceo",
]);
export const assignmentRoleEnum = pgEnum("assignment_role", ["primary", "secondary", "general", "advisor"]);
export const noteTypeEnum = pgEnum("note_type", ["contact", "important", "commercial", "event", "signal", "meeting", "general"]);
export const riskLevelEnum = pgEnum("risk_level", ["calm", "watch", "up"]);
export const rhythmEnum = pgEnum("rhythm", ["weekly", "biweekly", "monthly", "none"]);
export const stepStatusEnum = pgEnum("step_status", ["planned", "done", "dropped"]);

const id = () => text("id").primaryKey().default(sql`gen_random_uuid()::text`);
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

/* ---------------------------------------------------------------- kimlik */
export const teams = pgTable("teams", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: createdAt(),
});

export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  title: titleEnum("title").notNull().default("consultant"),
  teamId: text("team_id").references(() => teams.id, { onDelete: "set null" }),
  isAdmin: boolean("is_admin").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
});

/* Auth.js Drizzle adapter tabloları */
export const accounts = pgTable("accounts", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
}, (t) => [primaryKey({ columns: [t.identifier, t.token] })]);

/* ---------------------------------------------------------------- marka */
export const brands = pgTable("brands", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  parentId: text("parent_id"),                       // alt marka ise üst markanın id'si
  sector: text("sector"),
  website: text("website"),
  contractStart: date("contract_start"),
  isActive: boolean("is_active").notNull().default(true),
  riskLevel: riskLevelEnum("risk_level").notNull().default("calm"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/* hangi ekip hangi markaya hizmet veriyor */
export const brandServices = pgTable("brand_services", {
  brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  teamId: text("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  since: date("since"),
  isActive: boolean("is_active").notNull().default(true),
}, (t) => [primaryKey({ columns: [t.brandId, t.teamId] })]);

/* kim hangi markada hangi rolde */
export const brandAssignments = pgTable("brand_assignments", {
  id: id(),
  brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: assignmentRoleEnum("role").notNull(),
  rhythm: rhythmEnum("rhythm").notNull().default("none"),
  rhythmDay: text("rhythm_day"),                     // "Perşembe 15:00"
  rhythmAnchor: date("rhythm_anchor"),               // iki haftada bir için ilk toplantı tarihi
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("brand_assignment_unique").on(t.brandId, t.userId)]);

/* vault: markanın sabit bilgileri, tek satır */
export const brandVault = pgTable("brand_vault", {
  brandId: text("brand_id").primaryKey().references(() => brands.id, { onDelete: "cascade" }),
  backlinkBudgetMonthly: text("backlink_budget_monthly"),
  contentBudgetMonthly: text("content_budget_monthly"),
  infraTeam: text("infra_team"),                     // altyapı / geliştirme ajansı
  itTeam: text("it_team"),
  brandManager: text("brand_manager"),
  internalTeamSize: text("internal_team_size"),
  tools: text("tools"),
  reportingRhythm: text("reporting_rhythm"),
  extra: jsonb("extra").$type<Record<string, string>>().notNull().default({}),  // ekiplerin serbest alanları
  updatedBy: text("updated_by").references(() => users.id),
  updatedAt: updatedAt(),
});

export const brandVaultHistory = pgTable("brand_vault_history", {
  id: id(),
  brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  field: text("field").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  changedBy: text("changed_by").references(() => users.id),
  changedAt: createdAt(),
});

export const brandContacts = pgTable("brand_contacts", {
  id: id(),
  brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role"),
  email: text("email"),
  phone: text("phone"),
  topics: text("topics"),                            // hangi konuda muhatap
  introducedBy: text("introduced_by").references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
});

export const brandSignals = pgTable("brand_signals", {
  id: id(),
  brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: text("created_by").references(() => users.id),
});

export const brandRiskHistory = pgTable("brand_risk_history", {
  id: id(),
  brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  level: riskLevelEnum("level").notNull(),
  reason: text("reason"),
  setBy: text("set_by").references(() => users.id),
  setAt: createdAt(),
});

/* takvim etkinliğini markaya eşlemek için: başlıkta geçen kelime ya da katılımcı alan adı */
export const brandMatchRules = pgTable("brand_match_rules", {
  id: id(),
  brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),                      // "title" | "domain"
  value: text("value").notNull(),
});

/* ---------------------------------------------------------------- ortak notlar */
export const brandNotes = pgTable("brand_notes", {
  id: id(),
  brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull().references(() => users.id),
  type: noteTypeEnum("type").notNull().default("general"),
  body: text("body").notNull(),
  week: text("week"),                                // "2026-W38"; genel notlarda boş
  signalId: text("signal_id").references(() => brandSignals.id, { onDelete: "set null" }),
  eventId: text("event_id"),                         // calendar_events.id
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [index("brand_notes_brand_week").on(t.brandId, t.week), index("brand_notes_author").on(t.authorId)]);

/* haftalık temas işareti */
export const brandContactLog = pgTable("brand_contact_log", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  week: text("week").notNull(),
  contacted: boolean("contacted").notNull().default(true),
}, (t) => [primaryKey({ columns: [t.userId, t.brandId, t.week] })]);

/* ---------------------------------------------------------------- kişisel */
export const okrPeriods = pgTable("okr_periods", {
  id: id(),
  name: text("name").notNull(),                      // "2026 Q4"
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isCurrent: boolean("is_current").notNull().default(false),
});

export const okrs = pgTable("okrs", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  periodId: text("period_id").notNull().references(() => okrPeriods.id, { onDelete: "cascade" }),
  taskNo: text("task_no"),
  cluster: text("cluster").notNull(),
  expectations: text("expectations").array().notNull().default(sql`'{}'::text[]`),
  objectives: text("objectives").array().notNull().default(sql`'{}'::text[]`),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
}, (t) => [index("okrs_user_period").on(t.userId, t.periodId)]);

export const deliverables = pgTable("deliverables", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  periodId: text("period_id").notNull().references(() => okrPeriods.id, { onDelete: "cascade" }),
  okrId: text("okr_id").references(() => okrs.id, { onDelete: "set null" }),
  brandId: text("brand_id").references(() => brands.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  goal: text("goal"),
  wayOfDoing: text("way_of_doing"),
  note: text("note"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
});

export const deliverableSteps = pgTable("deliverable_steps", {
  id: id(),
  deliverableId: text("deliverable_id").notNull().references(() => deliverables.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  targetWeek: text("target_week").notNull(),         // "2026-W41"
  status: stepStatusEnum("status").notNull().default("planned"),
  doneAt: timestamp("done_at", { withTimezone: true }),
  note: text("note"),
  sortOrder: integer("sort_order").notNull().default(0),
}, (t) => [index("steps_target_week").on(t.targetWeek)]);

export const monthlyObligations = pgTable("monthly_obligations", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  month: text("month").notNull(),                    // "2026-10"
  title: text("title").notNull(),
  taskRef: text("task_ref"),
  scope: text("scope"),
  done: boolean("done").notNull().default(false),
  note: text("note"),
  sortOrder: integer("sort_order").notNull().default(0),
}, (t) => [index("monthly_user_month").on(t.userId, t.month)]);

export const weekEntries = pgTable("week_entries", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  week: text("week").notNull(),
  effortDays: jsonb("effort_days").$type<Record<string, boolean>>().notNull().default({}), // {"0":true,...} Pzt=0
  note: text("note"),
  updatedAt: updatedAt(),
}, (t) => [primaryKey({ columns: [t.userId, t.week] })]);

/* ---------------------------------------------------------------- takvim */
export const calendarEvents = pgTable("calendar_events", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  externalId: text("external_id").notNull(),
  brandId: text("brand_id").references(() => brands.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  attendees: text("attendees").array().notNull().default(sql`'{}'::text[]`),
  link: text("link"),
  postNote: text("post_note"),                       // toplantı sonrası kısa not
  syncedAt: createdAt(),
}, (t) => [uniqueIndex("calendar_user_external").on(t.userId, t.externalId)]);

/* ---------------------------------------------------------------- sistem */
export const auditLog = pgTable("audit_log", {
  id: id(),
  actorId: text("actor_id").references(() => users.id),
  entity: text("entity").notNull(),                  // "brand_vault" | "brand_assignment" | ...
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(),                  // "create" | "update" | "delete"
  diff: jsonb("diff"),
  at: createdAt(),
});

export const digestPrefs = pgTable("digest_prefs", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  weeklyEmail: boolean("weekly_email").notNull().default(true),
  calendarSync: boolean("calendar_sync").notNull().default(true),
});

/* ---------------------------------------------------------------- ilişkiler */
export const usersRelations = relations(users, ({ one, many }) => ({
  team: one(teams, { fields: [users.teamId], references: [teams.id] }),
  assignments: many(brandAssignments),
}));
export const brandsRelations = relations(brands, ({ one, many }) => ({
  parent: one(brands, { fields: [brands.parentId], references: [brands.id], relationName: "hierarchy" }),
  children: many(brands, { relationName: "hierarchy" }),
  services: many(brandServices),
  assignments: many(brandAssignments),
  notes: many(brandNotes),
  signals: many(brandSignals),
  contacts: many(brandContacts),
  vault: one(brandVault, { fields: [brands.id], references: [brandVault.brandId] }),
}));
export const brandAssignmentsRelations = relations(brandAssignments, ({ one }) => ({
  brand: one(brands, { fields: [brandAssignments.brandId], references: [brands.id] }),
  user: one(users, { fields: [brandAssignments.userId], references: [users.id] }),
}));
export const brandNotesRelations = relations(brandNotes, ({ one }) => ({
  brand: one(brands, { fields: [brandNotes.brandId], references: [brands.id] }),
  author: one(users, { fields: [brandNotes.authorId], references: [users.id] }),
  signal: one(brandSignals, { fields: [brandNotes.signalId], references: [brandSignals.id] }),
}));
export const deliverablesRelations = relations(deliverables, ({ one, many }) => ({
  steps: many(deliverableSteps),
  okr: one(okrs, { fields: [deliverables.okrId], references: [okrs.id] }),
  brand: one(brands, { fields: [deliverables.brandId], references: [brands.id] }),
}));
export const deliverableStepsRelations = relations(deliverableSteps, ({ one }) => ({
  deliverable: one(deliverables, { fields: [deliverableSteps.deliverableId], references: [deliverables.id] }),
}));
