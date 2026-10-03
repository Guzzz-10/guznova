import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

const items = [
  { q: "Fui con dudas y me fui con el auto que quería, en el precio que podía pagar. Todo clarísimo, cero presión.", n: "Martín R.", l: "Fisherton", a: "Audi A4" },
  { q: "Me tomaron mi usado a un valor justo y la financiación salió en un día. Se nota que les importa el cliente.", n: "Lucía F.", l: "Funes", a: "Toyota Hilux" },
  { q: "Ya es el segundo auto que le compro a GuzNova. Me avisaron cada paso de la transferencia. Recomendadísimos.", n: "Familia Benítez", l: "Roldán", a: "VW Amarok" },
];

export function Testimonios() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <SectionHeading eyebrow="Testimonios" title="Lo que dicen quienes ya manejan su GuzNova." />
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {items.map((t, i) => (
          <Reveal key={t.n} delay={i * 0.12} className="flex flex-col justify-between rounded-3xl border border-ink/10 bg-white p-8">
            <blockquote className="text-lg leading-relaxed tracking-[-0.01em]">“{t.q}”</blockquote>
            <figcaption className="mt-10 border-t border-ink/10 pt-5 text-sm">
              <span className="font-medium">{t.n}</span>
              <span className="text-mute"> · {t.l} · {t.a}</span>
            </figcaption>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
