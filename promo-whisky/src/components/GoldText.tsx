import React from "react";
import { interpolate } from "remotion";

type Props = {
  children: React.ReactNode;
  /** Progreso del brillo que cruza el texto (0 a 1). Fuera de rango no se ve. */
  shine?: number;
  style?: React.CSSProperties;
};

const METAL = "linear-gradient(180deg, #F7E7B4 0%, #E2C277 30%, #C9A24D 58%, #9E7A2F 100%)";
const BAND =
  "linear-gradient(100deg, rgba(255,252,240,0) 40%, rgba(255,252,240,0.95) 50%, rgba(255,252,240,0) 60%)";

/** Texto dorado metálico con un brillo opcional que lo recorre. */
export const GoldText: React.FC<Props> = ({ children, shine = 0, style }) => {
  const pos = interpolate(shine, [0, 1], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <span
      style={{
        display: "inline-block",
        backgroundImage: `${BAND}, ${METAL}`,
        backgroundSize: "250% 100%, 100% 100%",
        backgroundPosition: `${pos}% 0, 0 0`,
        backgroundRepeat: "no-repeat",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        // text-shadow ensucia el texto recortado: usamos drop-shadow.
        textShadow: "none",
        filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.65))",
        ...style,
      }}
    >
      {children}
    </span>
  );
};
