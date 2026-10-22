import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServidor } from "@/lib/supabase/servidor";

/** Enlace del email de acceso de los socios (alternativa a escribir el código). */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const token_hash = url.searchParams.get("token_hash");
  const type = (url.searchParams.get("type") || "email") as EmailOtpType;
  const siguiente = url.searchParams.get("next") || "/mi-carnet";
  const seguro = siguiente.startsWith("/") && !siguiente.startsWith("//") ? siguiente : "/mi-carnet";

  if (token_hash) {
    const supabase = await supabaseServidor();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) return NextResponse.redirect(new URL(seguro, url.origin));
  }
  return NextResponse.redirect(new URL("/mi-carnet?error=enlace", url.origin));
}
