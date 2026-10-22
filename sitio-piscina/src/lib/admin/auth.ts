import "server-only";
import { redirect } from "next/navigation";
import type { JwtPayload } from "@supabase/supabase-js";
import { modoDemo } from "@/lib/entorno";
import { supabaseServidor } from "@/lib/supabase/servidor";

/** Único email autorizado para entrar al panel (variable de entorno ADMIN_EMAIL). */
export const emailAdmin = () => (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

/** La sesión es de admin si el email coincide y se inició con Google (OAuth). */
export function esClaimAdmin(claims: Pick<JwtPayload, "email" | "amr"> | null | undefined) {
  const autorizado = emailAdmin();
  if (!claims || !autorizado) return false;
  const email = String(claims.email || "").toLowerCase();
  const metodos = (claims.amr ?? []).map((m) => (typeof m === "string" ? m : m.method));
  return email === autorizado && metodos.includes("oauth");
}

export type SesionAdmin = { demo: true; email: string } | { demo: false; email: string };

/** Para páginas del panel: si no es el admin, redirige al login. */
export async function requerirAdmin(): Promise<SesionAdmin> {
  if (modoDemo) return { demo: true, email: "demo@panel" };
  const supabase = await supabaseServidor();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/admin/ingresar");
  if (!esClaimAdmin(data.claims)) redirect("/admin/ingresar?error=no-autorizado");
  return { demo: false, email: String(data.claims.email) };
}

/** Para server actions: devuelve el cliente con la sesión del admin o un error (no redirige). */
export async function adminParaAccion() {
  if (modoDemo) return { error: "Modo demo: los cambios no se guardan. Configurá Supabase para usar el panel de verdad." } as const;
  const supabase = await supabaseServidor();
  const { data } = await supabase.auth.getClaims();
  if (!esClaimAdmin(data?.claims)) return { error: "Acceso no autorizado." } as const;
  return { supabase, email: String(data!.claims.email) } as const;
}
