import React from "react";
import { useVideoConfig } from "remotion";
import { config } from "../config";
import { alpha } from "./color";

type Props = {
  x: number;
  y: number;
  intensity: number;
  /** Inclinación del destello en grados. */
  angle?: number;
  color?: string;
};

/** Destello anamórfico dorado: núcleo brillante + línea horizontal + halo. */
export const LightFlare: React.FC<Props> = ({
  x,
  y,
  intensity,
  angle = -7,
  color = config.colors.gold,
}) => {
  const { width } = useVideoConfig();
  if (intensity <= 0.001) return null;
  const L = width * 1.9;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 0,
        height: 0,
        transform: `rotate(${angle}deg)`,
        opacity: Math.min(1, intensity),
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -480,
          top: -480,
          width: 960,
          height: 960,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(color, 0.42)} 0%, ${alpha(color, 0.12)} 32%, ${alpha(color, 0)} 68%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -L / 2,
          top: -34,
          width: L,
          height: 68,
          background: `linear-gradient(90deg, ${alpha(color, 0)} 0%, ${alpha(color, 0.28)} 32%, ${alpha(config.colors.goldLight, 0.55)} 50%, ${alpha(color, 0.28)} 68%, ${alpha(color, 0)} 100%)`,
          filter: "blur(16px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -L / 2,
          top: -2.5,
          width: L,
          height: 5,
          background: `linear-gradient(90deg, ${alpha(color, 0)} 0%, ${alpha(color, 0.7)} 28%, #FFF8E6 50%, ${alpha(color, 0.7)} 72%, ${alpha(color, 0)} 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -110,
          top: -110,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, #FFFFFF 0%, #FFF4D6 16%, rgba(241,216,148,0.55) 36%, rgba(201,162,77,0) 70%)",
        }}
      />
      {/* Reflejos internos de lente, sobre el eje del destello */}
      {[
        { d: -260, s: 70, o: 0.22 },
        { d: 340, s: 44, o: 0.28 },
        { d: 560, s: 110, o: 0.12 },
      ].map((g, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: g.d - g.s / 2,
            top: -g.s / 2,
            width: g.s,
            height: g.s,
            borderRadius: "50%",
            border: `2px solid ${alpha(config.colors.goldLight, g.o)}`,
            background: alpha(color, g.o * 0.35),
          }}
        />
      ))}
    </div>
  );
};
