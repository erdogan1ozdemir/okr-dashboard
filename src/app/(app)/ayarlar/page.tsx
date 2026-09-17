import { currentUser } from "@/lib/data";
import { PageHeader, Panel, Chip, Button } from "@/components/ui";

/** Ayarlar. TODO(altyapı): takvim bağlantısı Google OAuth'a, tercihler digest_prefs tablosuna bağlanacak. */
export default async function Page() {
  const me = await currentUser();
  return (
    <>
      <PageHeader title="Ayarlar" sub={me.email} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Takvim senkronizasyonu" meta={<Chip tone="good">bağlı</Chip>}><p className="text-sm text-neutral-600">{"Google Calendar'dan gelecek 14 günün toplantıları çekilir ve markaya eşlenir. Eşleşmeyen toplantılar Bu hafta ekranında marka seçmeni ister."}</p><div className="mt-3 flex gap-2"><Button>Şimdi senkronla</Button><Button>Bağlantıyı kaldır</Button></div></Panel>
        <Panel title="Haftalık e-posta özeti" meta={<Chip tone="good">açık</Chip>}><p className="text-sm text-neutral-600">Her Cuma: açık teslim adımları, temas girilmeyen markalar, markalarındaki yeni notlar, gelecek haftanın toplantıları.</p><div className="mt-3"><Button>Kapat</Button></div></Panel>
      </div>
    </>
  );
}
