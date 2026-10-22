import { NextResponse } from "next/server";
import { supabaseServidor, supabaseServicio } from "@/lib/supabase/servidor";
import { cancelarSuscripcion, credencialesMP } from "@/lib/pagos/mercadopago";

/** El socio cancela su renovación automática (sigue activo hasta la fecha de vencimiento). */
export async function POST() {
  const { data } = await (await supabaseServidor()).auth.getClaims();
  if (!data?.claims) return NextResponse.json({ error: "Sin sesión" }, { status: 401 });

  const db = supabaseServicio();
  const { data: socio } = await db.from("socios").select("id, mp_preapproval_id").eq("id", data.claims.sub).maybeSingle();
  if (!socio?.mp_preapproval_id) return NextResponse.json({ error: "No tenés una renovación automática activa." }, { status: 400 });

  const { accessToken } = await credencialesMP();
  if (accessToken) {
    try {
      await cancelarSuscripcion(accessToken, socio.mp_preapproval_id);
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: "Mercado Pago no respondió. Probá de nuevo." }, { status: 502 });
    }
  }
  await db.from("socios").update({ renovacion_automatica: false }).eq("id", socio.id);
  return NextResponse.json({ ok: true });
}
