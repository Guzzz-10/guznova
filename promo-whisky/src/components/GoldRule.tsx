import React from "react";
import { config } from "../config";
import { alpha } from "./color";

/** Línea dorada fina con un rombo al centro. Crece desde el centro con `progress`. */
export const GoldRule: React.FC<{ progress: number; width?: number }> = ({
  progress,
  width = 180,
}) => {
  const { gold, goldLight } = config.colors;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <div
      style={{
        position: "relative",
        width,
        height: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: width * p,
          height: 2,
          background: `linear-gradient(90deg, ${alpha(gold, 0)}, ${gold} 30%, ${goldLight} 50%, ${gold} 70%, ${alpha(gold, 0)})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 10,
          height: 10,
          background: goldLight,
          boxShadow: `0 0 14px ${gold}`,
          transform: `rotate(45deg) scale(${p})`,
        }}
      />
    </div>
  );
};
