import type { Metadata } from "next";
import { Suspense } from "react";
import { ResultadoPago } from "@/components/alta/ResultadoPago";

export const metadata: Metadata = { title: "¡Listo!", robots: { index: false } };

export default function Listo() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-agua-50 to-white pt-28 pb-36">
      <div className="contenedor">
        <Suspense>
          <ResultadoPago />
        </Suspense>
      </div>
    </div>
  );
}
