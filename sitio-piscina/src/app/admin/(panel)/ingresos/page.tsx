import Link from "next/link";
import { listarAccesos } from "@/lib/admin/datos";
import { obtenerContenido } from "@/lib/contenido/obtener";
import { ahoraMontevideo } from "@/lib/dias";
import { fechaYHora } from "@/lib/formato";
import { Escaner } from "@/components/admin/Escaner";
import { Insignia, Tarjeta } from "@/components/admin/ui";

export const metadata = { title: "Control de ingreso" };

type Props = { searchParams: Promise<{ fecha?: string; resultado?: string }> };

export default async function Ingresos({ searchParams }: Props) {
  const f = await searchParams;
  const hoy = ahoraMontevideo().fecha;
  const dia = /^\d{4}-\d{2}-\d{2}$/.test(f.fecha ?? "") ? f.fecha! : hoy;
  const [accesos, { planes }] = await Promise.all([listarAccesos(dia, f.resultado || undefined), obtenerContenido()]);
  const permitidos = accesos.filter((a) => a.resultado === "permitido").length;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold text-mar-950">Control de ingreso</h1>
        <p className="text-mar-600">Escaneá el QR del carnet y compará la foto con la persona.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
        <Escaner planes={planes.map((p) => ({ id: p.id, nombre: p.nombre }))} />

        <Tarjeta titulo="Historial de ingresos">
          <form className="mb-4 flex flex-wrap items-end gap-2">
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-mar-600">Día</span>
              <input type="date" name="fecha" defaultValue={dia} max={hoy} className="campo py-2" />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-mar-600">Resultado</span>
              <select name="resultado" defaultValue={f.resultado ?? ""} className="campo py-2">
                <option value="">Todos</option>
                <option value="permitido">Permitidos</option>
                <option value="vencido">Vencidos</option>
                <option value="suspendido">Suspendidos</option>
                <option value="pendiente">Pendientes</option>
                <option value="desconocido">Desconocidos</option>
              </select>
            </label>
            <button type="submit" className="btn btn-mar btn-chico">
              Ver
            </button>
          </form>
          <p className="mb-3 text-sm text-mar-600">
            <strong className="text-mar-900">{permitidos}</strong> ingresos permitidos · {accesos.length} lecturas en total
          </p>
          {accesos.length === 0 ? (
            <p className="text-mar-600">No hay registros ese día.</p>
          ) : (
            <ul className="max-h-[32rem] divide-y divide-mar-50 overflow-y-auto text-sm">
              {accesos.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0">
                    {a.socio_id ? (
                      <Link href={`/admin/socios/${a.socio_id}`} className="block truncate font-semibold text-mar-900 hover:underline">
                        {a.nombre}
                      </Link>
                    ) : (
                      <span className="block font-semibold text-mar-500">Código desconocido</span>
                    )}
                    <span className="text-mar-500 tabular-nums">{fechaYHora(a.creado_el)}</span>
                  </span>
                  <Insignia estado={a.resultado} />
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
    </div>
  );
}
