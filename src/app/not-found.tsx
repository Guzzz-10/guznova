import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main className="relative isolate grid min-h-dvh place-items-center overflow-hidden px-6 text-center">
      <div className="absolute inset-0 -z-10 bg-grid mask-fade-b" aria-hidden />
      <div className="absolute left-1/2 top-1/3 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-nova-500/15 blur-[110px]" aria-hidden />
      <div>
        <Link href="/" aria-label="AutoNova — Inicio">
          <Logo />
        </Link>
        <p className="mt-10 font-display text-8xl font-extrabold text-white/10">404</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Esta página tomó otro camino</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-400">
          Puede que el auto ya no esté publicado o que el link esté mal escrito.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/autos" className="btn-primary">
            Ver autos disponibles
          </Link>
          <Link href="/" className="btn-ghost">
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
