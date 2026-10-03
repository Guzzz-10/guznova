"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { ease } from "@/lib/motion";
import { waLink } from "@/lib/site";
import { Magnetic } from "./ui/Magnetic";

export function WhatsAppButton() {
  const [show, setShow] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setShow(y > 500));

  return (
    <div className="fixed right-5 bottom-5 z-40 md:right-8 md:bottom-8">
      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.5, ease }}>
            <Magnetic strength={0.35}>
              <a
                href={waLink("Hola GuzNova! Quería hacerles una consulta.")}
                target="_blank" rel="noopener noreferrer" aria-label="Escribinos por WhatsApp"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/15 transition-transform duration-300 hover:scale-105"
              >
                <MessageCircle strokeWidth={1.5} className="h-6 w-6" />
              </a>
            </Magnetic>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
