import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { config } from "../config";
import { SANS } from "../fonts";
import { useImagesReady } from "../hooks/useImagesReady";
import { alpha } from "./color";
import { hasStaticFile } from "./staticFiles";

type BottleProps = {
  /** Ruta dentro de /public (ver config.assets). */
  src: string;
  height: number;
  /** Centro horizontal de la botella. */
  x: number;
  /** Y de la base de la botella (el reflejo se dibuja debajo). */
  baseY: number;
  /** Color de la luz de contorno. */
  glow?: string;
  /** Intensidad de la luz de contorno (0 a 1). */
  glowStrength?: number;
  /** Progreso del destello que barre la botella (0 a 1). */
  sweep?: number;
  /** Opacidad del reflejo en el piso. */
  reflection?: number;
  /** Transformaciones extra (entrada, zoom, etc.), con origen en la base. */
  transform?: string;
  opacity?: number;
  /** Desenfoque en px (para entradas tipo "foco"). */
  blur?: number;
};

export const Bottle: React.FC<BottleProps> = ({
  src,
  height,
  x,
  baseY,
  glow = config.colors.gold,
  glowStrength = 0,
  sweep = 0,
  reflection = 0,
  transform = "",
  opacity = 1,
  blur = 0,
}) => {
  const url = staticFile(src);
  useImagesReady([url]);
  const exists = hasStaticFile(src);

  const filters = [
    blur > 0.05 ? `blur(${blur}px)` : "",
    glowStrength > 0.01
      ? `drop-shadow(0 0 ${height * 0.006}px ${alpha(glow, 0.85 * glowStrength)}) drop-shadow(0 0 ${height * 0.035}px ${alpha(glow, 0.55 * glowStrength)})`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  // El destello es una banda diagonal recortada con la silueta de la botella.
  const sweepPos = interpolate(sweep, [0, 1], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const showSweep = exists && sweep > 0 && sweep < 1;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: baseY - height,
        height,
        opacity,
        transform: `translateX(-50%) ${transform}`,
        transformOrigin: "50% 100%",
      }}
    >
      {exists && reflection > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: height,
            width: "100%",
            height,
            opacity: reflection,
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 26%)",
          }}
        >
          <Img
            src={url}
            style={{
              height,
              display: "block",
              transform: "scaleY(-1)",
              filter: "blur(2px)",
            }}
          />
        </div>
      ) : null}

      <div style={{ position: "relative", height, filter: filters || undefined }}>
        {exists ? (
          <Img src={url} style={{ height, display: "block" }} />
        ) : (
          <Placeholder height={height} name={src} />
        )}
        {showSweep ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              maskImage: `url(${url})`,
              maskSize: "100% 100%",
              backgroundImage:
                "linear-gradient(105deg, rgba(255,240,205,0) 38%, rgba(255,240,205,0.55) 46%, rgba(255,250,235,0.95) 50%, rgba(255,240,205,0.55) 54%, rgba(255,240,205,0) 62%)",
              backgroundSize: "250% 100%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: `${sweepPos}% 0`,
              mixBlendMode: "screen",
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

/** Se muestra si falta la foto: indica qué archivo poner en /public. */
const Placeholder: React.FC<{ height: number; name: string }> = ({ height, name }) => (
  <div
    style={{
      height,
      width: height * 0.32,
      borderRadius: `${height * 0.06}px ${height * 0.06}px ${height * 0.03}px ${height * 0.03}px`,
      border: `3px dashed ${config.colors.gold}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: config.colors.gold,
      fontFamily: SANS,
      fontSize: 28,
      textAlign: "center",
      padding: 12,
      boxSizing: "border-box",
      wordBreak: "break-all",
    }}
  >
    Falta public/{name}
  </div>
);
