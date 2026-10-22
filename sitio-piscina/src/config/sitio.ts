/**
 * Configuración técnica del sitio. Los datos del negocio (nombre, dirección,
 * WhatsApp, textos, etc.) se editan desde el panel /admin → Contenido y Configuración.
 * Los valores de ejemplo están en src/content/.
 */
export const urlSitio = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const navegacion = [
  { href: "/#inicio", label: "Inicio", id: "inicio" },
  { href: "/#piscinas", label: "Piscinas", id: "piscinas" },
  { href: "/#clases", label: "Clases", id: "clases" },
  { href: "/#historia", label: "Historia", id: "historia" },
  { href: "/#suscripcion", label: "Suscripción", id: "suscripcion" },
  { href: "/mi-carnet", label: "Mi Carnet", id: "mi-carnet" },
  { href: "/#contacto", label: "Contacto", id: "contacto" },
] as const;

export const aniosDesde = (anio: number) => new Date().getFullYear() - anio;
