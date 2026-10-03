"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { ease } from "@/lib/motion";
import { waLink } from "@/lib/site";

export function WhatsAppFloat() {
  return (
    <motion.a
      href={waLink("Hola GuzNova! Quería hacerles una consulta.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, ease, delay: 1.6 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      className="group fixed bottom-5 right-5 z-40 flex h-14 items-center gap-0 rounded-full bg-[#1fa855] pl-[17px] pr-[17px] text-white shadow-[0_8px_30px_rgb(0_0_0/0.35)] sm:bottom-7 sm:right-7"
    >
      <MessageCircle className="h-[22px] w-[22px] shrink-0" strokeWidth={1.75} />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-700 ease-premium group-hover:ml-2.5 group-hover:max-w-[120px]">
        Escribinos
      </span>
    </motion.a>
  );
}
