import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Camera, Handshake, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Counter, Reveal, Stagger, StaggerItem } from "@/components/ui/Motion";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Conocé la historia de AutoNova, nuestros valores y nuestro local.",
  alternates: { canonical: "/nosotros" },
};

const VALUES = [
  { Icon: ShieldCheck, title: "Transparencia", text: "Te contamos todo sobre cada auto: historial, estado y documentación. Sin letra chica." },
  { Icon: HeartHandshake, title: "Cercanía", text: "Atención personalizada, antes y después de la compra. Siempre vas a tener con quién hablar." },
  { Icon: Sparkles, title: "Calidad", text: "Seleccionamos y revisamos cada vehículo para que te lleves un auto en el que puedas confiar." },
  { Icon: Handshake, title: "Compromiso", text: "Cumplimos lo que prometemos: precios claros, plazos reales y trámites en regla." },
];

// Fotos del local: reemplazar estos placeholders por fotos reales.
const PHOTOS = [
  { title: "Nuestro showroom", className: "sm:col-span-2 sm:row-span-2", gradient: "from-nova-500/30 via-ink-800 to-ink-900" },
  { title: "Área de revisión mecánica", className: "", gradient: "from-indigo-500/25 via-ink-800 to-ink-900" },
  { title: "Entrega de unidades", className: "", gradient: "from-emerald-500/20 via-ink-800 to-ink-900" },
];

export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader
        eyebrow="Nosotros"
        title="Una automotora hecha a la medida de la gente"
        description={`Desde hace más de ${settings.statsYears} años ayudamos a familias y emprendedores de ${settings.city} a encontrar su auto.`}
      />

      <section className="pb-16 sm:pb-24">
        <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal className="space-y-5 text-ink-300 leading-relaxed">
            <h2 className="text-3xl font-bold text-white">Nuestra historia</h2>
            <p>
              AutoNova nació con una idea simple: que comprar un auto usado sea una experiencia tranquila y transparente.
              Empezamos como un pequeño emprendimiento familiar con pocas unidades y mucha dedicación.
            </p>
            <p>
              Con el tiempo crecimos gracias a la recomendación de nuestros clientes. Hoy contamos con un local propio,
              un equipo de revisión mecánica y alianzas con financieras para ofrecer cuotas accesibles.
            </p>
            <p>
              Lo que no cambió es nuestra forma de trabajar: cada auto que publicamos es uno que nosotros mismos
              compraríamos.
            </p>
            <dl className="grid grid-cols-3 gap-4 pt-4">
              {[
                { to: Number(settings.statsCarsSold) || 0, prefix: "+", label: "autos vendidos" },
                { to: Number(settings.statsYears) || 0, label: "años de experiencia" },
                { to: Number(settings.statsClients) || 0, suffix: "%", label: "clientes satisfechos" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col rounded-2xl border border-white/5 bg-ink-850 p-4">
                  <dt className="text-xs text-ink-400">{s.label}</dt>
                  <dd className="order-first font-display text-2xl font-bold text-white sm:text-3xl">
                    <Counter to={s.to} prefix={s.prefix} suffix={s.suffix} />
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Stagger className="grid auto-rows-[160px] gap-4 sm:grid-cols-2 sm:auto-rows-[180px]">
            {PHOTOS.map((p) => (
              <StaggerItem key={p.title} className={p.className}>
                <figure
                  className={`group relative flex h-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${p.gradient}`}
                >
                  <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
                  <Camera className="relative h-8 w-8 text-white/40 transition group-hover:scale-110" aria-hidden />
                  <figcaption className="relative mt-2 text-sm font-medium text-white/70">{p.title}</figcaption>
                  <span className="relative mt-1 text-[11px] text-white/40">Foto del local (placeholder)</span>
                </figure>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section bg-ink-900/40">
        <div className="container">
          <Reveal className="mb-12 text-center">
            <p className="eyebrow">Nuestros valores</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Lo que nos define</h2>
          </Reveal>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ Icon, title, text }) => (
              <StaggerItem key={title} className="h-full">
                <div className="card-surface h-full p-6">
                  <Icon className="h-8 w-8 text-nova-400" aria-hidden />
                  <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-400">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-12 text-center">
            <Link href="/autos" className="btn-primary group">
              Ver autos disponibles <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
