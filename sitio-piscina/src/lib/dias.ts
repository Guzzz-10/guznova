import type { Dia } from "@/lib/contenido/tipos";

export const dias: { id: Dia; iso: number; corto: string; largo: string }[] = [
  { id: "lun", iso: 1, corto: "Lun", largo: "Lunes" },
  { id: "mar", iso: 2, corto: "Mar", largo: "Martes" },
  { id: "mie", iso: 3, corto: "Mié", largo: "Miércoles" },
  { id: "jue", iso: 4, corto: "Jue", largo: "Jueves" },
  { id: "vie", iso: 5, corto: "Vie", largo: "Viernes" },
  { id: "sab", iso: 6, corto: "Sáb", largo: "Sábado" },
  { id: "dom", iso: 7, corto: "Dom", largo: "Domingo" },
];

export const diaDesdeIso = (n: number): Dia => dias.find((d) => d.iso === n)?.id ?? "lun";
export const isoDesdeDia = (d: Dia) => dias.find((x) => x.id === d)!.iso;
export const nombreDia = (d: Dia) => dias.find((x) => x.id === d)!.largo;

export const ZONA = "America/Montevideo";

/** Fecha y hora actuales en Montevideo: { fecha: "2026-10-22", hora: "18:05", iso: 4 } */
export function ahoraMontevideo(ahora = new Date()) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: ZONA,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      weekday: "short",
    })
      .formatToParts(ahora)
      .map((p) => [p.type, p.value]),
  );
  const isoSemana = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }[partes.weekday as string] ?? 1;
  return { fecha: `${partes.year}-${partes.month}-${partes.day}`, hora: `${partes.hour}:${partes.minute}`, iso: isoSemana };
}

/** Suma días a una fecha YYYY-MM-DD (sin problemas de zona horaria). */
export function sumarDias(fecha: string, n: number) {
  const [a, m, d] = fecha.split("-").map(Number);
  const f = new Date(Date.UTC(a, m - 1, d + n));
  return f.toISOString().slice(0, 10);
}

/** Próxima fecha (YYYY-MM-DD) en la que ocurre un horario. Si es hoy y ya pasó la hora, la semana siguiente. */
export function proximaFecha(dia: Dia, hora: string, ahora = new Date()) {
  const h = ahoraMontevideo(ahora);
  let delta = (isoDesdeDia(dia) - h.iso + 7) % 7;
  if (delta === 0 && hora <= h.hora) delta = 7;
  return sumarDias(h.fecha, delta);
}

/** "2026-10-27" → "27/10" */
export const fechaCortaDia = (fecha: string) => {
  const [, m, d] = fecha.split("-");
  return `${d}/${m}`;
};
