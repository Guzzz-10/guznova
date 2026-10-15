# AutoNova — Sitio web + panel de administración

Sitio web para una automotora de autos usados en Uruguay, con catálogo, fichas de autos, contacto directo por WhatsApp, reseñas moderadas y un panel de administración pensado para personas sin conocimientos técnicos.

**Tecnologías:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Prisma + SQLite (listo para PostgreSQL).

---

## 1. Instalación y ejecución

### Requisito: Node.js (una sola vez)

Descargá la versión **LTS** desde <https://nodejs.org>, instalala con las opciones por defecto y **reiniciá la computadora**.

### Opción fácil: doble clic

1. Descargá el proyecto (en GitHub: botón **`<> Code` → Download ZIP**).
2. **Windows:** antes de descomprimir, hacé clic derecho sobre el ZIP → **Propiedades** → marcá **Desbloquear** → **Aceptar**. Así Windows no bloquea el lanzador.
3. Descomprimí el ZIP (clic derecho → **Extraer todo…**). Conviene dejar la carpeta **fuera de OneDrive**, por ejemplo en `C:\autonova`, porque OneDrive puede trabar la instalación. No lo abras desde adentro del ZIP.
4. Hacé doble clic en:
   - **Windows:** `iniciar.bat`. Si aparece *“Windows protegió su PC”*, tocá **Más información** → **Ejecutar de todas formas**.
   - **Mac:** `iniciar.command`. Si aparece *“No se abrió…”*, tocá **Listo** (no lo mandes a la papelera). Después andá a **Ajustes del Sistema → Privacidad y seguridad**, bajá hasta *Seguridad*, tocá **Abrir igualmente**, poné tu contraseña y volvé a abrir el archivo. En macOS 14 o anteriores alcanza con clic derecho → **Abrir** → **Abrir**.
5. La primera vez instala todo y carga los datos de demo (puede tardar varios minutos). Cuando el sitio está listo, el navegador se abre solo.

**No cierres la ventana negra** mientras usás el sitio: si la cerrás, el sitio se apaga y el navegador muestra *“localhost ha rechazado la conexión”*. Para apagarlo, cerrá esa ventana.

> **Si el sitio se queda cargando:** en Windows, hacer clic dentro de la ventana negra la pone en modo “Seleccionar” y pausa el servidor. Hacé clic en la ventana y apretá **Esc**.

### Opción con la terminal

```bash
npm install
npm run dev
```

La primera vez, `npm run dev` crea solo el archivo `.env`, la base de datos y los datos de demo (10 autos con fotos, 5 reseñas y el usuario admin).

Abrí <http://localhost:3000> para ver el sitio y <http://localhost:3000/admin> para el panel. Si en la terminal aparece otro puerto (por ejemplo `3001`, porque el 3000 está ocupado), usá ese.

### Si el navegador dice “localhost ha rechazado la conexión”

Significa que el sitio **no está corriendo** en tu computadora. Revisá que:

- La ventana negra (o la terminal con `npm run dev`) siga abierta y diga **`Ready`**.
- No haya un error en esa ventana. Si lo hay, copialo para revisarlo.
- Estés entrando a la dirección que muestra la terminal (normalmente `http://localhost:3000`).
- La terminal esté abierta **dentro de la carpeta del proyecto** (la que tiene `package.json`). Si `npm` dice *“Could not read package.json”*, estás en otra carpeta: entrá con `cd` a la del proyecto.

### Modo producción (local)

```bash
npm run build
npm start
```

### Comandos útiles

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Sitio en modo desarrollo (se recarga solo al editar). |
| `npm run build` / `npm start` | Compila y levanta la versión de producción. |
| `npm run setup` | Crea la base de datos y carga los datos de demo (lo hace solo `npm run dev` la primera vez). |
| `npm run db:reset` | **Borra todo** y vuelve a cargar los datos de demo. |
| `npm run lint` | Chequeo de tipos de TypeScript. |

---

## 2. Credenciales de la demo

| | |
| --- | --- |
| **URL del panel** | `/admin` |
| **Usuario** | `admin` |
| **Contraseña** | `autonova2024` |

Se definen en `.env` (`SEED_ADMIN_USER` y `SEED_ADMIN_PASSWORD`) antes de correr el seed. **Antes de publicar el sitio**, cambiá la contraseña desde *Panel → Configuración → Cambiar contraseña*.

---

## 3. Cómo cambiar el número de WhatsApp (y otros datos)

No hace falta tocar código:

1. Entrá a `/admin` con tu usuario.
2. Andá a **Configuración**.
3. En **Número de WhatsApp** escribí el número con código de país, sin `+` ni espacios. Ejemplo: `59899123456` (598 + 099 123 456 sin el 0 inicial).
4. Tocá **Probar** para verificar que abre el chat correcto y después **Guardar cambios**.

En esa misma pantalla podés cambiar:

- El **mensaje automático** del botón “Me interesa”. Variables disponibles: `{auto}` (marca, modelo y año), `{precio}` y `{link}` (link a la ficha). Hay una vista previa en vivo.
- El mensaje del botón flotante de WhatsApp.
- Teléfono, email, dirección, ciudad, ubicación del mapa y horarios.
- Links a Instagram, Facebook y TikTok (si un campo queda vacío, no se muestra el ícono).
- Los números animados del inicio (autos vendidos, años, % de clientes satisfechos).
- Nombre comercial, **razón social** y **RUT** (aparecen en el pie de página y en las páginas legales).

> Los datos de contacto que vienen cargados (dirección, teléfono, WhatsApp, horarios) son **de ejemplo**. La razón social y el RUT figuran como `[razón social]` y `[RUT]` hasta que los completes.

---

## 4. Qué incluye

### Sitio público
- **Inicio:** hero animado con auto destacado, marcas, autos destacados, beneficios, reseñas aprobadas, contacto rápido y contadores animados.
- **Catálogo** (`/autos`): filtros por marca, modelo, año, precio, kilometraje, combustible y transmisión; ordenamiento por precio, año y km; etiqueta Disponible / Reservado / Vendido. Los filtros quedan en la URL (se pueden compartir).
- **Ficha del auto:** galería con deslizamiento, lightbox con zoom, datos técnicos, equipamiento, autos similares y botón **“Me interesa”** que abre WhatsApp con el mensaje precargado. En el celular, el precio y el botón quedan fijos abajo.
- **Botón flotante de WhatsApp** en todo el sitio.
- **Nosotros**, **Contacto** (con mapa de Google que se carga solo si se aceptan las cookies) y **Reseñas** (formulario con estrellas).
- **Legal:** Política de Privacidad (Ley N° 18.331), Términos y Condiciones (Ley N° 17.250), Política de Cookies y banner de consentimiento (Aceptar / Rechazar).

### Panel de administración (`/admin`)
- Inicio con resumen: autos publicados, vendidos, destacados y reseñas pendientes.
- **Autos:** crear, editar, eliminar (con confirmación), cambiar estado y destacar desde el listado.
- **Fotos:** arrastrar y soltar o elegir desde el celular, varias a la vez, con barra de progreso; elegir portada y reordenar. Las fotos se optimizan automáticamente (máx. 2000 px, JPG).
- **Reseñas:** aprobar y publicar, ocultar o eliminar. Solo las aprobadas se ven en el sitio.
- **Configuración** del negocio y cambio de contraseña.
- Mensajes claros de éxito y error, y navegación inferior pensada para el celular.

### SEO, rendimiento y accesibilidad
- Metadatos por página, `sitemap.xml`, `robots.txt` y datos estructurados (schema.org) en cada auto.
- **Open Graph:** cada auto genera una imagen con foto, nombre y precio, para que se vea bien al compartirlo por WhatsApp o redes.
- Imágenes optimizadas con `next/image` (AVIF/WebP), carga diferida.
- Respeta `prefers-reduced-motion`, navegación con teclado, textos alternativos y contraste adecuado.

### Seguridad
- Contraseñas hasheadas con bcrypt; sesión firmada (JWT) en cookie `httpOnly`.
- Todo `/admin` protegido por middleware, y cada acción del panel vuelve a validar la sesión.
- Límite de intentos de login.
- Validación de formularios en el cliente **y** en el servidor (zod).
- Anti-spam en reseñas: campo trampa (honeypot), tiempo mínimo de llenado, límite de envíos por conexión y bloqueo de links. La IP se guarda solo como hash.

---

## 5. Cómo publicarlo online

El sitio necesita un servidor Node.js. Hay dos caminos según el presupuesto y la escala:

### Opción A — Servidor con disco persistente (la más simple, mantiene SQLite)

Sirve cualquier servicio que ofrezca un **disco/volumen persistente**: Railway, Render, Fly.io o un VPS (DigitalOcean, Hetzner, etc.).

1. Subí el código a un repositorio de GitHub y conectalo al servicio.
2. Configurá las variables de entorno:
   - `DATABASE_URL="file:/data/autonova.db"` (ruta dentro del volumen persistente)
   - `AUTH_SECRET` → una clave larga y aleatoria. Generala con:
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `NEXT_PUBLIC_SITE_URL="https://www.tudominio.com.uy"` (importante para los links de WhatsApp y Open Graph)
   - `UPLOADS_DIR="/data/uploads"` (las fotos subidas también quedan en el volumen persistente)
3. Montá el volumen persistente en `/data`.
4. Comandos:
   - Build: `npm install && npm run build`
   - Primera vez: `npx prisma db push && npm run db:seed` (o solo `npx prisma db push` para empezar sin datos de demo y crear el usuario con el seed)
   - Start: `npm start`
5. Apuntá tu dominio al servicio (ellos dan las instrucciones de DNS) y verificá que tenga HTTPS.

En un VPS propio podés usar `pm2` para mantenerlo corriendo y Nginx/Caddy como proxy con HTTPS.

### Opción B — Vercel + PostgreSQL + storage en la nube

Vercel no tiene disco persistente, así que hay que cambiar dos cosas:

1. **Base de datos → PostgreSQL** (por ejemplo Neon o Supabase):
   - En `prisma/schema.prisma` cambiá `provider = "sqlite"` por `provider = "postgresql"`.
   - En `DATABASE_URL` poné la URL de conexión de PostgreSQL.
   - Corré `npx prisma db push && npm run db:seed` una vez apuntando a esa base.
   El esquema no usa nada específico de SQLite, así que no hace falta cambiar más código.
2. **Fotos → storage en la nube** (Vercel Blob, Cloudinary, S3, Cloudflare R2…):
   - Toda la lógica está aislada en `src/lib/storage.ts`. Implementá un nuevo `StorageDriver` (métodos `save` y `remove`) y asignalo a `driver`.
   - Agregá el dominio de las imágenes en `images.remotePatterns` de `next.config.ts`.
3. Cargá las mismas variables de entorno (`AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`) en el proyecto de Vercel.

### Checklist antes de publicar
- [ ] Cambiar la contraseña del admin.
- [ ] Definir un `AUTH_SECRET` propio y `NEXT_PUBLIC_SITE_URL` con el dominio real.
- [ ] Completar WhatsApp, dirección, horarios, redes, **razón social** y **RUT** en *Configuración*.
- [ ] Reemplazar los autos y fotos de demo por los reales (o arrancar con la base vacía).
- [ ] Reemplazar las fotos del local en *Nosotros* (`src/app/(site)/nosotros/page.tsx`).
- [ ] **Hacer revisar los textos legales por un profesional** (ver abajo).
- [ ] Evaluar la inscripción de la base de datos ante la URCDP.

---

## 6. Textos legales

Las páginas `/privacidad`, `/terminos` y `/cookies` son **plantillas** basadas en la normativa uruguaya (Ley N° 18.331 de Protección de Datos Personales y Ley N° 17.250 de Defensa del Consumidor). **Deben ser revisadas por un abogado o escribano** antes de publicar el sitio. Hay un comentario en el código de cada página indicándolo. Se completan solas con la razón social, RUT, dirección y email de la configuración.

---

## 7. Estructura del proyecto

```
prisma/
  schema.prisma        Modelo de datos (Car, CarImage, Review, Setting, AdminUser)
  seed.ts              Datos de demo
  demo-images.ts       Generador de las fotos ilustrativas de demo
public/uploads/        Fotos subidas (no se versiona; configurable con UPLOADS_DIR)
src/
  app/
    (site)/            Sitio público: inicio, autos, ficha, nosotros, contacto, reseñas, legales
    admin/             Panel: login, inicio, autos, reseñas, configuración
    api/               Subida de fotos y entrega de fotos subidas
    sitemap.ts, robots.ts, opengraph-image.tsx
  components/
    site/              Componentes del sitio público
    admin/             Componentes del panel
    ui/                Logo, animaciones, íconos
  lib/
    storage.ts         ⚙️ Guardado de imágenes (punto único para cambiar a la nube)
    auth.ts            Sesión del panel
    settings.ts        Configuración editable del negocio
    whatsapp.ts        Armado de links wa.me y mensajes
    validation.ts      Validaciones compartidas cliente/servidor
  middleware.ts        Protección de /admin
```

### Notas técnicas
- Las páginas se generan en cada visita (`force-dynamic`), así cualquier cambio en el panel se ve al instante.
- En producción, Next.js solo sirve los archivos de `public/` que existían al compilar; las fotos subidas después se entregan desde `src/app/api/uploads` mediante una regla `fallback` en `next.config.ts`.
- La fuente Sora para las imágenes Open Graph está en `src/assets/fonts` (licencia SIL OFL).
