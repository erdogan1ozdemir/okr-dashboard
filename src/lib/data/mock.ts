/**
 * KURGUSAL veri. Gerçek kişi, marka ya da not içermez. Amaç: veritabanı olmadan ekranların
 * gerçekçi görünmesi. Tarihler içinde bulunulan haftaya göre üretilir ki "bu hafta" hep dolu olsun.
 */
import type { Dataset } from "./types";
import { isoWeekKey, shiftWeek, weekRange, monthKey } from "@/lib/weeks";

const NOW = new Date();
const W0 = isoWeekKey(NOW);                 // bu hafta
const W = (n: number) => shiftWeek(W0, n);  // n hafta ileri / geri
const M0 = monthKey(NOW);
const monthShift = (n: number) => { const [y, m] = M0.split("-").map(Number); const d = new Date(Date.UTC(y, m - 1 + n, 1)); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`; };
const iso = (week: string, dayOffset: number, hour = 10) => { const d = weekRange(week).monday; return new Date(d.getTime() + dayOffset * 864e5 + (hour - 3) * 36e5).toISOString(); };

const T = { mi: "t-mi", perf: "t-perf", media: "t-media", seo: "t-seo" };
const P = { deniz: "u-deniz", efe: "u-efe", ipek: "u-ipek", selin: "u-selin", can: "u-can", lale: "u-lale" };
const B = { kuzey: "b-kuzey", mavi: "b-mavi", maviK: "b-mavi-kurumsal", pera: "b-pera", nova: "b-nova", delta: "b-delta", atlas: "b-atlas", yildiz: "b-yildiz" };

export const CURRENT_USER_ID = P.deniz;

export const mock: Dataset = {
  teams: [
    { id: T.mi, name: "Marketing Intelligence", slug: "marketing-intelligence" },
    { id: T.perf, name: "Performance Marketing", slug: "performance-marketing" },
    { id: T.media, name: "Media", slug: "media" },
    { id: T.seo, name: "SEO & GEO", slug: "seo-geo" },
  ],
  people: [
    { id: P.deniz, name: "Deniz Kaya", email: "deniz.kaya@inbound.com.tr", title: "consultant", teamId: T.seo, isAdmin: true },
    { id: P.efe, name: "Efe Demir", email: "efe.demir@inbound.com.tr", title: "sr_consultant", teamId: T.seo, isAdmin: false },
    { id: P.ipek, name: "İpek Şahin", email: "ipek.sahin@inbound.com.tr", title: "lead", teamId: T.perf, isAdmin: false },
    { id: P.selin, name: "Selin Aydın", email: "selin.aydin@inbound.com.tr", title: "manager", teamId: T.seo, isAdmin: false },
    { id: P.can, name: "Can Yılmaz", email: "can.yilmaz@inbound.com.tr", title: "consultant", teamId: T.media, isAdmin: false },
    { id: P.lale, name: "Lale Koç", email: "lale.koc@inbound.com.tr", title: "jr_consultant", teamId: T.mi, isAdmin: false },
  ],
  brands: [
    { id: B.kuzey, name: "Kuzey Mobilya", slug: "kuzey-mobilya", parentId: null, sector: "Mobilya · e-ticaret", website: "kuzeymobilya.example", contractStart: "2024-03-01", riskLevel: "watch", serviceTeamIds: [T.seo, T.perf] },
    { id: B.mavi, name: "Mavi Kahve", slug: "mavi-kahve", parentId: null, sector: "Gıda · perakende", website: "mavikahve.example", contractStart: "2025-01-15", riskLevel: "calm", serviceTeamIds: [T.seo, T.media] },
    { id: B.maviK, name: "Mavi Kahve Kurumsal", slug: "mavi-kahve-kurumsal", parentId: B.mavi, sector: "B2B", website: null, contractStart: null, riskLevel: "calm", serviceTeamIds: [T.seo] },
    { id: B.pera, name: "Pera Tekstil", slug: "pera-tekstil", parentId: null, sector: "Tekstil", website: "peratekstil.example", contractStart: "2023-09-01", riskLevel: "calm", serviceTeamIds: [T.seo, T.perf, T.mi] },
    { id: B.nova, name: "Nova Enerji", slug: "nova-enerji", parentId: null, sector: "Enerji", website: "novaenerji.example", contractStart: "2025-06-01", riskLevel: "calm", serviceTeamIds: [T.seo] },
    { id: B.delta, name: "Delta Sigorta", slug: "delta-sigorta", parentId: null, sector: "Finans", website: null, contractStart: "2024-11-01", riskLevel: "up", serviceTeamIds: [T.perf, T.media] },
    { id: B.atlas, name: "Atlas Turizm", slug: "atlas-turizm", parentId: null, sector: "Turizm", website: null, contractStart: "2026-02-01", riskLevel: "calm", serviceTeamIds: [T.media, T.mi] },
    { id: B.yildiz, name: "Yıldız Kozmetik", slug: "yildiz-kozmetik", parentId: null, sector: "Kozmetik", website: null, contractStart: "2026-05-01", riskLevel: "calm", serviceTeamIds: [T.perf] },
  ],
  assignments: [
    { brandId: B.kuzey, userId: P.deniz, role: "primary", rhythm: "weekly", rhythmDay: "Çarşamba 11:30", rhythmAnchor: null },
    { brandId: B.kuzey, userId: P.efe, role: "secondary", rhythm: "weekly", rhythmDay: null, rhythmAnchor: null },
    { brandId: B.kuzey, userId: P.selin, role: "general", rhythm: "none", rhythmDay: null, rhythmAnchor: null },
    { brandId: B.kuzey, userId: P.ipek, role: "primary", rhythm: "weekly", rhythmDay: "Salı 14:00", rhythmAnchor: null },
    { brandId: B.mavi, userId: P.deniz, role: "primary", rhythm: "biweekly", rhythmDay: "Cuma 15:00", rhythmAnchor: weekRange(W(-1)).friday.toISOString().slice(0, 10) },
    { brandId: B.maviK, userId: P.deniz, role: "primary", rhythm: "none", rhythmDay: null, rhythmAnchor: null },
    { brandId: B.mavi, userId: P.can, role: "primary", rhythm: "weekly", rhythmDay: "Pazartesi 10:00", rhythmAnchor: null },
    { brandId: B.pera, userId: P.efe, role: "primary", rhythm: "weekly", rhythmDay: "Perşembe 10:30", rhythmAnchor: null },
    { brandId: B.pera, userId: P.deniz, role: "advisor", rhythm: "none", rhythmDay: null, rhythmAnchor: null },
    { brandId: B.nova, userId: P.efe, role: "primary", rhythm: "biweekly", rhythmDay: "Perşembe 15:00", rhythmAnchor: weekRange(W0).monday.toISOString().slice(0, 10) },
    { brandId: B.nova, userId: P.deniz, role: "secondary", rhythm: "biweekly", rhythmDay: "Perşembe 15:00", rhythmAnchor: weekRange(W0).monday.toISOString().slice(0, 10) },
    { brandId: B.delta, userId: P.ipek, role: "primary", rhythm: "weekly", rhythmDay: "Salı 11:00", rhythmAnchor: null },
    { brandId: B.atlas, userId: P.can, role: "primary", rhythm: "monthly", rhythmDay: "ayın ilk Pazartesi", rhythmAnchor: null },
    { brandId: B.atlas, userId: P.lale, role: "secondary", rhythm: "monthly", rhythmDay: null, rhythmAnchor: null },
  ],
  signals: [
    { id: "s1", brandId: B.kuzey, title: "Teknik taleplerin IT'de bekleme süresi" },
    { id: "s2", brandId: B.kuzey, title: "Aylık sunum ritmi" },
    { id: "s3", brandId: B.kuzey, title: "Toplantı ertelemeleri" },
    { id: "s4", brandId: B.mavi, title: "Tedarikçi değişikliği" },
    { id: "s5", brandId: B.delta, title: "Reklam bütçesi kesintisi" },
    { id: "s6", brandId: B.delta, title: "Yeni ajans görüşmesi söylentisi" },
  ],
  contacts: [
    { id: "c1", brandId: B.kuzey, name: "Selin Ak", role: "E-ticaret müdürü", email: "selin.ak@kuzeymobilya.example", phone: null, topics: "Bütçe, öncelik, sunum", introducedBy: P.selin },
    { id: "c2", brandId: B.kuzey, name: "Barış Tan", role: "İç SEO uzmanı", email: "baris.tan@kuzeymobilya.example", phone: null, topics: "Teknik talepler, içerik onayı", introducedBy: P.deniz },
    { id: "c3", brandId: B.kuzey, name: "Merve Ulu", role: "IT proje yöneticisi", email: null, phone: "0532 000 00 00", topics: "Geliştirme sprintleri", introducedBy: P.efe },
    { id: "c4", brandId: B.mavi, name: "Okan Er", role: "Pazarlama direktörü", email: "okan.er@mavikahve.example", phone: null, topics: "Her konu", introducedBy: P.deniz },
    { id: "c5", brandId: B.delta, name: "Nil Çetin", role: "Dijital pazarlama yöneticisi", email: null, phone: null, topics: "Reklam bütçesi", introducedBy: P.ipek },
  ],
  vaultFields: [
    { id: "f-mgr", teamId: null, key: "brand_manager", label: "Marka yöneticisi", type: "text", sortOrder: 1 },
    { id: "f-size", teamId: null, key: "internal_team_size", label: "Markadaki ekip boyutu", type: "text", sortOrder: 2 },
    { id: "f-it", teamId: null, key: "it_team", label: "IT ekibi", type: "text", sortOrder: 3 },
    { id: "f-infra", teamId: null, key: "infra_team", label: "Altyapı / geliştirme ajansı", type: "text", sortOrder: 4 },
    { id: "f-tools", teamId: null, key: "tools", label: "Kullanılan araçlar", type: "text", sortOrder: 5 },
    { id: "f-bl", teamId: T.seo, key: "backlink_budget_monthly", label: "Aylık backlink bütçesi", type: "currency", sortOrder: 1 },
    { id: "f-ct", teamId: T.seo, key: "content_budget_monthly", label: "Aylık içerik bütçesi", type: "currency", sortOrder: 2 },
    { id: "f-scope", teamId: T.seo, key: "scope", label: "Hizmet kapsamı", type: "textarea", sortOrder: 3 },
    { id: "f-rep", teamId: T.seo, key: "reporting", label: "Raporlama ritmi", type: "text", sortOrder: 4 },
    { id: "f-ads", teamId: T.perf, key: "ads_budget_monthly", label: "Aylık ortalama reklam bütçesi", type: "currency", sortOrder: 1 },
    { id: "f-plat", teamId: T.perf, key: "platforms", label: "Reklam platformları", type: "text", sortOrder: 2 },
    { id: "f-med", teamId: T.media, key: "media_budget", label: "Aylık medya bütçesi", type: "currency", sortOrder: 1 },
    { id: "f-mi", teamId: T.mi, key: "data_sources", label: "Veri kaynakları", type: "textarea", sortOrder: 1 },
  ],
  vaultValues: [
    { brandId: B.kuzey, fieldId: "f-mgr", value: "Selin Ak", updatedBy: P.selin, updatedAt: iso(W(-6), 1) },
    { brandId: B.kuzey, fieldId: "f-size", value: "3 kişi (1 SEO, 2 içerik)", updatedBy: P.deniz, updatedAt: iso(W(-6), 1) },
    { brandId: B.kuzey, fieldId: "f-it", value: "Marka iç IT · sprint 2 haftada bir", updatedBy: P.efe, updatedAt: iso(W(-3), 2) },
    { brandId: B.kuzey, fieldId: "f-infra", value: "Örnek Yazılım (SAP Commerce)", updatedBy: P.efe, updatedAt: iso(W(-3), 2) },
    { brandId: B.kuzey, fieldId: "f-bl", value: "60.000 TL", updatedBy: P.deniz, updatedAt: iso(W(-2), 0) },
    { brandId: B.kuzey, fieldId: "f-ct", value: "40.000 TL · 12 içerik", updatedBy: P.deniz, updatedAt: iso(W(-2), 0) },
    { brandId: B.kuzey, fieldId: "f-scope", value: "Teknik SEO, kategori içerikleri, aylık rapor, GEO görünürlük takibi", updatedBy: P.deniz, updatedAt: iso(W(-6), 1) },
    { brandId: B.kuzey, fieldId: "f-rep", value: "Aylık sunum · her ayın ilk haftası", updatedBy: P.deniz, updatedAt: iso(W(-6), 1) },
    { brandId: B.kuzey, fieldId: "f-ads", value: "250.000 TL", updatedBy: P.ipek, updatedAt: iso(W(-1), 3) },
    { brandId: B.kuzey, fieldId: "f-plat", value: "Google Ads, Meta", updatedBy: P.ipek, updatedAt: iso(W(-1), 3) },
    { brandId: B.mavi, fieldId: "f-mgr", value: "Okan Er", updatedBy: P.deniz, updatedAt: iso(W(-8), 1) },
    { brandId: B.mavi, fieldId: "f-bl", value: "25.000 TL", updatedBy: P.deniz, updatedAt: iso(W(-8), 1) },
    { brandId: B.mavi, fieldId: "f-med", value: "180.000 TL", updatedBy: P.can, updatedAt: iso(W(-4), 1) },
    { brandId: B.delta, fieldId: "f-ads", value: "400.000 TL (Ekim'den itibaren 300.000)", updatedBy: P.ipek, updatedAt: iso(W(-1), 1) },
  ],
  riskHistory: [
    { brandId: B.kuzey, level: "watch", reason: "IT sprint takvimi kaydı, iki teknik talep üçüncü haftaya sarktı", setBy: P.deniz, setAt: iso(W(-2), 3) },
    { brandId: B.kuzey, level: "calm", reason: "Aylık sunum ritmi yeniden kuruldu", setBy: P.deniz, setAt: iso(W(-7), 1) },
    { brandId: B.delta, level: "up", reason: "Bütçe kesintisi ve rakip ajans görüşmesi", setBy: P.ipek, setAt: iso(W(-1), 1) },
  ],
  notes: [
    { id: "n1", brandId: B.kuzey, authorId: P.deniz, type: "contact", body: "Haftalık toplantıda kategori içerik planı ve Q4 kampanya takvimi konuşuldu. Barış Bey teknik taleplerin bir sonraki sprinte girmesi için IT'ye iletti.", week: W0, signalId: null, eventId: null, createdAt: iso(W0, 2, 12) },
    { id: "n2", brandId: B.kuzey, authorId: P.deniz, type: "signal", body: "Canonical düzeltmesi üçüncü haftadır sprint dışında; Merve Hanım kapasite sorunu olduğunu söyledi.", week: W0, signalId: "s1", eventId: null, createdAt: iso(W0, 2, 13) },
    { id: "n3", brandId: B.kuzey, authorId: P.ipek, type: "commercial", body: "Reklam bütçesi Kasım için %20 artırıldı, Black Friday planı onaylandı.", week: W0, signalId: null, eventId: null, createdAt: iso(W0, 1, 15) },
    { id: "n4", brandId: B.kuzey, authorId: P.efe, type: "event", body: "Markada yeni e-ticaret müdürü başladı (Selin Ak). İlk tanışma toplantısı gelecek hafta.", week: W(-1), signalId: null, eventId: null, createdAt: iso(W(-1), 3) },
    { id: "n5", brandId: B.kuzey, authorId: P.deniz, type: "important", body: "Aylık sunum formatı sadeleştirildi; marka tek sayfalık özet istiyor, detay ek olarak gidecek.", week: W(-1), signalId: "s2", eventId: null, createdAt: iso(W(-1), 2) },
    { id: "n6", brandId: B.kuzey, authorId: P.deniz, type: "contact", body: "Toplantı yapılamadı, markadaki SEO uzmanı izindeydi. Gündem maille iletildi.", week: W(-2), signalId: "s3", eventId: null, createdAt: iso(W(-2), 2) },
    { id: "n7", brandId: B.kuzey, authorId: P.selin, type: "general", body: "Sözleşme yenileme görüşmesi Aralık'ta. Bütçe artışı için Q4 sonuçları kritik.", week: null, signalId: null, eventId: null, createdAt: iso(W(-4), 0) },
    { id: "n8", brandId: B.mavi, authorId: P.deniz, type: "contact", body: "İki haftalık toplantı: kurumsal alt marka için ayrı blog yapısı onaylandı, ilk 5 içerik Ekim'de.", week: W(-1), signalId: null, eventId: null, createdAt: iso(W(-1), 4) },
    { id: "n9", brandId: B.mavi, authorId: P.can, type: "commercial", body: "Medya planı Q4 için revize edildi; TV yerine dijital video ağırlıklı.", week: W0, signalId: null, eventId: null, createdAt: iso(W0, 0) },
    { id: "n10", brandId: B.mavi, authorId: P.deniz, type: "signal", body: "Kahve tedarikçisi değişiyor, ürün sayfalarında içerik güncellemesi gerekecek.", week: W(-3), signalId: "s4", eventId: null, createdAt: iso(W(-3), 1) },
    { id: "n11", brandId: B.pera, authorId: P.efe, type: "contact", body: "Haftalık: yeni sezon koleksiyon sayfaları için kategori mimarisi konuşuldu.", week: W0, signalId: null, eventId: null, createdAt: iso(W0, 3) },
    { id: "n12", brandId: B.nova, authorId: P.efe, type: "contact", body: "Sunum bir hafta ertelendi; hacim verisi geç geldi.", week: W(-1), signalId: null, eventId: null, createdAt: iso(W(-1), 3) },
    { id: "n13", brandId: B.delta, authorId: P.ipek, type: "signal", body: "Marka Ekim'den itibaren reklam bütçesini düşürdüğünü iletti.", week: W(-1), signalId: "s5", eventId: null, createdAt: iso(W(-1), 1) },
    { id: "n14", brandId: B.delta, authorId: P.ipek, type: "signal", body: "Pazarlama yöneticisi başka bir ajansla görüştüklerini ima etti.", week: W0, signalId: "s6", eventId: null, createdAt: iso(W0, 1) },
    { id: "n15", brandId: B.atlas, authorId: P.can, type: "general", body: "Marka yaz sezonu sonrası kampanyaları durdurdu; Ocak'ta yeniden başlıyor.", week: null, signalId: null, eventId: null, createdAt: iso(W(-5), 0) },
  ],
  contactLog: [
    { userId: P.deniz, brandId: B.kuzey, week: W0, contacted: true },
    { userId: P.deniz, brandId: B.kuzey, week: W(-1), contacted: true },
    { userId: P.deniz, brandId: B.kuzey, week: W(-3), contacted: true },
    { userId: P.deniz, brandId: B.mavi, week: W(-1), contacted: true },
    { userId: P.deniz, brandId: B.mavi, week: W(-3), contacted: true },
    { userId: P.deniz, brandId: B.nova, week: W(-2), contacted: true },
  ],
  periods: [{ id: "p-q4", name: "2026 Q4", startDate: "2026-09-01", endDate: "2026-12-31", isCurrent: true }],
  okrs: [
    { id: "o1", userId: P.deniz, periodId: "p-q4", taskNo: "1", cluster: "Client ownership", expectations: ["Sorumlu olunan markalarda aylık review", "Çeyreklik yüz yüze toplantı"], objectives: ["Kuzey Mobilya", "Mavi Kahve"] },
    { id: "o2", userId: P.deniz, periodId: "p-q4", taskNo: "2", cluster: "Client ownership", expectations: ["Her hafta en az 1 kez markayla iletişim"], objectives: [] },
    { id: "o3", userId: P.deniz, periodId: "p-q4", taskNo: "3", cluster: "Client ownership", expectations: ["Churn risk sinyallerinin proaktif takibi"], objectives: ["Kuzey Mobilya'da IT bekleme süresi ve sunum ritmi"] },
    { id: "o4", userId: P.deniz, periodId: "p-q4", taskNo: "4", cluster: "Hizmet standardı", expectations: ["Yeni rapor şablonunun tüm markalarda kullanılması"], objectives: ["Kasım sonuna kadar ekip geçişi"] },
    { id: "o5", userId: P.deniz, periodId: "p-q4", taskNo: "5", cluster: "Knowhow aktarımı", expectations: ["GEO kontrol listesinin ekibe aktarılması"], objectives: ["Aralık'ta workshop", "Aylık operasyona dahil edilmesi"] },
    { id: "o6", userId: P.deniz, periodId: "p-q4", taskNo: "6", cluster: "Knowhow aktarımı", expectations: ["Ekip içi pozitif geri bildirim"], objectives: ["Her ay en az 1 kişiye"] },
  ],
  deliverables: [
    { id: "d1", userId: P.deniz, periodId: "p-q4", okrId: "o4", brandId: null, title: "Rapor şablonu geçişi", goal: "Kasım sonuna kadar tüm markalarda", wayOfDoing: "Mevcut sunum üreticisi temel alınır; pilot markada denenir, ekibe 1 saatlik aktarım yapılır, kalan markalar iki haftada geçer.", note: "Pilot marka Kuzey Mobilya." },
    { id: "d2", userId: P.deniz, periodId: "p-q4", okrId: "o5", brandId: null, title: "GEO kontrol listesi aktarımı", goal: "Aralık'ta ekip günlük operasyonunda", wayOfDoing: "Kontrol listesi GitHub'daki sürümden derlenir, örnek markayla workshop yapılır, aylık rapor şablonuna bir bölüm olarak eklenir.", note: null },
    { id: "d3", userId: P.deniz, periodId: "p-q4", okrId: "o1", brandId: B.kuzey, title: "Kuzey Mobilya Q4 strateji sunumu", goal: "Black Friday öncesi", wayOfDoing: "Kampanya takvimi markadan alınır, kategori öncelikleri ve teknik ön koşullar tek sunumda sunulur.", note: null },
  ],
  steps: [
    { id: "st1", deliverableId: "d1", title: "Final rapor formatının yaratılması", targetWeek: W(-1), status: "done", note: "Tek sayfalık özet + ek" },
    { id: "st2", deliverableId: "d1", title: "Pilot markada uygulanması", targetWeek: W0, status: "planned", note: null },
    { id: "st3", deliverableId: "d1", title: "Ekibe aktarım", targetWeek: W(2), status: "planned", note: null },
    { id: "st4", deliverableId: "d1", title: "Uygun tüm markalarda uygulanması", targetWeek: W(5), status: "planned", note: null },
    { id: "st5", deliverableId: "d2", title: "Kontrol listesinin derlenmesi", targetWeek: W(3), status: "planned", note: null },
    { id: "st6", deliverableId: "d2", title: "Ekiple workshop", targetWeek: W(6), status: "planned", note: null },
    { id: "st7", deliverableId: "d2", title: "Aylık operasyona dahil edilmesi", targetWeek: W(9), status: "planned", note: null },
    { id: "st8", deliverableId: "d3", title: "Kampanya takviminin markadan alınması", targetWeek: W(-2), status: "done", note: null },
    { id: "st9", deliverableId: "d3", title: "Strateji çerçevesinin hazırlanması", targetWeek: W(-1), status: "planned", note: "Kategori öncelikleri bekleniyor" },
    { id: "st10", deliverableId: "d3", title: "Sunumun yapılması", targetWeek: W0, status: "planned", note: null },
  ],
  monthly: [
    ...[monthShift(-1), M0, monthShift(1), monthShift(2)].flatMap((m, i) => [
      { id: `m${i}a`, userId: P.deniz, month: m, title: "Kuzey Mobilya aylık review", taskRef: "T1", scope: "Kuzey Mobilya", done: i === 0, note: i === 0 ? "3'ünde yapıldı" : null },
      { id: `m${i}b`, userId: P.deniz, month: m, title: "Mavi Kahve aylık review", taskRef: "T1", scope: "Mavi Kahve", done: i === 0, note: null },
      { id: `m${i}c`, userId: P.deniz, month: m, title: "Aylık plan + planlanan-gerçekleşen özeti", taskRef: "-", scope: "Yönetime", done: i === 0, note: null },
      { id: `m${i}d`, userId: P.deniz, month: m, title: "Churn risk sinyallerinin gözden geçirilmesi", taskRef: "T3", scope: "Tüm markalar", done: false, note: null },
      { id: `m${i}e`, userId: P.deniz, month: m, title: "Ekip içinde en az 1 kişiye pozitif geri bildirim", taskRef: "T6", scope: "Ekip", done: i === 0, note: i === 0 ? "Efe · rapor şablonu" : null },
    ]),
  ],
  weekEntries: [
    { userId: P.deniz, week: W0, effortDays: { "0": true, "1": true }, note: "Pilot rapor bu hafta Kuzey'e gidiyor; Q4 sunumu Perşembe." },
    { userId: P.deniz, week: W(-1), effortDays: { "0": true, "1": true, "2": true, "3": true, "4": true }, note: "" },
    { userId: P.deniz, week: W(-2), effortDays: { "0": true, "1": true, "2": true, "3": true, "4": true }, note: "" },
  ],
  events: [
    { id: "e1", userId: P.deniz, brandId: B.kuzey, title: "Kuzey Mobilya & Inbound SEO Weekly", startsAt: iso(W0, 2, 11.5), endsAt: iso(W0, 2, 12.5), attendees: ["selin.ak@kuzeymobilya.example", "baris.tan@kuzeymobilya.example"], postNote: "Q4 kampanya takvimi alındı; canonical talebi sprinte girdi." },
    { id: "e2", userId: P.deniz, brandId: B.kuzey, title: "Kuzey Mobilya Q4 Strateji Sunumu", startsAt: iso(W0, 3, 14), endsAt: iso(W0, 3, 15), attendees: ["selin.ak@kuzeymobilya.example"], postNote: null },
    { id: "e3", userId: P.deniz, brandId: B.nova, title: "Nova Enerji - Inbound SEO Catchup", startsAt: iso(W0, 3, 15), endsAt: iso(W0, 3, 15.75), attendees: ["yunus@novaenerji.example"], postNote: null },
    { id: "e4", userId: P.deniz, brandId: null, title: "Ekip haftalık", startsAt: iso(W0, 0, 10), endsAt: iso(W0, 0, 10.5), attendees: [], postNote: null },
    { id: "e5", userId: P.deniz, brandId: B.mavi, title: "Mavi Kahve İki Haftalık", startsAt: iso(W(1), 4, 15), endsAt: iso(W(1), 4, 16), attendees: ["okan.er@mavikahve.example"], postNote: null },
    { id: "e6", userId: P.deniz, brandId: null, title: "Yeni marka tanışma · Yıldız Kozmetik", startsAt: iso(W(1), 1, 11), endsAt: iso(W(1), 1, 12), attendees: ["info@yildizkozmetik.example"], postNote: null },
  ],
};
