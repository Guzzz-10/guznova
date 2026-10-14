// Valores por defecto de la configuración del negocio.
// Todos son editables desde /admin/configuracion sin tocar código.
export const SETTINGS_DEFAULTS = {
  businessName: "AutoNova",
  legalName: "[razón social]",
  rut: "[RUT]",
  whatsapp: "59899123456",
  phone: "099 123 456",
  email: "ventas@autonova.com.uy",
  address: "Av. Italia 4520",
  city: "Montevideo",
  hours: "Lunes a viernes: 9:00 a 19:00\nSábados: 9:00 a 13:00\nDomingos: cerrado",
  instagram: "https://instagram.com/autonova.uy",
  facebook: "https://facebook.com/autonova.uy",
  tiktok: "",
  mapQuery: "Av. Italia 4520, Montevideo, Uruguay",
  whatsappCarMessage:
    "Hola AutoNova! Me interesa el {auto} publicado a USD {precio}. ¿Sigue disponible? {link}",
  whatsappGenericMessage: "Hola AutoNova! Quisiera hacer una consulta.",
  statsCarsSold: "500",
  statsYears: "12",
  statsClients: "98",
} as const;

export type SettingKey = keyof typeof SETTINGS_DEFAULTS;
export type Settings = Record<SettingKey, string>;

export const SETTING_KEYS = Object.keys(SETTINGS_DEFAULTS) as SettingKey[];
