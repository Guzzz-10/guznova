import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

const items = [
  {
    texto: "Fui con miedo a comprar un usado y salí con el auto que soñaba. Me mostraron todo el historial y no me apuraron en ningún momento.",
    nombre: "Martín R.",
    meta: "Audi RS5 · Rosario",
  },
  {
    texto: "Tomaron mi camioneta en parte de pago a un precio justo y la financiación salió en el día. Trato excelente, de principio a fin.",
    nombre: "Lucía y Federico",
    meta: "Toyota Hilux · Funes",
  },
  {
    texto: "Pasaron dos años y siguen preguntando cómo anda el auto. Eso hoy no se ve. Se nota que les importa de verdad.",
    nombre: "Carolina S.",
    meta: "Tesla Model 3 · Pérez",
  },
];

export function Testimonios() {
  return (
    <section className="border-t border-line py-24 md:py-40">
      <div className="container-x">
        <SectionHeading kicker="Testimonios" lines={["Lo dicen quienes", "ya se llevaron el suyo."]} />
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t.nombre} delay={i * 0.12}>
              <figure className="flex h-full flex-col justify-between rounded-2xl border border-line bg-surface p-8">
                <blockquote className="text-[17px] leading-relaxed text-fg/90">
                  <span className="mb-4 block text-4xl leading-none text-accent">“</span>
                  {t.texto}
                </blockquote>
                <figcaption className="mt-10 border-t border-line pt-5">
                  <p className="font-medium">{t.nombre}</p>
                  <p className="mt-0.5 text-sm text-muted">{t.meta}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
