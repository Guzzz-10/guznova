import { useVideoConfig } from "remotion";

/** Datos de layout para adaptar cada escena a vertical (9:16) u horizontal (16:9). */
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const portrait = height >= width;
  return {
    width,
    height,
    portrait,
    /** Elige un valor según la orientación. */
    pick: <T,>(vertical: T, horizontal: T): T => (portrait ? vertical : horizontal),
  };
};
