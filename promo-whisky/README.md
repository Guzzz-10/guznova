# Promo Whisky — Tomás Irigoyen

Video promocional (Red Label y Black Label) hecho con [Remotion](https://www.remotion.dev) (React + TypeScript).

- **Vertical 1080×1920** (`PromoWhisky`): Reels, TikTok, estados de WhatsApp.
- **Horizontal 1920×1080** (`PromoWhiskyHorizontal`): mismas escenas, layout adaptado.
- 30 fps, 21 s (42 beats a 120 BPM).

Videos ya renderizados: `out/promo-whisky.mp4` y `out/promo-whisky-horizontal.mp4`.

## Uso

Requiere Node 20.19+ o 22.13+.

```bash
npm install
npm run dev                 # vista previa en el navegador (Remotion Studio)
npm run render              # → out/promo-whisky.mp4 (vertical)
npm run render:horizontal   # → out/promo-whisky-horizontal.mp4
npm run render:all          # los dos
```

La primera vez que renderizás, Remotion descarga automáticamente un Chrome
headless (hace falta internet). Las fuentes se bajan de Google Fonts.

## Qué editar

Todo está en **`src/config.ts`**:

| Qué | Dónde |
| --- | --- |
| Textos de cada escena | `texts` |
| Precios y promo | `prices` (`promo: ""` la oculta) |
| Nombre, WhatsApp, Instagram | `contact` |
| Colores | `colors` |
| Música, BPM, volumen, desde qué segundo arranca la pista | `music` |
| Duración de cada escena (en beats) | `sceneBeats` |

- **Música:** reemplazá `public/music.mp3` (ahora es un archivo silencioso de
  ejemplo) por tu pista libre de derechos. Poné el BPM real en `music.bpm`; si
  el primer beat no cae en el segundo 0, ajustá `music.startFromSeconds`.
  Si cambiás el BPM, ajustá `sceneBeats` para que el total siga entre 18 y 22 s.
- **Fotos de las botellas:** `public/assets/red-label.png` y
  `public/assets/black-label.png` (PNG con fondo transparente). Las actuales
  se recortaron de fotos de baja resolución: con PNGs de 1600 px de alto o más
  se ven mucho más nítidas. Si falta un archivo, aparece un recuadro indicando
  cuál poner.

## Estructura

```
src/
  config.ts          ← todo lo editable
  timeline.ts        cortes de escena sincronizados al BPM
  PromoVideo.tsx     arma el video: escenas + transiciones + viñeta + grano + música
  Root.tsx           composiciones vertical y horizontal
  scenes/            una escena por archivo (Hook, RedLabel, BlackLabel, Duo, Prices, Closing)
  components/        efectos: partículas, humo, destellos, botella, vaso con hielo, etc.
public/
  assets/            fotos de las botellas
  fx/                texturas de humo y grano (generadas con scripts/generate-textures.py)
  music.mp3          pista de música
```
