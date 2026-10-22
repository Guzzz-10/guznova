"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/entorno";

let cliente: SupabaseClient | null = null;

/** Cliente de Supabase para el navegador (usa la sesión guardada en cookies). */
export function supabaseNavegador() {
  if (!cliente) cliente = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return cliente;
}
