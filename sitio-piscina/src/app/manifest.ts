import type { MetadataRoute } from "next";
import { obtenerContenido } from "@/lib/contenido/obtener";

/** Permite "Agregar a la pantalla de inicio": abre directo en Mi Carnet. */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { negocio } = await obtenerContenido();
  return {
    name: `${negocio.nombre} · Mi Carnet`,
    short_name: negocio.nombre,
    description: `Tu carnet digital de socio de ${negocio.nombreCompleto}.`,
    start_url: "/mi-carnet",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ecfdfd",
    theme_color: "#0eaebf",
    lang: "es-UY",
    icons: [
      { src: "/iconos/icono-192.png", sizes: "192x192", type: "image/png" },
      { src: "/iconos/icono-512.png", sizes: "512x512", type: "image/png" },
      { src: "/iconos/icono-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
