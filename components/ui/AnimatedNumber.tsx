"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

type Props = { value: number; format: (n: number) => string; className?: string };

/** Número que "rueda" suavemente hacia su nuevo valor. */
export function AnimatedNumber({ value, format, className }: Props) {
  const spring = useSpring(value, { stiffness: 110, damping: 22, mass: 0.6 });
  const text = useTransform(spring, (v) => format(v));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span className={className}>{text}</motion.span>;
}
