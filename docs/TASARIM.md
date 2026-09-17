# Inbound OKR ve Marka Vault Panosu · Tasarım Dokümanı

Durum: taslak v1 · Hedef: Railway ya da Vercel üzerinde tek Next.js uygulaması + Postgres.
Görsel tasarım bu dokümanın kapsamı dışında; Claude Design ile ayrıca yapılacak.

## 1. Amaç

Üç işi tek yerde toplar:

1. **OKR takibi** · kişinin kendi OKR'ları, teslimleri, aylık yükümlülükleri ve haftalık ritmi. Yalnızca kişi ve yetkili yöneticiler görür.
2. **Marka hafızası** · her markada olan biten, iletişim notları, ticari notlar, sinyaller; herkes yazar, herkes okur, zaman içinde birikir.
3. **Marka vault'u** · markanın sabit bilgileri: bütçeler, altyapı ve IT ekipleri, iletişim kişileri, hangi Inbound ekipleri hizmet veriyor, kim bakıyor. Ekibe yeni katılan biri markayı buradan öğrenir.

Kullanıcılar: Inbound'un tüm ekipleri (Marketing Intelligence, Performance Marketing, Media, SEO & GEO). Giriş yalnızca `@inbound.com.tr` Google hesabıyla.

## 2. Kavramlar ve yetkiler

### Ekipler ve markalar
- **Ekip** · Marketing Intelligence · Performance Marketing · Media · SEO & GEO. Her ekibin hizmet verdiği marka listesi vardır (`brand_services`).
- **Marka** · hiyerarşik olabilir: Turkcell → Telco, Pasaj, Game+. Alt marka kendi notlarını taşır; üst marka görünümü alt markaları toplar.
- **Sorumluluk** · bir kişi bir markada `1. sorumlu`, `2. sorumlu`, `genel sorumlu` ya da `danışman` olabilir. Genel sorumlu ekip düzeyinde markanın sahibidir (ör. ekip yöneticisi), 1./2. sorumlu günlük işi yürütür.

### Unvan ve görünürlük
Unvan (`title`) kişiye bağlıdır: `jr_consultant · consultant · sr_consultant · lead · manager · director · gmy · ceo`.

| Kim | Kendi OKR'ı | Başkasının OKR'ı | Marka notları / vault | Admin |
|---|---|---|---|---|
| Jr Consultant … Lead | görür, düzenler | göremez | okur, yazar | hayır |
| Manager | görür | kendi ekibindekileri görür | okur, yazar | ekip listesi |
| Director · GMY · CEO | görür | herkesinkini görür | okur, yazar | hayır |
| Admin (bayrak) | - | - | - | marka, ekip, kişi, unvan yönetimi |

Admin bir unvan değil, kullanıcıya verilen bayraktır; ilk admin tohum verisinden gelir. "Manager yalnızca kendi ekibini görür" varsayımdır; Director/GMY/CEO tüm ekipleri görür.

OKR, teslim, aylık yükümlülük, haftalık efor ve hafta notu **kişiseldir**. Marka notları, temas kayıtları, sinyaller ve vault **ortaktır**. Bu ayrım veri modelinde `user_id` ile değil, tabloların kendisiyle yapılır; ortak tablolarda `author_id` yalnızca "kim yazdı" bilgisidir.

## 3. Ekranlar

| Rota | Ekran | İçerik |
|---|---|---|
| `/bu-hafta` | Bu hafta | Hafta seçici · efor günleri (Teamwork) · seçili markalarda temas ✓ + haftalık marka notu · bu haftaya düşen teslim adımları · hafta notu · takvimden gelen bu haftaki toplantılar, her toplantının altına kısa not |
| `/aylik` | Aylık yükümlülükler | Ay ay bloklar: OKR'dan gelen aylık maddeler, sunumlar, tekrar eden işler; ✓ + not. Kişisel |
| `/teslimler` | Teslimler | Teslim kartları: hedef, way of doing, adımlar (hedef hafta, ✓, not), ilerleme, gecikme uyarısı. Kişisel |
| `/okr` | OKR'lar | Kişinin OKR tablosu; dönem seçici. Yetkili yöneticiler için kişi seçici |
| `/markalar` | Markalarım | Sahiplik kartları · danışmanlık kartları · "Ekibimin diğer markaları" ve "Inbound'un diğer markaları" kapalı listeler. Kartta: ritim, son 4 hafta teması, son not, risk seviyesi. Notlar burada yazılmaz; detaya gidilir |
| `/inbound-markalar` | Inbound markaları | Tüm markalar: hizmet veren ekipler, sorumlular, son not tarihi, risk. Arama ve ekip filtresi |
| `/markalar/[slug]` | Marka detayı (vault) | Aşağıda |
| `/admin` | Yönetim | Ekipler, markalar (hiyerarşi), kişiler ve unvanlar, ekip-marka hizmet eşlemesi, sorumluluk atamaları |
| `/ayarlar` | Ayarlar | Takvim bağlantısı, haftalık e-posta tercihi, seçili markalar |

### Marka detayı
Sekmeler:
1. **Özet** · künye (sektör, web, sözleşme başlangıcı), hizmet veren ekipler ve sorumlular, risk seviyesi ve sinyaller, son 5 not, açık teslim adımları (bu markaya bağlı).
2. **Notlar** · tüm kullanıcıların notları; filtre: yazar, tür (iletişim · önemli · ticari · markada olan · sinyal · genel), hafta/ay. Varsayılan sıralama yeni → eski, "Benim notlarım" hızlı filtresi.
3. **Vault** · aylık backlink bütçesi, içerik bütçesi, altyapı ekibi, IT ekibi, marka yöneticisi, içerdeki ekip boyutu, kullanılan araçlar, raporlama ritmi. Her alanın son güncelleyeni ve tarihi görünür; değişiklik geçmişi tutulur.
4. **Kişiler** · markadaki iletişim kişileri: ad, rol, e-posta, telefon, hangi konuda muhatap, kim tanıştırdı.
5. **Zaman çizelgesi** · notlar, risk değişiklikleri, vault güncellemeleri, toplantılar tek akışta.
6. **Devir özeti** · sistemin ürettiği "bu markayı 10 dakikada anla" sayfası: vault + sinyaller + son 3 ayın öne çıkan notları + açık işler. Yeni katılan kişi için.

## 4. Eklediğim öneriler

- **Not türleri ve etiketler** · her not bir tür taşır; sinyal notları markanın izlenen sinyaline bağlanır (panodaki gibi).
- **Risk geçmişi** · seviye değişince kim, ne zaman, neden kaydı. Kart üzerinde trend.
- **Toplantı-not bağı** · takvimden gelen toplantıya yazılan not marka detayına "toplantı notu" türüyle düşer.
- **Devir özeti** · yukarıda. Vault'un asıl değeri burada ortaya çıkar.
- **Arama** · not, marka, kişi, vault alanı üzerinde tek arama kutusu.
- **Denetim kaydı** · vault ve sorumluluk değişiklikleri loglanır; yanlış düzenleme geri alınabilir.
- **Haftalık e-posta** · Cuma: açık teslim adımları, temas eksikleri, markalarındaki yeni notlar, gelecek haftanın toplantıları.
- **Sonra** · Fireflies entegrasyonu (toplantı özeti ve aksiyon maddeleri otomatik not olur), Excel dışa aktarım (okr-takip-tablosu skill'iyle aynı biçim), Slack bildirimi.

## 5. Teknik mimari

- **Uygulama** · Next.js 16 (App Router, TypeScript), sunucu bileşenleri + server actions. Tek repo, tek deploy.
- **Veritabanı** · Postgres. Railway'de Railway Postgres, Vercel'de Neon; ikisi de `DATABASE_URL` ile çalışır. ORM: Drizzle (şema `src/db/schema.ts`, migration `drizzle/`).
- **Kimlik** · Auth.js v5, Google provider, `hd=inbound.com.tr` + sunucu tarafında alan adı kontrolü. Oturum veritabanında (Drizzle adapter). Google Calendar için `calendar.readonly` kapsamı aynı onayda alınır; refresh token saklanır.
- **Takvim** · günde bir ve kullanıcı istediğinde: gelecek 14 günün etkinlikleri çekilir, marka eşlemesi başlık ve katılımcı alan adıyla yapılır (`brand.match_rules`), eşleşmeyenler kullanıcıya "hangi marka?" diye sorulur.
- **E-posta** · Resend. Haftalık özet cron: Vercel Cron ya da Railway cron servisi `POST /api/cron/weekly-digest` (gizli anahtarla).
- **Yetki** · tek yerde: `src/lib/authz.ts` (`canViewOkr(viewer, owner)`, `canEditVault`, `isAdmin`). Her server action önce buradan geçer.
- **Doğrulama** · Zod şemaları `src/lib/validators.ts`; form ve action aynı şemayı kullanır.
- **Stil** · Tailwind. Bileşenler şimdilik yalın; Claude Design çıktısı `src/components/ui` altına oturur.

## 6. Veri modeli (özet)

Kimlik: `users`, `accounts`, `sessions` (Auth.js) · `teams` · `user_teams`? Hayır: kişi tek ekipte (`users.team_id`).

Marka: `brands` (parent_id ile hiyerarşi) · `brand_services` (marka × ekip) · `brand_assignments` (marka × kişi × rol) · `brand_vault` (1-1, yapılandırılmış alanlar) · `brand_vault_history` · `brand_contacts` · `brand_signals` · `brand_risk_history` · `brand_match_rules`.

Ortak notlar: `brand_notes` (tür, gövde, hafta, opsiyonel sinyal ve toplantı bağı, yazar) · `brand_contact_log` (kişi × marka × hafta ✓).

Kişisel: `okr_periods` · `okrs` · `deliverables` · `deliverable_steps` · `monthly_obligations` · `week_entries` (efor günleri, hafta notu).

Takvim: `calendar_events` (kullanıcı, dış id, marka, başlangıç, başlık, katılımcılar, not).

Sistem: `audit_log` · `digest_prefs`.

Tam şema `src/db/schema.ts`.

## 7. Aşamalar

1. **İskelet** (bu teslim) · repo, şema, auth, yetki, rotalar, tohum verisi, README.
2. **Kişisel çalışma alanı** · Bu hafta, Aylık, Teslimler, OKR'lar ekranlarının işlevi; pano verisinin içe aktarımı.
3. **Marka katmanı** · Markalarım, Inbound markaları, marka detayı (Özet, Notlar, Vault, Kişiler).
4. **Entegrasyon** · takvim, haftalık e-posta, zaman çizelgesi, devir özeti, arama.
5. **Görsel tasarım** · Claude Design çıktısının bileşenlere uygulanması.
6. **Sonra** · Fireflies, Excel dışa aktarım, Slack.

## 8. Açık sorular

- Manager kendi ekibindeki herkesin OKR'ını mı görür, yoksa yalnızca kendisine bağlı olanları mı? (Varsayım: ekibin tamamı.)
- Danışman rolündeki kişi markanın haftalık temas hedefine sayılır mı? (Varsayım: hayır, panodaki gibi.)
- Vault alanları sabit mi kalacak, yoksa ekipler kendi alanlarını ekleyebilecek mi? (Varsayım: sabit çekirdek + "ek bilgiler" serbest alanları.)
- Google Workspace'te uygulamanın "internal" olarak kaydı için Cloud Console erişimi kimde?
