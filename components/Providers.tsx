"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { SmoothScroll } from "./SmoothScroll";
import { DetalleProvider } from "./DetalleProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      <DetalleProvider>{children}</DetalleProvider>
    </MotionConfig>
  );
}
