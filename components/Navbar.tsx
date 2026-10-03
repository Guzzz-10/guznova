"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ease } from "@/lib/motion";

const links = [
  { id: "destacados", label: "Destacados" },
  { id: "catalogo", label: "Catálogo" },
  { id: "financiacion", label: "Financiación" },
  { id: "nosotros", label: "Nosotros" },
  { id: "contacto", label: "Contacto" },
];

export function Navbar({ overHero = true }: { overHero?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const home = usePathname() === "/";
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 40));

  const light = overHero && !scrolled && !open; // texto blanco sobre el hero
  const href = (id: string) => (home ? `#${id}` : `/#${id}`);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease, delay: 0.2 }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled || open ? "border-b border-ink/10 bg-paper/85 backdrop-blur-xl backdrop-saturate-150" : "border-b border-transparent"
        } ${light ? "text-white" : "text-ink"}`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
          <Link href="/" className="flex items-baseline gap-2" aria-label="Automotoro GuzNova, inicio">
            <span className="text-lg font-semibold tracking-[-0.04em]">GuzNova</span>
            <span className={`hidden text-[10px] tracking-[0.25em] uppercase sm:inline ${light ? "text-white/60" : "text-mute"}`}>Automotoro</span>
          </Link>

          <ul className="hidden items-center gap-9 text-sm md:flex">
            {links.map((l) => (
              <li key={l.id}>
                <a href={href(l.id)} className="relative py-1 opacity-80 transition-opacity hover:opacity-100 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:after:scale-x-100">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <button
            className="-mr-2 flex h-11 w-11 items-center justify-center md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
          >
            {open ? <X strokeWidth={1.5} /> : <Menu strokeWidth={1.5} />}
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="fixed inset-0 z-40 bg-paper pt-24 md:hidden"
          >
            <ul className="flex flex-col gap-1 px-5">
              {links.map((l, i) => (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease, delay: 0.1 + i * 0.06 }}
                >
                  <a href={href(l.id)} onClick={() => setOpen(false)} className="block border-b border-ink/10 py-5 text-3xl font-semibold tracking-[-0.04em]">
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
