import Link from "next/link";
import { AlertTriangle, CalendarCheck, DoorOpen, ScanLine, UserPlus, UserRoundCheck, UserRoundX, Wallet } from "lucide-react";
import { estadisticas } from "@/lib/admin/datos";
import { obtenerContenido } from "@/lib/contenido/obtener";
import { fechaTexto, precioUYU, fecha } from "@/lib/formato";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { GraficoBarras, GraficoColumnas } from "@/components/admin/Graficos";
import { BannerEjemplo } from "@/components/admin/BannerEjemplo";
import { IconoWhatsApp } from "@/components/ui/IconosMarca";

export const metadata = { title: "Dashboard" };

const mesCorto = (m: string) => new Date(`${m}-15T12:00:00Z`).toLocaleDateString("es-UY", { month: "short" }).replace(".", "");
const mesLargo = (m: string) => new Date(`${m}-15T12:00:00Z`).toLocaleDateString("es-UY", { month: "long", year: "numeric" });

function Indicador({ etiqueta, valor, Icono, href, tono }: { etiqueta: string; valor: string; Icono: typeof Wallet; href: string; tono: string }) {
  return (
    <Link href={href} className="group rounded-3xl bg-white p-4 shadow-suave ring-1 ring-mar-100 transition hover:-translate-y-0.5 hover:ring-agua-300 sm:p-5">
      <span className={`grid size-10 place-items-center rounded-2xl ${tono}`}>
        <Icono className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-3 text-sm text-mar-600">{etiqueta}</p>
      <p className="text-2xl font-bold text-mar-950 sm:text-3xl">{valor}</p>
    </Link>
  );
}

export default async function Dashboard() {
  const [e, contenido] = await Promise.all([estadisticas(), obtenerContenido()]);
  const nombrePlan = (id: string) => contenido.planes.find((p) => p.id === id)?.nombre ?? id;
  const hora = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/Montevideo" }));
  const saludo = hora < 12 ? "¡Buen día!" : hora < 20 ? "¡Buenas tardes!" : "¡Buenas noches!";

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-mar-950">{saludo}</h1>
          <p className="text-mar-600 first-letter:uppercase">{fechaTexto(new Date())} · Así viene {contenido.negocio.nombre} hoy.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/ingresos" className="btn btn-agua btn-chico">
            <ScanLine className="size-4" aria-hidden="true" /> Escanear QR
          </Link>
          <Link href="/admin/socios/nuevo" className="btn btn-claro btn-chico">
            <UserPlus className="size-4" aria-hidden="true" /> Nuevo socio
          </Link>
          <Link href="/admin/pagos#registrar" className="btn btn-claro btn-chico">
            <Wallet className="size-4" aria-hidden="true" /> Registrar pago
          </Link>
        </div>
      </div>

      {contenido.usaEjemplo && <BannerEjemplo />}

      <section aria-label="Resumen" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Indicador etiqueta="Socios activos" valor={String(e.activos)} Icono={UserRoundCheck} href="/admin/socios?estado=activo" tono="bg-emerald-100 text-emerald-700" />
        <Indicador etiqueta="Socios vencidos" valor={String(e.vencidos)} Icono={UserRoundX} href="/admin/socios?estado=vencido" tono="bg-red-100 text-red-700" />
        <Indicador etiqueta="Ingresos del mes" valor={precioUYU(Number(e.ingresos_mes))} Icono={Wallet} href="/admin/pagos" tono="bg-agua-100 text-agua-800" />
        <Indicador etiqueta="Reservas de hoy" valor={String(e.reservas_hoy)} Icono={CalendarCheck} href="/admin/clases" tono="bg-sol-100 text-sol-800" />
        <Indicador etiqueta="Entradas al local hoy" valor={String(e.accesos_hoy)} Icono={DoorOpen} href="/admin/ingresos" tono="bg-mar-100 text-mar-700" />
      </section>

      <section aria-labelledby="t-alertas" className="rounded-3xl bg-white p-5 shadow-suave ring-1 ring-mar-100 sm:p-6">
        <h2 id="t-alertas" className="flex items-center gap-2 text-lg font-bold text-mar-900">
          <AlertTriangle className="size-5 text-sol-600" aria-hidden="true" /> Vencen en los próximos 7 días
          <span className="rounded-full bg-sol-100 px-2.5 py-0.5 text-sm text-sol-900">{e.vencen_pronto.length}</span>
        </h2>
        {e.vencen_pronto.length === 0 ? (
          <p className="mt-3 text-mar-600">Nadie vence esta semana. 🎉</p>
        ) : (
          <ul className="mt-4 divide-y divide-mar-100">
            {e.vencen_pronto.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <Link href={`/admin/socios/${s.id}`} className="min-w-0 hover:underline">
                  <span className="block font-semibold text-mar-900">{s.nombre}</span>
                  <span className="text-sm text-mar-500">
                    N.º {s.numero ?? "—"} · {nombrePlan(s.plan)} · vence {fecha(s.vence_el)}
                  </span>
                </Link>
                {s.renovacion_automatica ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">🔁 Se renueva solo</span>
                ) : (
                  <a
                    href={enlaceWhatsApp(
                      s.telefono.replace(/^0/, "598"),
                      `¡Hola ${s.nombre.split(" ")[0]}! Te escribimos de ${contenido.negocio.nombre}: tu plan vence el ${fecha(s.vence_el)}. Podés renovarlo desde Mi Carnet en la web o en recepción. ¡Te esperamos! 🏊`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp btn-chico"
                  >
                    <IconoWhatsApp className="size-4" /> Recordarle
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <GraficoColumnas
          titulo="Ingresos por mes"
          subtitulo="Pagos aprobados de los últimos 12 meses, en pesos"
          datos={e.serie_ingresos.map((x) => ({ etiqueta: mesCorto(x.mes), etiquetaLarga: mesLargo(x.mes), valor: Number(x.total) }))}
          unidad="pesos"
          color="#0b8ba0"
        />
        <GraficoColumnas
          titulo="Altas de socios por mes"
          subtitulo="Socios nuevos con su primer pago confirmado"
          datos={e.serie_altas.map((x) => ({ etiqueta: mesCorto(x.mes), etiquetaLarga: mesLargo(x.mes), valor: Number(x.total) }))}
          color="#1f7fd8"
        />
      </div>
      <GraficoBarras
        titulo="Clases más reservadas"
        subtitulo="Reservas de los últimos 30 días y las próximas"
        datos={e.top_clases.map((c) => ({ etiqueta: c.nombre, valor: Number(c.total) }))}
        vacio="Todavía no hay reservas de clases."
      />
    </div>
  );
}
