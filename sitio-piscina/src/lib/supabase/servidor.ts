import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/entorno";

/** Cliente con la sesión del usuario (server components, server actions y route handlers). */
export async function supabaseServidor() {
  const almacen = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => almacen.set(name, value, options));
        } catch {
          // Llamado desde un Server Component: el proxy se encarga de refrescar la sesión.
        }
      },
    },
  });
}

/** Cliente anónimo sin sesión: para leer el contenido público (permite cachear las páginas). */
export function supabasePublico() {
  return createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

/**
 * Cliente con la service role key: saltea RLS. Usar SOLO en el servidor y después
 * de validar permisos (webhook de Mercado Pago, alta de socios, acciones del admin).
 */
export function supabaseServicio() {
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!clave) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY");
  return createClient(supabaseUrl, clave, { auth: { persistSession: false, autoRefreshToken: false } });
}
