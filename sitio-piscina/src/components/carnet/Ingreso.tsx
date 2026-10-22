"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound, LoaderCircle, Mail } from "lucide-react";
import { modoDemo } from "@/lib/entorno";
import { supabaseNavegador } from "@/lib/supabase/cliente";
import { demo } from "@/lib/demo/almacen";
import { Campo } from "@/components/ui/Campo";
import { Aviso } from "@/components/ui/Aviso";

/** Login del socio: email + contraseña o código de 6 dígitos por email. */
export function Ingreso({ onIngreso, errorInicial }: { onIngreso: () => void; errorInicial?: string }) {
  const [modo, setModo] = useState<"clave" | "codigo">("clave");
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [codigo, setCodigo] = useState("");
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(errorInicial ?? "");
  const [info, setInfo] = useState("");

  const ejecutar = async (fn: () => Promise<void>) => {
    setCargando(true);
    setError("");
    setInfo("");
    try {
      await fn();
    } finally {
      setCargando(false);
    }
  };

  const conClave = (e: React.FormEvent) => {
    e.preventDefault();
    ejecutar(async () => {
      if (modoDemo) {
        if (!demo.existeCuenta()) return setError("En el modo demo primero tenés que hacerte socio (se guarda en este navegador).");
        demo.ingresar();
        return onIngreso();
      }
      const { error } = await supabaseNavegador().auth.signInWithPassword({ email: email.trim().toLowerCase(), password: clave });
      if (error) return setError("Email o contraseña incorrectos. Si no te acordás, entrá con un código por email.");
      onIngreso();
    });
  };

  const pedirCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    ejecutar(async () => {
      if (modoDemo) {
        setCodigoEnviado(true);
        return setInfo("Modo demo: escribí cualquier código de 6 dígitos.");
      }
      const { error } = await supabaseNavegador().auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/auth/confirm?next=/mi-carnet` },
      });
      if (error) {
        return setError(/rate|seconds/i.test(error.message) ? "Esperá unos segundos antes de pedir otro código." : "No encontramos una cuenta de socio con ese email.");
      }
      setCodigoEnviado(true);
      setInfo(`Te mandamos un código de 6 dígitos a ${email}. Revisá también el correo no deseado.`);
    });
  };

  const verificarCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    ejecutar(async () => {
      if (modoDemo) {
        if (!demo.existeCuenta()) return setError("En el modo demo primero tenés que hacerte socio.");
        demo.ingresar();
        return onIngreso();
      }
      const { error } = await supabaseNavegador().auth.verifyOtp({ email: email.trim().toLowerCase(), token: codigo.trim(), type: "email" });
      if (error) return setError("El código no es válido o venció. Pedí uno nuevo.");
      onIngreso();
    });
  };

  return (
    <div className="tarjeta mx-auto w-full max-w-md p-6 sm:p-8">
      <p className="text-center text-5xl" aria-hidden="true">
        🪪
      </p>
      <h1 className="mt-3 text-center font-display text-3xl font-bold text-mar-900">Mi Carnet</h1>
      <p className="mt-1 text-center text-mar-600">Ingresá para ver tu carnet, tus reservas y tus pagos.</p>

      <div role="tablist" aria-label="Forma de ingreso" className="mt-6 grid grid-cols-2 rounded-full bg-mar-50 p-1 ring-1 ring-mar-100">
        {[
          { id: "clave" as const, label: "Contraseña", Icono: KeyRound },
          { id: "codigo" as const, label: "Código por email", Icono: Mail },
        ].map(({ id, label, Icono }) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={modo === id}
            onClick={() => {
              setModo(id);
              setError("");
              setInfo("");
            }}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-sm font-semibold transition ${modo === id ? "bg-white text-mar-900 shadow-suave" : "text-mar-600"}`}
          >
            <Icono className="size-4" aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      {modo === "clave" ? (
        <form onSubmit={conClave} className="mt-6 grid gap-4">
          <Campo etiqueta="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Campo etiqueta="Contraseña" type="password" autoComplete="current-password" required value={clave} onChange={(e) => setClave(e.target.value)} />
          <button type="submit" disabled={cargando} className="btn btn-coral w-full">
            {cargando && <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />} Entrar
          </button>
          <button type="button" onClick={() => setModo("codigo")} className="text-sm font-semibold text-agua-700 underline-offset-4 hover:underline">
            ¿Te olvidaste la contraseña? Entrá con un código
          </button>
        </form>
      ) : !codigoEnviado ? (
        <form onSubmit={pedirCodigo} className="mt-6 grid gap-4">
          <Campo etiqueta="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" disabled={cargando} className="btn btn-coral w-full">
            {cargando && <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />} Mandame el código
          </button>
        </form>
      ) : (
        <form onSubmit={verificarCodigo} className="mt-6 grid gap-4">
          <Campo
            etiqueta="Código de 6 dígitos"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
            className="[&_input]:text-center [&_input]:font-display [&_input]:text-2xl [&_input]:tracking-[0.5em]"
          />
          <button type="submit" disabled={cargando || codigo.length !== 6} className="btn btn-coral w-full">
            {cargando && <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />} Verificar y entrar
          </button>
          <button type="button" onClick={() => setCodigoEnviado(false)} className="text-sm font-semibold text-agua-700 underline-offset-4 hover:underline">
            Pedir otro código
          </button>
        </form>
      )}

      {info && (
        <Aviso tipo="ok" className="mt-4">
          {info}
        </Aviso>
      )}
      {error && (
        <Aviso tipo="error" className="mt-4">
          {error}
        </Aviso>
      )}

      <p className="mt-6 border-t border-mar-100 pt-5 text-center text-sm text-mar-600">
        ¿Todavía no sos socio?{" "}
        <Link href="/hacete-socio" className="font-semibold text-coral-600 underline underline-offset-4">
          Hacete socio
        </Link>
      </p>
    </div>
  );
}
