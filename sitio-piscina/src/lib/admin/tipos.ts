import type { Acceso, Pago, ReservaDetallada, Socio } from "@/lib/socio/tipos";

export type Estadisticas = {
  activos: number;
  vencidos: number;
  pendientes: number;
  suspendidos: number;
  ingresos_mes: number;
  reservas_hoy: number;
  accesos_hoy: number;
  serie_ingresos: { mes: string; total: number }[];
  serie_altas: { mes: string; total: number }[];
  top_clases: { nombre: string; total: number }[];
  vencen_pronto: { id: string; nombre: string; numero: number | null; plan: string; vence_el: string; telefono: string; renovacion_automatica: boolean }[];
};

export type SocioFila = Socio & { estado_socio: string; foto_url?: string | null };

export type FichaSocio = {
  socio: SocioFila;
  fotoUrl: string | null;
  pagos: Pago[];
  reservas: ReservaDetallada[];
  accesos: Acceso[];
};

export type Actividad = { id: number; email: string | null; accion: string; detalle: string | null; creado_el: string };

export type Inscripto = { id: string; socio_id: string; nombre: string; numero: number | null; telefono: string; fecha: string };

/** Resultado de una acción del panel (server action). */
export type Resultado = { ok: boolean; mensaje: string; id?: string } | null;
