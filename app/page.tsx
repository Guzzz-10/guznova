import { Catalogo } from "@/components/sections/Catalogo";
import { Contacto } from "@/components/sections/Contacto";
import { Destacados } from "@/components/sections/Destacados";
import { Financiacion } from "@/components/sections/Financiacion";
import { Hero } from "@/components/sections/Hero";
import { PorQue } from "@/components/sections/PorQue";
import { Testimonios } from "@/components/sections/Testimonios";

export default function Home() {
  return (
    <>
      <Hero />
      <Destacados />
      <Catalogo />
      <PorQue />
      <Financiacion />
      <Testimonios />
      <Contacto />
    </>
  );
}
