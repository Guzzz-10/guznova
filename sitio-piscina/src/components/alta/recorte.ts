import type { Area } from "react-easy-crop";

/** Recorta la imagen al área elegida y la exporta como JPEG 600×800 (tipo carnet). */
export async function recortarImagen(src: string, area: Area, ancho = 600, alto = 800): Promise<{ blob: Blob; dataUrl: string }> {
  const img = await new Promise<HTMLImageElement>((ok, mal) => {
    const i = new Image();
    i.onload = () => ok(i);
    i.onerror = mal;
    i.src = src;
  });
  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ancho, alto);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, ancho, alto);
  const blob = await new Promise<Blob>((ok) => canvas.toBlob((b) => ok(b!), "image/jpeg", 0.88));
  return { blob, dataUrl: canvas.toDataURL("image/jpeg", 0.88) };
}

export const dataUrlABlob = async (dataUrl: string) => (await fetch(dataUrl)).blob();
