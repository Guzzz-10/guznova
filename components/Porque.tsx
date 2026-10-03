import { HandCoins, Handshake, ShieldCheck } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

const puntos = [
  { Icon: ShieldCheck, titulo: "Autos peritados", texto: "Cada unidad pasa por una revisión mecánica y documental de 120 puntos. Vos ves el informe completo antes de decidir." },
  { Icon: HandCoins, titulo: "Financiación a tu medida", texto: "Trabajamos con los principales bancos y financieras para armar un plan que se ajuste a tu bolsillo. Y tomamos tu usado." },
  { Icon: Handshake, titulo: "Acompañamiento real", texto: "Del primer mensaje a la transferencia y después también. Un asesor propio, sin vueltas y sin letra chica." },
];

export function Porque() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-32">
      <SectionHeading eyebrow="Por qué elegirnos" title="Comprar un auto tiene que ser un placer." />
      <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-ink/10 bg-ink/10 md:grid-cols-3">
        {puntos.map(({ Icon, titulo, texto }, i) => (
          <Reveal key={titulo} delay={i * 0.12} className="group bg-paper p-8 md:p-10">
            <Icon strokeWidth={1.25} className="h-9 w-9 text-accent transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1" />
            <h3 className="mt-10 text-xl font-semibold tracking-[-0.03em]">{titulo}</h3>
            <p className="mt-3 leading-relaxed text-mute">{texto}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
