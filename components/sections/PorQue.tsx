import { ClipboardCheck, Handshake, ShieldCheck } from "lucide-react";
import { Counter } from "../ui/Counter";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

const puntos = [
  {
    icon: ShieldCheck,
    titulo: "Historial verificado",
    texto: "Revisamos titularidad, multas, kilometraje y service de cada unidad antes de que llegue a la vidriera.",
  },
  {
    icon: ClipboardCheck,
    titulo: "Revisión de 120 puntos",
    texto: "Mecánica, electrónica, carrocería e interior. Si algo no está a la altura, lo resolvemos o no lo vendemos.",
  },
  {
    icon: Handshake,
    titulo: "Trato sin vueltas",
    texto: "Te asesoramos, tomamos tu usado en parte de pago y te acompañamos también después de la entrega.",
  },
];

const stats = [
  { to: 15, suffix: "", label: "años de experiencia" },
  { to: 2400, suffix: "+", label: "autos vendidos" },
  { to: 1800, suffix: "+", label: "clientes felices" },
];

export function PorQue() {
  return (
    <section id="nosotros" className="scroll-mt-16 border-t border-line py-24 md:py-40">
      <div className="container-x">
        <SectionHeading
          kicker="Por qué elegirnos"
          lines={["Comprar un auto", "tiene que ser un placer."]}
        />

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {puntos.map((p, i) => (
            <Reveal key={p.titulo} delay={i * 0.12} className="bg-bg p-8 md:p-10">
              <p.icon className="h-7 w-7 text-accent" strokeWidth={1.1} />
              <h3 className="mt-10 text-xl font-medium tracking-tight">{p.titulo}</h3>
              <p className="mt-3 leading-relaxed text-muted">{p.texto}</p>
            </Reveal>
          ))}
        </div>

        <dl className="mt-20 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <dt className="order-2 mt-3 text-sm text-muted">{s.label}</dt>
              <dd className="display text-[clamp(3.5rem,8vw,6.5rem)] tabular-nums">
                <Counter to={s.to} suffix={s.suffix} />
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
