import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  text: string;
  /** Frame en el que empieza a aparecer la primera palabra. */
  delay?: number;
  /** Frames entre palabra y palabra. */
  stagger?: number;
  style?: React.CSSProperties;
  /** Render opcional de cada palabra (por ejemplo, dorada). */
  renderWord?: (word: string, index: number) => React.ReactNode;
};

/** Cada palabra sube desde una máscara invisible, con un spring suave. */
export const RevealWords: React.FC<Props> = ({
  text,
  delay = 0,
  stagger = 5,
  style,
  renderWord,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <span style={{ display: "inline-block", ...style }}>
      {words.map((w, i) => {
        const p = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: { damping: 200, stiffness: 90, mass: 0.9 },
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              overflow: "hidden",
              verticalAlign: "top",
              padding: "0.08em 0.04em 0.16em",
              margin: "-0.08em -0.04em -0.16em",
            }}
          >
            <span
              style={{
                display: "inline-block",
                transform: `translateY(${(1 - p) * 110}%)`,
                opacity: Math.min(1, p * 1.6),
              }}
            >
              {renderWord ? renderWord(w, i) : w}
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        );
      })}
    </span>
  );
};
