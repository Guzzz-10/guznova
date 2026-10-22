"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { modoDemo } from "@/lib/entorno";
import { supabaseNavegador } from "@/lib/supabase/cliente";
import { LogoIcono } from "@/components/ui/Logo";
import { Aviso } from "@/components/ui/Aviso";

const errores: Record<string, string> = {
  "no-autorizado": "Acceso no autorizado. Solo la cuenta de Google del dueño puede entrar al panel.",
  sesion: "No pudimos iniciar la sesión con Google. Probá de nuevo.",
  "sin-codigo": "El inicio de sesión se interrumpió. Probá de nuevo.",
};

const IconoGoogle = () => (
  <svg viewBox="0 0 48 48" className="size-6" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
  </svg>
);

export function IngresoAdmin({ nombre }: { nombre: string }) {
  const params = useSearchParams();
  const [cargando, setCargando] = useState(false);
  const error = errores[params.get("error") ?? ""];
  const inactividad = params.get("motivo") === "inactividad";

  const conGoogle = async () => {
    setCargando(true);
    await supabaseNavegador().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { prompt: "select_account" } },
    });
  };

  return (
    <div className="w-full max-w-sm rounded-4xl bg-white p-7 text-center shadow-flotante sm:p-9">
      <LogoIcono className="mx-auto size-16" />
      <h1 className="mt-4 text-2xl font-bold text-mar-900">Panel de {nombre}</h1>
      <p className="mt-1 text-mar-600">Acceso exclusivo para la administración.</p>

      {inactividad && (
        <Aviso tipo="info" className="mt-5 text-left">
          Cerramos tu sesión por inactividad. Volvé a ingresar.
        </Aviso>
      )}
      {error && (
        <Aviso tipo="error" className="mt-5 text-left">
          {error}
        </Aviso>
      )}

      {modoDemo ? (
        <>
          <Aviso tipo="alerta" className="mt-5 text-left">
            Modo demo: Supabase todavía no está configurado, así que el panel muestra datos ficticios.
          </Aviso>
          <Link href="/admin" className="btn btn-agua mt-5 w-full">
            Entrar al panel de demostración
          </Link>
        </>
      ) : (
        <button type="button" onClick={conGoogle} disabled={cargando} className="btn btn-claro mt-6 w-full ring-2 ring-mar-100">
          {cargando ? <LoaderCircle className="size-6 animate-spin" aria-hidden="true" /> : <IconoGoogle />} Ingresar con Google
        </button>
      )}

      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-mar-500">
        <ShieldCheck className="size-4" aria-hidden="true" /> Solo el email autorizado puede entrar.
      </p>
    </div>
  );
}
