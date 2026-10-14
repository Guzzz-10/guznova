"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { cn } from "@/lib/cn";

export function WhatsAppFloat({ href }: { href: string }) {
  // En la ficha de un auto (celular) hay una barra fija abajo: subimos el botón.
  const onCarPage = /^\/autos\/[^/]+/.test(usePathname());
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className={cn(
        "group fixed right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-5px_rgba(37,211,102,.6)] sm:right-7 sm:h-16 sm:w-16",
        onCarPage ? "bottom-24 lg:bottom-7" : "bottom-5 sm:bottom-7",
      )}
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] motion-safe:animate-pulse-ring" aria-hidden />
      <WhatsAppIcon className="relative h-7 w-7 sm:h-8 sm:w-8" />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-ink-900 opacity-0 shadow-lg transition group-hover:opacity-100 sm:block">
        ¿Hablamos?
      </span>
    </motion.a>
  );
}
