import { NextResponse, type NextRequest } from "next/server";
import { supabaseServidor, supabaseServicio } from "@/lib/supabase/servidor";
import { buscarPagosPorReferencia, credencialesMP, procesarPago, procesarSuscripcion } from "@/lib/pagos/mercadopago";
import { estadoSocio } from "@/lib/socio/tipos";

/**
 * A la vuelta de Mercado Pago: consulta el estado real del pago por si el webhook
 * todavía no llegó (o en desarrollo, donde Mercado Pago no puede llamar a localhost).
 */
export async function POST(request: NextRequest) {
  const cuerpo = await request.json().catch(() => ({}));
  const { data } = await (await supabaseServidor()).auth.getClaims();
  if (!data?.claims) return NextResponse.json({ error: "Sin sesión" }, { status: 401 });

  const db = supabaseServicio();
  const leerSocio = () => db.from("socios").select("*").eq("id", data.claims.sub).maybeSingle();
  const { data: socio } = await leerSocio();
  if (!socio) return NextResponse.json({ error: "Sin ficha" }, { status: 404 });

  const { accessToken } = await credencialesMP();
  if (accessToken) {
    try {
      if (cuerpo.preapproval_id && cuerpo.preapproval_id === socio.mp_preapproval_id) await procesarSuscripcion(accessToken, cuerpo.preapproval_id);
      if (cuerpo.payment_id && /^\d+$/.test(String(cuerpo.payment_id))) await procesarPago(accessToken, String(cuerpo.payment_id));
      for (const p of await buscarPagosPorReferencia(accessToken, socio.id, socio.plan_id)) await procesarPago(accessToken, String(p.id));
    } catch (e) {
      console.error("No se pudo sincronizar con Mercado Pago:", e);
    }
  }

  const { data: actualizado } = await leerSocio();
  return NextResponse.json({ estado: actualizado ? estadoSocio(actualizado) : "pendiente" });
}
