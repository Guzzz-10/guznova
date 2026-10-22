import Link from "next/link";
import { Download, Search, UserPlus } from "lucide-react";
import { listarSocios, POR_PAGINA } from "@/lib/admin/datos";
import { obtenerContenido } from "@/lib/contenido/obtener";
import { formatoCedula, formatoNumeroSocio, fecha } from "@/lib/formato";
import { Avatar, Insignia } from "@/components/admin/ui";

export const metadata = { title: "Socios" };

type Props = { searchParams: Promise<{ q?: string; estado?: string; plan?: string; pagina?: string }> };

export default async function Socios({ searchParams }: Props) {
  const f = await searchParams;
  const pagina = Math.max(1, Number(f.pagina) || 1);
  const [{ filas, total }, { planes }] = await Promise.all([listarSocios({ ...f, pagina }), obtenerContenido()]);
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const nombrePlan = (id: string) => planes.find((p) => p.id === id)?.nombre ?? id;
  const qs = (extra: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ q: f.q, estado: f.estado, plan: f.plan, ...extra })) if (v) p.set(k, String(v));
    return p.toString();
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-mar-950">Socios</h1>
          <p className="text-mar-600">{total} {total === 1 ? "socio" : "socios"} con estos filtros.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/admin/socios/exportar?${qs({})}`} className="btn btn-claro btn-chico">
            <Download className="size-4" aria-hidden="true" /> Exportar a Excel (CSV)
          </a>
          <Link href="/admin/socios/nuevo" className="btn btn-agua btn-chico">
            <UserPlus className="size-4" aria-hidden="true" /> Nuevo socio
          </Link>
        </div>
      </div>

      <form className="grid gap-3 rounded-3xl bg-white p-4 shadow-suave ring-1 ring-mar-100 sm:grid-cols-[1fr_auto_auto_auto]" role="search">
        <label className="relative">
          <span className="sr-only">Buscar</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-mar-400" aria-hidden="true" />
          <input name="q" defaultValue={f.q} placeholder="Buscar por nombre, cédula o N.º de socio" className="campo pl-12" />
        </label>
        <label>
          <span className="sr-only">Estado</span>
          <select name="estado" defaultValue={f.estado ?? ""} className="campo">
            <option value="">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="vencido">Vencidos</option>
            <option value="pendiente">Pago pendiente</option>
            <option value="suspendido">Suspendidos</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Plan</span>
          <select name="plan" defaultValue={f.plan ?? ""} className="campo">
            <option value="">Todos los planes</option>
            {planes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-mar btn-chico">
          Filtrar
        </button>
      </form>

      {filas.length === 0 ? (
        <p className="rounded-3xl bg-white p-10 text-center text-mar-600 shadow-suave ring-1 ring-mar-100">No encontramos socios con esos filtros.</p>
      ) : (
        <>
          {/* Celular: tarjetas */}
          <ul className="grid gap-2 md:hidden">
            {filas.map((s) => (
              <li key={s.id}>
                <Link href={`/admin/socios/${s.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-suave ring-1 ring-mar-100">
                  <Avatar nombre={s.nombre_completo} foto={s.foto_url} tam="size-12" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-mar-900">{s.nombre_completo}</span>
                    <span className="text-sm text-mar-500">
                      N.º {formatoNumeroSocio(s.numero_socio)} · {nombrePlan(s.plan_id)}
                    </span>
                  </span>
                  <Insignia estado={s.estado_socio} />
                </Link>
              </li>
            ))}
          </ul>

          {/* Escritorio: tabla */}
          <div className="hidden overflow-x-auto rounded-3xl bg-white shadow-suave ring-1 ring-mar-100 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-mar-50 text-mar-600">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Socio</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Cédula</th>
                  <th scope="col" className="px-4 py-3 font-semibold">N.º</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Plan</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Estado</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Vence</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mar-50">
                {filas.map((s) => (
                  <tr key={s.id} className="hover:bg-agua-50/50">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-3">
                        <Avatar nombre={s.nombre_completo} foto={s.foto_url} />
                        <span>
                          <span className="block font-semibold text-mar-900">{s.nombre_completo}</span>
                          <span className="text-mar-500">{s.email}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{formatoCedula(s.cedula)}</td>
                    <td className="px-4 py-3 tabular-nums">{formatoNumeroSocio(s.numero_socio)}</td>
                    <td className="px-4 py-3">{nombrePlan(s.plan_id)}</td>
                    <td className="px-4 py-3">
                      <Insignia estado={s.estado_socio} />
                    </td>
                    <td className="px-4 py-3 tabular-nums">{fecha(s.vence_el)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/socios/${s.id}`} className="font-semibold text-agua-700 hover:underline">
                        Ver ficha
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginas > 1 && (
            <nav aria-label="Páginas" className="flex items-center justify-center gap-2">
              {pagina > 1 && (
                <Link href={`?${qs({ pagina: pagina - 1 })}`} className="btn btn-claro btn-chico">
                  ← Anterior
                </Link>
              )}
              <span className="text-sm text-mar-600">
                Página {pagina} de {paginas}
              </span>
              {pagina < paginas && (
                <Link href={`?${qs({ pagina: pagina + 1 })}`} className="btn btn-claro btn-chico">
                  Siguiente →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
