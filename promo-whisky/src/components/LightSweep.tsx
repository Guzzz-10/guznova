import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { config } from "../config";
import { alpha } from "./color";

type Props = {
  /** 0 a 1: la banda cruza la pantalla; en 0,5 cubre el centro. */
  progress: number;
  direction?: 1 | -1;
  strength?: number;
};

/** Barrido de luz dorada a pantalla completa (se usa para tapar los cortes). */
export const LightSweep: React.FC<Props> = ({ progress, direction = 1, strength = 1 }) => {
  const { width, height } = useVideoConfig();
  const diag = Math.hypot(width, height);
  const band = diag * 0.95;
  const travel = diag + band;
  const pos = (progress - 0.5) * travel * direction;
  const flash = Math.pow(Math.sin(Math.min(Math.max(progress, 0), 1) * Math.PI), 2) * strength;
  const { gold, goldLight } = config.colors;

  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${alpha(goldLight, 0.5 * flash)} 0%, ${alpha(gold, 0.22 * flash)} 45%, ${alpha(gold, 0)} 85%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: width / 2 - band / 2,
          top: height / 2 - diag * 0.8,
          width: band,
          height: diag * 1.6,
          opacity: strength,
          transform: `rotate(${direction * 16}deg) translateX(${pos}px)`,
          background: `linear-gradient(90deg, ${alpha(gold, 0)} 0%, ${alpha(gold, 0.12)} 18%, ${alpha(gold, 0.5)} 36%, ${alpha("#FFF2CF", 0.95)} 50%, ${alpha(gold, 0.5)} 64%, ${alpha(gold, 0.12)} 82%, ${alpha(gold, 0)} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
