import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { MINUTOS_INACTIVIDAD_ADMIN, supabaseAnonKey, supabaseUrl } from "@/lib/entorno";

export const COOKIE_ACTIVIDAD_ADMIN = "admin_ultima_actividad";

/**
 * Refresca la sesión de Supabase en cada request y, en el panel,
 * cierra la sesión si pasó demasiado tiempo sin actividad.
 */
export async function actualizarSesion(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista) => {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        respuesta = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options));
      },
    },
  });

  // Importante: getClaims() valida el JWT y refresca la sesión si hace falta.
  const { data } = await supabase.auth.getClaims();
  const ruta = request.nextUrl.pathname;
  const esPanel = ruta.startsWith("/admin") && !ruta.startsWith("/admin/ingresar");

  if (esPanel && data?.claims) {
    const ultima = Number(request.cookies.get(COOKIE_ACTIVIDAD_ADMIN)?.value || 0);
    const vencida = ultima > 0 && Date.now() - ultima > MINUTOS_INACTIVIDAD_ADMIN * 60_000;
    if (vencida) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/admin/ingresar";
      url.search = "?motivo=inactividad";
      const redireccion = NextResponse.redirect(url);
      respuesta.cookies.getAll().forEach((c) => redireccion.cookies.set(c));
      redireccion.cookies.delete(COOKIE_ACTIVIDAD_ADMIN);
      return redireccion;
    }
    respuesta.cookies.set(COOKIE_ACTIVIDAD_ADMIN, String(Date.now()), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  return respuesta;
}
