import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Bottle } from "../components/Bottle";
import { alpha } from "../components/color";
import { GoldParticles } from "../components/GoldParticles";
import { SceneCamera } from "../components/SceneCamera";
import { Smoke } from "../components/Smoke";
import { TitleBlock } from "../components/TitleBlock";
import { config } from "../config";
import { useBeatPulse } from "../hooks/useBeat";
import { useLayout } from "../hooks/useLayout";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Escena 2 — Red Label: la botella sube desde abajo con luz roja de contorno. */
export const RedLabelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { width, height, portrait, pick } = useLayout();
  const pulse = useBeatPulse();
  const { red, amber, gold } = config.colors;

  const bottleH = pick(1080, 880);
  const bottleX = pick(width / 2, width * 0.66);
  const baseY = pick(1730, 1000);
  const textX = pick(width / 2, width * 0.3);
  const textY = pick(205, height / 2 - 170);

  const enter = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 55, mass: 1.1 },
    durationInFrames: 28,
  });
  const zoom = interpolate(frame, [0, durationInFrames], [0.95, 1.04], clamp);
  const rise = (1 - enter) * height * 0.45;
  const glow = interpolate(frame, [8, 40], [0, 1], clamp) * (0.82 + 0.18 * pulse);
  const parallax = interpolate(frame, [0, durationInFrames], [20, -20], clamp);

  return (
    <SceneCamera zoom={[1, 1.05]}>
      {/* Luz roja de fondo detrás de la botella */}
      <AbsoluteFill
        style={{
          opacity: interpolate(enter, [0, 1], [0.2, 1]) * (0.85 + 0.15 * pulse),
          transform: `translateY(${parallax * 0.4}px)`,
          background: `radial-gradient(ellipse ${bottleH * 0.75}px ${bottleH * 0.62}px at ${bottleX}px ${baseY - bottleH * 0.5}px, ${alpha(red, 0.62)} 0%, ${alpha(red, 0.22)} 42%, ${alpha(amber, 0.05)} 70%, rgba(0,0,0,0) 100%)`,
        }}
      />
      <Smoke color={red} opacity={0.28} speed={1.1} />
      <GoldParticles count={26} seed="red" color={amber} speed={1.2} opacity={0.85} boost={pulse} />

      {/* Piso: línea de luz y resplandor bajo la botella */}
      <div
        style={{
          position: "absolute",
          left: bottleX - bottleH * 0.55,
          top: baseY - 1,
          width: bottleH * 1.1,
          height: 2,
          opacity: enter * 0.8,
          background: `linear-gradient(90deg, ${alpha(red, 0)}, ${alpha(red, 0.9)} 30%, ${alpha(gold, 0.9)} 50%, ${alpha(red, 0.9)} 70%, ${alpha(red, 0)})`,
        }}
      />

      <Bottle
        src={config.assets.redLabel}
        height={bottleH}
        x={bottleX}
        baseY={baseY}
        glow="#D8262A"
        glowStrength={glow}
        sweep={interpolate(frame, [36, 72], [0, 1], clamp)}
        reflection={0.24 * enter}
        transform={`translateY(${rise}px) scale(${zoom})`}
        opacity={interpolate(enter, [0, 0.25], [0, 1], clamp)}
      />

      <div
        style={{
          position: "absolute",
          left: textX,
          top: textY,
          transform: `translateX(-50%) translateY(${parallax}px)`,
        }}
      >
        <TitleBlock
          title={config.texts.redLabel.title}
          subtitle={config.texts.redLabel.subtitle}
          delay={6}
          titleSize={portrait ? 150 : 140}
          subtitleSize={portrait ? 50 : 48}
          glow={red}
        />
      </div>
    </SceneCamera>
  );
};
