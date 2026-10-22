import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Bottle } from "../components/Bottle";
import { alpha } from "../components/color";
import { GoldParticles } from "../components/GoldParticles";
import { GoldRule } from "../components/GoldRule";
import { GoldText } from "../components/GoldText";
import { SceneCamera } from "../components/SceneCamera";
import { Smoke } from "../components/Smoke";
import { config } from "../config";
import { SANS, SERIF } from "../fonts";
import { useLayout } from "../hooks/useLayout";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Escena 5 — Precios y oferta en tarjetas con borde dorado. */
export const PricesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, pick } = useLayout();
  const { gold, red } = config.colors;
  const { pricesTitle } = config.texts;
  const { promo } = config.prices;

  const cardW = pick(880, 780);
  const cardH = pick(430, 440);
  const cards = [
    {
      label: config.texts.redLabel.title,
      price: config.prices.redLabel,
      bottle: config.assets.redLabel,
      accent: red,
      left: pick((width - cardW) / 2, width / 2 - cardW - 24),
      top: pick(520, 250),
    },
    {
      label: config.texts.blackLabel.title,
      price: config.prices.blackLabel,
      bottle: config.assets.blackLabel,
      accent: gold,
      left: pick((width - cardW) / 2, width / 2 + 24),
      top: pick(1000, 250),
    },
  ];

  const title = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 20 });
  const promoIn = spring({ frame: frame - 30, fps, config: { damping: 18, stiffness: 120, mass: 0.8 } });

  return (
    <SceneCamera zoom={[1, 1.04]}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 55% at 50% 52%, ${alpha(gold, 0.12)} 0%, rgba(0,0,0,0) 70%)`,
        }}
      />
      <Smoke color={gold} opacity={0.16} speed={0.8} />
      <GoldParticles count={30} seed="prices" speed={0.8} opacity={0.75} />

      {pricesTitle ? (
        <div
          style={{
            position: "absolute",
            top: pick(300, 60),
            left: 0,
            width,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: title,
            transform: `translateY(${(1 - title) * 30}px)`,
          }}
        >
          <GoldText
            shine={interpolate(frame, [20, 50], [0, 1], clamp)}
            style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: pick(112, 100), lineHeight: 1.15, paddingRight: "0.08em" }}
          >
            {pricesTitle}
          </GoldText>
          <div style={{ marginTop: 6 }}>
            <GoldRule progress={title} width={200} />
          </div>
        </div>
      ) : null}

      {cards.map((c, i) => (
        <PriceCard key={i} {...c} width={cardW} height={cardH} delay={2 + i * 7} />
      ))}

      {promo ? (
        <div
          style={{
            position: "absolute",
            top: pick(1540, 790),
            left: 0,
            width,
            display: "flex",
            justifyContent: "center",
            opacity: Math.min(1, promoIn * 1.4),
            transform: `scale(${interpolate(promoIn, [0, 1], [0.85, 1])})`,
          }}
        >
          <div
            style={{
              position: "relative",
              padding: "26px 60px",
              borderRadius: 999,
              border: `2px solid ${alpha(gold, 0.9)}`,
              background: `linear-gradient(180deg, ${alpha(gold, 0.16)}, ${alpha(gold, 0.05)})`,
              boxShadow: `0 0 40px ${alpha(gold, 0.25)}, inset 0 0 24px ${alpha(gold, 0.12)}`,
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: pick(52, 50),
              letterSpacing: "0.04em",
              color: config.colors.cream,
              whiteSpace: "nowrap",
              maxWidth: width - 100,
              overflow: "hidden",
            }}
          >
            <Diamond side="left" />
            {promo}
            <Diamond side="right" />
            <PillShine progress={interpolate(frame, [60, 90], [0, 1], clamp)} />
          </div>
        </div>
      ) : null}
    </SceneCamera>
  );
};

type CardProps = {
  label: string;
  price: string;
  bottle: string;
  accent: string;
  left: number;
  top: number;
  width: number;
  height: number;
  delay: number;
};

const PriceCard: React.FC<CardProps> = ({ label, price, bottle, accent, left, top, width, height, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { gold, goldLight, cream } = config.colors;

  const enter = spring({ frame: frame - delay, fps, config: { damping: 200, stiffness: 80 }, durationInFrames: 30 });
  const border = interpolate(frame, [delay + 4, delay + 32], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const content = interpolate(frame, [delay + 14, delay + 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const thumb = spring({ frame: frame - delay - 6, fps, config: { damping: 200 }, durationInFrames: 30 });

  const thumbW = height * 0.62;
  const pad = 44;
  const textW = width - thumbW - pad * 1.5;
  // Ajuste automático para que el precio entre en la tarjeta.
  const priceSize = Math.min(118, textW / Math.max(1, price.length * 0.6));
  const r = 30;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        opacity: Math.min(1, enter * 1.5),
        transform: `translateY(${(1 - enter) * 140}px)`,
      }}
    >
      {/* Fondo de la tarjeta */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: r,
          overflow: "hidden",
          background: "linear-gradient(155deg, rgba(36,28,18,0.94) 0%, rgba(16,14,11,0.95) 55%, rgba(10,10,10,0.96) 100%)",
          boxShadow: `0 30px 80px rgba(0,0,0,0.65), 0 0 50px ${alpha(gold, 0.1)}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -thumbW * 0.2,
            top: -height * 0.1,
            width: thumbW * 1.4,
            height: height * 1.2,
            background: `radial-gradient(ellipse at 50% 60%, ${alpha(accent, 0.55)} 0%, ${alpha(accent, 0)} 65%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: r,
            right: r,
            top: 0,
            height: 1.5,
            background: `linear-gradient(90deg, ${alpha(goldLight, 0)}, ${alpha(goldLight, 0.6)}, ${alpha(goldLight, 0)})`,
          }}
        />
        <Bottle
          src={bottle}
          height={height * 0.86}
          x={thumbW * 0.56}
          baseY={height - height * 0.06}
          glow={accent}
          glowStrength={0.55}
          transform={`translateY(${(1 - thumb) * height * 0.5}px)`}
          opacity={thumb}
        />
      </div>

      {/* Borde dorado que se dibuja alrededor */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id={`card-border-${delay}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={goldLight} />
            <stop offset="0.45" stopColor={gold} />
            <stop offset="1" stopColor="#8E6B27" />
          </linearGradient>
        </defs>
        <rect
          x={1.5}
          y={1.5}
          width={width - 3}
          height={height - 3}
          rx={r}
          fill="none"
          stroke={`url(#card-border-${delay})`}
          strokeWidth={3}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - border}
          style={{ filter: `drop-shadow(0 0 8px ${alpha(gold, 0.6)})` }}
        />
      </svg>

      {/* Contenido */}
      <div
        style={{
          position: "absolute",
          left: thumbW,
          top: 0,
          width: textW,
          height,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: content,
          transform: `translateX(${(1 - content) * 30}px)`,
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: 48,
            letterSpacing: "0.16em",
            paddingLeft: "0.16em",
            textTransform: "uppercase",
            color: cream,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
        <div style={{ margin: "18px 0 10px" }}>
          <GoldRule progress={content} width={150} />
        </div>
        <GoldText
          shine={interpolate(frame, [delay + 40, delay + 68], [0, 1], clamp)}
          style={{ fontFamily: SERIF, fontWeight: 600, fontSize: priceSize, lineHeight: 1.15, whiteSpace: "nowrap" }}
        >
          {price}
        </GoldText>
      </div>
    </div>
  );
};

const PillShine: React.FC<{ progress: number }> = ({ progress }) =>
  progress > 0 && progress < 1 ? (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 999,
        backgroundImage: "linear-gradient(100deg, rgba(255,246,220,0) 40%, rgba(255,246,220,0.35) 50%, rgba(255,246,220,0) 60%)",
        backgroundSize: "250% 100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: `${100 - progress * 100}% 0`,
        mixBlendMode: "screen",
      }}
    />
  ) : null;

const Diamond: React.FC<{ side: "left" | "right" }> = ({ side }) => (
  <span
    style={{
      display: "inline-block",
      width: 12,
      height: 12,
      verticalAlign: "middle",
      transform: "translateY(-3px) rotate(45deg)",
      background: config.colors.goldLight,
      boxShadow: `0 0 10px ${config.colors.gold}`,
      [side === "left" ? "marginRight" : "marginLeft"]: 26,
    }}
  />
);
