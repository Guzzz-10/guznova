"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { ease } from "@/lib/motion";

export function Reveal({
  children, delay = 0, y = 32, className, as = "div",
}: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" | "p" | "h2" }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </Tag>
  );
}
