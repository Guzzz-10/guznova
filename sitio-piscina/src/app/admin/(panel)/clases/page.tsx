import Link from "next/link";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { obtenerContenido } from "@/lib/contenido/obtener";
import { modoDemo } from "@/lib/entorno";
import { tipos } from "@/content/clases";
import { BannerEjemplo } from "@/components/admin/BannerEjemplo";
import { BotonOrden } from "@/components/admin/BotonOrden";

export const metadata = { title: "Clases y horarios" };

export default async function Clases() {
  const { clases, origen } = await obtenerContenido();
  const editable = origen.clases === "db" || modoDemo;
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-mar-950">Clases y horarios</h1>
          <p className="text-mar-600">Creá clases, armá los horarios con sus cupos y mirá quiénes están anotados.</p>
        </div>
        {editable && (
          <Link href="/admin/clases/nueva" className="btn btn-agua btn-chico">
            <Plus className="size-4" aria-hidden="true" /> Nueva clase
          </Link>
        )}
      </div>
      {!editable && <BannerEjemplo texto="Estas son las clases de ejemplo. Cargalas en la base para poder editarlas y recibir reservas." />}
      <ul className="grid gap-3">
        {clases.map((c) => (
          <li key={c.id} className={`flex flex-wrap items-center gap-3 rounded-3xl bg-white p-4 shadow-suave ring-1 ring-mar-100 sm:p-5 ${c.activa ? "" : "opacity-60"}`}>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-mar-900">
                {c.nombre} {!c.activa && <span className="ml-1 rounded-full bg-mar-100 px-2 py-0.5 text-xs text-mar-700">Oculta</span>}
              </p>
              <p className="text-sm text-mar-600">
                {tipos.find((t) => t.id === c.tipo)?.label} · {c.edad} · {c.profesor || "Sin profe asignado"} · {c.horarios.filter((h) => h.activo).length} horarios
              </p>
            </div>
            {editable && (
              <div className="flex items-center gap-1">
                <BotonOrden tabla="clases" id={c.id} direccion={-1}>
                  <ArrowUp className="size-4" aria-label="Subir" />
                </BotonOrden>
                <BotonOrden tabla="clases" id={c.id} direccion={1}>
                  <ArrowDown className="size-4" aria-label="Bajar" />
                </BotonOrden>
                <Link href={`/admin/clases/${c.id}`} className="btn btn-agua btn-chico">
                  Editar y ver anotados
                </Link>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
