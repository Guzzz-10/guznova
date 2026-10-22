import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { actualizarSesion } from "@/lib/supabase/proxy";
import { supabaseConfigurado } from "@/lib/entorno";

export async function proxy(request: NextRequest) {
  if (!supabaseConfigurado) return NextResponse.next();
  return actualizarSesion(request);
}

export const config = {
  // Solo donde hay sesión: panel, área de socio, alta, validación de QR y la API.
  matcher: ["/admin/:path*", "/mi-carnet/:path*", "/hacete-socio/:path*", "/v/:path*", "/auth/:path*", "/api/:path*"],
};
