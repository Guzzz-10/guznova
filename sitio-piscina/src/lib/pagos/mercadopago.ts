import "server-only";
import { randomUUID } from "node:crypto";
import { supabaseConfigurado } from "@/lib/entorno";
import { supabaseServicio } from "@/lib/supabase/servidor";
import { urlSitio } from "@/config/sitio";
import type { Plan } from "@/lib/contenido/tipos";
import { crearReferencia, estadoLocal, leerReferencia } from "./firma";

const API = "https://api.mercadopago.com";

/** Token y secreto: primero las variables de entorno, si no lo cargado desde el panel. */
export async function credencialesMP() {
  let accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || "";
  let webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET || "";
  let origen: "entorno" | "panel" | null = accessToken ? "entorno" : null;
  if ((!accessToken || !webhookSecret) && supabaseConfigurado && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { data } = await supabaseServicio().from("secretos").select("clave, valor").in("clave", ["mp_access_token", "mp_webhook_secret"]);
    const leer = (k: string) => data?.find((d) => d.clave === k)?.valor ?? "";
    if (!accessToken && leer("mp_access_token")) {
      accessToken = leer("mp_access_token");
      origen = "panel";
    }
    webhookSecret ||= leer("mp_webhook_secret");
  }
  return { accessToken, webhookSecret, origen };
}

export const pagosSimulados = () => process.env.PAGOS_SIMULADOS === "true";

async function mp<T>(ruta: string, init: RequestInit & { token: string }): Promise<T> {
  const { token, ...resto } = init;
  const r = await fetch(`${API}${ruta}`, {
    ...resto,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(resto.method && resto.method !== "GET" ? { "X-Idempotency-Key": randomUUID() } : {}),
      ...resto.headers,
    },
    cache: "no-store",
  });
  const cuerpo = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Mercado Pago ${r.status}: ${JSON.stringify(cuerpo).slice(0, 300)}`);
  return cuerpo as T;
}

type Socio = { id: string; email: string; nombre_completo: string };

/** Suscripción con débito automático mensual (Mercado Pago "preapproval"). */
export async function crearSuscripcion(token: string, socio: Socio, plan: Plan, nombreNegocio: string) {
  return mp<{ id: string; init_point: string }>("/preapproval", {
    token,
    method: "POST",
    body: JSON.stringify({
      reason: `${nombreNegocio} · ${plan.nombre} (mensual)`,
      external_reference: crearReferencia(socio.id, plan.id),
      payer_email: socio.email,
      auto_recurring: { frequency: 1, frequency_type: "months", transaction_amount: plan.precio, currency_id: "UYU" },
      back_url: `${urlSitio}/hacete-socio/listo`,
      status: "pending",
    }),
  });
}

/** Pago único de un mes (Checkout Pro): tarjeta, débito, saldo o efectivo en redes de cobranza. */
export async function crearPagoUnico(token: string, socio: Socio, plan: Plan, nombreNegocio: string) {
  return mp<{ id: string; init_point: string }>("/checkout/preferences", {
    token,
    method: "POST",
    body: JSON.stringify({
      items: [{ id: plan.id, title: `${nombreNegocio} · ${plan.nombre} (1 mes)`, quantity: 1, unit_price: plan.precio, currency_id: "UYU" }],
      payer: { email: socio.email, name: socio.nombre_completo },
      external_reference: crearReferencia(socio.id, plan.id),
      metadata: { socio_id: socio.id, plan_id: plan.id },
      back_urls: {
        success: `${urlSitio}/hacete-socio/listo`,
        pending: `${urlSitio}/hacete-socio/listo`,
        failure: `${urlSitio}/hacete-socio/listo?estado=error`,
      },
      auto_return: "approved",
      notification_url: `${urlSitio}/api/mercadopago/webhook?source_news=webhooks`,
      statement_descriptor: nombreNegocio.slice(0, 13).toUpperCase(),
    }),
  });
}

export async function cancelarSuscripcion(token: string, preapprovalId: string) {
  return mp(`/preapproval/${preapprovalId}`, { token, method: "PUT", body: JSON.stringify({ status: "cancelled" }) });
}

/* ───────── Procesamiento de notificaciones ───────── */

type PagoMP = {
  id: number;
  status: string;
  transaction_amount: number;
  currency_id: string;
  external_reference?: string | null;
  metadata?: { preapproval_id?: string; socio_id?: string; plan_id?: string } | null;
  point_of_interaction?: { transaction_data?: { subscription_id?: string } } | null;
  description?: string;
};

type PreapprovalMP = { id: string; status: string; external_reference?: string; auto_recurring?: { transaction_amount?: number } };

async function socioPorPreapproval(preapprovalId: string) {
  const { data } = await supabaseServicio().from("socios").select("id, plan_id").eq("mp_preapproval_id", preapprovalId).maybeSingle();
  return data;
}

/** Registra (o actualiza) un pago de Mercado Pago y, si está aprobado, activa/extiende al socio. */
export async function procesarPago(token: string, pagoId: string, preapprovalIdConocido?: string) {
  const pago = await mp<PagoMP>(`/v1/payments/${pagoId}`, { token });
  const preapprovalId = preapprovalIdConocido || pago.metadata?.preapproval_id || pago.point_of_interaction?.transaction_data?.subscription_id || null;

  let ref = leerReferencia(pago.external_reference);
  if (!ref && preapprovalId) {
    const s = await socioPorPreapproval(preapprovalId);
    if (s) ref = { socioId: s.id, planId: s.plan_id };
  }
  if (!ref) return { ok: false as const, motivo: "Pago sin socio asociado (se ignora)" };
  if (pago.currency_id !== "UYU") return { ok: false as const, motivo: `Moneda inesperada: ${pago.currency_id}` };

  const { error } = await supabaseServicio().rpc("registrar_pago", {
    p_socio: ref.socioId,
    p_plan: ref.planId ?? "basico",
    p_monto: pago.transaction_amount,
    p_metodo: "mercadopago",
    p_estado: estadoLocal(pago.status),
    p_mp_payment_id: String(pago.id),
    p_mp_preapproval_id: preapprovalId,
    p_detalle: preapprovalId ? "Débito automático mensual" : "Pago único con Mercado Pago",
  });
  if (error) throw error;
  return { ok: true as const, socioId: ref.socioId, estado: estadoLocal(pago.status) };
}

/** Cobro mensual de una suscripción. */
export async function procesarPagoAutorizado(token: string, id: string) {
  const ap = await mp<{ preapproval_id: string; payment?: { id: number } }>(`/authorized_payments/${id}`, { token });
  if (!ap.payment?.id) return { ok: false as const, motivo: "Cobro todavía sin pago" };
  return procesarPago(token, String(ap.payment.id), ap.preapproval_id);
}

/** Cambios en la suscripción (autorizada, pausada, cancelada). */
export async function procesarSuscripcion(token: string, id: string) {
  const pre = await mp<PreapprovalMP>(`/preapproval/${id}`, { token });
  const ref = leerReferencia(pre.external_reference);
  if (!ref) return { ok: false as const, motivo: "Suscripción sin socio asociado" };
  const activa = pre.status === "authorized";
  const cambios: Record<string, unknown> = { renovacion_automatica: activa };
  if (activa) cambios.mp_preapproval_id = pre.id;
  const db = supabaseServicio().from("socios").update(cambios).eq("id", ref.socioId);
  // Si se cancela una suscripción vieja, no tocamos la nueva.
  const { error } = activa ? await db : await db.eq("mp_preapproval_id", pre.id);
  if (error) throw error;
  return { ok: true as const, socioId: ref.socioId, estado: pre.status };
}

/** Busca pagos por referencia (para sincronizar a la vuelta del checkout si el webhook todavía no llegó). */
export async function buscarPagosPorReferencia(token: string, socioId: string, planId: string) {
  const r = await mp<{ results: PagoMP[] }>(
    `/v1/payments/search?sort=date_created&criteria=desc&limit=5&external_reference=${encodeURIComponent(crearReferencia(socioId, planId))}`,
    { token },
  ).catch(() => ({ results: [] as PagoMP[] }));
  return r.results;
}

/** Verifica el token consultando la cuenta (para el panel → Configuración). */
export async function probarConexion(token: string) {
  return mp<{ id: number; nickname: string; email?: string; site_id: string }>("/users/me", { token });
}
