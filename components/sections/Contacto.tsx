"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { SITE, waLink } from "@/lib/site";
import { Button } from "../ui/Button";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

const field =
  "w-full border-0 border-b border-line bg-transparent py-3 text-[17px] outline-none transition-colors duration-500 placeholder:text-muted/70 focus:border-accent";

export function Contacto() {
  const [nombre, setNombre] = useState("");
  const [interes, setInteres] = useState("");
  const [mensaje, setMensaje] = useState("");

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const texto = `Hola GuzNova! Soy ${nombre || "un cliente"}.${interes ? ` Me interesa: ${interes}.` : ""} ${mensaje}`.trim();
    window.open(waLink(texto), "_blank", "noopener,noreferrer");
  };

  const info = [
    { icon: MapPin, label: SITE.direccion },
    { icon: Clock, label: SITE.horarios.join(" · ") },
    { icon: Phone, label: SITE.telefono },
    { icon: Mail, label: SITE.email },
  ];

  return (
    <section id="contacto" className="scroll-mt-16 border-t border-line py-24 md:py-40">
      <div className="container-x grid gap-16 lg:grid-cols-2 lg:gap-24">
        <div>
          <SectionHeading
            kicker="Contacto"
            lines={["Vení a conocernos,", "o escribinos."]}
            sub="Te respondemos en el día. Si preferís, pasá por el salón y tomamos unos mates mientras mirás los autos."
          />
          <ul className="mt-12 space-y-5">
            {info.map(({ icon: Icon, label }, i) => (
              <Reveal key={label} delay={i * 0.07}>
                <li className="flex items-start gap-4 text-[15px] text-fg/80">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.25} />
                  {label}
                </li>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={0.1}>
          <form onSubmit={enviar} className="space-y-7 rounded-3xl border border-line bg-surface p-7 sm:p-10">
            <div>
              <label htmlFor="nombre" className="sr-only">Nombre</label>
              <input id="nombre" className={field} placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div>
              <label htmlFor="interes" className="sr-only">Auto de interés</label>
              <input id="interes" className={field} placeholder="¿Qué auto te interesa?" value={interes} onChange={(e) => setInteres(e.target.value)} />
            </div>
            <div>
              <label htmlFor="mensaje" className="sr-only">Mensaje</label>
              <textarea id="mensaje" rows={3} className={`${field} resize-none`} placeholder="Contanos qué estás buscando" value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
            </div>
            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted">Se abre WhatsApp con tu mensaje listo para enviar.</p>
              <Button type="submit">Enviar consulta</Button>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
