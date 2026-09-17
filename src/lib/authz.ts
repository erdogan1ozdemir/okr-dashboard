/**
 * Tüm yetki kararları burada. Server action'lar ve sayfalar önce bu fonksiyonlardan geçer;
 * hiçbir yerde unvan karşılaştırması tekrar yazılmaz.
 */
export type Title = "jr_consultant" | "consultant" | "sr_consultant" | "lead" | "manager" | "director" | "gmy" | "ceo";

export interface Viewer {
  id: string;
  title: Title;
  teamId: string | null;
  isAdmin: boolean;
}

export interface OkrOwner {
  id: string;
  teamId: string | null;
}

/** OKR, teslim, aylık yükümlülük, hafta girişi: kişisel veriler */
export function canViewPersonal(viewer: Viewer, owner: OkrOwner): boolean {
  if (viewer.id === owner.id) return true;
  if (viewer.title === "director" || viewer.title === "gmy" || viewer.title === "ceo") return true;
  if (viewer.title === "manager") return viewer.teamId !== null && viewer.teamId === owner.teamId;
  return false;
}

export function canEditPersonal(viewer: Viewer, owner: OkrOwner): boolean {
  return viewer.id === owner.id;
}

/** Marka notları, temas, sinyaller, vault, kişiler: ortak veriler; giriş yapan herkes okur ve yazar */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function canReadBrand(_viewer: Viewer): boolean {
  return true;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function canWriteBrandNote(_viewer: Viewer): boolean {
  return true;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function canEditVault(_viewer: Viewer): boolean {
  return true;
}

/** Yalnızca yazar ya da admin kendi notunu düzenler / siler */
export function canEditNote(viewer: Viewer, note: { authorId: string }): boolean {
  return viewer.isAdmin || viewer.id === note.authorId;
}

/** Ekip, marka, kişi, unvan ve atama yönetimi */
export function canAdmin(viewer: Viewer): boolean {
  return viewer.isAdmin;
}

/** Manager kendi ekibinin atamalarını düzenleyebilir */
export function canManageTeamAssignments(viewer: Viewer, teamId: string): boolean {
  return viewer.isAdmin || (viewer.title === "manager" && viewer.teamId === teamId);
}

export const ALLOWED_EMAIL_DOMAIN = "inbound.com.tr";
export function isAllowedEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase().endsWith("@" + ALLOWED_EMAIL_DOMAIN);
}
