import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { CookieBanner } from "@/components/site/CookieBanner";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { getSettings } from "@/lib/settings";
import { waLink } from "@/lib/whatsapp";

// Las páginas leen la base de datos en cada visita, así los cambios del panel se ven al instante.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const generic = waLink(settings.whatsapp, settings.whatsappGenericMessage);
  return (
    <MotionProvider>
      <Header whatsappHref={generic} />
      <main id="contenido" className="min-h-[70vh]">
        {children}
      </main>
      <Footer settings={settings} />
      <WhatsAppFloat href={generic} />
      <CookieBanner />
    </MotionProvider>
  );
}
