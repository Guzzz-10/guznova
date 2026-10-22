import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { FilmGrain } from "./components/FilmGrain";
import { hasStaticFile } from "./components/staticFiles";
import { Transition, TransitionType } from "./components/Transition";
import { Vignette } from "./components/Vignette";
import { config } from "./config";
import { BlackLabelScene } from "./scenes/BlackLabelScene";
import { ClosingScene } from "./scenes/ClosingScene";
import { DuoScene } from "./scenes/DuoScene";
import { HookScene } from "./scenes/HookScene";
import { PricesScene } from "./scenes/PricesScene";
import { RedLabelScene } from "./scenes/RedLabelScene";
import { SCENES, SceneId, sceneStart, TOTAL_FRAMES } from "./timeline";

const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  hook: HookScene,
  redLabel: RedLabelScene,
  blackLabel: BlackLabelScene,
  duo: DuoScene,
  prices: PricesScene,
  closing: ClosingScene,
};

/** Efecto que tapa cada corte (los cortes caen en los beats, ver timeline.ts). */
const TRANSITIONS: { at: SceneId; type: TransitionType; pre: number; post: number; direction?: 1 | -1 }[] = [
  { at: "redLabel", type: "flare", pre: 8, post: 10 },
  { at: "blackLabel", type: "sweep", pre: 9, post: 11 },
  { at: "duo", type: "sweep", pre: 9, post: 11, direction: -1 },
  { at: "prices", type: "dip", pre: 6, post: 5 },
  { at: "closing", type: "flare", pre: 8, post: 10, direction: -1 },
];

/** Video completo. Se usa igual para vertical y horizontal: cada escena adapta su layout. */
export const PromoVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const { music } = config;
  const hasMusic = hasStaticFile(music.file);
  const fadeIn = Math.max(1, music.fadeInSeconds * fps);
  const fadeOut = Math.max(1, music.fadeOutSeconds * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: config.colors.black }}>
      {SCENES.map(({ id, from, durationInFrames }) => {
        const Scene = SCENE_COMPONENTS[id];
        return (
          <Sequence key={id} name={id} from={from} durationInFrames={durationInFrames}>
            <Scene />
          </Sequence>
        );
      })}

      {TRANSITIONS.map(({ at, type, pre, post, direction }) => (
        <Sequence key={at} name={`transición → ${at}`} from={sceneStart(at) - pre} durationInFrames={pre + post}>
          <Transition type={type} pre={pre} post={post} direction={direction} />
        </Sequence>
      ))}

      <Vignette />
      <FilmGrain opacity={0.07} />

      {hasMusic ? (
        <Audio
          src={staticFile(music.file)}
          trimBefore={Math.round(music.startFromSeconds * fps)}
          volume={(f) =>
            interpolate(f, [0, fadeIn, TOTAL_FRAMES - fadeOut, TOTAL_FRAMES], [0, music.volume, music.volume, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
