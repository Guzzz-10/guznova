"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { cn } from "@/lib/cn";
import { NAV } from "@/lib/nav";


export function Header({ whatsappHref }: { whatsappHref: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled || open ? "border-b border-white/5 bg-ink-950/80 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-nova-500 focus:px-4 focus:py-2 focus:text-ink-950">
        Saltar al contenido
      </a>
      <div className="container flex h-16 items-center justify-between sm:h-20">
        <Link href="/" aria-label="AutoNova — Inicio" className="rounded-lg">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "relative rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                isActive(item.href) ? "text-white" : "text-ink-300 hover:text-white",
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-nova-500"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-primary hidden !px-4 !py-2.5 sm:inline-flex">
            <WhatsAppIcon className="h-4 w-4" />
            Escribinos
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-white md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Menú móvil"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "calc(100dvh - 4rem)" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-ink-950 md:hidden"
          >
            <motion.ul
              className="container flex flex-col gap-1 pt-6"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
            >
              {NAV.map((item) => (
                <motion.li key={item.href} variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } }}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between rounded-2xl px-4 py-4 font-display text-2xl font-semibold",
                      isActive(item.href) ? "bg-white/5 text-nova-400" : "text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
              <motion.li variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="mt-6">
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full !py-4 text-base">
                  <WhatsAppIcon className="h-5 w-5" />
                  Escribinos por WhatsApp
                </a>
              </motion.li>
            </motion.ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
