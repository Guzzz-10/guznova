import { getStaticFiles } from "remotion";

/** true si el archivo existe dentro de /public. */
export const hasStaticFile = (name: string) =>
  getStaticFiles().some((f) => f.name === name);
