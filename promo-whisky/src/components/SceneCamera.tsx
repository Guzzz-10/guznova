import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { config } from "../config";

type Props = {
  children: React.ReactNode;
  /** Zoom lento de cámara de principio a fin de la escena. */
  zoom?: [number, number];
  /** Desplazamiento vertical lento de cámara (px). */
  drift?: [number, number];
};

/** Contenedor de escena: fondo negro + movimiento de cámara lento y continuo. */
export const SceneCamera: React.FC<Props> = ({ children, zoom = [1, 1.06], drift = [0, 0] }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opts = {
    easing: Easing.inOut(Easing.sin),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  } as const;
  const scale = interpolate(frame, [0, durationInFrames], zoom, opts);
  const y = interpolate(frame, [0, durationInFrames], drift, opts);
  return (
    <AbsoluteFill style={{ backgroundColor: config.colors.black, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateY(${y}px) scale(${scale})` }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
