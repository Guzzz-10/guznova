import { HashLink } from "./ui/HashLink";
import { SITE } from "@/lib/site";

const cols = [
  {
    title: "Explorar",
    items: [
      ["Destacados", "/#destacados"],
      ["Catálogo", "/#catalogo"],
      ["Financiación", "/#financiacion"],
      ["Nosotros", "/#nosotros"],
    ],
  },
  {
    title: "Contacto",
    items: [
      [SITE.telefono, `tel:${SITE.telefono.replace(/[^+\d]/g, "")}`],
      [SITE.email, `mailto:${SITE.email}`],
      [SITE.instagram, "https://instagram.com"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="overflow-hidden border-t border-line">
      <div className="container-x pt-16 md:pt-24">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-2xl font-semibold tracking-[-0.04em]">
              Guz<span className="text-accent">Nova</span>
            </p>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-muted">
              Autos seleccionados, atención de persona a persona. Desde Rosario para toda la región.
            </p>
            <p className="mt-6 text-sm text-muted">
              {SITE.direccion}
              <br />
              {SITE.horarios[0]}
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted">{c.title}</p>
              <ul className="mt-5 space-y-3">
                {c.items.map(([label, href]) => (
                  <li key={label}>
                    <HashLink
                      href={href}
                      className="text-[15px] text-fg/80 transition-colors duration-500 hover:text-accent"
                    >
                      {label}
                    </HashLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-line py-6 text-xs text-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.nombre} Automotora. Todos los derechos reservados.</p>
          <p>Sitio de demostración · Precios y unidades de ejemplo.</p>
        </div>
      </div>

      <p
        aria-hidden
        className="pointer-events-none select-none whitespace-nowrap text-center text-[26vw] font-semibold leading-[0.78] tracking-[-0.06em] text-white/[0.03] sm:text-[20vw]"
      >
        GuzNova
      </p>
    </footer>
  );
}
