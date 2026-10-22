import React from "react";
import { interpolate } from "remotion";
import { config } from "../config";
import { alpha } from "./color";

type Props = {
  x: number;
  y: number;
  /** Frame actual relativo al inicio del destello. */
  t: number;
  duration?: number;
  size?: number;
};

/** Destello en forma de estrella de cuatro puntas (brillo sobre vidrio o texto). */
export const Sparkle: React.FC<Props> = ({ x, y, t, duration = 16, size = 120 }) => {
  if (t < 0 || t > duration) return null;
  const k = interpolate(t, [0, duration * 0.4, duration], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ray = (rot: number, len: number) => (
    <div
      style={{
        position: "absolute",
        left: -len / 2,
        top: -1.5,
        width: len,
        height: 3,
        transform: `rotate(${rot}deg)`,
        background: `linear-gradient(90deg, rgba(255,255,255,0), rgba(255,250,232,0.95) 50%, rgba(255,255,255,0))`,
      }}
    />
  );
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 0,
        height: 0,
        opacity: k,
        transform: `scale(${0.4 + k * 0.6}) rotate(${t * 2.5}deg)`,
        mixBlendMode: "screen",
      }}
    >
      {ray(0, size)}
      {ray(90, size)}
      {ray(45, size * 0.45)}
      {ray(-45, size * 0.45)}
      <div
        style={{
          position: "absolute",
          left: -size * 0.18,
          top: -size * 0.18,
          width: size * 0.36,
          height: size * 0.36,
          borderRadius: "50%",
          background: `radial-gradient(circle, #FFFFFF 0%, ${alpha(config.colors.goldLight, 0.6)} 35%, ${alpha(config.colors.gold, 0)} 70%)`,
        }}
      />
    </div>
  );
};
