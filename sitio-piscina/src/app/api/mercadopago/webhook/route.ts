import { NextResponse, type NextRequest } from "next/server";
import { credencialesMP, procesarPago, procesarPagoAutorizado, procesarSuscripcion } from "@/lib/pagos/mercadopago";
import { verificarFirmaMP } from "@/lib/pagos/firma";

/**
 * Webhook de Mercado Pago. Configuralo en Tus integraciones → Webhooks con los eventos
 * "Pagos" y "Planes y suscripciones" apuntando a https://TU-DOMINIO/api/mercadopago/webhook
 * Siempre se vuelve a consultar el recurso a la API de Mercado Pago (nunca se confía en el cuerpo).
 */
export async function POST(request: NextRequest) {
  const url = request.nextUrl;
  const cuerpo = await request.json().catch(() => ({}) as Record<string, unknown>);
  const tipo = String(cuerpo.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic") ?? "");
  const dataIdQuery = url.searchParams.get("data.id");
  const id = String((cuerpo.data as { id?: string | number } | undefined)?.id ?? dataIdQuery ?? url.searchParams.get("id") ?? "");

  const { accessToken, webhookSecret } = await credencialesMP();
  if (!accessToken || !id) return NextResponse.json({ ok: true, ignorado: true });

  if (webhookSecret) {
    const valida = verificarFirmaMP({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId: dataIdQuery ?? id,
      secreto: webhookSecret,
    });
    if (!valida) return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  try {
    let resultado: unknown = { ignorado: true };
    if (tipo === "payment") resultado = await procesarPago(accessToken, id);
    else if (tipo === "subscription_authorized_payment") resultado = await procesarPagoAutorizado(accessToken, id);
    else if (tipo === "subscription_preapproval") resultado = await procesarSuscripcion(accessToken, id);
    return NextResponse.json({ ok: true, resultado });
  } catch (e) {
    console.error(`Error procesando webhook ${tipo} ${id}:`, e);
    // 500 para que Mercado Pago reintente más tarde
    return NextResponse.json({ error: "Error procesando la notificación" }, { status: 500 });
  }
}
