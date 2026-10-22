import "server-only";
import { modoDemo } from "@/lib/entorno";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { obtenerContenido } from "@/lib/contenido/obtener";
import { ahoraMontevideo } from "@/lib/dias";
import type { Acceso, Pago, ReservaDetallada } from "@/lib/socio/tipos";
import { demoAccesos, demoActividad, demoEstadisticas, demoInscriptos, demoPagos, demoReservas, demoSocios } from "@/lib/demo/panel";
import type { Actividad, Estadisticas, FichaSocio, Inscripto, SocioFila } from "./tipos";

/* Consultas del panel. Corren en el servidor con la sesión del admin: las reglas RLS de la base
   vuelven a verificar que sea el email autorizado. En modo demo devuelven datos ficticios. */

export const POR_PAGINA = 25;

export async function estadisticas(): Promise<Estadisticas> {
  if (modoDemo) {
    const { planes, clases } = await obtenerContenido();
    return demoEstadisticas(planes, clases);
  }
  const { data, error } = await (await supabaseServidor()).rpc("estadisticas_admin");
  if (error) throw error;
  return data as Estadisticas;
}

export type FiltrosSocios = { q?: string; estado?: string; plan?: string; pagina?: number };

const limpiarBusqueda = (q: string) => q.replace(/[,()*%\\]/g, " ").trim();

export async function listarSocios(f: FiltrosSocios, todos = false): Promise<{ filas: SocioFila[]; total: number }> {
  const q = limpiarBusqueda(f.q ?? "");
  const digitos = q.replace(/\D/g, "");
  if (modoDemo) {
    let filas = demoSocios();
    if (q) {
      const t = q.toLowerCase();
      filas = filas.filter(
        (s) => s.nombre_completo.toLowerCase().includes(t) || (digitos && (s.cedula.includes(digitos) || String(s.numero_socio ?? "") === digitos.replace(/^0+/, ""))) || s.email.includes(t),
      );
    }
    if (f.estado) filas = filas.filter((s) => s.estado_socio === f.estado);
    if (f.plan) filas = filas.filter((s) => s.plan_id === f.plan);
    const pagina = Math.max(1, f.pagina ?? 1);
    return { filas: todos ? filas : filas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA), total: filas.length };
  }

  const supabase = await supabaseServidor();
  let consulta = supabase.from("socios").select("*, estado_socio", { count: "exact" }).order("creado_el", { ascending: false });
  if (q) {
    const ors = [`nombre_completo.ilike.%${q}%`, `email.ilike.%${q}%`];
    if (digitos) ors.push(`cedula.ilike.%${digitos}%`);
    if (digitos && digitos.length <= 7) ors.push(`numero_socio.eq.${Number(digitos)}`);
    consulta = consulta.or(ors.join(","));
  }
  if (f.estado) consulta = consulta.eq("estado_socio", f.estado);
  if (f.plan) consulta = consulta.eq("plan_id", f.plan);
  if (!todos) {
    const pagina = Math.max(1, f.pagina ?? 1);
    consulta = consulta.range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);
  }
  const { data, count, error } = await consulta;
  if (error) throw error;
  const filas = (data ?? []) as SocioFila[];

  // Miniaturas con URLs firmadas (las fotos son privadas)
  const rutas = filas.map((s) => s.foto_path).filter(Boolean) as string[];
  if (rutas.length && !todos) {
    const { data: firmadas } = await supabase.storage.from("fotos-socios").createSignedUrls(rutas, 3600);
    const mapa = new Map((firmadas ?? []).map((x) => [x.path, x.signedUrl]));
    for (const s of filas) s.foto_url = s.foto_path ? (mapa.get(s.foto_path) ?? null) : null;
  }
  return { filas, total: count ?? filas.length };
}

export async function fichaSocio(id: string): Promise<FichaSocio | null> {
  if (modoDemo) {
    const { planes, clases } = await obtenerContenido();
    const socio = demoSocios().find((s) => s.id === id);
    if (!socio) return null;
    return {
      socio,
      fotoUrl: null,
      pagos: demoPagos(planes).filter((p) => p.socio_id === id),
      reservas: demoReservas(clases).filter((r) => r.socio_id === id),
      accesos: demoAccesos().filter((a) => a.socio_id === id).slice(0, 20),
    };
  }
  const supabase = await supabaseServidor();
  const { data: socio } = await supabase.from("socios").select("*, estado_socio").eq("id", id).maybeSingle();
  if (!socio) return null;
  const [pagos, reservas, accesos, foto] = await Promise.all([
    supabase.from("pagos").select("*").eq("socio_id", id).order("creado_el", { ascending: false }).limit(50),
    supabase.from("reservas").select("*, horarios(hora, clases(nombre, piscina))").eq("socio_id", id).order("fecha", { ascending: false }).limit(50),
    supabase.from("accesos").select("*").eq("socio_id", id).order("creado_el", { ascending: false }).limit(20),
    socio.foto_path ? supabase.storage.from("fotos-socios").createSignedUrl(socio.foto_path, 3600) : Promise.resolve({ data: null }),
  ]);
  type FilaReserva = ReservaDetallada & { horarios: { hora: string; clases: { nombre: string; piscina: string } | null } | null };
  return {
    socio: socio as SocioFila,
    fotoUrl: foto.data?.signedUrl ?? null,
    pagos: (pagos.data ?? []) as Pago[],
    reservas: ((reservas.data ?? []) as FilaReserva[]).map((r) => ({
      ...r,
      hora: String(r.horarios?.hora ?? "").slice(0, 5),
      clase: r.horarios?.clases?.nombre ?? "Clase",
      piscina: r.horarios?.clases?.piscina ?? "",
    })),
    accesos: (accesos.data ?? []) as Acceso[],
  };
}

export type FiltrosPagos = { desde: string; hasta: string; plan?: string; estado?: string; metodo?: string };

export async function listarPagos(f: FiltrosPagos): Promise<Pago[]> {
  const desde = new Date(`${f.desde}T00:00:00-03:00`).toISOString();
  const hasta = new Date(`${f.hasta}T23:59:59-03:00`).toISOString();
  if (modoDemo) {
    const { planes } = await obtenerContenido();
    return demoPagos(planes).filter(
      (p) => p.creado_el >= desde && p.creado_el <= hasta && (!f.plan || p.plan_id === f.plan) && (!f.estado || p.estado === f.estado) && (!f.metodo || p.metodo === f.metodo),
    );
  }
  let q = (await supabaseServidor()).from("pagos").select("*").gte("creado_el", desde).lte("creado_el", hasta).order("creado_el", { ascending: false }).limit(1000);
  if (f.plan) q = q.eq("plan_id", f.plan);
  if (f.estado) q = q.eq("estado", f.estado);
  if (f.metodo) q = q.eq("metodo", f.metodo);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Pago[];
}

export async function listarAccesos(fecha: string, resultado?: string): Promise<Acceso[]> {
  const desde = new Date(`${fecha}T00:00:00-03:00`).toISOString();
  const hasta = new Date(`${fecha}T23:59:59-03:00`).toISOString();
  if (modoDemo) return demoAccesos().filter((a) => a.creado_el >= desde && a.creado_el <= hasta && (!resultado || a.resultado === resultado));
  let q = (await supabaseServidor()).from("accesos").select("*").gte("creado_el", desde).lte("creado_el", hasta).order("creado_el", { ascending: false }).limit(500);
  if (resultado) q = q.eq("resultado", resultado);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Acceso[];
}

/** Anotados en un horario a partir de hoy (próximas fechas). */
export async function inscriptos(horarioIds: string[]): Promise<Record<string, Inscripto[]>> {
  const out: Record<string, Inscripto[]> = Object.fromEntries(horarioIds.map((h) => [h, []]));
  if (!horarioIds.length) return out;
  if (modoDemo) {
    const { clases } = await obtenerContenido();
    for (const h of horarioIds) out[h] = demoInscriptos(clases, h);
    return out;
  }
  const { data, error } = await (await supabaseServidor())
    .from("reservas")
    .select("id, horario_id, fecha, socio_id, socios(nombre_completo, numero_socio, telefono)")
    .in("horario_id", horarioIds)
    .eq("estado", "confirmada")
    .gte("fecha", ahoraMontevideo().fecha)
    .order("fecha");
  if (error) throw error;
  type Fila = { id: string; horario_id: string; fecha: string; socio_id: string; socios: { nombre_completo: string; numero_socio: number | null; telefono: string } | null };
  for (const r of (data ?? []) as unknown as Fila[]) {
    out[r.horario_id]?.push({ id: r.id, socio_id: r.socio_id, fecha: r.fecha, nombre: r.socios?.nombre_completo ?? "—", numero: r.socios?.numero_socio ?? null, telefono: r.socios?.telefono ?? "" });
  }
  return out;
}

export async function listarActividad(limite = 100): Promise<Actividad[]> {
  if (modoDemo) return demoActividad();
  const { data, error } = await (await supabaseServidor()).from("actividad").select("*").order("creado_el", { ascending: false }).limit(limite);
  if (error) throw error;
  return (data ?? []) as Actividad[];
}
