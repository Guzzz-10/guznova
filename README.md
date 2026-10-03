# GuzNova Automotora — demo web

Demo de sitio para una automotora de Rosario. Next.js (App Router) + TypeScript + Tailwind CSS 4 + Framer Motion + Lenis + lucide-react.

## Levantarlo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # versión de producción
```

Requiere Node 20+.

## Estructura

```
app/               layout, home y /auto/[slug] (ficha compartible)
components/
  sections/        Hero, Destacados, Catalogo, PorQue, Financiacion, Testimonios, Contacto
  ui/              Reveal, SplitText, Magnetic, Counter, AnimatedNumber, CarImage, Button, HashLink
  AutoCard, AutoModal (layoutId compartido), Gallery, AutoInfo, Navbar, Footer, WhatsAppFloat, SmoothScroll
data/autos.ts      autos de ejemplo (editar acá)
lib/               site.ts (datos de contacto y WhatsApp), format, motion, lenis
```

## Personalizar

- **Autos y fotos:** `data/autos.ts`. Las fotos son de Unsplash (dominio permitido en `next.config.ts`); si una no carga se muestra un placeholder. Para producción, reemplazarlas por fotos reales de cada unidad.
- **Contacto / WhatsApp:** `lib/site.ts` (el número `5493415550123` es de ejemplo).
- **Tasa del simulador:** `TNA` en `components/sections/Financiacion.tsx`.
- **Color de acento:** variable `--color-accent` en `app/globals.css`.

## Deploy en Vercel

1. Subir el repo a GitHub.
2. En [vercel.com/new](https://vercel.com/new) importar el repo; Vercel detecta Next.js sin configuración.
3. Deploy. No requiere variables de entorno.

O por CLI: `npx vercel` (preview) y `npx vercel --prod`.
