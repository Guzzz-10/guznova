import { LoginForm } from "./LoginForm";
import { Logo } from "@/components/ui/Logo";

export const metadata = { title: "Ingresar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center bg-gradient-to-br from-ink-50 via-white to-nova-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo light />
        </div>
        <div className="a-card p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-ink-900">Panel de administración</h1>
          <p className="mb-6 mt-1 text-sm text-ink-500">Ingresá con tu usuario y contraseña.</p>
          <LoginForm next={next ?? ""} />
        </div>
        <p className="mt-6 text-center text-xs text-ink-400">
          <a href="/" className="underline-offset-2 hover:underline">
            ← Volver al sitio
          </a>
        </p>
      </div>
    </main>
  );
}
