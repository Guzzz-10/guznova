/*
 * ⚠️ PLANTILLA LEGAL: esta Política de Cookies es un modelo y debe ser revisada por un
 * profesional. Si en el futuro se agregan herramientas de analítica o publicidad
 * (Google Analytics, Meta Pixel, etc.), hay que actualizar la tabla y cargarlas solo
 * cuando el visitante acepte las cookies.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/site/LegalPage";
import { CookieSettingsButton } from "@/components/site/CookieBanner";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Qué cookies usa el sitio de AutoNova y cómo podés gestionarlas.",
  alternates: { canonical: "/cookies" },
};

const COOKIES = [
  { name: "autonova_consent", type: "Propia · necesaria", purpose: "Recordar si aceptaste o rechazaste las cookies opcionales.", duration: "6 meses" },
  { name: "autonova_session", type: "Propia · necesaria", purpose: "Mantener iniciada la sesión del panel de administración (solo personal autorizado).", duration: "7 días" },
  { name: "Cookies de Google Maps", type: "De terceros · opcional", purpose: "Mostrar el mapa interactivo en la página de Contacto. Solo se cargan si aceptás.", duration: "Según Google" },
];

export default async function CookiesPage() {
  const s = await getSettings();
  return (
    <LegalPage title="Política de Cookies" description="Qué son las cookies, cuáles usamos y cómo podés gestionarlas.">
      <h2>1. ¿Qué son las cookies?</h2>
      <p>
        Las cookies son pequeños archivos que un sitio web guarda en tu navegador para recordar información sobre tu visita, como tus
        preferencias.
      </p>

      <h2>2. Cookies que usamos</h2>
      <p>
        {s.businessName} usa muy pocas cookies. <strong>No usamos cookies de publicidad ni de seguimiento.</strong>
      </p>
      <div className="not-prose -mx-4 mb-6 overflow-x-auto px-4">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-ink-300">
              <th className="py-3 pr-4 font-semibold">Cookie</th>
              <th className="py-3 pr-4 font-semibold">Tipo</th>
              <th className="py-3 pr-4 font-semibold">Finalidad</th>
              <th className="py-3 font-semibold">Duración</th>
            </tr>
          </thead>
          <tbody>
            {COOKIES.map((c) => (
              <tr key={c.name} className="border-b border-white/5 align-top">
                <td className="py-3 pr-4 font-mono text-xs text-white">{c.name}</td>
                <td className="py-3 pr-4">{c.type}</td>
                <td className="py-3 pr-4">{c.purpose}</td>
                <td className="py-3">{c.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>3. Tu consentimiento</h2>
      <p>
        Al ingresar al sitio te mostramos un aviso para que aceptes o rechaces las cookies opcionales. Las cookies necesarias no
        requieren consentimiento porque sin ellas el sitio no funciona correctamente. Si rechazás, el sitio funciona igual, pero el mapa
        de Google solo se cargará si lo pedís expresamente.
      </p>
      <p>
        Podés cambiar tu elección en cualquier momento: <CookieSettingsButton />.
      </p>

      <h2>4. Cómo eliminar o bloquear cookies</h2>
      <p>
        También podés borrar o bloquear las cookies desde la configuración de tu navegador (Chrome, Safari, Firefox, Edge, etc.). Tené
        en cuenta que bloquear las cookies necesarias puede afectar el funcionamiento del sitio.
      </p>

      <h2>5. Más información</h2>
      <p>
        Para saber cómo tratamos tus datos personales, consultá nuestra <Link href="/privacidad">Política de Privacidad</Link>.
      </p>
    </LegalPage>
  );
}
