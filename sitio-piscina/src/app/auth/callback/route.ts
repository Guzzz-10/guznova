import { NextResponse, type NextRequest } from "next/server";
import { supabaseServidor, supabaseServicio } from "@/lib/supabase/servidor";
import { emailAdmin, esClaimAdmin } from "@/lib/admin/auth";

/** Vuelta del login con Google (panel de administración). */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const codigo = url.searchParams.get("code");
  const destino = (ruta: string) => NextResponse.redirect(new URL(ruta, url.origin));
  if (!codigo) return destino("/admin/ingresar?error=sin-codigo");

  const supabase = await supabaseServidor();
  const { error } = await supabase.auth.exchangeCodeForSession(codigo);
  if (error) return destino("/admin/ingresar?error=sesion");

  const { data } = await supabase.auth.getClaims();
  if (!esClaimAdmin(data?.claims)) {
    // Cualquier otra cuenta de Google: se cierra la sesión y se rechaza.
    const id = data?.claims?.sub;
    await supabase.auth.signOut();
    if (id) {
      // Si esa cuenta se acaba de crear al entrar con Google (no es socio), se borra.
      const servicio = supabaseServicio();
      const { data: socio } = await servicio.from("socios").select("id").eq("id", id).maybeSingle();
      if (!socio) await servicio.auth.admin.deleteUser(id);
    }
    return destino("/admin/ingresar?error=no-autorizado");
  }

  // Sincroniza el email autorizado con la tabla que usan las reglas de seguridad (RLS).
  const admin = supabaseServicio();
  await admin.from("admin_autorizado").delete().neq("email", emailAdmin());
  await admin.from("admin_autorizado").upsert({ email: emailAdmin() });
  await admin.from("actividad").insert({ email: emailAdmin(), accion: "Inicio de sesión", detalle: "Ingresó al panel con Google" });

  return destino("/admin");
}
