import { useCurrentFrame } from "remotion";
import { FRAMES_PER_BEAT } from "../timeline";

/**
 * Pulso que vale 1 justo en cada beat y decae hasta el siguiente.
 * Las escenas empiezan siempre en un beat, así que el frame relativo alcanza.
 */
export const useBeatPulse = (decay = 5) => {
  const frame = useCurrentFrame();
  const pos = frame / FRAMES_PER_BEAT;
  return Math.exp(-(pos - Math.floor(pos)) * decay);
};
