import React from "react";
import { AbsoluteFill, random, staticFile, useCurrentFrame } from "remotion";
import { useImagesReady } from "../hooks/useImagesReady";

/** Grano de película leve. Cambia cada 2 frames, como el cine. */
export const FilmGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  const grain = staticFile("fx/grain.png");
  useImagesReady([grain]);
  const step = Math.floor(frame / 2);
  return (
    <AbsoluteFill
      style={{
        // La textura se precarga con useImagesReady, así que es seguro usarla de fondo.
        // eslint-disable-next-line @remotion/no-background-image
        backgroundImage: `url(${grain})`,
        backgroundSize: "640px 640px",
        backgroundPosition: `${Math.round(random(`gx${step}`) * 640)}px ${Math.round(random(`gy${step}`) * 640)}px`,
        mixBlendMode: "overlay",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};
