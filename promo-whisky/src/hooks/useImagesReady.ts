import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";

/**
 * Las imágenes usadas como CSS mask-image o background-image no las espera
 * Remotion. Este hook pausa el render hasta que estén decodificadas.
 */
export const useImagesReady = (srcs: string[]) => {
  const key = srcs.join("|");
  const [handle] = useState(() => delayRender(`Cargando imágenes: ${key}`));

  useEffect(() => {
    Promise.all(
      key.split("|").map((src) => {
        const img = new Image();
        img.src = src;
        // Si falta un archivo no frenamos el render: se ve el placeholder.
        return img.decode().catch(() => undefined);
      }),
    ).then(() => continueRender(handle));
  }, [handle, key]);
};
