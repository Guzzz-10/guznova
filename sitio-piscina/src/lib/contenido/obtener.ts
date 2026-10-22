import "server-only";
import { cache } from "react";
import { supabaseConfigurado } from "@/lib/entorno";
import { supabasePublico } from "@/lib/supabase/servidor";
import { contactoPorDefecto, heroPorDefecto, negocioPorDefecto, whatsappPorDefecto } from "@/content/negocio";
import { historiaPorDefecto, hitosPorDefecto } from "@/content/historia";
import { galeriaPorDefecto, piscinasPorDefecto } from "@/content/piscinas";
import { planesPorDefecto } from "@/content/planes";
import { clasesPorDefecto, ocupacionDemo } from "@/content/clases";
import { proximaFecha } from "@/lib/dias";
import { filaAClase, filaAFoto, filaAHito, filaAPiscina, filaAPlan } from "./mapeo";
import type { Contenido, Disponibilidad } from "./tipos";

export const contenidoPorDefecto: Contenido = {
  negocio: negocioPorDefecto,
  hero: heroPorDefecto,
  historia: historiaPorDefecto,
  contacto: contactoPorDefecto,
  whatsapp: whatsappPorDefecto,
  planes: planesPorDefecto,
  piscinas: piscinasPorDefecto,
  galeria: galeriaPorDefecto,
  hitos: hitosPorDefecto,
  clases: clasesPorDefecto,
  usaEjemplo: true,
  origen: { planes: "ejemplo", piscinas: "ejemplo", galeria: "ejemplo", hitos: "ejemplo", clases: "ejemplo" },
};

const ordenar = <T extends { orden: number }>(xs: T[]) => [...xs].sort((a, b) => a.orden - b.orden);

/**
 * Lee todo el contenido editable desde Supabase. Si una tabla está vacía
 * (o la base no está configurada), usa los valores de ejemplo de src/content.
 */
export const obtenerContenido = cache(async (): Promise<Contenido> => {
  if (!supabaseConfigurado) return contenidoPorDefecto;
  try {
    const db = supabasePublico();
    const [bloques, planes, piscinas, galeria, hitos, clases] = await Promise.all([
      db.from("contenido").select("clave, valor"),
      db.from("planes").select("*").order("orden"),
      db.from("piscinas").select("*").order("orden"),
      db.from("galeria").select("*").order("orden"),
      db.from("hitos").select("*").order("orden"),
      db.from("clases").select("*, horarios(*)").order("orden"),
    ]);
    const err = [bloques, planes, piscinas, galeria, hitos, clases].find((r) => r.error)?.error;
    if (err) throw err;

    const valor = (clave: string) => bloques.data?.find((b) => b.clave === clave)?.valor ?? {};
    const negocio = { ...negocioPorDefecto, ...valor("negocio") };
    const listas = {
      planes: planes.data?.length ? planes.data.map(filaAPlan) : null,
      piscinas: piscinas.data?.length ? piscinas.data.map(filaAPiscina) : null,
      galeria: galeria.data?.length ? galeria.data.map(filaAFoto) : null,
      hitos: hitos.data?.length ? hitos.data.map(filaAHito) : null,
      clases: clases.data?.length ? clases.data.map(filaAClase) : null,
    };

    return {
      negocio: { ...negocio, redes: { ...negocioPorDefecto.redes, ...negocio.redes }, mapa: { ...negocioPorDefecto.mapa, ...negocio.mapa } },
      hero: { ...heroPorDefecto, ...valor("hero") },
      historia: { ...historiaPorDefecto, ...valor("historia") },
      contacto: { ...contactoPorDefecto, ...valor("contacto") },
      whatsapp: { ...whatsappPorDefecto, ...valor("whatsapp") },
      planes: ordenar(listas.planes ?? planesPorDefecto),
      piscinas: ordenar(listas.piscinas ?? piscinasPorDefecto),
      galeria: ordenar(listas.galeria ?? galeriaPorDefecto),
      hitos: ordenar(listas.hitos ?? hitosPorDefecto),
      clases: ordenar(listas.clases ?? clasesPorDefecto),
      usaEjemplo: Object.values(listas).some((l) => l === null) || !bloques.data?.length,
      origen: {
        planes: listas.planes ? "db" : "ejemplo",
        piscinas: listas.piscinas ? "db" : "ejemplo",
        galeria: listas.galeria ? "db" : "ejemplo",
        hitos: listas.hitos ? "db" : "ejemplo",
        clases: listas.clases ? "db" : "ejemplo",
      },
    };
  } catch (e) {
    console.error("No se pudo leer el contenido desde Supabase, se usan los valores de ejemplo:", e);
    return contenidoPorDefecto;
  }
});

/** Planes que se pueden contratar (fuente de verdad del precio para Mercado Pago). */
export async function obtenerPlanActivo(id: string) {
  const { planes } = await obtenerContenido();
  return planes.find((p) => p.id === id && p.activo) ?? null;
}

/** Ocupación de la próxima fecha de cada horario (para mostrar los cupos). */
export async function obtenerDisponibilidad(clases: Contenido["clases"]): Promise<Disponibilidad> {
  const base: Disponibilidad = {};
  for (const c of clases) for (const h of c.horarios) base[h.id] = { fecha: proximaFecha(h.dia, h.hora), ocupados: ocupacionDemo[h.id] ?? 0 };
  if (!supabaseConfigurado) return base;
  try {
    const { data, error } = await supabasePublico().rpc("disponibilidad");
    if (error) throw error;
    const real: Disponibilidad = {};
    for (const f of (data ?? []) as { horario_id: string; fecha: string; ocupados: number }[]) real[f.horario_id] = { fecha: f.fecha, ocupados: f.ocupados };
    return real;
  } catch {
    return base;
  }
}
