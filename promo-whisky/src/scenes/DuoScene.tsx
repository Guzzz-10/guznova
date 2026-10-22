import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Bottle } from "../components/Bottle";
import { alpha } from "../components/color";
import { GoldParticles } from "../components/GoldParticles";
import { GoldText } from "../components/GoldText";
import { IceGlass } from "../components/IceGlass";
import { RevealWords } from "../components/RevealWords";
import { SceneCamera } from "../components/SceneCamera";
import { Smoke } from "../components/Smoke";
import { config } from "../config";
import { SERIF } from "../fonts";
import { useBeatPulse } from "../hooks/useBeat";
import { useLayout } from "../hooks/useLayout";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Escena 4 — Las dos botellas juntas, partículas doradas y un vaso con hielo hecho de luz. */
export const DuoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { width, pick } = useLayout();
  const pulse = useBeatPulse();
  const { red, gold, cream } = config.colors;
  const { lead, highlight } = config.texts.duo;

  const bottleH = pick(960, 760);
  const baseY = pick(1680, 1010);
  // Las botellas se separan para que el vaso quede entre las dos, adelante.
  const spread = pick(0.25, 0.17) * width;
  const redX = width / 2 - spread;
  const blackX = width / 2 + spread;

  const enter = (delay: number) =>
    spring({
      frame: frame - delay,
      fps,
      config: { damping: 200, stiffness: 60, mass: 1 },
      durationInFrames: 26,
    });
  const inRed = enter(0);
  const inBlack = enter(3);
  const zoom = interpolate(frame, [0, durationInFrames], [0.97, 1.03], clamp);
  const glass = spring({ frame: frame - 16, fps, config: { damping: 200 }, durationInFrames: 30 });
  const parallax = interpolate(frame, [0, durationInFrames], [16, -16], clamp);

  return (
    <SceneCamera zoom={[1.06, 1]}>
      <AbsoluteFill
        style={{
          transform: `translateY(${parallax * 0.5}px)`,
          background: [
            `radial-gradient(ellipse ${bottleH * 0.5}px ${bottleH * 0.6}px at ${redX}px ${baseY - bottleH * 0.5}px, ${alpha(red, 0.5)} 0%, ${alpha(red, 0)} 100%)`,
            `radial-gradient(ellipse ${bottleH * 0.5}px ${bottleH * 0.6}px at ${blackX}px ${baseY - bottleH * 0.5}px, ${alpha(gold, 0.32)} 0%, ${alpha(gold, 0)} 100%)`,
          ].join(", "),
          opacity: 0.85 + 0.15 * pulse,
        }}
      />
      <Smoke color={gold} opacity={0.2} />
      <GoldParticles count={34} seed="duo-back" speed={0.7} opacity={0.7} />

      <div
        style={{
          position: "absolute",
          left: width / 2 - bottleH * 0.75,
          top: baseY - 1,
          width: bottleH * 1.5,
          height: 2,
          opacity: 0.8,
          background: `linear-gradient(90deg, ${alpha(gold, 0)}, ${alpha(red, 0.9)} 25%, ${config.colors.goldLight} 50%, ${alpha(gold, 0.9)} 75%, ${alpha(gold, 0)})`,
        }}
      />

      <Bottle
        src={config.assets.redLabel}
        height={bottleH}
        x={redX}
        baseY={baseY}
        glow="#D8262A"
        glowStrength={inRed * (0.75 + 0.2 * pulse)}
        sweep={interpolate(frame, [34, 66], [0, 1], clamp)}
        reflection={0.22}
        opacity={interpolate(inRed, [0, 0.2], [0, 1], clamp)}
        transform={`translateX(${(1 - inRed) * -width * 0.28}px) rotate(${(1 - inRed) * -7}deg) scale(${zoom})`}
      />
      <Bottle
        src={config.assets.blackLabel}
        height={bottleH}
        x={blackX}
        baseY={baseY}
        glow={gold}
        glowStrength={inBlack * (0.65 + 0.2 * pulse)}
        sweep={interpolate(frame, [40, 72], [0, 1], clamp)}
        reflection={0.22}
        opacity={interpolate(inBlack, [0, 0.2], [0, 1], clamp)}
        transform={`translateX(${(1 - inBlack) * width * 0.28}px) rotate(${(1 - inBlack) * 7}deg) scale(${zoom})`}
      />

      <IceGlass
        x={width / 2}
        baseY={baseY + pick(150, 40) + (1 - glass) * 60}
        width={pick(310, 300)}
        opacity={glass}
        sweep={interpolate(frame, [50, 80], [0, 1], clamp)}
      />

      <GoldParticles count={30} seed="duo-front" speed={1.3} opacity={0.95} boost={pulse} />

      <div
        style={{
          position: "absolute",
          left: 0,
          top: pick(300, 70),
          width,
          textAlign: "center",
          transform: `translateY(${parallax}px)`,
          fontFamily: SERIF,
          fontSize: pick(124, 110),
          lineHeight: 1.1,
          color: cream,
          textShadow: "0 6px 30px rgba(0,0,0,0.75)",
          whiteSpace: "nowrap",
        }}
      >
        <RevealWords
          text={`${lead} ${highlight}`}
          delay={10}
          stagger={4}
          renderWord={(w, i) =>
            i < lead.split(" ").length ? (
              <span style={{ fontWeight: 600 }}>{w}</span>
            ) : (
              <GoldText
                shine={interpolate(frame, [48, 80], [0, 1], clamp)}
                style={{ fontStyle: "italic", fontWeight: 400, paddingRight: "0.06em" }}
              >
                {w}
              </GoldText>
            )
          }
        />
      </div>
    </SceneCamera>
  );
};
