export const CAR_STATUS = ["DISPONIBLE", "RESERVADO", "VENDIDO"] as const;
export type CarStatus = (typeof CAR_STATUS)[number];

export const STATUS_LABEL: Record<CarStatus, string> = {
  DISPONIBLE: "Disponible",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
};

export const FUELS = ["NAFTA", "DIESEL", "HIBRIDO", "ELECTRICO"] as const;
export type Fuel = (typeof FUELS)[number];
export const FUEL_LABEL: Record<Fuel, string> = {
  NAFTA: "Nafta",
  DIESEL: "Diésel",
  HIBRIDO: "Híbrido",
  ELECTRICO: "Eléctrico",
};

export const TRANSMISSIONS = ["MANUAL", "AUTOMATICA"] as const;
export type Transmission = (typeof TRANSMISSIONS)[number];
export const TRANSMISSION_LABEL: Record<Transmission, string> = {
  MANUAL: "Manual",
  AUTOMATICA: "Automática",
};

export const BODY_TYPES = ["Hatchback", "Sedán", "SUV", "Pickup", "Utilitario", "Coupé"] as const;

export const REVIEW_STATUS = ["PENDIENTE", "APROBADA", "OCULTA"] as const;
export type ReviewStatus = (typeof REVIEW_STATUS)[number];
export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  PENDIENTE: "Pendiente",
  APROBADA: "Publicada",
  OCULTA: "Oculta",
};

export function label<T extends string>(map: Record<T, string>, value: string): string {
  return (map as Record<string, string>)[value] ?? value;
}
