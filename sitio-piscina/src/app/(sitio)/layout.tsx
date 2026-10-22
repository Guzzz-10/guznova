import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { obtenerContenido } from "@/lib/contenido/obtener";

export default async function SitioLayout({ children }: { children: React.ReactNode }) {
  const { negocio, whatsapp } = await obtenerContenido();
  return (
    <>
      <Header nombre={negocio.nombre} eslogan={negocio.eslogan} logoUrl={negocio.logoUrl} whatsapp={whatsapp.numero} />
      <main id="contenido">{children}</main>
      <Footer negocio={negocio} whatsapp={whatsapp.numero} />
      <WhatsAppFab numero={whatsapp.numero} mensaje={`¡Hola ${negocio.nombre}! ${whatsapp.mensajeGeneral}`} />
    </>
  );
}
