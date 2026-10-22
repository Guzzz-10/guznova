import { IconoWhatsApp } from "@/components/ui/IconosMarca";
import { enlaceWhatsApp } from "@/lib/whatsapp";

export function WhatsAppFab({ numero, mensaje }: { numero: string; mensaje: string }) {
  return (
    <a
      href={enlaceWhatsApp(numero, mensaje)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fab-whatsapp group fixed right-4 bottom-4 z-40 grid size-16 place-items-center rounded-full bg-whatsapp text-white shadow-flotante transition-all duration-300 hover:scale-110 active:scale-95 sm:right-6 sm:bottom-6 print:hidden"
    >
      <span aria-hidden="true" className="absolute inset-0 animate-pulso rounded-full bg-whatsapp" />
      <IconoWhatsApp className="relative size-9" />
      <span className="pointer-events-none absolute right-full mr-3 hidden translate-x-2 rounded-full bg-mar-950 px-4 py-2 text-sm font-semibold whitespace-nowrap opacity-0 shadow-suave transition group-hover:translate-x-0 group-hover:opacity-100 sm:block">
        ¿Hablamos? 👋
      </span>
    </a>
  );
}
