const pesos = new Intl.NumberFormat("es-UY", { maximumFractionDigits: 0 });

/** $ 1.490 */
export const precioUYU = (monto: number) => `$ ${pesos.format(monto)}`;

const fechaCorta = new Intl.DateTimeFormat("es-UY", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Montevideo" });
const fechaLarga = new Intl.DateTimeFormat("es-UY", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Montevideo" });
const fechaHora = new Intl.DateTimeFormat("es-UY", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Montevideo",
});

export const fecha = (d: string | Date | null | undefined) => (d ? fechaCorta.format(new Date(d)) : "—");
export const fechaTexto = (d: string | Date | null | undefined) => (d ? fechaLarga.format(new Date(d)) : "—");
export const fechaYHora = (d: string | Date | null | undefined) => (d ? fechaHora.format(new Date(d)) : "—");

/** 1234567-8 → 1.234.567-8 */
export function formatoCedula(ci: string) {
  const d = ci.replace(/\D/g, "");
  if (d.length < 2) return d;
  const cuerpo = d.slice(0, -1);
  const verif = d.slice(-1);
  return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${verif}`;
}

/** 1024 → 001024 */
export const formatoNumeroSocio = (n: number | null | undefined) => (n ? String(n).padStart(6, "0") : "——————");
