import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { config } from "../config";
import { SANS, SERIF } from "../fonts";
import { alpha } from "./color";
import { GoldRule } from "./GoldRule";
import { RevealWords } from "./RevealWords";

type Props = {
  title: string;
  subtitle: string;
  delay?: number;
  titleSize: number;
  subtitleSize: number;
  /** Color del resplandor detrás del título. */
  glow?: string;
};

/** Título grande + línea dorada + subtítulo espaciado (escenas de cada botella). */
export const TitleBlock: React.FC<Props> = ({
  title,
  subtitle,
  delay = 0,
  titleSize,
  subtitleSize,
  glow = config.colors.gold,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rule = spring({ frame: frame - delay - 10, fps, config: { damping: 200 }, durationInFrames: 26 });
  const sub = interpolate(frame, [delay + 14, delay + 34], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tracking = 0.4 - 0.18 * sub;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <RevealWords
        text={title}
        delay={delay}
        style={{
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: titleSize,
          lineHeight: 1.02,
          color: config.colors.cream,
          textShadow: `0 0 40px ${alpha(glow, 0.45)}, 0 6px 30px rgba(0,0,0,0.7)`,
          whiteSpace: "nowrap",
        }}
      />
      <div style={{ margin: `${titleSize * 0.16}px 0 ${titleSize * 0.13}px` }}>
        <GoldRule progress={rule} width={titleSize * 1.5} />
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: subtitleSize,
          textTransform: "uppercase",
          letterSpacing: `${tracking}em`,
          paddingLeft: `${tracking}em`,
          color: config.colors.gold,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 16}px)`,
          whiteSpace: "nowrap",
          textShadow: "0 4px 20px rgba(0,0,0,0.8)",
        }}
      >
        {subtitle}
      </div>
    </div>
  );
};
