import { carTitle, formatNumber } from "./format";

/** Deja solo dígitos (wa.me requiere el número con código de país, sin + ni espacios). */
export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function waLink(phone: string, message: string): string {
  return `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(message)}`;
}

/**
 * Arma el mensaje para un auto a partir de la plantilla configurable.
 * Variables disponibles: {auto}, {marca}, {modelo}, {anio}, {precio}, {link}
 */
export function carMessage(
  template: string,
  car: { brand: string; model: string; year: number; price: number; version?: string },
  link: string,
): string {
  return template
    .replaceAll("{auto}", carTitle(car))
    .replaceAll("{marca}", car.brand)
    .replaceAll("{modelo}", car.model)
    .replaceAll("{anio}", String(car.year))
    .replaceAll("{precio}", formatNumber(car.price))
    .replaceAll("{link}", link);
}
