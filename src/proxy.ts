/* Next.js 16: oturum kontrolü proxy dosyasında. Auth rotaları, cron ve giriş sayfası hariç her yol oturum ister. */
export { auth as proxy } from "@/auth";
export const config = { matcher: ["/((?!api/auth|api/cron|giris|_next|favicon.ico).*)"] };
