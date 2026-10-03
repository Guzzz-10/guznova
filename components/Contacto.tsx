"use client";

import { MapPin, Clock, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { SITE, waLink } from "@/lib/site";
import { Button } from "./ui/Button";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

const field = "w-full rounded-xl border border-ink/12 bg-white px-4 py-3.5 text-base outline-none transition-colors duration-300 placeholder:text-ink/35 focus:border-ink";

export function Contacto() {
  const [f, setF] = useState({ nombre: "", tel: "", msg: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const texto = `Hola GuzNova! Soy ${f.nombre}${f.tel ? ` (${f.tel})` : ""}. ${f.msg}`;
    window.open(waLink(texto), "_blank", "noopener,noreferrer");
  };

  const info = [
    { Icon: MapPin, t: SITE.direccion },
    { Icon: Clock, t: SITE.horario },
    { Icon: Phone, t: SITE.telefono },
    { Icon: Mail, t: SITE.email },
  ];

  return (
    <section id="contacto" className="mx-auto grid max-w-7xl scroll-mt-16 gap-14 px-5 pb-24 md:px-8 md:pb-32 lg:grid-cols-2 lg:gap-24">
      <div>
        <SectionHeading eyebrow="Contacto" title="Vení a conocernos. O escribinos.">
          Un café, un test drive y la tranquilidad de comprar con gente de confianza.
        </SectionHeading>
        <ul className="mt-10 space-y-5">
          {info.map(({ Icon, t }, i) => (
            <Reveal as="li" key={t} delay={i * 0.07} className="flex items-center gap-4 text-mute">
              <Icon strokeWidth={1.25} className="h-5 w-5 text-accent" /> <span className="text-ink">{t}</span>
            </Reveal>
          ))}
        </ul>
      </div>

      <Reveal delay={0.1}>
        <form onSubmit={submit} className="space-y-4 rounded-3xl border border-ink/10 bg-white p-6 md:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <input required value={f.nombre} onChange={set("nombre")} className={field} placeholder="Tu nombre" aria-label="Nombre" autoComplete="name" />
            <input value={f.tel} onChange={set("tel")} className={field} placeholder="Teléfono" aria-label="Teléfono" type="tel" autoComplete="tel" />
          </div>
          <textarea required value={f.msg} onChange={set("msg")} className={`${field} min-h-36 resize-none`} placeholder="Contanos qué auto buscás" aria-label="Mensaje" />
          <Button type="submit">Enviar por WhatsApp</Button>
        </form>
      </Reveal>
    </section>
  );
}
