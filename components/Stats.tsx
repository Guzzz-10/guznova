import { Reveal } from "./ui/Reveal";
import { Counter } from "./ui/Counter";

const stats = [
  { to: 18, suffix: "", label: "años de experiencia" },
  { to: 2400, suffix: "+", label: "autos vendidos" },
  { to: 1900, suffix: "+", label: "clientes felices" },
];

export function Stats() {
  return (
    <section id="nosotros" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20 md:px-8 md:py-28">
      <div className="grid grid-cols-1 gap-10 border-y border-ink/10 py-12 sm:grid-cols-3 sm:gap-6">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.1}>
            <p className="text-6xl font-semibold tracking-[-0.05em] md:text-7xl">
              <Counter to={s.to} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-sm text-mute">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
