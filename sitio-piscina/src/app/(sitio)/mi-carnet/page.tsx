import type { Metadata } from "next";
import { Suspense } from "react";
import { obtenerContenido } from "@/lib/contenido/obtener";
import { urlSitio } from "@/config/sitio";
import { AreaSocio } from "@/components/carnet/AreaSocio";

export const metadata: Metadata = {
  title: "Mi Carnet",
  description: "Tu carnet digital de socio: mostralo en la entrada, renová tu plan y mirá tus reservas y pagos.",
  robots: { index: false, follow: true },
};

export default async function MiCarnet() {
  const { negocio, planes, clases } = await obtenerContenido();
  return (
    <div className="min-h-screen bg-gradient-to-b from-agua-50 via-white to-white pt-24 pb-36 sm:pt-28">
      <div className="contenedor">
        <Suspense>
          <AreaSocio negocio={{ nombre: negocio.nombre, logoUrl: negocio.logoUrl }} planes={planes.filter((p) => p.activo)} clases={clases} urlSitio={urlSitio} />
        </Suspense>
      </div>
    </div>
  );
}
