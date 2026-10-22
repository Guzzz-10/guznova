import { Mail, Phone } from "lucide-react";
import type { ContenidoContacto, ContenidoWhatsApp } from "@/lib/contenido/tipos";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { IconoWhatsApp } from "@/components/ui/IconosMarca";
import { Ola } from "@/components/ui/Ola";
import { PelotaPlaya, Salvavidas, SolSonriente } from "@/components/ui/Decoracion";

type Props = { contacto: ContenidoContacto; whatsapp: ContenidoWhatsApp; nombre: string; telefono: string; email: string };

export function Consultas({ contacto, whatsapp, nombre, telefono, email }: Props) {
  return (
    <section id="contacto" aria-labelledby="titulo-contacto" className="relative bg-mar-950">
      <Ola className="text-sol-300" variante={2} />
      <div className="relative overflow-hidden bg-gradient-to-b from-sol-300 via-sol-200 to-coral-200 pt-12 pb-36 sm:pb-44">
        <SolSonriente className="absolute top-6 right-[6%] size-20 animate-flotar sm:size-28" />
        <Salvavidas className="absolute bottom-40 -left-6 hidden size-28 animate-flotar [animation-delay:-2s] md:block" style={{ "--giro": "18deg" } as React.CSSProperties} />
        <PelotaPlaya className="absolute right-[12%] bottom-44 hidden size-16 animate-flotar [animation-delay:-4s] md:block" />

        <div className="contenedor relative text-center">
          <p data-reveal className="chip bg-white/70 text-mar-900 ring-1 ring-white">💬 Consultas</p>
          <h2 id="titulo-contacto" data-reveal className="mt-4 font-display text-5xl leading-none font-bold text-mar-950 sm:text-6xl">
            {contacto.titulo}
            <br />
            <span className="text-coral-600">{contacto.destacado}</span>
          </h2>
          <p data-reveal className="mx-auto mt-5 max-w-xl text-lg text-mar-900">
            {contacto.subtitulo}
          </p>

          <div data-reveal className="mt-9">
            <a
              href={enlaceWhatsApp(whatsapp.numero, `¡Hola ${nombre}! ${whatsapp.mensajeGeneral}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp px-8 py-5 text-2xl sm:px-12"
            >
              <IconoWhatsApp className="size-8" /> Abrir WhatsApp
            </a>
          </div>

          <div data-reveal className="mt-10">
            <p className="text-sm font-bold tracking-wider text-mar-800 uppercase">O elegí un tema</p>
            <ul className="mt-4 flex flex-wrap justify-center gap-3">
              {whatsapp.temas.map((t) => (
                <li key={t.label}>
                  <a
                    href={enlaceWhatsApp(whatsapp.numero, t.mensaje)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-display text-lg font-semibold text-mar-900 shadow-suave transition duration-300 hover:-translate-y-1 hover:rotate-[-2deg] hover:bg-mar-900 hover:text-white"
                  >
                    <span aria-hidden="true">{t.emoji}</span> {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <p data-reveal className="mt-10 flex flex-col items-center justify-center gap-3 text-mar-900 sm:flex-row sm:gap-6">
            <a href={`tel:${telefono.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 font-semibold hover:text-coral-700">
              <Phone className="size-5" aria-hidden="true" /> {telefono}
            </a>
            <a href={`mailto:${email}`} className="inline-flex items-center gap-2 font-semibold hover:text-coral-700">
              <Mail className="size-5" aria-hidden="true" /> {email}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
