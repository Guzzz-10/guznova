import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { SocialLinks } from "./SocialLinks";
import { CookieSettingsButton } from "./CookieBanner";
import type { Settings } from "@/lib/settings-defaults";
import { NAV } from "@/lib/nav";

const LEGAL = [
  { href: "/privacidad", label: "Política de Privacidad" },
  { href: "/terminos", label: "Términos y Condiciones" },
  { href: "/cookies", label: "Política de Cookies" },
];

export function Footer({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-white/5 bg-ink-950">
      <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-ink-400">
            Autos usados seleccionados, revisados y listos para transferir. Atención personalizada en {settings.city}.
          </p>
          <SocialLinks settings={settings} />
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold text-white">Navegación</h2>
          <ul className="space-y-2.5 text-sm">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-ink-400 transition hover:text-nova-400">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold text-white">Contacto</h2>
          <ul className="space-y-3 text-sm text-ink-400">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-nova-500" aria-hidden />
              <span>
                {settings.address}, {settings.city}
              </span>
            </li>
            {settings.phone && (
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-nova-500" aria-hidden />
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-white">
                  {settings.phone}
                </a>
              </li>
            )}
            {settings.email && (
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-nova-500" aria-hidden />
                <a href={`mailto:${settings.email}`} className="break-all hover:text-white">
                  {settings.email}
                </a>
              </li>
            )}
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-nova-500" aria-hidden />
              <span className="whitespace-pre-line">{settings.hours}</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold text-white">Legal</h2>
          <ul className="space-y-2.5 text-sm">
            {LEGAL.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-ink-400 transition hover:text-nova-400">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <CookieSettingsButton />
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="container flex flex-col gap-2 py-6 pb-24 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
          <p>
            © {year} {settings.businessName}. Todos los derechos reservados.
          </p>
          <p>
            {settings.legalName} · RUT {settings.rut}
          </p>
        </div>
      </div>
    </footer>
  );
}
