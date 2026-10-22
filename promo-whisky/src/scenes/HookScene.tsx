import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha } from "../components/color";
import { GoldParticles } from "../components/GoldParticles";
import { GoldText } from "../components/GoldText";
import { LightFlare } from "../components/LightFlare";
import { SceneCamera } from "../components/SceneCamera";
import { Smoke } from "../components/Smoke";
import { config } from "../config";
import { SERIF } from "../fonts";
import { useLayout } from "../hooks/useLayout";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Escena 1 — Gancho: un destello dorado cruza la pantalla y revela la frase. */
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { width, height, pick } = useLayout();
  const { gold, cream } = config.colors;
  const lines = config.texts.hook;

  // El destello cruza en ~0,8 s y va revelando el texto a su paso.
  const crossEnd = Math.round(durationInFrames * 0.42);
  const sweepEase = Easing.bezier(0.5, 0.05, 0.3, 1);
  const flareX = (f: number) =>
    interpolate(f, [0, crossEnd], [-0.2 * width, 1.2 * width], { ...clamp, easing: sweepEase });
  const flareY = height * pick(0.475, 0.5);
  const flareIntensity = interpolate(frame, [0, 3, crossEnd - 4, crossEnd + 8], [0.5, 1, 1, 0], clamp);

  const fontSize = pick(124, 118);
  const lineH = fontSize * 1.14;
  const blockTop = flareY - (lines.length * lineH) / 2;

  const blur = interpolate(frame, [4, crossEnd + 6], [6, 0], clamp);
  const tracking = interpolate(frame, [0, durationInFrames], [0.05, 0.012], clamp);
  const exit = interpolate(frame, [durationInFrames - 9, durationInFrames], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const afterglow = interpolate(frame, [crossEnd * 0.6, crossEnd + 10, durationInFrames], [0, 1, 0.6], clamp);

  return (
    <SceneCamera zoom={[1.04, 1]}>
      <Smoke color={gold} opacity={0.16} />
      <GoldParticles count={22} seed="hook" opacity={interpolate(frame, [6, 30], [0, 0.8], clamp)} />

      {/* Resplandor que queda detrás del texto después del destello */}
      <AbsoluteFill
        style={{
          opacity: afterglow,
          background: `radial-gradient(ellipse ${pick("70% 18%", "55% 30%")} at 50% ${(flareY / height) * 100}%, ${alpha(gold, 0.16)} 0%, ${alpha(gold, 0)} 100%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          top: blockTop,
          width,
          opacity: 1 - exit * 0.85,
          transform: `scale(${1 + exit * 0.05})`,
          filter: blur > 0.1 || exit > 0 ? `blur(${blur + exit * 6}px)` : undefined,
        }}
      >
        {lines.map((line, i) => {
          const last = i === lines.length - 1;
          const reveal = flareX(frame - i * 2);
          return (
            <div
              key={i}
              style={{
                height: lineH,
                lineHeight: `${lineH}px`,
                textAlign: "center",
                fontFamily: SERIF,
                fontSize,
                fontWeight: last ? 400 : 600,
                fontStyle: last ? "italic" : "normal",
                letterSpacing: `${tracking}em`,
                color: cream,
                whiteSpace: "nowrap",
                clipPath: `inset(-30% ${Math.max(0, width - reveal)}px -30% 0)`,
                textShadow: last ? undefined : "0 6px 30px rgba(0,0,0,0.7)",
              }}
            >
              {last ? (
                <GoldText
                  shine={interpolate(frame, [crossEnd + 6, durationInFrames - 6], [0, 1], clamp)}
                  style={{ paddingRight: "0.08em" }}
                >
                  {line}
                </GoldText>
              ) : (
                line
              )}
            </div>
          );
        })}
      </div>

      <LightFlare x={flareX(frame)} y={flareY} intensity={flareIntensity} />
    </SceneCamera>
  );
};
