import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerContenido } from "@/lib/contenido/obtener";
import { inscriptos } from "@/lib/admin/datos";
import { EditorClase } from "@/components/admin/EditorClase";
import { Inscriptos } from "@/components/admin/Inscriptos";
import { Tarjeta } from "@/components/admin/ui";

export const metadata = { title: "Editar clase" };

export default async function EditarClase({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { clases, piscinas } = await obtenerContenido();
  const clase = id === "nueva" ? undefined : clases.find((c) => c.id === id);
  if (id !== "nueva" && !clase) notFound();
  const anotados = clase ? await inscriptos(clase.horarios.map((h) => h.id)) : {};

  return (
    <div className="grid gap-6">
      <div>
        <Link href="/admin/clases" className="text-sm font-semibold text-agua-700 hover:underline">
          ← Clases
        </Link>
        <h1 className="text-3xl font-bold text-mar-950">{clase ? clase.nombre : "Nueva clase"}</h1>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] xl:items-start">
        <Tarjeta titulo="Datos de la clase">
          <EditorClase clase={clase} piscinas={piscinas.map((p) => p.nombre)} />
        </Tarjeta>
        {clase && (
          <Tarjeta titulo="Anotados por horario">
            <Inscriptos horarios={clase.horarios} inscriptos={anotados} />
          </Tarjeta>
        )}
      </div>
    </div>
  );
}
