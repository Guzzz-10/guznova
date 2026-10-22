import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Bottle } from "../components/Bottle";
import { alpha } from "../components/color";
import { GoldParticles } from "../components/GoldParticles";
import { SceneCamera } from "../components/SceneCamera";
import { Smoke } from "../components/Smoke";
import { Sparkle } from "../components/Sparkle";
import { TitleBlock } from "../components/TitleBlock";
import { config } from "../config";
import { SERIF } from "../fonts";
import { useBeatPulse } from "../hooks/useBeat";
import { useLayout } from "../hooks/useLayout";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Escena 3 — Black Label: negro y dorado, la botella entra en foco con reflejos. */
export const BlackLabelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { width, height, portrait, pick } = useLayout();
  const pulse = useBeatPulse();
  const { gold, goldLight } = config.colors;

  const bottleH = pick(1080, 880);
  const bottleX = pick(width / 2, width * 0.66);
  const baseY = pick(1730, 1000);
  const bottleW = bottleH * 0.3;
  const textX = pick(width / 2, width * 0.3);
  const textY = pick(205, height / 2 - 170);

  // Entrada tipo "foco": de grande y desenfocada a nítida.
  const focus = interpolate(frame, [0, 26], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const scale = interpolate(focus, [0, 1], [1.16, 1]) * interpolate(frame, [0, durationInFrames], [1, 1.035], clamp);
  const parallax = interpolate(frame, [0, durationInFrames], [20, -20], clamp);
  const bottleTop = baseY - bottleH;

  return (
    <SceneCamera zoom={[1.05, 1]}>
      {/* Haces de luz dorada detrás de la botella */}
      {[-1, 1].map((side) => (
        <div
          key={side}
          style={{
            position: "absolute",
            left: bottleX + side * bottleW * 0.9 - 60,
            top: -100,
            width: 120,
            height: height + 200,
            opacity: focus * (0.16 + 0.06 * pulse),
            transform: `rotate(${side * (8 + Math.sin(frame / 30) * 1.5)}deg)`,
            transformOrigin: "50% 0%",
            background: `linear-gradient(180deg, ${alpha(goldLight, 0.9)} 0%, ${alpha(gold, 0.35)} 45%, ${alpha(gold, 0)} 90%)`,
            filter: "blur(18px)",
          }}
        />
      ))}

      {/* "12" monumental en contorno dorado, con parallax lento */}
      <div
        style={{
          position: "absolute",
          left: bottleX,
          top: baseY - bottleH * 0.55,
          transform: `translate(-50%, -50%) translateY(${parallax * -1.4}px) scale(${interpolate(frame, [0, durationInFrames], [1.08, 1], clamp)})`,
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: pick(940, 860),
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: `2px ${alpha(gold, 0.55)}`,
          opacity: focus * 0.45,
          whiteSpace: "nowrap",
        }}
      >
        12
      </div>

      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${bottleH * 0.6}px ${bottleH * 0.55}px at ${bottleX}px ${baseY - bottleH * 0.45}px, ${alpha(gold, 0.2)} 0%, ${alpha(gold, 0.05)} 50%, rgba(0,0,0,0) 100%)`,
          opacity: focus,
        }}
      />
      <Smoke color={gold} opacity={0.18} speed={0.9} />
      <GoldParticles count={28} seed="black" opacity={0.9} boost={pulse} />

      <div
        style={{
          position: "absolute",
          left: bottleX - bottleH * 0.5,
          top: baseY - 1,
          width: bottleH,
          height: 2,
          opacity: focus * 0.85,
          background: `linear-gradient(90deg, ${alpha(gold, 0)}, ${alpha(gold, 0.9)} 35%, ${goldLight} 50%, ${alpha(gold, 0.9)} 65%, ${alpha(gold, 0)})`,
        }}
      />

      <Bottle
        src={config.assets.blackLabel}
        height={bottleH}
        x={bottleX}
        baseY={baseY}
        glow={gold}
        glowStrength={focus * (0.6 + 0.15 * pulse)}
        sweep={interpolate(frame, [26, 62], [0, 1], clamp)}
        reflection={0.26 * focus}
        blur={(1 - focus) * 10}
        opacity={interpolate(frame, [0, 10], [0, 1], clamp)}
        transform={`scale(${scale})`}
      />

      {/* Reflejos que destellan sobre el vidrio */}
      <Sparkle x={bottleX - bottleW * 0.28} y={bottleTop + bottleH * 0.3} t={frame - 52} size={130} />
      <Sparkle x={bottleX + bottleW * 0.33} y={bottleTop + bottleH * 0.62} t={frame - 74} size={100} />
      <Sparkle x={bottleX - bottleW * 0.05} y={bottleTop + bottleH * 0.12} t={frame - 94} size={90} />

      <div
        style={{
          position: "absolute",
          left: textX,
          top: textY,
          transform: `translateX(-50%) translateY(${parallax}px)`,
        }}
      >
        <TitleBlock
          title={config.texts.blackLabel.title}
          subtitle={config.texts.blackLabel.subtitle}
          delay={8}
          titleSize={portrait ? 150 : 140}
          subtitleSize={portrait ? 50 : 48}
          glow={gold}
        />
      </div>
    </SceneCamera>
  );
};
