"use client";

import { motion } from "framer-motion";
import { ease } from "@/lib/motion";

type Props = {
  text: string;
  className?: string;
  delay?: number;
  by?: "word" | "char";
  inView?: boolean;
};

/** Título que entra con máscara y stagger, por palabra o por letra. */
export function SplitText({ text, className, delay = 0, by = "word", inView = false }: Props) {
  const words = text.split(" ");
  let n = 0;
  const trigger = inView
    ? { whileInView: { y: "0%" }, viewport: { once: true, margin: "0px 0px -60px 0px" } }
    : { animate: { y: "0%" } };

  return (
    <span className={className} aria-label={text}>
      {words.map((w, wi) => (
        <span key={wi} aria-hidden className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
          {(by === "char" ? Array.from(w) : [w]).map((piece, ci) => (
            <motion.span
              key={ci}
              className="inline-block will-change-transform"
              initial={{ y: "110%" }}
              {...trigger}
              transition={{ duration: 1, ease, delay: delay + n++ * (by === "char" ? 0.03 : 0.09) }}
            >
              {piece}
            </motion.span>
          ))}
          {wi < words.length - 1 && " "}
        </span>
      ))}
    </span>
  );
}
