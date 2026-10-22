import { Encabezado } from "@/components/ui/Encabezado";
import { Ola } from "@/components/ui/Ola";
import { Clases } from "./Clases";
import type { Clase, Disponibilidad } from "@/lib/contenido/tipos";

export function SeccionClases({ clases, whatsapp, disponibilidad }: { clases: Clase[]; whatsapp: string; disponibilidad: Disponibilidad }) {
  return (
    <section id="clases" aria-labelledby="titulo-clases" className="relative bg-white">
      <Ola className="text-agua-50" variante={1} />
      <div className="bg-agua-50 py-14 sm:py-20">
        <div className="contenedor">
          <Encabezado
            id="titulo-clases"
            etiqueta="📅 Clases"
            titulo={
              <>
                Encontrá tu clase <span className="text-coral-500">ideal</span>
              </>
            }
            bajada="Filtrá por día, tipo o edad, elegí el horario que te queda cómodo y reservá tu lugar en un toque. ¿Dudas? Consultanos por WhatsApp."
          />
          <div className="mt-10">
            <Clases clases={clases} whatsapp={whatsapp} disponibilidadInicial={disponibilidad} />
          </div>
        </div>
      </div>
      <Ola className="text-agua-50" invertida variante={3} />
    </section>
  );
}
