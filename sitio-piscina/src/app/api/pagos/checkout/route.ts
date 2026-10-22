import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { supabaseServidor, supabaseServicio } from "@/lib/supabase/servidor";
import { obtenerContenido, obtenerPlanActivo } from "@/lib/contenido/obtener";
import { cancelarSuscripcion, credencialesMP, crearPagoUnico, crearSuscripcion, pagosSimulados } from "@/lib/pagos/mercadopago";

/** Inicia el pago del socio logueado: suscripción mensual o pago único. Devuelve la URL de Mercado Pago. */
export async function POST(request: NextRequest) {
  const cuerpo = await request.json().catch(() => ({}));
  const modo = cuerpo.modo === "unico" ? "unico" : "suscripcion";

  const { data } = await (await supabaseServidor()).auth.getClaims();
  if (!data?.claims) return NextResponse.json({ error: "Ingresá a tu cuenta para pagar." }, { status: 401 });

  const db = supabaseServicio();
  const { data: socio } = await db.from("socios").select("*").eq("id", data.claims.sub).maybeSingle();
  if (!socio) return NextResponse.json({ error: "No encontramos tu ficha de socio." }, { status: 404 });
  if (socio.suspendido) return NextResponse.json({ error: "Tu cuenta está suspendida. Escribinos por WhatsApp." }, { status: 403 });

  const plan = await obtenerPlanActivo(String(cuerpo.planId ?? socio.plan_id));
  if (!plan) return NextResponse.json({ error: "El plan elegido no está disponible." }, { status: 400 });

  const { accessToken } = await credencialesMP();
  if (!accessToken) {
    if (!pagosSimulados()) return NextResponse.json({ error: "Los pagos online todavía no están configurados. Escribinos por WhatsApp." }, { status: 503 });
    const { error } = await db.rpc("registrar_pago", {
      p_socio: socio.id,
      p_plan: plan.id,
      p_monto: plan.precio,
      p_metodo: "mercadopago",
      p_estado: "aprobado",
      p_mp_payment_id: `simulado-${randomUUID()}`,
      p_detalle: "Pago simulado (PAGOS_SIMULADOS=true)",
    });
    if (error) return NextResponse.json({ error: "No se pudo simular el pago." }, { status: 500 });
    return NextResponse.json({ url: "/hacete-socio/listo?simulado=1" });
  }

  const { negocio } = await obtenerContenido();
  try {
    if (modo === "suscripcion") {
      if (socio.renovacion_automatica && socio.mp_preapproval_id) {
        if (socio.plan_id === plan.id) return NextResponse.json({ error: "Ya tenés la renovación automática activa con este plan." }, { status: 409 });
        await cancelarSuscripcion(accessToken, socio.mp_preapproval_id).catch(() => null);
        await db.from("socios").update({ renovacion_automatica: false }).eq("id", socio.id);
      }
      const pre = await crearSuscripcion(accessToken, socio, plan, negocio.nombre);
      await db.from("socios").update({ mp_preapproval_id: pre.id }).eq("id", socio.id);
      return NextResponse.json({ url: pre.init_point });
    }
    const pref = await crearPagoUnico(accessToken, socio, plan, negocio.nombre);
    return NextResponse.json({ url: pref.init_point });
  } catch (e) {
    console.error("Error creando el pago en Mercado Pago:", e);
    return NextResponse.json({ error: "Mercado Pago no respondió. Probá de nuevo en un ratito." }, { status: 502 });
  }
}
