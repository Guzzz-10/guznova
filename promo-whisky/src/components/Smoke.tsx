import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { config } from "../config";
import { useImagesReady } from "../hooks/useImagesReady";

type Props = {
  color?: string;
  opacity?: number;
  speed?: number;
  /** Escala de las volutas. */
  scale?: number;
};

/** Humo/niebla suave: dos capas de textura que se desplazan a distinta velocidad. */
export const Smoke: React.FC<Props> = ({
  color = config.colors.gold,
  opacity = 0.2,
  speed = 1,
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fog = staticFile("fx/fog.png");
  useImagesReady([fog]);
  const t = (frame / fps) * speed;

  const layers = [
    { size: 1500 * scale, vx: 16, vy: -9, ox: 0, oy: 0, o: 1 },
    { size: 950 * scale, vx: -26, vy: -14, ox: 410, oy: 230, o: 0.6 },
  ];

  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: "screen",
        pointerEvents: "none",
        // Más densa abajo, casi nada arriba.
        maskImage:
          "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.2) 100%)",
      }}
    >
      {layers.map((l, i) => (
        <AbsoluteFill
          key={i}
          style={{
            backgroundColor: color,
            opacity: l.o,
            maskImage: `url(${fog})`,
            maskSize: `${l.size}px ${l.size}px`,
            maskRepeat: "repeat",
            maskPosition: `${l.ox + l.vx * t}px ${l.oy + l.vy * t}px`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
