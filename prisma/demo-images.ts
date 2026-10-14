// Generador de fotos de demo: ilustraciones de autos en SVG que luego se
// convierten a JPG con sharp. Se usan solo para la demo; en producción las
// fotos reales se suben desde el panel de administración.

export type BodyKind = "hatch" | "sedan" | "suv" | "pickup";
export type Variant = "studio" | "dusk" | "detail";

type Shape = {
  body: string;
  windows: string;
  pillars: number[]; // posiciones x de parantes / líneas de puerta
  beltY: number;
  bottomY: number;
  roofRail?: string;
  bedLine?: string;
};

const W = 1600;
const H = 1000;
const REAR_X = 460;
const FRONT_X = 1130;

function arches(bottomY: number, r: number) {
  return `L ${FRONT_X + r} ${bottomY} A ${r} ${r} 0 0 0 ${FRONT_X - r} ${bottomY} L ${REAR_X + r} ${bottomY} A ${r} ${r} 0 0 0 ${REAR_X - r} ${bottomY} Z`;
}

const SHAPES: Record<BodyKind, Shape> = {
  hatch: {
    body:
      "M 255 712 L 250 640 Q 248 580 275 555 L 378 450 Q 398 418 458 412 L 800 405 Q 850 407 885 432 L 1010 540 Q 1200 552 1310 585 Q 1355 600 1358 650 L 1355 712 " +
      arches(712, 104),
    windows:
      "M 308 548 L 392 458 Q 410 432 462 428 L 795 422 Q 838 424 865 444 L 975 545 Z",
    pillars: [655],
    beltY: 548,
    bottomY: 712,
  },
  sedan: {
    body:
      "M 255 712 L 250 640 Q 250 560 285 545 L 400 532 Q 430 528 455 505 L 520 432 Q 545 405 600 402 L 820 400 Q 865 402 895 428 L 1015 540 Q 1200 552 1310 585 Q 1355 600 1358 650 L 1355 712 " +
      arches(712, 104),
    windows:
      "M 470 540 L 532 446 Q 552 420 602 417 L 815 415 Q 852 418 877 440 L 980 545 Z",
    pillars: [720],
    beltY: 543,
    bottomY: 712,
  },
  suv: {
    body:
      "M 250 700 L 245 600 Q 245 520 270 490 L 300 370 Q 312 340 360 336 L 860 330 Q 905 333 930 360 L 1040 500 Q 1210 510 1320 545 Q 1360 565 1362 620 L 1358 700 " +
      arches(700, 108),
    windows:
      "M 290 500 L 318 380 Q 328 356 368 353 L 855 348 Q 895 352 915 378 L 1005 505 Z",
    pillars: [470, 745],
    beltY: 503,
    bottomY: 700,
    roofRail: "M 380 326 L 840 321",
  },
  pickup: {
    body:
      "M 245 712 L 240 620 Q 240 560 265 540 L 555 540 L 560 410 Q 565 382 605 380 L 860 378 Q 900 380 925 408 L 1030 520 Q 1210 530 1320 560 Q 1362 578 1365 635 L 1362 712 " +
      arches(712, 108),
    windows:
      "M 583 528 L 585 405 Q 590 395 610 394 L 855 393 Q 890 396 910 420 L 1000 525 Z",
    pillars: [760],
    beltY: 528,
    bottomY: 712,
    bedLine: "M 262 548 L 552 548",
  },
};

function shade(hex: string, amount: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const f = (c: number) =>
    Math.max(0, Math.min(255, Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount)));
  return `#${[f(r), f(g), f(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function wheel(cx: number, cy: number, r: number) {
  const spokes = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 72 * Math.PI) / 180;
    const x = cx + Math.cos(a) * r * 0.58;
    const y = cy + Math.sin(a) * r * 0.58;
    return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="url(#rim)" stroke-width="${(r * 0.16).toFixed(1)}" stroke-linecap="round"/>`;
  }).join("");
  return `
  <g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#101114"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.9}" fill="none" stroke="#1d1f24" stroke-width="6"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.66}" fill="#2a2d33"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.64}" fill="none" stroke="url(#rim)" stroke-width="5"/>
    ${spokes}
    <circle cx="${cx}" cy="${cy}" r="${r * 0.14}" fill="url(#rim)"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.06}" fill="#1a1b1f"/>
  </g>`;
}

function background(variant: Variant, seed: number) {
  if (variant === "dusk") {
    let rnd = seed;
    const next = () => {
      rnd = (rnd * 9301 + 49297) % 233280;
      return rnd / 233280;
    };
    let x = 0;
    let skyline = "";
    while (x < W) {
      const w = 40 + next() * 90;
      const h = 40 + next() * 170;
      skyline += `<rect x="${x.toFixed(0)}" y="${(640 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="#1b1a2b" opacity="${(0.55 + next() * 0.35).toFixed(2)}"/>`;
      x += w + 4;
    }
    return `
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0d1730"/>
        <stop offset="0.45" stop-color="#33305a"/>
        <stop offset="0.62" stop-color="#b8644a"/>
        <stop offset="0.66" stop-color="#e59a5a"/>
      </linearGradient>
      <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1c1c22"/>
        <stop offset="1" stop-color="#08080a"/>
      </linearGradient>
      <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#ffd59a" stop-opacity="0.9"/>
        <stop offset="1" stop-color="#ffd59a" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    <circle cx="1220" cy="610" r="260" fill="url(#sun)"/>
    ${skyline}
    <rect y="640" width="${W}" height="${H - 640}" fill="url(#ground)"/>
    <rect y="640" width="${W}" height="3" fill="#f0a466" opacity="0.35"/>
    <path d="M 0 900 L ${W} 860" stroke="#ffffff" stroke-opacity="0.06" stroke-width="10" stroke-dasharray="80 60"/>`;
  }
  const warm = variant === "detail";
  return `
  <defs>
    <radialGradient id="wall" cx="0.5" cy="0.35" r="0.75">
      <stop offset="0" stop-color="${warm ? "#3a3530" : "#2c313b"}"/>
      <stop offset="1" stop-color="#0b0c10"/>
    </radialGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1b1e25"/>
      <stop offset="1" stop-color="#07080a"/>
    </linearGradient>
    <radialGradient id="spot" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#wall)"/>
  <rect y="660" width="${W}" height="${H - 660}" fill="url(#floor)"/>
  <rect y="660" width="${W}" height="2" fill="#ffffff" opacity="0.06"/>
  <ellipse cx="805" cy="800" rx="760" ry="120" fill="url(#spot)"/>
  ${Array.from({ length: 6 }, (_, i) => `<rect x="${140 + i * 240}" y="70" width="140" height="10" rx="5" fill="#ffffff" opacity="0.10"/>`).join("")}`;
}

export function renderCarSvg(opts: {
  kind: BodyKind;
  color: string;
  variant: Variant;
  seed?: number;
}): string {
  const { kind, color, variant } = opts;
  const s = SHAPES[kind];
  const tireR = kind === "suv" || kind === "pickup" ? 92 : 84;
  const wheelY = 790 - tireR;
  const light = shade(color, 0.35);
  const dark = shade(color, -0.45);

  const doorLines = s.pillars
    .map(
      (x) =>
        `<line x1="${x}" y1="${s.beltY - 6}" x2="${x - 4}" y2="${s.bottomY - 8}" stroke="${dark}" stroke-width="3" opacity="0.8"/>`,
    )
    .join("");
  const pillarBlocks = s.pillars
    .map((x) => `<rect x="${x - 10}" y="300" width="20" height="${s.beltY - 300 + 2}" fill="${shade(color, -0.2)}"/>`)
    .join("");
  const handles = s.pillars
    .map(
      (x) =>
        `<rect x="${x + 70}" y="${s.beltY + 28}" width="56" height="10" rx="5" fill="${dark}" opacity="0.7"/>`,
    )
    .join("");

  const car = `
  <defs>
    <linearGradient id="paint" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${light}"/>
      <stop offset="0.45" stop-color="${color}"/>
      <stop offset="1" stop-color="${dark}"/>
    </linearGradient>
    <linearGradient id="gloss" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="0.55" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="0.7" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3b4554"/>
      <stop offset="0.5" stop-color="#11151b"/>
      <stop offset="1" stop-color="#232a35"/>
    </linearGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e9ecef"/>
      <stop offset="1" stop-color="#7c828a"/>
    </linearGradient>
    <linearGradient id="head" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#cfd8e3"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <clipPath id="bodyClip"><path d="${s.body}"/></clipPath>
    <filter id="blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <ellipse cx="805" cy="${790}" rx="640" ry="26" fill="#000" opacity="0.75" filter="url(#blur)"/>
  ${wheel(REAR_X, wheelY, tireR)}
  ${wheel(FRONT_X, wheelY, tireR)}
  <path d="${s.body}" fill="url(#paint)"/>
  <g clip-path="url(#bodyClip)">
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#gloss)"/>
    <path d="M 240 ${s.beltY + 60} L 1370 ${s.beltY + 40}" stroke="#ffffff" stroke-opacity="0.22" stroke-width="3"/>
    <rect x="0" y="${s.bottomY - 26}" width="${W}" height="30" fill="#000" opacity="0.35"/>
  </g>
  <path d="${s.windows}" fill="url(#glass)"/>
  <path d="${s.windows}" fill="none" stroke="#0a0b0d" stroke-width="5"/>
  <g clip-path="url(#winClip)">${pillarBlocks}</g>
  <clipPath id="winClip"><path d="${s.windows}"/></clipPath>
  ${doorLines}
  ${handles}
  ${s.roofRail ? `<path d="${s.roofRail}" stroke="#16171a" stroke-width="10" stroke-linecap="round"/>` : ""}
  ${s.bedLine ? `<path d="${s.bedLine}" stroke="#16171a" stroke-width="8" stroke-linecap="round"/>` : ""}
  <path d="M 1300 ${s.beltY + 52} q 40 6 54 26 l -4 14 q -30 -6 -54 -14 Z" fill="url(#head)"/>
  <path d="M 1330 ${s.bottomY - 40} l 26 0" stroke="#e8ecf1" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
  <path d="M 250 ${s.beltY + 40} q 18 -6 30 -2 l -2 34 q -16 2 -30 -4 Z" fill="#c4161c"/>
  <path d="M ${kind === "suv" ? 1010 : 985} ${s.beltY - 12} q 30 -14 46 4 l -8 16 q -24 -2 -38 -6 Z" fill="${shade(color, -0.25)}"/>
  `;

  let scene = car;
  if (variant === "dusk") {
    scene = `<g transform="translate(${W} 0) scale(-1 1)">${car}</g>`;
  } else if (variant === "detail") {
    scene = `<g transform="scale(1.9) translate(-620 -330)">${car}</g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${background(variant, opts.seed ?? 7)}
  ${scene}
</svg>`;
}
