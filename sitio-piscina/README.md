# Sitio web + panel para un complejo de piscinas 🏊

Sitio público (pensado primero para celular) y panel de administración privado para un complejo de piscinas en Uruguay que funciona con **suscripción mensual**.

- **Sitio público:** inicio con olas animadas, piscinas, clases con reservas y cupos, historia, planes, alta de socio en 5 pasos, pago con Mercado Pago y el carnet digital con QR (**Mi Carnet**).
- **Panel `/admin`:** solo entra el email del dueño, con Google. Tiene dashboard, socios, control de ingreso con escáner QR, pagos, planes, clases y horarios, el contenido editable del sitio y la configuración.
- **Tecnología:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Supabase (base de datos, login y archivos) y Mercado Pago (suscripciones y pago único).

> El nombre **"Aquazul"**, la ciudad, los precios, las clases y las fotos son **de ejemplo**. Todo se cambia desde el panel → *Configuración* y *Contenido del sitio*, sin tocar código.

---

## 1. Probarlo ya (modo demo, sin configurar nada)

```bash
npm install
npm run dev
```

Abrí <http://localhost:3000>. Sin las variables de Supabase el sitio corre en **modo demo**:

| Dónde | Qué podés probar |
|---|---|
| `/` | Todo el sitio con el contenido de ejemplo |
| `/hacete-socio` | El alta completa. El pago se simula y el carnet se guarda **solo en tu navegador** |
| `/mi-carnet` | El carnet con QR, pantalla completa, descarga, reservas e historial |
| `/admin` | El panel con datos ficticios. En modo demo los cambios no se guardan |

---

## 2. Puesta en marcha real

### 2.1 Supabase (base de datos, login y fotos)

1. Creá un proyecto en <https://supabase.com>. Conviene elegir la región São Paulo, que es la más cercana a Uruguay.
2. Entrá a **SQL Editor**, pegá todo el archivo [`supabase/migrations/0001_esquema_inicial.sql`](supabase/migrations/0001_esquema_inicial.sql) y ejecutalo. Ese script crea:
   - las tablas,
   - las reglas de seguridad (RLS),
   - los buckets de fotos,
   - las funciones de pagos, accesos y reservas.
3. En **Project Settings → API** copiá la `URL`, la `anon key` y la `service_role key`.
4. En **Authentication → URL Configuration** configurá:
   - **Site URL:** `https://TU-DOMINIO`
   - **Redirect URLs:** `https://TU-DOMINIO/auth/callback` y `https://TU-DOMINIO/auth/confirm`. Para probar en tu compu, agregá también las mismas con `http://localhost:3000`.
5. **Login con código para socios.** En **Authentication → Email Templates → Magic Link** reemplazá el contenido por:

   ```html
   <h2>Tu código para entrar a Mi Carnet</h2>
   <p style="font-size:28px;letter-spacing:6px"><strong>{{ .Token }}</strong></p>
   <p>O tocá este enlace: <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/mi-carnet">Entrar a Mi Carnet</a></p>
   ```

6. **Login con Google para el panel:**
   1. En <https://console.cloud.google.com>, entrá a *APIs y servicios → Credenciales → Crear ID de cliente de OAuth* y elegí *Aplicación web*.
   2. En **URI de redireccionamiento autorizados** poné `https://TU-PROYECTO.supabase.co/auth/v1/callback`.
   3. En Supabase, entrá a **Authentication → Providers → Google**, activalo y pegá el *Client ID* y el *Client Secret*.
7. **Emails (recomendado).** El envío de emails que trae Supabase de fábrica tiene límites bajos. Para producción configurá un SMTP propio (Resend, Brevo, etc.) en **Authentication → SMTP Settings**.

### 2.2 Variables de entorno

Copiá `.env.example` como `.env.local` (en tu compu) o cargalas en el hosting:

| Variable | Qué es |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL pública, ej. `https://www.tupiscina.com.uy`. Se usa para SEO, el QR y Mercado Pago |
| `NEXT_PUBLIC_WHATSAPP` | WhatsApp inicial (`59899123456`). Después se cambia desde el panel |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Datos de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secreta.** Solo la usa el servidor |
| `ADMIN_EMAIL` | **El único email que puede entrar al panel**, ej. `correodueño@gmail.com` |
| `NEXT_PUBLIC_ADMIN_INACTIVIDAD_MIN` | Minutos sin actividad hasta que se cierra el panel. Por defecto son 30 |
| `MERCADOPAGO_ACCESS_TOKEN` | Opcional: también se puede cargar desde el panel |
| `MERCADOPAGO_WEBHOOK_SECRET` | Opcional: también se puede cargar desde el panel |
| `PAGOS_SIMULADOS` | Solo para pruebas: `true` activa socios sin cobrar. **Nunca en producción** |

### 2.3 Publicar en Vercel

1. Importá el repositorio en <https://vercel.com/new>.
2. En **Root Directory** elegí `sitio-piscina`.
3. Cargá las variables de entorno y hacé *Deploy*.
4. Conectá tu dominio y actualizá `NEXT_PUBLIC_SITE_URL`, junto con las URLs de Supabase del paso 2.1.

### 2.4 Primer ingreso al panel

1. Entrá a `https://TU-DOMINIO/admin/ingresar`. No hay ningún enlace al panel desde el sitio público.
2. Ingresá con la cuenta de Google de `ADMIN_EMAIL`. Ese email se copia solo a la tabla que usan las reglas de seguridad de la base.
3. En el dashboard tocá **"Cargar contenido para editar"**. Eso copia el contenido de ejemplo (planes, clases, piscinas, galería, historia) a la base para que lo puedas editar.
4. En **Configuración** cargá los datos reales del negocio: nombre, logo, dirección, redes y mapa de Google.

### 2.5 Mercado Pago

1. En <https://www.mercadopago.com.uy/developers> creá una aplicación y copiá el **Access Token de producción** (`APP_USR-…`).
2. En **Webhooks** de la aplicación:
   - poné la URL `https://TU-DOMINIO/api/mercadopago/webhook`,
   - marcá los eventos **Pagos** y **Planes y suscripciones**,
   - copiá la **clave secreta**.
3. Cargá el token y la clave en **Panel → Configuración → Mercado Pago**, o en las variables de entorno. Tocá *Probar conexión*.

El socio puede pagar de dos formas:

- **Débito automático mensual.** Usa una suscripción (*preapproval*) y Mercado Pago cobra solo cada mes.
- **Pago único de un mes.** Usa Checkout Pro y acepta tarjeta, débito, saldo o efectivo en redes de cobranza.

Cada cobro aprobado llega por webhook y hace lo siguiente:

- extiende el vencimiento y, la primera vez, **genera el carnet** (número de socio y QR);
- si un pago se rechaza o se reembolsa, queda registrado;
- si se cancela la suscripción, se desactiva la renovación.

El estado "vencido" se calcula solo con la fecha de vencimiento, así que no hace falta ninguna tarea programada.

> **Para probar:** usá credenciales y [usuarios de prueba](https://www.mercadopago.com.uy/developers/es/docs/your-integrations/test/accounts) de Mercado Pago. En las suscripciones, el email del socio tiene que ser el de la cuenta de Mercado Pago que paga. En tu compu (localhost) Mercado Pago no puede mandar webhooks: por eso, al volver del pago, la página `/hacete-socio/listo` consulta el estado del pago directamente.

### 2.6 Fotos reales

- **Desde el panel (recomendado):** en *Contenido del sitio* podés subir y reordenar la galería y las fotos de las piscinas, el fondo del inicio y la historia. Las imágenes se achican solas para que carguen rápido.
- **Desde el código:** las fotos de ejemplo están en `public/imagenes/`. Reemplazalas por las tuyas con el mismo nombre.
- **Video de fondo:** en *Contenido → Textos* podés poner un video de fondo para el inicio (mp4 liviano).

---

## 3. Seguridad

### Panel de administración

- Solo entra `ADMIN_EMAIL`, iniciando sesión con **Google**.
- Se verifica en tres lugares:
  1. el *callback* de login (cualquier otra cuenta se rechaza con "Acceso no autorizado"),
  2. el layout y cada acción del servidor,
  3. las reglas **RLS** de la base, con la función `es_admin()`. Esa función exige el email autorizado **y** que la sesión se haya iniciado con Google: una sesión con contraseña con el mismo email no alcanza.
- **Cierre por inactividad**, en dos niveles:
  - en el navegador, con un aviso 1 minuto antes;
  - en el servidor: el *proxy* cierra la sesión si pasó el tiempo sin pedidos.

### Datos de los socios

- Cada socio ve **solo su ficha, sus pagos y sus reservas**. Un socio no puede modificar su vencimiento ni su plan.
- Las fotos están en un bucket **privado** y se muestran con URLs firmadas que vencen.

### Pagos y webhooks

- Los precios se leen siempre de la base en el servidor: nadie puede cambiar el monto desde el navegador.
- El webhook valida la firma `x-signature` y siempre vuelve a consultar el pago a la API de Mercado Pago.
- La `service_role key` y el token de Mercado Pago nunca llegan al navegador.

---

## 4. Comandos

```bash
npm run dev        # desarrollo
npm run build      # build de producción
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm test           # pruebas unitarias (cédula, firma de Mercado Pago)
npm run test:db    # prueba la migración SQL completa en un Postgres en memoria (PGlite)
```

## 5. Estructura

```
src/
  app/(sitio)/        sitio público: inicio, hacete-socio, mi-carnet, términos, privacidad
  app/admin/          panel (login con Google + secciones)
  app/api/            alta de socios, pagos y webhook de Mercado Pago
  app/v/[token]/      destino del QR del carnet (valida solo si lo abre el admin)
  components/         secciones, carnet, alta y panel
  content/            contenido de ejemplo (se usa hasta que lo cargues en la base)
  lib/                Supabase, Mercado Pago, contenido, validaciones, modo demo
supabase/migrations/  esquema de la base, RLS, funciones y buckets
public/imagenes/      fotos de ejemplo (reemplazables)
```

## 6. A tener en cuenta

- **Reservas de clases.** Las reservas son para la **próxima fecha** de cada horario y cualquier socio activo puede reservar. Si querés limitar las clases según el plan (por ejemplo, solo el Plan Full), es un cambio chico en la función `reservar_clase`.
- **Cambios de precio.** Si cambiás el precio de un plan, las suscripciones con débito automático que ya existen siguen con el monto anterior hasta que el socio renueve o cambie de plan.
- **Textos legales.** Los términos y la política de privacidad son un **modelo**: revisalos con tu asesor (Ley N.º 18.331).
