import { config } from "./config";

export const FPS = config.fps;
export const FRAMES_PER_BEAT = (60 / config.music.bpm) * FPS;

export const SCENE_ORDER = [
  "hook",
  "redLabel",
  "blackLabel",
  "duo",
  "prices",
  "closing",
] as const;

export type SceneId = (typeof SCENE_ORDER)[number];

export type SceneSlot = {
  id: SceneId;
  from: number;
  durationInFrames: number;
};

// Cada corte cae exactamente en un beat. Redondeamos sobre el acumulado
// para que no se acumule desfase con BPMs que no dan frames enteros.
let beatCursor = 0;
export const SCENES: SceneSlot[] = SCENE_ORDER.map((id) => {
  const from = Math.round(beatCursor * FRAMES_PER_BEAT);
  beatCursor += config.sceneBeats[id];
  const to = Math.round(beatCursor * FRAMES_PER_BEAT);
  return { id, from, durationInFrames: to - from };
});

export const TOTAL_FRAMES = Math.round(beatCursor * FRAMES_PER_BEAT);

export const sceneStart = (id: SceneId) =>
  SCENES.find((s) => s.id === id)!.from;
