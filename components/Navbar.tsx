"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { cn } from "@/lib/cn";
import { scrollToHash } from "@/lib/lenis";
import { ease } from "@/lib/motion";
import { SITE } from "@/lib/site";

const links = [
  { href: "#destacados", label: "Destacados" },
  { href: "#catalogo", label: "Catálogo" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#financiacion", label: "Financiación" },
  { href: "#contacto", label: "Contacto" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

  const go = (e: MouseEvent, hash: string) => {
    setMenu(false);
    if (pathname === "/" && scrollToHash(hash)) e.preventDefault();
  };

  return (
    <>
      <motion.header
        initial={{ y: "-100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1.1, ease, delay: 0.2 }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-700 ease-premium",
          scrolled || menu
            ? "border-line bg-bg/70 backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="container-x flex h-16 items-center justify-between sm:h-[72px]">
          <Link
            href="/"
            onClick={() => setMenu(false)}
            className="flex items-baseline gap-2"
            aria-label="GuzNova — inicio"
          >
            <span className="text-[19px] font-semibold tracking-[-0.04em]">
              Guz<span className="text-accent">Nova</span>
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.28em] text-muted sm:block">
              {SITE.descriptor}
            </span>
          </Link>

          <nav className="hidden items-center gap-9 md:flex" aria-label="Principal">
            {links.map((l) => (
              <Link
                key={l.href}
                href={`/${l.href}`}
                onClick={(e) => go(e, l.href)}
                className="group relative text-sm text-fg/75 transition-colors duration-500 hover:text-fg"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-700 ease-premium group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="-mr-2 flex h-10 w-10 items-center justify-center md:hidden"
            aria-label={menu ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menu}
            onClick={() => setMenu((m) => !m)}
          >
            {menu ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div
            key="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col justify-center bg-bg/95 px-6 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <nav className="flex flex-col gap-1" aria-label="Móvil">
              {links.map((l, i) => (
                <div key={l.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.8, ease, delay: 0.08 + i * 0.06 }}
                  >
                    <Link
                      href={`/${l.href}`}
                      onClick={(e) => go(e, l.href)}
                      className="display block py-2 text-[2.5rem]"
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                </div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
