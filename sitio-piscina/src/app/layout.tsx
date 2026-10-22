import type { Metadata, Viewport } from "next";
import { Fredoka, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { urlSitio } from "@/config/sitio";
import { obtenerContenido } from "@/lib/contenido/obtener";
import { Revelar } from "@/components/ui/Revelar";
import { RegistrarSW } from "@/components/ui/RegistrarSW";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", weight: ["500", "600", "700"], display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { negocio: n, hero } = await obtenerContenido();
  const titulo = `${n.nombre} · Piscinas climatizadas en ${n.ciudad}`;
  return {
    metadataBase: new URL(urlSitio),
    title: { default: `${titulo} | Clases de natación y aquagym`, template: `%s | ${n.nombre}` },
    description: n.descripcion,
    applicationName: n.nombre,
    keywords: ["piscina", "piscinas climatizadas", `piscina ${n.ciudad}`, "clases de natación", "natación infantil", "aquagym", "matronatación", "nado libre", "suscripción mensual", "Uruguay"],
    openGraph: {
      type: "website",
      locale: "es_UY",
      url: "/",
      siteName: n.nombreCompleto,
      title: titulo,
      description: n.descripcion,
      images: [{ url: hero.imagenUrl, width: 1920, height: 1200, alt: n.nombreCompleto }],
    },
    twitter: { card: "summary_large_image", title: titulo, description: n.descripcion, images: [hero.imagenUrl] },
    appleWebApp: { capable: true, title: n.nombre, statusBarStyle: "default" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#0eaebf",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Marca que hay JS (para las animaciones de aparición). Si algo falla, a los 2,5 s se muestra todo igual.
const scriptInicial = `document.documentElement.classList.add('js');setTimeout(function(){if(!window.__revealOk)document.documentElement.classList.remove('js')},2500);`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-UY" data-scroll-behavior="smooth" className={`${fredoka.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        <Script id="marcar-js" strategy="beforeInteractive">
          {scriptInicial}
        </Script>
        <a
          href="#contenido"
          className="sr-only rounded-full bg-mar-950 px-5 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60]"
        >
          Saltar al contenido
        </a>
        {children}
        <Revelar />
        <RegistrarSW />
      </body>
    </html>
  );
}
