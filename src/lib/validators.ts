import { z } from "zod";

export const weekKey = z.string().regex(/^\d{4}-W\d{2}$/, "Hafta anahtarı 2026-W38 biçiminde olmalı");
export const monthKey = z.string().regex(/^\d{4}-\d{2}$/);

export const noteInput = z.object({
  brandId: z.string().min(1),
  type: z.enum(["contact", "important", "commercial", "event", "signal", "meeting", "general"]),
  body: z.string().trim().min(1, "Not boş olamaz").max(5000),
  week: weekKey.optional(),
  signalId: z.string().optional(),
  eventId: z.string().optional(),
});

export const contactLogInput = z.object({ brandId: z.string().min(1), week: weekKey, contacted: z.boolean() });

export const weekEntryInput = z.object({
  week: weekKey,
  effortDays: z.record(z.string(), z.boolean()).optional(),
  note: z.string().max(5000).optional(),
});

export const vaultInput = z.object({
  brandId: z.string().min(1),
  backlinkBudgetMonthly: z.string().max(200).optional(),
  contentBudgetMonthly: z.string().max(200).optional(),
  infraTeam: z.string().max(200).optional(),
  itTeam: z.string().max(200).optional(),
  brandManager: z.string().max(200).optional(),
  internalTeamSize: z.string().max(100).optional(),
  tools: z.string().max(500).optional(),
  reportingRhythm: z.string().max(200).optional(),
  extra: z.record(z.string(), z.string().max(1000)).optional(),
});

export const stepToggleInput = z.object({ stepId: z.string().min(1), done: z.boolean(), note: z.string().max(2000).optional() });

export const riskInput = z.object({
  brandId: z.string().min(1),
  level: z.enum(["calm", "watch", "up"]),
  reason: z.string().max(1000).optional(),
});
