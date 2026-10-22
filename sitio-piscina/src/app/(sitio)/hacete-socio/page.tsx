import type { Metadata } from "next";
import { obtenerContenido } from "@/lib/contenido/obtener";
import { AsistenteAlta } from "@/components/alta/AsistenteAlta";
import { Burbujas } from "@/components/ui/Burbujas";

export const metadata: Metadata = {
  title: "Hacete socio",
  description: "Elegí tu plan, completá tus datos, subí tu foto y pagá online con Mercado Pago. Tu carnet digital se genera al instante.",
  alternates: { canonical: "/hacete-socio" },
};

export default async function HaceteSocio({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  const { planes, negocio } = await obtenerContenido();
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-agua-50 via-white to-white pt-28 pb-36">
      <Burbujas cantidad={6} opacidad={0.5} className="[&_.burbuja]:bg-agua-200/40" />
      <div className="contenedor relative">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="chip bg-coral-100 text-coral-800">🏊 Alta de socio</p>
          <h1 className="titulo-seccion mt-3 text-mar-900">
            ¡Hacete socio de <span className="text-agua-600">{negocio.nombre}</span>!
          </h1>
          <p className="mt-3 text-lg text-mar-700">En 5 pasos y en menos de 3 minutos ya tenés tu carnet digital.</p>
        </div>
        <AsistenteAlta planes={planes.filter((p) => p.activo)} planInicial={plan ?? null} nombreNegocio={negocio.nombre} />
      </div>
    </div>
  );
}
