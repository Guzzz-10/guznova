import React, { useMemo } from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { config } from "../config";
import { alpha } from "./color";

type Props = {
  count?: number;
  seed?: string;
  color?: string;
  /** Multiplicador de velocidad de subida. */
  speed?: number;
  opacity?: number;
  /** Pulso extra de brillo (por ejemplo, sincronizado al beat). */
  boost?: number;
};

/** Partículas doradas que flotan hacia arriba con profundidad (parallax) y titileo. */
export const GoldParticles: React.FC<Props> = ({
  count = 40,
  seed = "particles",
  color = config.colors.gold,
  speed = 1,
  opacity = 1,
  boost = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const particles = useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const depth = r("depth");
        const bokeh = i % 7 === 3;
        return {
          x: r("x"),
          y: r("y"),
          depth,
          bokeh,
          size: bokeh ? 28 + r("size") * 50 : 2.5 + depth * 7,
          phase: r("phase") * Math.PI * 2,
          twinkle: 1.2 + r("tw") * 2.6,
          sway: 8 + r("sway") * 28,
          rise: bokeh ? 10 + depth * 18 : 16 + depth * 58,
        };
      }),
    [count, seed],
  );

  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      {particles.map((p, i) => {
        const span = height + 240;
        const y = (((p.y * span - p.rise * speed * t) % span) + span) % span - 120;
        const x = p.x * width + Math.sin(t * 0.7 + p.phase) * p.sway;
        const tw = 0.55 + 0.45 * Math.sin(t * p.twinkle + p.phase);
        const o = p.bokeh
          ? 0.22 * tw
          : Math.min(1, (0.3 + 0.7 * p.depth) * tw * (1 + boost * 0.6));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - p.size / 2,
              top: y - p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              opacity: o,
              background: p.bokeh
                ? `radial-gradient(circle, ${alpha(config.colors.goldLight, 0.55)} 0%, ${alpha(color, 0.3)} 45%, ${alpha(color, 0)} 70%)`
                : `radial-gradient(circle, rgba(255,248,225,1) 0%, ${alpha(color, 0.95)} 32%, ${alpha(color, 0)} 70%)`,
              filter: p.bokeh ? "blur(3px)" : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
