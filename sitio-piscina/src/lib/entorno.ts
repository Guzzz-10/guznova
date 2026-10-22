/**
 * Detecta qué servicios están configurados.
 * Sin Supabase el sitio funciona en "modo demo": muestra el contenido de ejemplo,
 * el alta y el carnet se guardan solo en el navegador y el panel usa datos ficticios.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseConfigurado = Boolean(supabaseUrl && supabaseAnonKey);
export const modoDemo = !supabaseConfigurado;

/** Minutos sin actividad antes de cerrar la sesión del panel. */
export const MINUTOS_INACTIVIDAD_ADMIN = Number(process.env.NEXT_PUBLIC_ADMIN_INACTIVIDAD_MIN || 30);
