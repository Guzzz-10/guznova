import { Encabezado } from "@/components/ui/Encabezado";
import { Carrusel } from "@/components/ui/Carrusel";
import type { FotoGaleria, Piscina } from "@/lib/contenido/tipos";
import { TarjetaPiscina } from "./TarjetaPiscina";
import { Galeria } from "./Galeria";
import { Gota } from "@/components/ui/Decoracion";

export function Piscinas({ piscinas, galeria }: { piscinas: Piscina[]; galeria: FotoGaleria[] }) {
  return (
    <section id="piscinas" aria-labelledby="titulo-piscinas" className="relative overflow-hidden bg-white pt-10 pb-24 sm:pt-16">
      <Gota className="absolute top-24 left-[8%] hidden size-10 animate-flotar text-agua-200 md:block" />
      <Gota className="absolute top-52 right-[10%] hidden size-7 animate-flotar text-coral-200 [animation-delay:-2s] md:block" />
      <div className="contenedor">
        <Encabezado
          id="titulo-piscinas"
          etiqueta="🏊 Nuestras piscinas"
          titulo={
            <>
              {piscinas.length === 1 ? "Una piscina" : `${["", "Una", "Dos", "Tres", "Cuatro", "Cinco"][piscinas.length] ?? piscinas.length} piscinas`},{" "}
              <span className="text-agua-600">mil formas</span> de disfrutar
            </>
          }
          bajada="Desde el primer chapuzón de los más chiquitos hasta tus largos de entrenamiento. Tocá cada piscina para ver su ficha."
        />

        <div className="mt-12" data-reveal>
          <Carrusel etiqueta="Piscinas del complejo">
            {piscinas.map((p) => (
              <TarjetaPiscina key={p.id} piscina={p} />
            ))}
          </Carrusel>
        </div>

        <div className="mt-20">
          <div className="mb-8 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end" data-reveal>
            <div>
              <h3 className="font-display text-3xl font-bold text-mar-900 sm:text-4xl">Galería 📸</h3>
              <p className="mt-1 text-mar-700">Así se vive un día en el agua. Tocá una foto para verla en grande.</p>
            </div>
          </div>
          <Galeria fotos={galeria} />
        </div>
      </div>
    </section>
  );
}
