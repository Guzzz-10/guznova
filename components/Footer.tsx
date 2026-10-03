import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="overflow-hidden bg-ink text-white">
      <div className="mx-auto max-w-7xl px-5 pt-16 md:px-8 md:pt-24">
        <div className="grid gap-10 text-sm sm:grid-cols-3">
          <p className="max-w-xs text-white/60">Autos seleccionados, atención sin vueltas. Rosario, Santa Fe.</p>
          <ul className="space-y-2.5 text-white/60">
            {[["Destacados", "destacados"], ["Catálogo", "catalogo"], ["Financiación", "financiacion"], ["Contacto", "contacto"]].map(([l, id]) => (
              <li key={id}><a href={`/#${id}`} className="transition-colors hover:text-white">{l}</a></li>
            ))}
          </ul>
          <div className="space-y-2.5 text-white/60">
            <p>{SITE.direccion}</p><p>{SITE.horario}</p><p>{SITE.email}</p>
          </div>
        </div>
        <p aria-hidden className="mt-16 -mb-[0.14em] text-[clamp(4rem,19vw,18rem)] leading-none font-semibold tracking-[-0.06em] text-white/[0.07] select-none">
          GuzNova
        </p>
      </div>
      <div className="border-t border-white/10 px-5 py-6 text-xs text-white/40 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 sm:flex-row">
          <span>© {new Date().getFullYear()} {SITE.nombre}. Todos los derechos reservados.</span>
          <span>Sitio demo · Fotos de Unsplash</span>
        </div>
      </div>
    </footer>
  );
}
