export type EstadoSocio = "activo" | "vencido" | "pendiente" | "suspendido";

export type Socio = {
  id: string;
  numero_socio: number | null;
  nombre_completo: string;
  cedula: string;
  fecha_nacimiento: string;
  telefono: string;
  email: string;
  foto_path: string | null;
  plan_id: string;
  suspendido: boolean;
  vence_el: string | null;
  qr_token: string | null;
  mp_preapproval_id: string | null;
  renovacion_automatica: boolean;
  acepto_terminos_el: string | null;
  notas: string | null;
  creado_el: string;
};

export type MetodoPago = "mercadopago" | "efectivo" | "transferencia";
export type EstadoPago = "aprobado" | "pendiente" | "rechazado" | "reembolsado";

export type Pago = {
  id: string;
  socio_id: string | null;
  socio_nombre: string | null;
  plan_id: string;
  monto: number;
  moneda: string;
  metodo: MetodoPago;
  estado: EstadoPago;
  mp_payment_id: string | null;
  periodo_desde: string | null;
  periodo_hasta: string | null;
  detalle: string | null;
  registrado_por: string | null;
  creado_el: string;
};

export type Reserva = {
  id: string;
  horario_id: string;
  socio_id: string;
  fecha: string;
  estado: "confirmada" | "cancelada";
  creado_el: string;
};

/** Reserva con los datos de la clase para mostrar. */
export type ReservaDetallada = Reserva & { clase: string; hora: string; piscina: string };

export type Acceso = {
  id: number;
  socio_id: string | null;
  nombre: string | null;
  codigo: string | null;
  resultado: "permitido" | "vencido" | "suspendido" | "pendiente" | "desconocido";
  creado_el: string;
};

/** El estado se calcula a partir de la fecha de vencimiento (no hace falta un cron). */
export function estadoSocio(s: Pick<Socio, "vence_el" | "suspendido">, ahora = new Date()): EstadoSocio {
  if (s.suspendido) return "suspendido";
  if (!s.vence_el) return "pendiente";
  return new Date(s.vence_el) >= ahora ? "activo" : "vencido";
}

export const etiquetaEstado: Record<EstadoSocio, string> = {
  activo: "Activo",
  vencido: "Vencido",
  pendiente: "Pago pendiente",
  suspendido: "Suspendido",
};

/** Contenido del QR: un enlace que solo el administrador puede validar. */
export const contenidoQR = (urlSitio: string, token: string) => `${urlSitio}/v/${token}`;

/** Extrae el token de un QR leído (enlace /v/<token>); si no es un enlace devuelve el texto tal cual. */
export function tokenDesdeQR(texto: string) {
  const t = texto.trim();
  const m = t.match(/\/v\/([A-Za-z0-9_-]{16,})/);
  return m ? m[1] : t;
}

/** Traduce los errores de las funciones SQL a mensajes para el usuario. */
export function mensajeError(e: unknown) {
  const m = (e as { message?: string })?.message ?? String(e);
  const tabla: Record<string, string> = {
    SIN_CUPO: "Ese horario se quedó sin cupo. Probá con otro o consultanos por WhatsApp.",
    YA_RESERVADO: "Ya tenés un lugar reservado en ese horario.",
    SOCIO_NO_ACTIVO: "Tu suscripción no está activa. Renovala desde Mi Carnet para reservar.",
    NO_SOCIO: "Necesitás ser socio para reservar.",
    HORARIO_INEXISTENTE: "Ese horario ya no está disponible.",
    NO_PERMITIDO: "No tenés permiso para hacer esto.",
    SIN_CARNET: "El socio todavía no tiene carnet (falta el primer pago).",
    FECHA_NO_COINCIDE: "La fecha elegida no coincide con el día del horario.",
    NO_EXISTE: "No encontramos ese registro.",
  };
  const clave = Object.keys(tabla).find((k) => m.includes(k));
  return clave ? tabla[clave] : "Algo salió mal. Probá de nuevo en un ratito.";
}
