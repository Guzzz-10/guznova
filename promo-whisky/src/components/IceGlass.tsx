import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { config } from "../config";

type Props = {
  /** Centro horizontal. */
  x: number;
  /** Y de la base del vaso. */
  baseY: number;
  width: number;
  opacity?: number;
  /** Progreso del brillo que cruza el vaso (0 a 1). */
  sweep?: number;
};

const VB_W = 400;
const VB_H = 440;

/**
 * Vaso con whisky y hielo "sugerido" solo con luces (SVG, sin imágenes):
 * bordes brillantes, reflejos en las paredes, whisky ámbar y cubos de hielo
 * dibujados por sus aristas iluminadas.
 */
export const IceGlass: React.FC<Props> = ({ x, baseY, width, opacity = 1, sweep = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const height = (width * VB_H) / VB_W;
  const { amber, gold, goldLight } = config.colors;

  // Brillo que recorre el borde frontal del vaso.
  const theta = (0.15 + ((t * 0.32) % 1) * 0.7) * Math.PI;
  const glintX = 200 + 165 * Math.cos(theta);
  const glintY = 60 + 22 * Math.sin(theta);
  const shimmer = Math.sin(t * 2.2) * 6;
  const sweepX = -260 + sweep * 920;

  const cubes = [
    { cx: 148, cy: 212, s: 112, r: -14, ph: 0 },
    { cx: 252, cy: 202, s: 104, r: 11, ph: 1.7 },
    { cx: 204, cy: 146, s: 94, r: 27, ph: 3.1 },
  ];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      style={{
        position: "absolute",
        left: x - width / 2,
        top: baseY - height,
        opacity,
        overflow: "visible",
      }}
    >
      <defs>
        <clipPath id="glass-inside">
          <path d="M 44 66 L 62 360 Q 200 380 338 360 L 356 66 Z" />
        </clipPath>
        <clipPath id="glass-body">
          <path d="M 35 60 L 55 402 Q 200 426 345 402 L 365 60 Q 200 40 35 60 Z" />
        </clipPath>
        <linearGradient id="whisky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E09A45" stopOpacity="0.62" />
          <stop offset="0.55" stopColor={amber} stopOpacity="0.72" />
          <stop offset="1" stopColor="#5A2A0C" stopOpacity="0.85" />
        </linearGradient>
        <radialGradient id="whisky-core" cx="0.5" cy="0.45" r="0.5">
          <stop offset="0" stopColor={goldLight} stopOpacity="0.55" />
          <stop offset="1" stopColor={goldLight} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.16" />
          <stop offset="0.18" stopColor="#FFFFFF" stopOpacity="0.03" />
          <stop offset="0.82" stopColor="#FFFFFF" stopOpacity="0.03" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.14" />
        </linearGradient>
        <linearGradient id="streak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.25" stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="0.7" stopColor="#FFF2D2" stopOpacity="0.35" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="rim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={goldLight} stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="0.7" stopColor={gold} stopOpacity="0.5" />
          <stop offset="1" stopColor={goldLight} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="ice" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.2" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="sweep-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.5" stopColor="#FFF6E0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="caustic" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={amber} stopOpacity="0.75" />
          <stop offset="0.6" stopColor={amber} stopOpacity="0.2" />
          <stop offset="1" stopColor={amber} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glint" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="0.4" stopColor={goldLight} stopOpacity="0.5" />
          <stop offset="1" stopColor={goldLight} stopOpacity="0" />
        </radialGradient>
        <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* Luz ámbar proyectada en el piso */}
      <ellipse cx="200" cy="418" rx="210" ry="30" fill="url(#caustic)" opacity={0.75 + Math.sin(t * 1.6) * 0.15} />

      {/* Cuerpo del vaso */}
      <path d="M 35 60 L 55 402 Q 200 426 345 402 L 365 60 Q 200 40 35 60 Z" fill="url(#wall)" />

      {/* Whisky */}
      <g clipPath="url(#glass-inside)">
        <rect x="0" y="232" width="400" height="200" fill="url(#whisky)" />
        <ellipse cx="200" cy="300" rx="150" ry="70" fill="url(#whisky-core)" />
      </g>

      {/* Cubos de hielo: solo aristas y reflejos */}
      <g clipPath="url(#glass-inside)">
        {cubes.map((c, i) => {
          const bob = Math.sin(t * 1.3 + c.ph) * 2.5;
          const rot = c.r + Math.sin(t * 0.9 + c.ph) * 1.5;
          const h = c.s / 2;
          const d = c.s * 0.17; // profundidad: cara trasera desplazada
          return (
            <g key={i} transform={`translate(${c.cx} ${c.cy + bob}) rotate(${rot})`}>
              <rect x={-h + d} y={-h - d} width={c.s} height={c.s} rx="18" fill="none" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="1.5" />
              <path
                d={`M ${-h + 6} ${-h + 6} l ${d} ${-d} M ${h - 6} ${-h + 6} l ${d} ${-d} M ${h - 6} ${h - 6} l ${d} ${-d}`}
                stroke="#FFFFFF"
                strokeOpacity="0.3"
                strokeWidth="1.5"
              />
              <rect x={-h} y={-h} width={c.s} height={c.s} rx="20" fill="url(#ice)" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="2" />
              <rect x={-h + 15} y={-h + 15} width={c.s - 30} height={c.s - 30} rx="12" fill="none" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="1.5" />
              <path d={`M ${-h + 14} ${-h + 34} Q ${-h + 14} ${-h + 14} ${-h + 34} ${-h + 14}`} fill="none" stroke="#FFFFFF" strokeOpacity="0.9" strokeWidth="3.5" strokeLinecap="round" filter="url(#soft)" />
              <circle cx={h - 22} cy={h - 24} r="5" fill="url(#glint)" opacity={0.6 + 0.4 * Math.sin(t * 3 + c.ph)} />
            </g>
          );
        })}
      </g>

      {/* Superficie del whisky */}
      <ellipse cx={200 + shimmer} cy="232" rx="146" ry="17" fill={goldLight} fillOpacity="0.16" stroke="#FFE8B0" strokeOpacity="0.55" strokeWidth="1.5" />

      {/* Fondo grueso del vaso */}
      <ellipse cx="200" cy="362" rx="148" ry="17" fill="none" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1.5" />
      <path d="M 57 368 L 55 402 Q 200 426 345 402 L 343 368 Q 200 392 57 368 Z" fill={amber} fillOpacity="0.28" />
      <path d="M 55 402 Q 200 426 345 402" fill="none" stroke="#FFEFC8" strokeOpacity="0.55" strokeWidth="2" />

      {/* Paredes: reflejos verticales */}
      <path d="M 46 78 L 63 388" stroke="url(#streak)" strokeWidth="7" strokeLinecap="round" filter="url(#soft)" />
      <path d="M 74 84 L 88 382" stroke="url(#streak)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M 352 80 L 337 388" stroke="url(#streak)" strokeWidth="4.5" strokeLinecap="round" filter="url(#soft)" opacity="0.8" />
      <path d="M 35 60 L 55 402 M 365 60 L 345 402" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="1.5" fill="none" />

      {/* Borde superior */}
      <ellipse cx="200" cy="60" rx="165" ry="22" fill="none" stroke="url(#rim)" strokeWidth="2.6" />
      <ellipse cx="200" cy="61" rx="157" ry="18.5" fill="none" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="1.2" />

      {/* Brillo que cruza el vaso */}
      {sweep > 0 && sweep < 1 ? (
        <g clipPath="url(#glass-body)">
          <rect x={sweepX} y="-40" width="160" height="520" fill="url(#sweep-band)" transform={`rotate(18 ${sweepX + 80} 220)`} />
        </g>
      ) : null}

      {/* Destello que recorre el borde */}
      <circle cx={glintX} cy={glintY} r="26" fill="url(#glint)" filter="url(#glow)" />
      <circle cx={glintX} cy={glintY} r="7" fill="url(#glint)" />
    </svg>
  );
};
