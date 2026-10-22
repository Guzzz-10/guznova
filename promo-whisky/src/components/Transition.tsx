import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { config } from "../config";
import { alpha } from "./color";
import { LightFlare } from "./LightFlare";
import { LightSweep } from "./LightSweep";

export type TransitionType = "flare" | "sweep" | "dip";

type Props = {
  type: TransitionType;
  /** Frames antes del corte. */
  pre: number;
  /** Frames después del corte. */
  post: number;
  direction?: 1 | -1;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Efecto que tapa un corte de escena (se monta centrado en el corte). */
export const Transition: React.FC<Props> = ({ type, pre, post, direction = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const total = pre + post;

  if (type === "sweep") {
    return <LightSweep progress={interpolate(frame, [0, total], [0, 1], clamp)} direction={direction} />;
  }

  if (type === "dip") {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: config.colors.black,
          opacity: interpolate(frame, [0, pre, total], [0, 1, 0], {
            ...clamp,
            easing: Easing.inOut(Easing.quad),
          }),
        }}
      />
    );
  }

  // "flare": un destello cruza la pantalla y estalla justo en el corte.
  const x = interpolate(frame, [0, pre, total], [-0.2 * width, width * 0.5, 1.2 * width], clamp);
  const flash = interpolate(frame, [0, pre, total], [0, 1, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          background: `radial-gradient(ellipse at 50% 50%, ${alpha(config.colors.goldLight, 0.7 * flash)} 0%, ${alpha(config.colors.gold, 0.3 * flash)} 45%, ${alpha(config.colors.gold, 0)} 85%)`,
        }}
      />
      <LightFlare
        x={x}
        y={height * 0.5}
        angle={-6 * direction}
        intensity={interpolate(frame, [0, 3, total - 3, total], [0, 1, 1, 0], clamp)}
      />
    </AbsoluteFill>
  );
};
