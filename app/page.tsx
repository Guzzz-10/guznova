import { autos } from "@/data/autos";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { Destacados } from "@/components/Destacados";
import { Catalogo } from "@/components/Catalogo";
import { Porque } from "@/components/Porque";
import { Financiacion } from "@/components/Financiacion";
import { Testimonios } from "@/components/Testimonios";
import { Contacto } from "@/components/Contacto";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero auto={autos[0]} />
        <Stats />
        <Destacados autos={autos.filter((a) => a.destacado)} />
        <Catalogo />
        <Porque />
        <Financiacion />
        <Testimonios />
        <Contacto />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
