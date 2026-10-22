import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha } from "../components/color";
import { GoldParticles } from "../components/GoldParticles";
import { GoldRule } from "../components/GoldRule";
import { GoldText } from "../components/GoldText";
import { SceneCamera } from "../components/SceneCamera";
import { Smoke } from "../components/Smoke";
import { Sparkle } from "../components/Sparkle";
import { config } from "../config";
import { SANS, SERIF } from "../fonts";
import { useLayout } from "../hooks/useLayout";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const METAL = "linear-gradient(180deg, #F7E7B4 0%, #E2C277 30%, #C9A24D 58%, #9E7A2F 100%)";
const SHINE =
  "linear-gradient(105deg, rgba(255,251,236,0) 40%, rgba(255,251,236,0.95) 50%, rgba(255,251,236,0) 60%)";

/** Escena 6 — Cierre: nombre en dorado con brillo final, contacto y leyenda legal. */
export const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, portrait, pick } = useLayout();
  const { gold, cream } = config.colors;
  const { name, whatsappLabel, whatsapp, instagramLabel, instagram } = config.contact;

  const nameSize = Math.min(pick(136, 150), (width - 140) / (name.length * 0.52));
  const nameY = pick(560, 210);
  const nameW = name.length * nameSize * 0.5;

  const rule = interpolate(frame, [18, 38], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const shine = interpolate(frame, [44, 68], [0, 1], clamp);
  const halo = interpolate(frame, [40, 70], [0, 1], clamp);
  const item = (i: number) =>
    spring({ frame: frame - 24 - i * 5, fps, config: { damping: 200 }, durationInFrames: 22 });
  const legal = interpolate(frame, [36, 54], [0, 1], clamp);

  const label: React.CSSProperties = {
    fontFamily: SANS,
    fontWeight: 500,
    fontSize: 48,
    color: alpha(cream, 0.82),
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
  };
  const value = (size: number): React.CSSProperties => ({
    fontFamily: SANS,
    fontWeight: 600,
    fontSize: size,
    letterSpacing: "0.03em",
    lineHeight: 1.2,
    whiteSpace: "nowrap",
  });
  const appear = (p: number): React.CSSProperties => ({
    opacity: p,
    transform: `translateY(${(1 - p) * 24}px)`,
  });

  const whatsappBlock = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", ...appear(item(0)) }}>
      <div style={label}>{whatsappLabel}</div>
      <GoldText style={value(pick(78, 72))}>{whatsapp}</GoldText>
    </div>
  );
  const instagramBlock = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", ...appear(item(portrait ? 1 : 0)) }}>
      <div style={label}>{instagramLabel}</div>
      <GoldText style={value(pick(70, 72))}>{instagram}</GoldText>
    </div>
  );

  return (
    <SceneCamera zoom={[1.03, 1]}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${pick("85% 40%", "60% 55%")} at 50% ${pick("42%", "40%")}, ${alpha(gold, 0.14 + halo * 0.06)} 0%, rgba(0,0,0,0) 70%)`,
        }}
      />
      <Smoke color={gold} opacity={0.15} speed={0.7} />
      <GoldParticles count={34} seed="closing" speed={0.6} opacity={0.8} />

      {/* Nombre: letras que aparecen de a una + brillo final */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: nameY,
          width,
          textAlign: "center",
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: nameSize,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ position: "relative", display: "inline-block", filter: "drop-shadow(0 6px 24px rgba(0,0,0,0.6))" }}>
          {name.split("").map((ch, i) => {
            const p = spring({ frame: frame - 2 - i * 1.6, fps, config: { damping: 200 }, durationInFrames: 20 });
            return (
              <span
                key={i}
                style={{
                  position: "relative",
                  top: (1 - p) * 40,
                  opacity: p,
                  filter: p < 0.99 ? `blur(${(1 - p) * 12}px)` : undefined,
                  backgroundImage: METAL,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {ch}
              </span>
            );
          })}
          {/* Brillo final: copia del nombre recortada al texto con una banda de luz. */}
          {shine > 0 && shine < 1 ? (
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                backgroundImage: SHINE,
                backgroundSize: "250% 100%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: `${100 - shine * 100}% 0`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {name.split("").map((ch, i) => (
                <span key={i}>{ch}</span>
              ))}
            </span>
          ) : null}
        </div>
      </div>
      <Sparkle x={width / 2 + nameW * 0.47} y={nameY + nameSize * 0.32} t={frame - 62} size={150} duration={20} />
      <Sparkle x={width / 2 - nameW * 0.42} y={nameY + nameSize * 0.2} t={frame - 50} size={90} />

      <div
        style={{
          position: "absolute",
          left: 0,
          width,
          top: nameY + nameSize * 1.32,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <GoldRule progress={rule} width={pick(520, 640)} />
      </div>

      {portrait ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            width,
            top: nameY + nameSize * 1.32 + 90,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 56,
          }}
        >
          {whatsappBlock}
          {instagramBlock}
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            left: 0,
            width,
            top: nameY + nameSize * 1.32 + 80,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 110,
          }}
        >
          {whatsappBlock}
          <div style={{ width: 2, height: 150, background: alpha(gold, 0.5), opacity: item(0) }} />
          {instagramBlock}
        </div>
      )}

      {/* Leyenda legal: visible pero discreta */}
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          bottom: pick(150, 60),
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 400,
          fontSize: 48,
          lineHeight: 1.3,
          color: alpha(cream, 0.6),
          opacity: legal,
        }}
      >
        {portrait
          ? config.texts.legal.map((l, i) => <div key={i}>{l}</div>)
          : config.texts.legal.join(" ")}
      </div>
      <div
        style={{
          position: "absolute",
          left: width / 2 - 60,
          width: 120,
          height: 2,
          bottom: pick(150, 60) + (portrait ? config.texts.legal.length : 1) * 48 * 1.3 + 30,
          background: alpha(gold, 0.4),
          opacity: legal,
        }}
      />
    </SceneCamera>
  );
};
