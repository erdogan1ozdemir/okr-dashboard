import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";
import { isAllowedEmail, ALLOWED_EMAIL_DOMAIN } from "@/lib/authz";

/**
 * Google ile giriş; yalnızca @inbound.com.tr. Takvim okuma izni aynı onayda alınır,
 * refresh token accounts tablosunda saklanır (takvim senkronizasyonu için).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "database" },
  providers: [
    Google({
      authorization: {
        params: {
          hd: ALLOWED_EMAIL_DOMAIN,
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    // hd parametresi tarayıcı tarafında atlatılabilir; sunucuda yeniden kontrol edilir
    signIn({ profile }) {
      return isAllowedEmail(profile?.email);
    },
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  pages: { signIn: "/giris" },
});
