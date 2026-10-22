"use client";

/**
 * Almacén del MODO DEMO (sin Supabase): guarda el socio, sus pagos y reservas
 * en el navegador para poder mostrar el flujo completo. No usar con datos reales.
 */
import type { Pago, Reserva, Socio } from "@/lib/socio/tipos";

const K = { socio: "demo:socio", foto: "demo:foto", pagos: "demo:pagos", reservas: "demo:reservas", sesion: "demo:sesion" };
export const EVENTO_DEMO = "demo-cambio";

function leer<T>(clave: string, porDefecto: T): T {
  try {
    const v = localStorage.getItem(clave);
    return v ? (JSON.parse(v) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}
function escribir(clave: string, valor: unknown) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // almacenamiento lleno o bloqueado: en demo no es grave
  }
  window.dispatchEvent(new Event(EVENTO_DEMO));
}
const id = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
const tokenQR = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");

export const demo = {
  socio: () => (leer<boolean>(K.sesion, false) ? leer<Socio | null>(K.socio, null) : null),
  existeCuenta: () => Boolean(leer<Socio | null>(K.socio, null)),
  foto: () => leer<string | null>(K.foto, null),
  pagos: () => leer<Pago[]>(K.pagos, []),
  reservas: () => leer<Reserva[]>(K.reservas, []),

  crearSocio(datos: Omit<Socio, "id" | "numero_socio" | "foto_path" | "suspendido" | "vence_el" | "qr_token" | "mp_preapproval_id" | "renovacion_automatica" | "creado_el" | "notas">, fotoDataUrl: string) {
    const socio: Socio = {
      ...datos,
      id: id(),
      numero_socio: null,
      foto_path: "demo",
      suspendido: false,
      vence_el: null,
      qr_token: null,
      mp_preapproval_id: null,
      renovacion_automatica: false,
      notas: null,
      creado_el: new Date().toISOString(),
    };
    escribir(K.foto, fotoDataUrl);
    escribir(K.pagos, []);
    escribir(K.reservas, []);
    escribir(K.sesion, true);
    escribir(K.socio, socio);
    return socio;
  },

  /** Simula un pago aprobado (igual que registrar_pago en la base real). */
  pagar(planId: string, monto: number, renovacionAutomatica: boolean) {
    const s = leer<Socio | null>(K.socio, null);
    if (!s) return;
    const desde = new Date(Math.max(Date.now(), s.vence_el ? new Date(s.vence_el).getTime() : 0));
    const hasta = new Date(desde);
    hasta.setMonth(hasta.getMonth() + 1);
    const pago: Pago = {
      id: id(),
      socio_id: s.id,
      socio_nombre: s.nombre_completo,
      plan_id: planId,
      monto,
      moneda: "UYU",
      metodo: "mercadopago",
      estado: "aprobado",
      mp_payment_id: null,
      periodo_desde: desde.toISOString(),
      periodo_hasta: hasta.toISOString(),
      detalle: "Pago simulado (modo demo)",
      registrado_por: "demo",
      creado_el: new Date().toISOString(),
    };
    escribir(K.pagos, [pago, ...leer<Pago[]>(K.pagos, [])]);
    escribir(K.socio, {
      ...s,
      plan_id: planId,
      vence_el: hasta.toISOString(),
      numero_socio: s.numero_socio ?? 1000 + Math.floor(Math.random() * 400) + 25,
      qr_token: s.qr_token ?? tokenQR(),
      renovacion_automatica: renovacionAutomatica,
    });
  },

  cancelarRenovacion() {
    const s = leer<Socio | null>(K.socio, null);
    if (s) escribir(K.socio, { ...s, renovacion_automatica: false });
  },

  reservar(horarioId: string, fecha: string) {
    const s = leer<Socio | null>(K.socio, null);
    if (!s) throw new Error("NO_SOCIO");
    const lista = leer<Reserva[]>(K.reservas, []);
    if (lista.some((r) => r.horario_id === horarioId && r.fecha === fecha && r.estado === "confirmada")) throw new Error("YA_RESERVADO");
    const r: Reserva = { id: id(), horario_id: horarioId, socio_id: s.id, fecha, estado: "confirmada", creado_el: new Date().toISOString() };
    escribir(K.reservas, [r, ...lista]);
    return r;
  },

  cancelarReserva(reservaId: string) {
    escribir(
      K.reservas,
      leer<Reserva[]>(K.reservas, []).map((r) => (r.id === reservaId ? { ...r, estado: "cancelada" as const } : r)),
    );
  },

  regenerarQR() {
    const s = leer<Socio | null>(K.socio, null);
    if (s?.numero_socio) escribir(K.socio, { ...s, qr_token: tokenQR() });
  },

  ingresar: () => escribir(K.sesion, true),
  salir: () => escribir(K.sesion, false),
  borrarTodo() {
    Object.values(K).forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new Event(EVENTO_DEMO));
  },
};
