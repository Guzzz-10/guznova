import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";

const playfair = loadPlayfair("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});
loadPlayfair("italic", { weights: ["400", "600"], subsets: ["latin"] });

const montserrat = loadMontserrat("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});

/** Títulos: serif elegante. */
export const SERIF = `${playfair.fontFamily}, Georgia, serif`;
/** Textos secundarios. */
export const SANS = `${montserrat.fontFamily}, Helvetica, Arial, sans-serif`;
