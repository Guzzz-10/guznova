import Link from "next/link";
import { listarPagos } from "@/lib/admin/datos";
import { obtenerContenido } from "@/lib/contenido/obtener";
import { ahoraMontevideo, sumarDias } from "@/lib/dias";
import { fecha, precioUYU } from "@/lib/formato";
import { Insignia, Tarjeta } from "@/components/admin/ui";
import { PagoManual } from "@/components/admin/PagoManual";

export const metadata = { title: "Pagos" };

type Props = { searchParams: Promise<{ desde?: string; hasta?: string; plan?: string; estado?: string; metodo?: string }> };
const metodos = { mercadopago: "Mercado Pago", efectivo: "Efectivo", transferencia: "Transferencia" } as const;
const valida = (f?: string) => (f && /^\d{4}-\d{2}-\d{2}$/.test(f) ? f : undefined);

export default async function Pagos({ searchParams }: Props) {
  const f = await searchParams;
  const hoy = ahoraMontevideo().fecha;
  const inicioMes = `${hoy.slice(0, 8)}01`;
  const desde = valida(f.desde) ?? inicioMes;
  const hasta = valida(f.hasta) ?? hoy;
  const [pagos, { planes }] = await Promise.all([listarPagos({ desde, hasta, plan: f.plan || undefined, estado: f.estado || undefined, metodo: f.metodo || undefined }), obtenerContenido()]);

  const aprobados = pagos.filter((p) => p.estado === "aprobado");
  const total = aprobados.reduce((a, p) => a + Number(p.monto), 0);
  const porMetodo = (Object.keys(metodos) as (keyof typeof metodos)[]).map((m) => ({
    m,
    total: aprobados.filter((p) => p.metodo === m).reduce((a, p) => a + Number(p.monto), 0),
    n: aprobados.filter((p) => p.metodo === m).length,
  }));
  const mesPasado = new Date(`${inicioMes}T12:00:00Z`);
  mesPasado.setUTCMonth(mesPasado.getUTCMonth() - 1);
  const inicioMesPasado = mesPasado.toISOString().slice(0, 10);
  const presets = [
    { label: "Hoy", desde: hoy, hasta: hoy },
    { label: "Últimos 7 días", desde: sumarDias(hoy, -6), hasta: hoy },
    { label: "Este mes", desde: inicioMes, hasta: hoy },
    { label: "Mes pasado", desde: inicioMesPasado, hasta: sumarDias(inicioMes, -1) },
    { label: "Últimos 12 meses", desde: sumarDias(hoy, -365), hasta: hoy },
  ];
  const nombrePlan = (id: string) => planes.find((p) => p.id === id)?.nombre ?? id;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold text-mar-950">Pagos</h1>
        <p className="text-mar-600">Pagos de Mercado Pago (automáticos) y los registrados a mano en recepción.</p>
      </div>

      <div className="grid gap-3">
        <div className="flex flex-wrap gap-2" aria-label="Períodos rápidos">
          {presets.map((p) => {
            const activo = p.desde === desde && p.hasta === hasta;
            return (
              <Link
                key={p.label}
                href={`?desde=${p.desde}&hasta=${p.hasta}`}
                aria-current={activo ? "true" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${activo ? "bg-mar-900 text-white ring-mar-900" : "bg-white text-mar-800 ring-mar-100 hover:ring-agua-300"}`}
              >
                {p.label}
              </Link>
            );
          })}
        </div>
        <form className="grid gap-2 rounded-3xl bg-white p-4 shadow-suave ring-1 ring-mar-100 sm:grid-cols-3 lg:grid-cols-6 lg:items-end">
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-mar-600">Desde</span>
            <input type="date" name="desde" defaultValue={desde} className="campo py-2" />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-mar-600">Hasta</span>
            <input type="date" name="hasta" defaultValue={hasta} className="campo py-2" />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-mar-600">Plan</span>
            <select name="plan" defaultValue={f.plan ?? ""} className="campo py-2">
              <option value="">Todos</option>
              {planes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-mar-600">Estado</span>
            <select name="estado" defaultValue={f.estado ?? ""} className="campo py-2">
              <option value="">Todos</option>
              <option value="aprobado">Aprobados</option>
              <option value="pendiente">Pendientes</option>
              <option value="rechazado">Rechazados</option>
              <option value="reembolsado">Reembolsados</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-mar-600">Método</span>
            <select name="metodo" defaultValue={f.metodo ?? ""} className="campo py-2">
              <option value="">Todos</option>
              {Object.entries(metodos).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-mar btn-chico">
            Filtrar
          </button>
        </form>
      </div>

      <section aria-label="Totales del período" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="col-span-2 rounded-3xl bg-gradient-to-br from-agua-600 to-mar-700 p-5 text-white shadow-suave lg:col-span-1">
          <p className="text-sm text-agua-100">Total cobrado</p>
          <p className="text-3xl font-bold">{precioUYU(total)}</p>
          <p className="text-sm text-agua-100">
            {aprobados.length} pagos aprobados · {fecha(`${desde}T12:00:00`)} al {fecha(`${hasta}T12:00:00`)}
          </p>
        </div>
        {porMetodo.map((x) => (
          <div key={x.m} className="rounded-3xl bg-white p-5 shadow-suave ring-1 ring-mar-100">
            <p className="text-sm text-mar-600">{metodos[x.m]}</p>
            <p className="text-2xl font-bold text-mar-950">{precioUYU(x.total)}</p>
            <p className="text-sm text-mar-500">{x.n} pagos</p>
          </div>
        ))}
      </section>

      <div id="registrar" className="scroll-mt-24">
        <Tarjeta titulo="Registrar un pago en efectivo o transferencia">
          <PagoManual planes={planes.filter((p) => p.activo)} />
        </Tarjeta>
      </div>

      <Tarjeta titulo={`Pagos del período (${pagos.length})`}>
        {pagos.length === 0 ? (
          <p className="text-mar-600">No hay pagos con esos filtros.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-mar-500">
                <tr>
                  <th scope="col" className="py-2 pr-3 font-semibold">Fecha</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Socio</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Plan</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Método</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Estado</th>
                  <th scope="col" className="py-2 text-right font-semibold">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mar-50">
                {pagos.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 pr-3 whitespace-nowrap tabular-nums">{fecha(p.creado_el)}</td>
                    <td className="py-2 pr-3">
                      {p.socio_id ? (
                        <Link href={`/admin/socios/${p.socio_id}`} className="font-semibold text-mar-900 hover:underline">
                          {p.socio_nombre ?? "Socio"}
                        </Link>
                      ) : (
                        <span className="text-mar-500">{p.socio_nombre ?? "Socio eliminado"}</span>
                      )}
                      {p.detalle && <span className="block text-xs text-mar-500">{p.detalle}</span>}
                    </td>
                    <td className="py-2 pr-3">{nombrePlan(p.plan_id)}</td>
                    <td className="py-2 pr-3">{metodos[p.metodo]}</td>
                    <td className="py-2 pr-3">
                      <Insignia estado={p.estado} />
                    </td>
                    <td className="py-2 text-right font-semibold whitespace-nowrap tabular-nums">{precioUYU(Number(p.monto))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Tarjeta>
    </div>
  );
}
