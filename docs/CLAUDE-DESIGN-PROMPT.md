# Claude Design'a verilecek prompt

Aşağıdaki metin olduğu gibi Claude Design'a yapıştırılır. Repo bağlandıktan sonra tek mesaj olarak gönderilir.

---

Inbound adlı dijital pazarlama ajansının iç kullanım panosunun görsel tasarımını yapmanı istiyorum. Uygulama çalışır durumda ama görsel tasarımı yok: şu an yalnızca yapı, düzen ve içerik var. Senden bu iskeleti ajansın kimliğine uygun, günlük kullanılacak bir arayüze dönüştürmeni istiyorum.

## Uygulama ne işe yarıyor

Üç işi tek yerde topluyor:

1. **OKR takibi** · her çalışanın kendi hedefleri, teslimleri, aylık yükümlülükleri ve haftalık ritmi. Kişiseldir: yalnızca kişi ve yöneticisi görür.
2. **Marka hafızası** · markalarla ilgili notlar (iletişim, ticari, markada olan, sinyal). Herkes yazar, herkes okur, zamanla birikir.
3. **Marka vault'u** · markanın sabit bilgileri: bütçeler, hangi IT ve altyapı ekibiyle çalışıyor, iletişim kişileri, hangi Inbound ekipleri hizmet veriyor. Ekibe yeni katılan biri markayı buradan öğreniyor.

Kullanıcılar: ajansın dört ekibi (Marketing Intelligence, Performance Marketing, Media, SEO & GEO). Haftada birkaç kez, işin ortasında açılıyor. Pazarlama sitesi değil, çalışma aracı: yoğun bilgi, hızlı tarama, az süs.

## Repoyu çalıştırma

```bash
npm install
npm run dev        # http://localhost:3000
```

`DATABASE_URL` tanımlı olmadığı için uygulama **kurgusal veri modunda** açılır: giriş istemez, tüm ekranlar örnek veriyle dolu gelir. Kişiler ve markalar uydurmadır (Deniz Kaya, Kuzey Mobilya, Mavi Kahve...). Tarihler bugüne göre üretilir, yani "bu hafta" her zaman doludur. Tasarımı bu modda yaparsın.

Bağlam için: `docs/TASARIM.md` (ekranların ne yaptığı, yetki modeli, veri modeli).

## Ekranlar

| Rota | Ekran | Tasarımda önemli olan |
|---|---|---|
| `/bu-hafta` | Bu hafta | Günlük kullanılan ekran. Efor günleri, marka başına temas işareti ve haftalık not alanı, bu haftaya düşen teslim adımları (gecikmişler ayrışmalı), takvimden gelen toplantılar, hafta notu. Çok sayıda küçük etkileşim var; yazma alanları rahat olmalı |
| `/aylik` | Aylık yükümlülükler | Ay ay bloklar, her maddede onay ve not. İçinde bulunulan ay öne çıkmalı |
| `/teslimler` | Teslimler | Teslim kartları: hedef, nasıl yapılacağı, adımlar ve hedef haftaları. Adımın durumu (planda, bu hafta, gecikmiş, tamam) tek bakışta okunmalı |
| `/okr` | OKR'lar | Dört sütunlu OKR tablosu. Uzun Türkçe metin okunaklı olmalı |
| `/markalar` | Markalarım | Sahiplik ve danışmanlık kartları: son dört haftanın temas göstergesi, birlikte bakan kişiler, son not, risk seviyesi. Altta "ekibimin diğer markaları" ve "Inbound'un diğer markaları" varsayılan kapalı listeler |
| `/inbound-markalar` | Inbound markaları | Tüm markaların tablosu: ekipler, sorumlular, risk, son not. Tarama ve filtreleme ekranı |
| `/markalar/[slug]` | Marka detayı | Uygulamanın kalbi. Altı sekme: Özet · Notlar · Vault · Kişiler · Zaman çizelgesi · Devir özeti. Notlar uzun ve Türkçe; okuma tipografisi burada belirleyici. Vault ekip ekip bölümlenmiş bilgi kartları. Devir özeti "bu markayı 10 dakikada anla" sayfası |
| `/admin` | Yönetim | Liste ve tablo ağırlıklı |
| `/ayarlar` | Ayarlar | İki kart |

## Marka kimliği

Ajansın renk sistemi (başlangıç noktası, ton dengesini sen kur):

- Koyu teal `#10332F` · ana mürekkep ve başlık rengi
- Coral `#FF7B52`, koyu coral `#E85F36` · vurgu, içinde bulunulan hafta ve ay
- Gold `#F5A623` · uyarı ve öncelik
- Nötr `#F0EDE8` · sıcak zemin
- Semantik: yeşil `#2E7D32` tamamlandı, kırmızı `#D32F2F` gecikmiş ve risk
- Koyu tema zemini olarak `#0B1D1A` ailesi kullanılabilir

Tipografi: başlıklarda Bricolage Grotesque, gövdede Outfit, sayı ve tarihlerde tek aralıklı bir yüz (IBM Plex Mono gibi). Daha iyi bir eşleşme öneriyorsan gerekçesiyle değiştirebilirsin.

İki tema da gereklidir: açık ve koyu. Şu an yalnızca tek açık tema var, koyu tema yok.

## Dikkat etmeni istediklerim

- **Semantik renk ayrı olmalı.** Risk seviyesi (sakin / izlemede / yükseldi) ve adım durumu (planda / bu hafta / gecikmiş / tamam) vurgudan bağımsız okunmalı. Her şey coral olursa hiçbir şey öne çıkmaz.
- **Not okuma deneyimi.** Marka detayındaki notlar uzun Türkçe paragraflar; satır uzunluğu, satır aralığı ve yazar/tarih künyesinin hiyerarşisi bu ekranı yapar ya da bozar.
- **Yoğunluk.** Haftalık ekranda altı marka, beş gün, birkaç teslim adımı ve toplantı aynı anda görünür. Ferah ama boş olmayan bir yoğunluk gerekiyor; kart içinde kart yığınından kaçın.
- **Yazma alanları.** Notlar sürekli yazılıyor. Metin alanları içerik kadar büyüyen, kesilmeyen, tıklaması kolay olmalı.
- **Kapalı listeler.** "Diğer markalar" bölümleri varsayılan kapalı; açıldığında tablo gibi taranabilir olmalı, kart olmamalı.
- **Mobil.** Telefonda da açılacak. Tablolar kendi içinde kaysın, sayfa yatay kaymasın.
- **Kurgusal veri rozeti.** Üst barda "Kurgusal veri" etiketi var; veritabanı bağlanınca kaybolacak, tasarımda geçici bir durum olarak düşün.

## Nerede çalışacaksın

- `src/app/globals.css` · renk değişkenleri, tema tanımları, tipografi
- `src/components/ui.tsx` · ortak bileşenler: `PageHeader`, `Panel`, `Chip`, `Tick`, `Tabs`, `Field`, `Empty`, `NoteBox`, `Button`. Yeni bileşen ekleyebilirsin
- `src/app/(app)/*/page.tsx` · ekranların düzeni ve sınıfları
- `src/app/(app)/layout.tsx` · üst bar ve gezinme

**Dokunma:** `src/lib/data/*` (veri katmanı ve kurgusal veri), `src/lib/authz.ts` (yetki kuralları), `src/db/schema.ts` (veri modeli), `src/auth.ts`, `src/lib/calendar`, `src/lib/email`. Bunlar altyapı; tasarım değişikliği bunları gerektirmemeli. Ekranın ihtiyacı olan bir veri yoksa uydurma, bana söyle.

## Teknik kurallar

- Next.js 16 App Router, sunucu bileşenleri. Veri çekme sunucuda; etkileşim gerektiren parçalar için `"use client"` ekleyebilirsin.
- Tailwind v4 (`@import "tailwindcss"`). Renkleri CSS değişkeni olarak tanımla, bileşenlerde doğrudan hex yazma.
- Arayüz metinleri Türkçe. Türkçe karakterler doğru, em dash (—) kullanma, emoji kullanma.
- Formlar şu an çalışmıyor (kaydetme yok); görünüm doğru olsun yeter, işlevi ben bağlayacağım.
- `npm run build` ve `npx tsc --noEmit` hatasız kalmalı.

## Nasıl ilerlemeni istiyorum

1. Önce uygulamayı çalıştır, dokuz ekranı da gez.
2. Bana kısa bir yön önerisi getir: palet, tipografi, yoğunluk kararı ve bir ekranın (tercihen `/bu-hafta` ya da marka detayı) görünümü. Onaylayınca diğerlerine geç.
3. Ortak bileşenlerden başla, sonra ekranlara uygula; aynı öğe her ekranda aynı görünsün.
4. Bitirince değiştirdiğin dosyaları ve verdiğin kararları özetle.
