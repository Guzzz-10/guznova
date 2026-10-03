"use client";

import { motion, type Variants } from "framer-motion";
import type { ElementType } from "react";
import { ease } from "@/lib/motion";

type Props = {
  lines: string[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  stagger?: number;
  /** true: anima al montar. false: anima al entrar en pantalla */
  onMount?: boolean;
};

const inner: Variants = {
  hidden: { y: "112%" },
  show: (delay: number) => ({
    y: "0%",
    transition: { duration: 1.1, ease, delay },
  }),
};

/** Revela cada línea desde una máscara, con stagger. */
export function SplitText({
  lines,
  as = "h2",
  className,
  delay = 0,
  stagger = 0.11,
  onMount = false,
}: Props) {
  const Tag = as as ElementType;
  // El disparador va en el contenedor (visible); el que se mueve es el hijo.
  const trigger = onMount
    ? { initial: "hidden", animate: "show" }
    : {
        initial: "hidden",
        whileInView: "show",
        viewport: { once: true, margin: "0px 0px -60px 0px" },
      };

  return (
    <Tag className={className} aria-label={lines.join(" ")}>
      {lines.map((line, i) => (
        <motion.span
          key={line}
          aria-hidden
          {...trigger}
          className="-mb-[0.12em] block overflow-hidden pb-[0.12em]"
        >
          <motion.span
            className="block will-change-transform"
            variants={inner}
            custom={delay + i * stagger}
          >
            {line}
          </motion.span>
        </motion.span>
      ))}
    </Tag>
  );
}
