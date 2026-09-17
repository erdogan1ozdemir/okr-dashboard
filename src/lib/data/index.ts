/**
 * Veri katmanı. DATABASE_URL yoksa kurgusal veri (mock.ts) kullanılır; varsa Postgres uygulaması.
 * TODO(altyapı): db.ts'yi Drizzle sorgularıyla yaz; ekranlar bu dosyadaki fonksiyonların dışına çıkmaz.
 */
import type { Dataset, Person } from "./types";
import { mock, CURRENT_USER_ID } from "./mock";

export const MOCK_MODE = !process.env.DATABASE_URL;

export async function loadDataset(): Promise<Dataset> {
  if (MOCK_MODE) return mock;
  throw new Error("TODO(altyapı): Postgres veri katmanı henüz yazılmadı; DATABASE_URL'i kaldırınca kurgusal veri modu açılır.");
}

export async function currentUser(): Promise<Person> {
  const d = await loadDataset();
  const u = d.people.find((p) => p.id === CURRENT_USER_ID);
  if (!u) throw new Error("Kurgusal kullanıcı bulunamadı");
  return u;
}
