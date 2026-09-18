# Inbound OKR ve Marka Vault Panosu

OKR takibi, marka hafızası ve marka vault'u tek uygulamada. Tasarım: [docs/TASARIM.md](docs/TASARIM.md).

## Yığın
Next.js 16 (App Router, TypeScript) · Postgres + Drizzle · Auth.js (Google, yalnızca @inbound.com.tr) · Resend · Tailwind

## Hemen görmek için (kurgusal veri modu)
```bash
npm install
npm run dev                     # http://localhost:3000
```
`DATABASE_URL` tanımlı değilse giriş istenmez, tüm ekranlar `src/lib/data/mock.ts` içindeki kurgusal veriyle açılır. Görsel tasarım bu modda yapılır.

## Veritabanıyla çalıştırma
```bash
cp .env.example .env            # değerleri doldur
npm run db:push                 # şemayı veritabanına yaz
npm run db:seed                 # ekipler, dönem, kurgusal örnek veri
npm run dev
```
TODO(altyapı): `src/lib/data/index.ts` içindeki Postgres uygulaması ve ekranlardaki server action'lar henüz yazılmadı; şu an yalnızca kurgusal veri modu tam çalışır.

Google Cloud Console'da OAuth istemcisi: yetkili yönlendirme `http://localhost:3000/api/auth/callback/google` (canlıda alan adıyla). Kapsamlar: openid, email, profile, calendar.readonly. Uygulama türü "Internal" olursa yalnızca Workspace hesapları görür.

## Deploy
- **Vercel** · Neon Postgres, `vercel.json` cron haftalık özeti Cuma 16:00 (UTC 13:00) tetikler.
- **Railway** · Railway Postgres + web servisi; cron için ayrı servis `curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://<alan>/api/cron/weekly-digest`.

## Dizinler
```
src/db/schema.ts            veri modeli
src/lib/authz.ts            tüm yetki kararları
src/lib/weeks.ts            ISO hafta yardımcıları
src/lib/validators.ts       Zod şemaları (form + server action)
src/lib/calendar/google.ts  takvim senkronizasyonu ve marka eşleme
src/lib/email/weekly-digest.ts
src/lib/data/types.ts       ekranların görünüm modelleri
src/lib/data/mock.ts        kurgusal veri (gerçek kişi / marka yok)
src/lib/data/select.ts      ortak seçiciler ve etiketler
src/components/ui.tsx       yapısal bileşenler (Panel, Chip, Tick, Tabs...)
src/app/(app)/*             ekranlar (bu-hafta, aylik, teslimler, okr, markalar, markalar/[slug], inbound-markalar, admin, ayarlar)
scripts/seed.ts             tohum verisi (kurgusal)
docs/TASARIM.md             tasarım dokümanı
docs/CLAUDE-DESIGN-PROMPT.md  görsel tasarım için Claude Design'a verilecek prompt
```
