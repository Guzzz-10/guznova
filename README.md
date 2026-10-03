# Automotoro GuzNova — demo web

Demo de sitio premium para una automotora de Rosario. Next.js (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion + Lenis.

## Levantarlo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # versión de producción
```

## Deploy en Vercel

1. Subí el repo a GitHub (ya está en `guzzz-10/guznova`).
2. En vercel.com → **Add New → Project** → importá el repo. Vercel detecta Next.js solo; no hace falta configurar nada.
3. **Deploy**. Cada push a la rama principal redeploya (y cada rama genera un preview).

O por CLI: `npx vercel` (preview) y `npx vercel --prod`.

## Qué editar

- `data/autos.ts` — los autos (fotos de Unsplash por ID; reemplazar por fotos reales del cliente).
- `lib/site.ts` — dirección, teléfono, email y **número de WhatsApp** (hoy es de ejemplo).
- `app/globals.css` — paleta (`--color-accent`, `--color-ink`, `--color-paper`).
- `components/Financiacion.tsx` — tasa de referencia (`TNA`).

Respeta `prefers-reduced-motion`: sin smooth scroll, sin parallax, y destacados como lista scrolleable.
