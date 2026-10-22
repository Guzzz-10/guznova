"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IdCard, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { navegacion } from "@/config/sitio";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { IconoWhatsApp } from "@/components/ui/IconosMarca";

const emojis: Record<string, string> = {
  inicio: "🏠",
  piscinas: "🏊",
  clases: "📅",
  historia: "📖",
  suscripcion: "💳",
  "mi-carnet": "🪪",
  contacto: "💬",
};

type Props = { nombre: string; eslogan: string; logoUrl: string | null; whatsapp: string };

export function Header({ nombre, eslogan, logoUrl, whatsapp }: Props) {
  const pathname = usePathname();
  const esInicio = pathname === "/";
  const [scrolleado, setScrolleado] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState<string>("inicio");
  const botonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fondo sólido al bajar
  useEffect(() => {
    const onScroll = () => setScrolleado(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Resaltar la sección visible (solo en la home)
  useEffect(() => {
    if (!esInicio) return;
    const ids = navegacion.map((n) => n.id).filter((id) => id !== "mi-carnet");
    const secciones = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entradas) => {
        const visibles = entradas.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visibles[0]) setActivo(visibles[0].target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );
    secciones.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [esInicio]);

  // Menú móvil: bloquear scroll, cerrar con Escape y devolver el foco
  useEffect(() => {
    if (!abierto) return;
    const boton = botonRef.current;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
      if (e.key === "Tab" && panelRef.current) {
        const focos = panelRef.current.querySelectorAll<HTMLElement>("a, button");
        const primero = focos[0];
        const ultimo = focos[focos.length - 1];
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      boton?.focus();
    };
  }, [abierto]);

  const transparente = esInicio && !scrolleado && !abierto;
  const esActivo = (id: string) => (id === "mi-carnet" ? pathname.startsWith("/mi-carnet") : esInicio && activo === id);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        abierto
          ? "py-2"
          : transparente
            ? "bg-transparent py-3 sm:py-4"
            : "bg-white/85 py-2 shadow-suave backdrop-blur-xl"
      }`}
    >
      <div className="contenedor flex items-center justify-between gap-4">
        <Link href="/#inicio" aria-label={`${nombre} — ir al inicio`} className="relative z-10 rounded-xl" onClick={() => setAbierto(false)}>
          <Logo nombre={nombre} eslogan={eslogan} logoUrl={logoUrl} claro={transparente || abierto} />
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-0.5 xl:gap-1">
            {navegacion.map((item) =>
              item.id === "mi-carnet" ? (
                <li key={item.id} className="ml-1">
                  <Link
                    href={item.href}
                    aria-current={esActivo(item.id) ? "page" : undefined}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.95rem] font-semibold transition ${
                      transparente
                        ? "bg-white/15 text-white ring-1 ring-white/50 hover:bg-white/25"
                        : "bg-agua-50 text-agua-800 ring-1 ring-agua-200 hover:bg-agua-100"
                    }`}
                  >
                    <IdCard className="size-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              ) : (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    aria-current={esActivo(item.id) ? "location" : undefined}
                    className={`relative rounded-full px-3 py-2 text-[0.95rem] font-semibold transition xl:px-3.5 ${
                      transparente ? "text-white/90 hover:text-white" : "text-mar-800 hover:text-agua-700"
                    } ${esActivo(item.id) ? (transparente ? "text-white" : "text-agua-700") : ""}`}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-3 -bottom-0.5 h-1 rounded-full bg-sol-400 transition-transform duration-300 ${
                        esActivo(item.id) ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/hacete-socio" className="btn btn-coral btn-chico hidden sm:inline-flex">
            Hacete socio
          </Link>
          <button
            ref={botonRef}
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-controls="menu-movil"
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            className={`relative z-10 grid size-12 place-items-center rounded-2xl transition lg:hidden ${
              transparente ? "bg-white/15 text-white ring-1 ring-white/40" : abierto ? "bg-white/10 text-white" : "bg-agua-50 text-mar-900 ring-1 ring-agua-200"
            }`}
          >
            {abierto ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      <div
        id="menu-movil"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        hidden={!abierto}
        className="fixed inset-0 z-0 overflow-y-auto bg-gradient-to-br from-mar-900 via-mar-800 to-agua-800 lg:hidden"
      >
        <div className="contenedor flex min-h-full flex-col pt-24 pb-10">
          <nav aria-label="Menú móvil">
            <ul className="grid gap-2">
              {navegacion.map((item, i) => (
                <li key={item.id} style={{ animationDelay: `${i * 45}ms` }} className="animate-[entrar_0.5s_both]">
                  <Link
                    href={item.href}
                    onClick={() => setAbierto(false)}
                    className={`flex items-center gap-4 rounded-3xl px-5 py-3.5 font-display text-2xl font-semibold text-white transition hover:bg-white/10 ${
                      esActivo(item.id) ? "bg-white/10 ring-1 ring-white/20" : ""
                    }`}
                  >
                    <span aria-hidden="true" className="grid size-11 place-items-center rounded-2xl bg-white/10 text-xl">
                      {emojis[item.id]}
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto grid gap-3 pt-8">
            <Link href="/hacete-socio" onClick={() => setAbierto(false)} className="btn btn-coral w-full">
              Hacete socio
            </Link>
            <a href={enlaceWhatsApp(whatsapp, "¡Hola! Tengo una consulta.")} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp w-full">
              <IconoWhatsApp className="size-6" /> Escribinos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
