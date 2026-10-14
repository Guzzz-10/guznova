"use client";

import { MotionConfig } from "framer-motion";

/** reducedMotion="user": respeta la preferencia del sistema (prefers-reduced-motion). */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
