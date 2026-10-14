import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["500", "600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "AutoNova — Autos usados seleccionados en Uruguay",
    template: "%s | AutoNova",
  },
  description:
    "Autos usados revisados, con financiación y toma de usados. Encontrá tu próximo auto en AutoNova y consultanos por WhatsApp.",
  applicationName: "AutoNova",
  openGraph: {
    type: "website",
    locale: "es_UY",
    siteName: "AutoNova",
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#07080B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-UY" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
