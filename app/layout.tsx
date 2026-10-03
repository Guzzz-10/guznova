import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { AutoModalProvider } from "@/components/AutoModal";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SmoothScroll } from "@/components/SmoothScroll";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GuzNova Automotora · Rosario",
  description:
    "Autos usados premium seleccionados uno por uno, con historial verificado, financiación y atención personalizada en Rosario.",
  openGraph: {
    title: "GuzNova Automotora · Rosario",
    description: "Autos que se sienten distintos. Catálogo, financiación y atención personalizada.",
    locale: "es_AR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <MotionConfig reducedMotion="user">
          <SmoothScroll />
          <AutoModalProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <WhatsAppFloat />
          </AutoModalProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
