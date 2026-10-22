"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { modoDemo } from "@/lib/entorno";
import { supabaseNavegador } from "@/lib/supabase/cliente";
import { estadoSocio, type EstadoSocio } from "@/lib/socio/tipos";
import { Burbujas } from "@/components/ui/Burbujas";

/** Pantalla de vuelta de Mercado Pago: espera la confirmación y muestra el carnet listo. */
export function ResultadoPago() {
  const params = useSearchParams();
  const fallo = params.get("estado") === "error" || params.get("status") === "rejected" || params.get("collection_status") === "rejected";
  const [estado, setEstado] = useState<EstadoSocio | "esperando" | "demorado">(modoDemo || params.get("simulado") ? "activo" : "esperando");

  useEffect(() => {
    if (modoDemo || fallo || params.get("simulado")) return;
    let vivo = true;
    let intentos = 0;
    const supabase = supabaseNavegador();

    const consultar = async () => {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) return;
      const { data } = await supabase.from("socios").select("vence_el, suspendido").eq("id", s.session.user.id).maybeSingle();
      if (!vivo || !data) return;
      const e = estadoSocio(data);
      if (e === "activo") setEstado("activo");
      else if (++intentos >= 20) setEstado("demorado");
      else setTimeout(consultar, 3000);
    };

    fetch("/api/pagos/sincronizar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preapproval_id: params.get("preapproval_id"), payment_id: params.get("payment_id") ?? params.get("collection_id") }),
    })
      .catch(() => null)
      .finally(consultar);

    return () => {
      vivo = false;
    };
  }, [params, fallo]);

  if (fallo) {
    return (
      <div className="tarjeta mx-auto max-w-lg p-8 text-center">
        <p className="text-6xl" aria-hidden="true">
          😕
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold text-mar-900">El pago no se completó</h1>
        <p className="mt-2 text-mar-700">No te preocupes: tu cuenta ya está creada. Podés intentar de nuevo desde Mi Carnet con otra tarjeta o medio de pago.</p>
        <Link href="/mi-carnet" className="btn btn-coral mt-6">
          Reintentar el pago
        </Link>
      </div>
    );
  }

  if (estado === "activo") {
    return (
      <div className="relative mx-auto max-w-lg overflow-hidden rounded-5xl bg-gradient-to-br from-agua-500 via-agua-600 to-mar-700 p-8 text-center text-white shadow-flotante sm:p-12">
        <Burbujas cantidad={9} />
        <p className="relative animate-bounce text-7xl" aria-hidden="true">
          🎉
        </p>
        <h1 className="relative mt-4 font-display text-4xl font-bold">¡Bienvenido/a a la familia!</h1>
        <p className="relative mt-3 text-lg text-agua-50">Tu pago se confirmó y tu carnet digital ya está listo para usar en la entrada.</p>
        <Link href="/mi-carnet" className="btn btn-sol relative mt-8 text-xl">
          Ver mi carnet 🪪
        </Link>
      </div>
    );
  }

  return (
    <div className="tarjeta mx-auto max-w-lg p-8 text-center" aria-live="polite">
      {estado === "demorado" ? (
        <>
          <p className="text-6xl" aria-hidden="true">
            ⏳
          </p>
          <h1 className="mt-4 font-display text-3xl font-bold text-mar-900">Estamos esperando a Mercado Pago</h1>
          <p className="mt-2 text-mar-700">
            Algunos pagos (por ejemplo en efectivo) tardan un poco en acreditarse. Apenas se confirme, tu carnet aparece en Mi Carnet. ¡No tenés que hacer nada más!
          </p>
          <Link href="/mi-carnet" className="btn btn-agua mt-6">
            Ir a Mi Carnet
          </Link>
        </>
      ) : (
        <>
          <LoaderCircle className="mx-auto size-14 animate-spin text-agua-600" aria-hidden="true" />
          <h1 className="mt-4 font-display text-3xl font-bold text-mar-900">Confirmando tu pago…</h1>
          <p className="mt-2 text-mar-700">Esto tarda unos segundos. Estamos generando tu carnet digital.</p>
        </>
      )}
    </div>
  );
}
