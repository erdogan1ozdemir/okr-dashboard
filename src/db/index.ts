import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;
let instance: Db | null = null;

/** Bağlantı ilk sorguda kurulur; DATABASE_URL yoksa modül yüklenirken değil, kullanılırken hata verir. */
function connect(): Db {
  if (instance) return instance;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL tanımlı değil (.env.example'a bak). Tanımsızken uygulama kurgusal veri modunda çalışır.");
  const client = postgres(url, { max: 5, prepare: false }); // sunucusuz ortamda bağlantı sayısı düşük
  instance = drizzle(client, { schema });
  return instance;
}

/** Gerçek örnek; adapter gibi nesneyi inceleyen kütüphaneler için */
export const getDb = connect;

export const db: Db = new Proxy({} as Db, {
  get(_t, prop) {
    const real = connect() as unknown as Record<PropertyKey, unknown>;
    const v = real[prop];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(real) : v;
  },
});
export type { Db };
