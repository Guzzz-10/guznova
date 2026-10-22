import Link from "next/link";
import { Camera, Check, ClipboardList, CreditCard, FileCheck, IdCard, MousePointerClick } from "lucide-react";
import type { Plan } from "@/lib/contenido/tipos";
import { precioUYU } from "@/lib/formato";
import { Encabezado } from "@/components/ui/Encabezado";
import { Burbujas } from "@/components/ui/Burbujas";

const pasos = [
  { Icono: MousePointerClick, titulo: "Elegí tu plan", texto: "El que mejor te quede." },
  { Icono: ClipboardList, titulo: "Completá tus datos", texto: "Nombre, cédula y contacto." },
  { Icono: Camera, titulo: "Subí tu foto", texto: "Tipo carnet, la recortás ahí mismo." },
  { Icono: FileCheck, titulo: "Aceptá los términos", texto: "Y la política de privacidad." },
  { Icono: CreditCard, titulo: "Pagá online", texto: "Con Mercado Pago, se renueva solo cada mes." },
];

const estilos = {
  agua: { icono: "bg-agua-100 text-agua-700", check: "text-agua-600", boton: "btn-agua" },
  coral: { icono: "bg-coral-100 text-coral-600", check: "text-coral-500", boton: "btn-coral" },
  sol: { icono: "bg-sol-100 text-sol-700", check: "text-sol-600", boton: "btn-sol" },
};
const emojiColor = { agua: "🏊", coral: "🚀", sol: "👨‍👩‍👧‍👦" };

export function Suscripcion({ planes }: { planes: Plan[] }) {
  return (
    <section id="suscripcion" aria-labelledby="titulo-suscripcion" className="relative overflow-hidden bg-gradient-to-b from-mar-800 via-mar-900 to-mar-950 pt-6 pb-28 text-white">
      <Burbujas cantidad={6} opacidad={0.25} />
      <div aria-hidden="true" className="absolute top-40 -left-32 size-96 rounded-full bg-agua-500/20 blur-3xl" />
      <div aria-hidden="true" className="absolute right-0 bottom-20 size-96 rounded-full bg-coral-500/15 blur-3xl" />

      <div className="contenedor relative">
        <Encabezado
          id="titulo-suscripcion"
          claro
          etiqueta="💳 Suscripción mensual"
          titulo={
            <>
              Elegí tu plan y <span className="text-sol-300">tirate al agua</span>
            </>
          }
          bajada="Pagás mes a mes con Mercado Pago y la renovación es automática: te olvidás de hacer filas. Tu carnet digital se genera al instante."
        />

        <ul className={`mt-14 grid items-center gap-6 lg:gap-5 ${planes.length >= 3 ? "lg:grid-cols-3" : planes.length === 2 ? "mx-auto max-w-3xl md:grid-cols-2" : "mx-auto max-w-md"}`}>
          {planes.map((p, i) => {
            const e = estilos[p.color];
            return (
              <li
                key={p.id}
                data-reveal
                style={{ "--retraso": `${i * 120}ms` } as React.CSSProperties}
                className={`relative ${p.destacado ? "order-first lg:order-none lg:-my-4" : ""}`}
              >
                {p.etiqueta && (
                  <span className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-sol-300 px-4 py-1.5 font-display text-sm font-bold whitespace-nowrap text-mar-950 shadow-suave">
                    ⭐ {p.etiqueta}
                  </span>
                )}
                <article
                  className={`flex h-full flex-col rounded-4xl bg-white p-7 text-mar-950 transition duration-300 hover:-translate-y-2 ${
                    p.destacado ? "shadow-[0_30px_80px_-20px_rgb(242_86_63_/_0.55)] ring-4 ring-coral-400 lg:py-10" : "shadow-flotante"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className={`grid size-12 place-items-center rounded-2xl text-2xl ${e.icono}`}>
                      {emojiColor[p.color]}
                    </span>
                    <div>
                      <h3 className="font-display text-2xl font-bold">{p.nombre}</h3>
                      <p className="text-sm text-mar-600">{p.bajada}</p>
                    </div>
                  </div>
                  <p className="mt-6 flex items-baseline gap-1">
                    <span className="font-display text-5xl font-bold tracking-tight">{precioUYU(p.precio)}</span>
                    <span className="font-semibold text-mar-500">/mes</span>
                  </p>
                  <p className="text-xs text-mar-500">Pesos uruguayos, IVA incluido.</p>
                  <ul className="mt-6 grid gap-3">
                    {p.incluye.map((x) => (
                      <li key={x} className="flex gap-2.5">
                        <Check className={`mt-0.5 size-5 shrink-0 ${e.check}`} strokeWidth={3} aria-hidden="true" />
                        <span className="text-mar-800">{x}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/hacete-socio?plan=${p.id}`} className={`btn ${p.destacado ? "btn-coral" : e.boton} mt-8 w-full`}>
                    Quiero este plan
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>

        <div className="mt-20" data-reveal>
          <h3 className="text-center font-display text-3xl font-bold sm:text-4xl">Hacerte socio es así de fácil</h3>
          <ol className="relative mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            <div aria-hidden="true" className="absolute top-8 right-[10%] left-[10%] hidden h-1 rounded-full bg-gradient-to-r from-agua-400 via-sol-300 to-coral-400 lg:block" />
            {pasos.map(({ Icono, titulo, texto }, i) => (
              <li key={titulo} data-reveal style={{ "--retraso": `${i * 120}ms` } as React.CSSProperties} className="relative flex items-start gap-4 lg:flex-col lg:items-center lg:text-center">
                <span className="relative grid size-16 shrink-0 place-items-center rounded-3xl bg-white text-mar-900 shadow-flotante">
                  <Icono className="size-7" aria-hidden="true" />
                  <span className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-coral-500 font-display text-sm font-bold text-white ring-4 ring-mar-900">{i + 1}</span>
                </span>
                <div>
                  <p className="font-display text-xl font-semibold">{titulo}</p>
                  <p className="text-mar-200">{texto}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 font-semibold text-agua-100 ring-1 ring-white/15">
              <IdCard className="size-5 text-sol-300" aria-hidden="true" /> Al confirmarse el pago, tu carnet digital aparece en “Mi Carnet”.
            </p>
            <Link href="/hacete-socio" className="btn btn-sol text-xl">
              Empezar ahora 🚀
            </Link>
            <p className="text-sm text-mar-300">
              ¿Ya sos socio?{" "}
              <Link href="/mi-carnet" className="font-semibold text-white underline underline-offset-4 hover:text-sol-300">
                Entrá a Mi Carnet
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
