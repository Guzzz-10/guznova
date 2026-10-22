import React from "react";
import { Composition } from "remotion";
import { config } from "./config";
import { PromoVideo } from "./PromoVideo";
import { TOTAL_FRAMES } from "./timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Vertical 9:16 — Reels, TikTok, estados de WhatsApp */}
      <Composition
        id="PromoWhisky"
        component={PromoVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={config.fps}
        width={1080}
        height={1920}
      />
      {/* Horizontal 16:9 — mismas escenas, layout adaptado */}
      <Composition
        id="PromoWhiskyHorizontal"
        component={PromoVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={config.fps}
        width={1920}
        height={1080}
      />
    </>
  );
};
