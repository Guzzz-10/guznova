import React from "react";
import { AbsoluteFill } from "remotion";

/** Viñeta oscura en los bordes. */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 1 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      opacity: strength,
      background:
        "radial-gradient(ellipse 75% 70% at 50% 46%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.88) 100%)",
    }}
  />
);
