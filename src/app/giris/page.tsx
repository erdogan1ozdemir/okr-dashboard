import { redirect } from "next/navigation";

export default function LoginPage() {
  if (!process.env.DATABASE_URL) redirect("/bu-hafta"); // kurgusal veri modu: giriş yok
  return (
    <main className="min-h-screen grid place-items-center">
      <form action={async () => { "use server"; const { signIn } = await import("@/auth"); await signIn("google", { redirectTo: "/bu-hafta" }); }}>
        <h1 className="text-xl font-semibold mb-4">Inbound Pano</h1>
        <button className="border rounded px-4 py-2" type="submit">Google ile giriş yap (@inbound.com.tr)</button>
      </form>
    </main>
  );
}
