import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { fichaSocio } from "@/lib/admin/datos";
import { obtenerContenido } from "@/lib/contenido/obtener";
import { formatoCedula, formatoNumeroSocio, fecha, fechaYHora, precioUYU } from "@/lib/formato";
import { ahoraMontevideo, fechaCortaDia } from "@/lib/dias";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { Avatar, Insignia, Tarjeta } from "@/components/admin/ui";
import { FormularioSocio } from "@/components/admin/FormularioSocio";
import { FormularioRenovar } from "@/components/admin/FormularioRenovar";
import { FotoSocioAdmin } from "@/components/admin/FotoSocioAdmin";
import { AccionesSocio, CancelarReserva } from "@/components/admin/AccionesSocio";
import { IconoWhatsApp } from "@/components/ui/IconosMarca";

export const metadata = { title: "Ficha del socio" };

const metodo = { mercadopago: "Mercado Pago", efectivo: "Efectivo", transferencia: "Transferencia" };

export default async function FichaSocio({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ficha, { planes }] = await Promise.all([fichaSocio(id), obtenerContenido()]);
  if (!ficha) notFound();
  const { socio: s, fotoUrl, pagos, reservas, accesos } = ficha;
  const plan = planes.find((p) => p.id === s.plan_id)?.nombre ?? s.plan_id;
  const hoy = ahoraMontevideo().fecha;

  return (
    <div className="grid gap-5">
      <Link href="/admin/socios" className="text-sm font-semibold text-agua-700 hover:underline">
        ← Socios
      </Link>

      <section className="flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-suave ring-1 ring-mar-100 sm:flex-row sm:p-6">
        <Avatar nombre={s.nombre_completo} foto={fotoUrl} tam="size-32 sm:size-40 text-3xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-mar-950 sm:text-3xl">{s.nombre_completo}</h1>
            <Insignia estado={s.estado_socio} />
            {s.renovacion_automatica && <span className="rounded-full bg-agua-50 px-2.5 py-0.5 text-xs font-bold text-agua-800 ring-1 ring-agua-200">🔁 Débito automático</span>}
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-mar-500">N.º de socio</dt>
              <dd className="font-semibold tabular-nums">{formatoNumeroSocio(s.numero_socio)}</dd>
            </div>
            <div>
              <dt className="text-mar-500">Cédula</dt>
              <dd className="font-semibold tabular-nums">{formatoCedula(s.cedula)}</dd>
            </div>
            <div>
              <dt className="text-mar-500">Plan</dt>
              <dd className="font-semibold">{plan}</dd>
            </div>
            <div>
              <dt className="text-mar-500">Vence</dt>
              <dd className="font-semibold tabular-nums">{fecha(s.vence_el)}</dd>
            </div>
            <div>
              <dt className="text-mar-500">Nacimiento</dt>
              <dd className="font-semibold tabular-nums">{fecha(s.fecha_nacimiento)}</dd>
            </div>
            <div>
              <dt className="text-mar-500">Socio desde</dt>
              <dd className="font-semibold tabular-nums">{fecha(s.creado_el)}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-mar-500">Contacto</dt>
              <dd className="flex flex-wrap gap-x-4 gap-y-1 font-semibold">
                <a href={`tel:${s.telefono}`} className="inline-flex items-center gap-1 hover:underline">
                  <Phone className="size-4" aria-hidden="true" /> {s.telefono}
                </a>
                <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1 break-all hover:underline">
                  <Mail className="size-4" aria-hidden="true" /> {s.email}
                </a>
                <a href={enlaceWhatsApp(s.telefono.replace(/^0/, "598"))} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-whatsapp-oscuro hover:underline">
                  <IconoWhatsApp className="size-4" /> WhatsApp
                </a>
              </dd>
            </div>
          </dl>
          {s.notas && <p className="mt-3 rounded-2xl bg-sol-50 p-3 text-sm text-sol-900 ring-1 ring-sol-200">📝 {s.notas}</p>}
          <div className="mt-4">
            <AccionesSocio id={s.id} nombre={s.nombre_completo} suspendido={s.suspendido} tieneCarnet={Boolean(s.numero_socio)} />
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Tarjeta titulo="Renovar manualmente">
          <FormularioRenovar socioId={s.id} planes={planes.filter((p) => p.activo)} planActual={s.plan_id} />
        </Tarjeta>
        <Tarjeta titulo="Foto del carnet">
          <FotoSocioAdmin socioId={s.id} />
        </Tarjeta>
      </div>

      <Tarjeta titulo="Historial de pagos">
        {pagos.length === 0 ? (
          <p className="text-mar-600">Sin pagos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-mar-500">
                <tr>
                  <th className="py-2 pr-3 font-semibold">Fecha</th>
                  <th className="py-2 pr-3 font-semibold">Plan</th>
                  <th className="py-2 pr-3 font-semibold">Método</th>
                  <th className="py-2 pr-3 font-semibold">Período</th>
                  <th className="py-2 pr-3 font-semibold">Estado</th>
                  <th className="py-2 text-right font-semibold">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mar-50">
                {pagos.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 pr-3 tabular-nums">{fecha(p.creado_el)}</td>
                    <td className="py-2 pr-3">{planes.find((x) => x.id === p.plan_id)?.nombre ?? p.plan_id}</td>
                    <td className="py-2 pr-3">{metodo[p.metodo]}</td>
                    <td className="py-2 pr-3 tabular-nums">{p.periodo_hasta ? `${fecha(p.periodo_desde)} → ${fecha(p.periodo_hasta)}` : "—"}</td>
                    <td className="py-2 pr-3">
                      <Insignia estado={p.estado} />
                    </td>
                    <td className="py-2 text-right font-semibold tabular-nums">{precioUYU(Number(p.monto))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Tarjeta>

      <div className="grid gap-5 lg:grid-cols-2">
        <Tarjeta titulo="Reservas">
          {reservas.length === 0 ? (
            <p className="text-mar-600">Sin reservas.</p>
          ) : (
            <ul className="divide-y divide-mar-50 text-sm">
              {reservas.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                  <span>
                    <span className="font-semibold text-mar-900">{r.clase}</span>
                    <span className="text-mar-500">
                      {" "}
                      · {fechaCortaDia(r.fecha)} {r.hora}
                    </span>
                  </span>
                  {r.estado === "cancelada" ? (
                    <span className="text-coral-600">Cancelada</span>
                  ) : r.fecha >= hoy ? (
                    <CancelarReserva id={r.id} />
                  ) : (
                    <span className="text-mar-400">Realizada</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
        <Tarjeta titulo="Últimos ingresos al local">
          {accesos.length === 0 ? (
            <p className="text-mar-600">Todavía no registró ingresos.</p>
          ) : (
            <ul className="divide-y divide-mar-50 text-sm">
              {accesos.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="tabular-nums">{fechaYHora(a.creado_el)}</span>
                  <Insignia estado={a.resultado} />
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>

      <Tarjeta titulo="Editar datos">
        <FormularioSocio planes={planes} socio={s} />
      </Tarjeta>
    </div>
  );
}
