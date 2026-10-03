import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Automotoro GuzNova · Autos seleccionados en Rosario",
  description: "Automotora en Rosario con autos peritados, financiación a tu medida y atención sin vueltas. Mirá el catálogo.",
};
export const viewport: Viewport = { themeColor: "#0B0B0C" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={GeistSans.variable}>
      <body className="bg-paper font-sans text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
