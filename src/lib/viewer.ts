import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Viewer } from "@/lib/authz";

/** Oturumdaki kullanıcıyı unvan ve ekip bilgisiyle döndürür; yoksa null. auth modülü tembel yüklenir. */
export async function getViewer(): Promise<(Viewer & { email: string; name: string | null }) | null> {
  const { auth } = await import("@/auth");
  const session = await auth();
  if (!session?.user?.id) return null;
  const [u] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  if (!u || !u.isActive) return null;
  return { id: u.id, title: u.title, teamId: u.teamId, isAdmin: u.isAdmin, email: u.email, name: u.name };
}

export async function requireViewer() {
  const v = await getViewer();
  if (!v) throw new Error("Oturum gerekli");
  return v;
}
