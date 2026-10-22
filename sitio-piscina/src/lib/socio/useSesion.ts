"use client";

import { useCallback, useEffect, useState } from "react";
import { modoDemo } from "@/lib/entorno";
import { supabaseNavegador } from "@/lib/supabase/cliente";
import { demo, EVENTO_DEMO } from "@/lib/demo/almacen";
import { estadoSocio, type EstadoSocio, type Socio } from "./tipos";

export type SesionSocio =
  | { estado: "cargando" }
  | { estado: "anonimo" }
  | { estado: "sin-ficha"; email: string }
  | { estado: "error" }
  | { estado: "socio"; socio: Socio; estadoSocio: EstadoSocio };

/** Sesión del socio en el navegador (Supabase o modo demo). */
export function useSesionSocio() {
  const [sesion, setSesion] = useState<SesionSocio>({ estado: "cargando" });

  const cargar = useCallback(async () => {
    if (modoDemo) {
      const s = demo.socio();
      setSesion(s ? { estado: "socio", socio: s, estadoSocio: estadoSocio(s) } : { estado: "anonimo" });
      return;
    }
    const supabase = supabaseNavegador();
    const { data } = await supabase.auth.getSession();
    const usuario = data.session?.user;
    if (!usuario) return setSesion({ estado: "anonimo" });
    const { data: socio, error } = await supabase.from("socios").select("*").eq("id", usuario.id).maybeSingle();
    if (error) return setSesion({ estado: "error" });
    if (!socio) return setSesion({ estado: "sin-ficha", email: usuario.email ?? "" });
    setSesion({ estado: "socio", socio: socio as Socio, estadoSocio: estadoSocio(socio as Socio) });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial desde una fuente externa
    cargar();
    if (modoDemo) {
      window.addEventListener(EVENTO_DEMO, cargar);
      return () => window.removeEventListener(EVENTO_DEMO, cargar);
    }
    const { data } = supabaseNavegador().auth.onAuthStateChange((evento) => {
      if (evento === "SIGNED_IN" || evento === "SIGNED_OUT" || evento === "USER_UPDATED") cargar();
    });
    return () => data.subscription.unsubscribe();
  }, [cargar]);

  return { sesion, recargar: cargar };
}
