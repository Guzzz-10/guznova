# Paso a paso completo: bot de WhatsApp de Otormín (Hostinger + n8n + ManyChat)

Qué es cada cosa:
- **Hostinger (VPS):** el servidor donde corre n8n las 24 horas, con su base de datos (Postgres) y Redis.
- **ManyChat (servicio aparte):** conecta el WhatsApp de Otormín y es el inbox donde el equipo lee y responde.
- **OpenAI:** el "cerebro" del bot, más la transcripción de audios y el análisis de fotos.
- **Google:** la planilla de stock (Sheets) y la agenda de visitas (Calendar).

Archivos que vas a usar (en GitHub, rama `claude/stoic-gates-iqv1oc`):
`workflows/otormin_bot.json`, `workflows/otormin_inactividad.json`, `workflows/otormin_errores.json`, `docker-compose.yml`, `.env.example`.

> Convención: donde dice `bot.otormin.com.uy` poné el subdominio real que uses. Donde dice `TU_CLAVE_WEBHOOK`, la clave que generás en el paso 17.

---

# ETAPA 1 – Qué pedirle al cliente

## Paso 1. Mandale este mensaje a Otormín (copiar y pegar)

```
Hola! Para dejar funcionando el asistente de WhatsApp necesito lo siguiente:

ACCESOS
1. ManyChat: crear la cuenta (o usar la que tienen) con plan Pro, y agregarme como
   Administrador: Configuración → Equipo → Invitar → mi email: ____________
2. WhatsApp: el número que van a usar para el bot. Importante:
   - Si ese número hoy está en la app de WhatsApp o WhatsApp Business del celular,
     avisame (hay que pasarlo a la API o usar "coexistencia").
   - Vamos a hacer una videollamada de 15 min para conectarlo: necesito que esté
     la persona que administra el Facebook / Meta Business de la empresa y que tenga
     el celular de ese número a mano (llega un código por SMS o llamada).
   - Nombre que querés que se vea en WhatsApp (ej: "Otormín Automóviles") y logo.
3. OpenAI (la inteligencia del bot): crear una cuenta en platform.openai.com con la
   tarjeta de la empresa, cargar saldo (USD 10 alcanzan para arrancar) y pasarme
   una "API key" (o invitarme a la organización).
4. Google: compartirme (a mi Gmail) la planilla de stock y el Google Calendar
   del local donde se agendan las visitas. Si no tienen planilla, la armo yo y
   ustedes la mantienen.
5. Dominio (opcional): si quieren usar bot.otormin.com.uy, necesito que quien
   maneja el dominio cree un registro DNS (yo les paso el dato), o acceso al panel.

DATOS DEL NEGOCIO (para que el bot responda bien)
6. Nombre con el que se presenta el asistente (ej: "Martín, de Otormín").
7. Dirección exacta del local (y link de Google Maps). ¿Hay más de una sucursal?
8. Días y horarios de atención (y si abren feriados).
9. Teléfono de la sucursal.
10. Financiación: ¿financian? Tasa anual (%), anticipo mínimo (%), en cuántas
    cuotas (12, 24, 36...), requisitos (cédula, recibo de sueldo, etc.) y con quién
    financian (propia, financiera, banco).
11. ¿Toman usados como parte de pago? (el bot nunca da precio de tasación: lo
    pasa a un vendedor).
12. Formas de pago, garantía que dan, documentación para comprar, ¿entregan en el
    interior?, cualquier otra pregunta frecuente con su respuesta.
13. Moneda de los precios (USD / pesos).

STOCK
14. Planilla con una fila por auto y estas columnas:
    id, tipo, marca, modelo, version, anio, km, combustible, transmision, traccion,
    color, puertas, precio_usd, precio_ars, condicion, disponible (SI/NO), sucursal,
    foto_url, descripcion, destacado, fecha_ingreso
    Las fotos: un link directo a la foto (de su web, por ejemplo). Si no tienen,
    me mandan las fotos y las subo yo.
    ¿Quién va a mantener la planilla al día? (el bot la lee en tiempo real)

EQUIPO
15. Nombres y emails de los vendedores que van a atender los chats en ManyChat.
16. Email del responsable que recibe los avisos si algo falla.
17. ¿El bot puede agendar visitas solo o prefieren que un vendedor confirme cada turno?
18. ¿Cuándo quieren que el bot pase la conversación a una persona? Por defecto:
    cuando el cliente lo pide, se queja, quiere permutar, hay temas legales o
    prendas, ofrece mucho menos, quiere reservar o cerrar, o el bot no entiende.
```

## Paso 2. Revisar lo que te mandaron (checklist)
- [ ] Soy administrador en ManyChat y el plan es **Pro**.
- [ ] Hay fecha para la videollamada de conexión de WhatsApp.
- [ ] Tengo la **API key de OpenAI** y la cuenta tiene saldo.
- [ ] Me compartieron la **planilla** y el **calendario** (o los creo yo).
- [ ] Tengo todos los datos del negocio (puntos 6 a 13).
- [ ] Tengo los emails de los vendedores y del responsable de avisos.
- [ ] Decidido el dominio: `bot.otormin.com.uy`, o uno tuyo (ej. `otormin.tudominio.com`).

---

# ETAPA 2 – Hostinger: el servidor

## Paso 3. Comprar el VPS
1. Entrá a **hostinger.com → VPS** (o, en hPanel, **VPS → Comprar VPS**).
2. Plan **KVM 2** (recomendado). **KVM 1** alcanza para arrancar con pocos mensajes.
3. Al configurarlo:
   - **Ubicación:** **Brasil (São Paulo)**, la más cercana a Uruguay.
   - **Sistema operativo:** **Ubuntu 24.04** (el sistema solo, o "Ubuntu 24.04 con Docker" si aparece).
     **No elijas la plantilla "n8n"**: instala otro n8n que ocupa los puertos 80/443 y choca con este.
   - **Contraseña de root:** inventá una y **guardala**.
4. Terminá la compra y esperá a que el VPS diga **"En ejecución"**.
5. En la vista general del VPS anotá la **dirección IP** (ej. `123.45.67.89`).

> **¿Ya tenés un VPS en Hostinger con tu propio n8n?** Para un cliente conviene un VPS aparte: queda separado de lo tuyo, se lo podés traspasar y lo paga el cliente. Si igual querés usar el mismo servidor, avisame y te paso la variante.

## Paso 4. Firewall (si lo usás)
hPanel → **VPS → (tu VPS) → Seguridad → Firewall**. Si tenés reglas, permití la entrada en los puertos **22** (SSH), **80** y **443**.

## Paso 5. Crear el subdominio
**Si el dominio está en Hostinger:**
1. hPanel → **Dominios** → elegí el dominio → **DNS / Nameservers** → **Administrar registros DNS**.
2. **Agregar registro**:
   - Tipo: **A**
   - Nombre: `bot`
   - Apunta a: **la IP del VPS**
   - TTL: el que viene
3. **Agregar registro**.

**Si el dominio es del cliente y está en otro lado:** pediles que creen ese mismo registro A (`bot` → IP del VPS).

**Para comprobarlo:** desde tu compu, `ping bot.otormin.com.uy` tiene que responder la IP del VPS. Puede tardar de 5 minutos a un par de horas.

## Paso 6. Abrir la terminal del servidor
hPanel → **VPS → (tu VPS)** → botón **"Terminal del navegador"** (arriba a la derecha). Se abre una consola negra ya conectada como `root`.
Todo lo de los pasos 7 a 10 se escribe ahí: copiá cada bloque, pegalo y apretá Enter.

## Paso 7. Instalar Docker
Si elegiste "Ubuntu 24.04 con Docker", saltá este paso. Si no:
```bash
curl -fsSL https://get.docker.com | sh
docker --version && docker compose version
```
Tienen que aparecer las dos versiones.

## Paso 8. Bajar el proyecto
```bash
git clone -b claude/stoic-gates-iqv1oc https://github.com/Guzzz-10/guznova.git /root/otormin
cd /root/otormin
ls
```
Tenés que ver `docker-compose.yml`, `workflows`, `sql`, `docs`, etc.

## Paso 9. Crear el archivo de configuración `.env`
Cambiá **solo** las dos primeras líneas (tu subdominio y tu email) y pegá todo el bloque:
```bash
cd /root/otormin
cp .env.example .env
sed -i "s|^N8N_HOST=.*|N8N_HOST=bot.otormin.com.uy|" .env
sed -i "s|^ACME_EMAIL=.*|ACME_EMAIL=tu@email.com|" .env
sed -i "s|^N8N_ENCRYPTION_KEY=.*|N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)|" .env
sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$(openssl rand -hex 16)|" .env
sed -i "s|^REDIS_PASSWORD=.*|REDIS_PASSWORD=$(openssl rand -hex 16)|" .env
cat .env
```
**Copiá todo lo que muestra `cat .env` y guardalo** en tu gestor de contraseñas. Si se pierde `N8N_ENCRYPTION_KEY`, se pierden todas las credenciales.

## Paso 10. Levantar todo
```bash
cd /root/otormin
docker compose --profile https up -d
sleep 60
docker compose ps
```
Tienen que aparecer **5 servicios**: `postgres`, `redis`, `n8n`, `n8n-worker` y `caddy`. Todos "Up", y los primeros cuatro "(healthy)".

Si algo falla:
- `docker compose logs caddy`: problemas con el certificado HTTPS (casi siempre el DNS del paso 5 todavía no apunta).
- `docker compose logs n8n`: problemas de n8n.

## Paso 11. Entrar a n8n por primera vez
1. Abrí `https://bot.otormin.com.uy` en el navegador (tiene que aparecer el candado).
2. Creá la cuenta de dueño: email, nombre y contraseña. **Guardala.**
3. La encuesta podés saltearla.

---

# ETAPA 3 – Cuentas externas

## Paso 12. API key de OpenAI
Con la cuenta del cliente:
1. Entrá a **platform.openai.com → Settings → Billing** y cargá saldo.
2. **API keys → Create new secret key** → nombre `n8n-otormin` → copiala (empieza con `sk-`). Se ve una sola vez.

## Paso 13. Google Cloud (para conectar Sheets y Calendar a tu n8n)
n8n instalado en tu servidor necesita su propia "app" de Google. Se hace una sola vez:
1. **Crear el proyecto:** entrá a **console.cloud.google.com** → arriba, selector de proyecto → **Proyecto nuevo** → nombre `Otormin n8n` → Crear.
2. **Habilitar las APIs:** **APIs y servicios → Biblioteca** → habilitá una por una **Google Sheets API**, **Google Drive API** y **Google Calendar API**.
3. **Pantalla de consentimiento** (**APIs y servicios → Pantalla de consentimiento de OAuth**, o "Google Auth Platform"):
   - Tipo **Externo**.
   - Nombre `Otormin n8n` y tu email → guardar.
   - Ir a **Público / Audiencia** y tocar **Publicar app** ("En producción").
     > **Importante:** si la dejás en modo "Prueba", Google corta la conexión a los 7 días y el bot deja de ver el stock.
4. **Crear el cliente OAuth:** **Credenciales → Crear credenciales → ID de cliente de OAuth**:
   - Tipo: **Aplicación web**.
   - En **URIs de redireccionamiento autorizados** → **Agregar URI** → `https://bot.otormin.com.uy/rest/oauth2-credential/callback`
   - **Crear** → copiá el **ID de cliente** y el **Secreto del cliente**.

## Paso 14. La planilla de stock
1. Si no tienen planilla, abrí la del demo y hacé **Archivo → Hacer una copia**: `https://docs.google.com/spreadsheets/d/1b2lqCilMgI8gilY2OGOs27PmfHZlvAX2E4Z2JEUQkmE`
2. La pestaña tiene que llamarse **`stock_autos`**. La fila 1 son los títulos de columna (los del paso 1, punto 14).
3. Cargá los autos de Otormín: una fila por auto, `disponible` = `SI` o `NO`.
4. **Fotos:** el link tiene que abrir la imagen sola (termina en `.jpg` o `.png`). Si el cliente te mandó las fotos:
   - Subilas a tu hosting de Hostinger: hPanel → **Sitios web → Administrador de archivos** → `public_html/autos/`.
   - El link queda `https://tudominio.com/autos/hilux-2021.jpg`.
5. Copiá el link de la planilla (la URL completa del navegador).

## Paso 15. Correo para los avisos de error (Gmail)
1. Entrá a **myaccount.google.com → Seguridad** → activá la **Verificación en 2 pasos**.
2. Buscá **"Contraseñas de aplicaciones"** → creá una llamada `n8n` → copiá la clave de 16 letras.
3. Vas a usar: servidor `smtp.gmail.com`, puerto `465`, SSL activado, tu Gmail y esa clave.

---

# ETAPA 4 – n8n: credenciales y workflows

## Paso 16. API key de n8n
En n8n: abajo a la izquierda, **tu usuario → Settings → n8n API → Create an API key** → nombre `errores` → sin vencimiento → **copiala**.

## Paso 17. Generar la clave del webhook
En la **Terminal del navegador** de Hostinger:
```bash
openssl rand -hex 24
```
Copiá el resultado: es `TU_CLAVE_WEBHOOK`. Va en n8n (paso 18) y en ManyChat (pasos 26, 27 y 29).

Para ver las claves de Postgres y Redis que generaste en el paso 9:
```bash
grep -E "POSTGRES_PASSWORD|REDIS_PASSWORD" /root/otormin/.env
```

## Paso 18. Crear las 9 credenciales en n8n
Para cada una:
1. **Overview → botón ▾ al lado de "Create" → Credential**, buscá el tipo y completá los campos.
2. **Arriba de todo, hacé clic en el nombre de la credencial y cambialo por el nombre EXACTO de la tabla.**
3. **Save.**

| # | Tipo (lo que buscás) | Nombre EXACTO | Campos |
|---|---|---|---|
| 1 | **Header Auth** | `ManyChat API` | Name: `Authorization` · Value: `Bearer ` + token de ManyChat (paso 22). Creala ahora y completás el token después |
| 2 | **Header Auth** | `ManyChat webhook (clave)` | Name: `X-Otormin-Token` · Value: `TU_CLAVE_WEBHOOK` |
| 3 | **OpenAI** | `OpenAI Otormín` | API Key: la `sk-...` del paso 12 |
| 4 | **Postgres** | `Postgres Otormín` | Host `postgres` · Database `otormin` · User `otormin` · Password `POSTGRES_PASSWORD` · Port `5432` · SSL `Disable` |
| 5 | **Redis** | `Redis Otormín` | Host `redis` · Port `6379` · Password `REDIS_PASSWORD` · Database Number `1` |
| 6 | **Google Sheets OAuth2 API** | `Google Sheets Otormín` | Client ID y Client Secret del paso 13 → **Sign in with Google** → elegí la cuenta que tiene la planilla → Permitir |
| 7 | **Google Calendar OAuth2 API** | `Google Calendar Otormín` | Mismo Client ID y Secret → **Sign in with Google** → la cuenta del calendario |
| 8 | **SMTP** | `SMTP avisos Otormín` | User: tu Gmail · Password: clave de aplicación · Host `smtp.gmail.com` · Port `465` · SSL/TLS: activado |
| 9 | **n8n API** | `n8n API (errores)` | API Key: la del paso 16 · Base URL: `http://n8n:5678/api/v1` |

> Los nombres tienen que ser **idénticos**, con tildes y paréntesis: así n8n los conecta solo al importar.

## Paso 19. Bajar los 3 workflows a tu compu
Entrá a `https://github.com/Guzzz-10/guznova/tree/claude/stoic-gates-iqv1oc/workflows`. En cada archivo (`otormin_errores.json`, `otormin_inactividad.json`, `otormin_bot.json`) tocá el botón **"Download raw file"** (la flecha hacia abajo).

## Paso 20. Importar en este orden
**A) Errores**
1. **Overview → Create workflow**.
2. Arriba a la derecha, **⋯ → Import from File...** → `otormin_errores.json`.
3. Doble clic en el nodo **"Configuración de avisos"** y completá:
   - `EMAIL_ADMIN`: el email del responsable (paso 1, punto 16).
   - `EMAIL_REMITENTE`: tu Gmail del paso 15.
   - `FLOW_NOTIFICAR_HUMANO` y `FLOW_ENVIAR_MENSAJES`: dejalos así por ahora (se completan en el paso 34).
4. **Save** → **Publish** (activar). **Obligatorio:** en n8n 2.x, si este workflow no está activo, no se ejecuta.

**B) Inactividad**
1. **Create workflow → ⋯ → Import from File...** → `otormin_inactividad.json`.
2. **⋯ → Settings → Error Workflow** → elegí "Otormín - Errores (aviso al admin)" → Save.
3. **Save** → **Publish**.

**C) Bot**
1. **Create workflow → ⋯ → Import from File...** → `otormin_bot.json`.
2. **⋯ → Settings → Error Workflow** → "Otormín - Errores (aviso al admin)" → Save.
3. **Save**, y **NO lo actives todavía** (se activa en el paso 37).
4. Doble clic en el nodo **"Webhook ManyChat"** → pestaña **Production URL** → copiá la URL. Tiene que ser `https://bot.otormin.com.uy/webhook/otormin-manychat`.

En los tres: revisá que ningún nodo tenga un triángulo rojo de credencial. Si alguno lo tiene, abrilo y elegí la credencial en la lista.

---

# ETAPA 5 – ManyChat (cuenta del cliente)

> Los nombres están como aparecen en ManyChat en español. Si lo ves en inglés: Automatización = *Automation*, Condición = *Condition*, Acciones = *Actions*, Retraso inteligente = *Smart Delay*, Establecer campo = *Set Custom Field*, Borrar campo = *Clear Custom Field*, Solicitud externa = *External Request*.

## Paso 21. Conectar WhatsApp (en la videollamada con el cliente)
1. ManyChat → **Configuración → Canales → WhatsApp → Conectar**.
2. Se abre la ventana de Meta. El cliente entra con su Facebook (el que administra el Meta Business) y:
   - Elige o crea el **Business** (Otormín).
   - Crea o elige la cuenta de WhatsApp Business.
   - Pone el **nombre visible** ("Otormín Automóviles").
   - Ingresa el **número** y el **código** que le llega por SMS o llamada.
3. Al terminar, ManyChat muestra el número conectado.
4. En la misma sección, cargá la foto de perfil, la descripción y la dirección del perfil de WhatsApp.
5. **Pago de Meta:** Meta pide una tarjeta para las plantillas de mensajes (solo se usan si después prendés el seguimiento). Las respuestas dentro de las 24 h no las cobra Meta.

## Paso 22. Token de la API de ManyChat
1. ManyChat → **Configuración → API → Generar token** → copialo.
2. En n8n, abrí la credencial **`ManyChat API`** → Value: `Bearer ` + el token (la palabra Bearer, un espacio y el token) → **Save**.

## Paso 23. Crear los 12 campos
ManyChat → **Configuración → Campos** → **+ Nuevo campo de usuario**. Para cada uno: escribí el nombre **exacto** → tipo **Texto** → **Crear**.

```
respuesta_definitiva
mensaje_a_enviar
parte_1
parte_2
parte_3
foto_1
foto_2
foto_3
bot_activo
estado_conversacion
motivo_derivacion
auto_interes
```

## Paso 24. Crear las 7 etiquetas
ManyChat → **Configuración → Etiquetas** → **+ Nueva etiqueta**, una por una:
```
nuevo
en_conversacion
lead_caliente
visita_agendada
necesita_humano
cerrada
sin_respuesta
```

## Paso 25. Equipo, Live Chat y OpenAI dentro de ManyChat
1. **Configuración → Equipo → Invitar:** el email de cada vendedor, rol **Agente de Live Chat**.
2. **Configuración → Live Chat** (o "Bandeja de entrada"):
   - **Pausa de automatización cuando un agente responde:** **2 horas**.
   - **Apertura de conversaciones:** "Las conversaciones se abren de forma explícita" (o la opción equivalente).
3. **Configuración → Integraciones → OpenAI → Conectar** → pegá la API key de OpenAI (la del paso 12 sirve).
4. Cada vendedor se baja la **app de ManyChat** en el celular y activa las notificaciones.

## Paso 26. Flow "Enviar mensajes" (le manda al cliente la respuesta del bot)
1. **Automatización → + Nueva automatización → Empezar desde cero**.
2. Arriba a la izquierda, hacé clic en el nombre y escribí **`Enviar mensajes`**.
3. Agregá un bloque **Mensaje de WhatsApp** como primer paso → texto: clic en **`{ }`** (insertar variable) → **`parte_1`**.
4. Desde ese mensaje: **+ siguiente paso → Condición** → **+ Condición** → campo `parte_2` → **tiene cualquier valor**.
   - Salida **verde (se cumple)** → **Mensaje de WhatsApp** con `{ } parte_2`.
5. Agregá otra **Condición**: `parte_3` **tiene cualquier valor**.
   - Conectala tanto desde el mensaje `parte_2` como desde la salida **"De lo contrario"** de la condición anterior.
   - Salida verde → **Mensaje de WhatsApp** con `{ } parte_3`.
6. Agregá otra **Condición**: `foto_1` **tiene cualquier valor**.
   - Conectala desde el mensaje `parte_3` y desde el "De lo contrario" de la condición `parte_3`.
   - Salida verde → bloque de **Imagen** con la URL `{ } foto_1`. Si tu bloque de imagen no acepta variables, usá un **Mensaje** de texto con `{ } foto_1`: WhatsApp muestra la vista previa.
   - Repetí lo mismo para `foto_2` y `foto_3`, encadenados igual.
7. Al final de **todos los caminos**, un bloque **Acciones** con **+ Acción → Borrar campo de usuario**, seis veces: `parte_1`, `parte_2`, `parte_3`, `foto_1`, `foto_2`, `foto_3`.
8. (Opcional) Entre mensaje y mensaje, un **Retraso inteligente** de 1 a 2 segundos para que parezca una persona.
9. **Publicar** (arriba a la derecha).

## Paso 27. Flow "Derivar a humano" (lo dispara el bot cuando hace falta una persona)
1. **+ Nueva automatización → Empezar desde cero** → nombre **`Derivar a humano`**.
2. Primer paso: bloque **Acciones**:
   - **+ Acción → Live Chat → Marcar conversación como abierta**.
   - **+ Acción → Live Chat → Asignar conversación** → elegí el equipo de ventas o un vendedor.
   - **+ Acción → Notificar a administradores**:
     - Destinatarios: los vendedores. Canal: app y/o email.
     - Texto: `Cliente {{First Name}} ({{Phone}}) necesita un asesor. Motivo: {{motivo_derivacion}}. Auto: {{auto_interes}}` (insertá cada `{{...}}` con el botón `{ }`).
3. **No pongas mensajes al cliente** (el aviso al cliente lo manda el bot).
4. **Publicar.**

## Paso 28. Flow "Reactivar bot" (lo usa el vendedor cuando termina)
1. **+ Nueva automatización → Empezar desde cero** → nombre **`Reactivar bot`**.
2. Bloque **Acciones**:
   - **Establecer campo de usuario** `bot_activo` = `si`.
   - **Establecer campo de usuario** `estado_conversacion` = `en_conversacion`.
   - **Quitar etiqueta** `necesita_humano`.
   - **Agregar etiqueta** `en_conversacion`.
   - **Realizar solicitud externa** (sección Automatización / Herramientas de desarrollo):
     - Tipo **POST**, URL `https://bot.otormin.com.uy/webhook/otormin-manychat`.
     - **Encabezados:** `X-Otormin-Token` = `TU_CLAVE_WEBHOOK`.
     - **Cuerpo** (JSON): `{"subscriber_id": "{{Contact Id}}", "evento": "reactivar"}`, con `{{Contact Id}}` insertado con el botón de variables.
     - **Guardar.**
   - (Opcional) **Live Chat → Marcar conversación como cerrada**.
3. **Publicar.**

## Paso 29. Flow "Tomar conversación" (para meterse en un chat que el bot no derivó)
1. **+ Nueva automatización** → nombre **`Tomar conversación`**.
2. Bloque **Acciones**:
   - `bot_activo` = `no`.
   - `estado_conversacion` = `necesita_humano`.
   - **Agregar etiqueta** `necesita_humano`.
   - **Live Chat → Marcar conversación como abierta** y **Asignar conversación**.
   - **Realizar solicitud externa**: igual que en el paso 28, pero con el cuerpo `{"subscriber_id": "{{Contact Id}}", "evento": "tomar"}`.
3. **Publicar.**

## Paso 30. (Opcional) Flow "Cerrar conversación"
**+ Nueva automatización** → nombre **`Cerrar conversación`** → **Acciones → Live Chat → Marcar conversación como cerrada** → **Publicar**.
Si no encontrás esa acción, salteá este paso.

## Paso 31. Flow "Recibir mensajes" (el del video: junta los mensajes y se los manda a n8n)
1. **+ Nueva automatización → Empezar desde cero** → nombre **`Recibir mensajes`**.
2. **Paso A – ¿lo está atendiendo un humano?** Primer paso: **Condición** → **+ Condición** → `bot_activo` **es** `no`.
   - Salida **verde (se cumple)**: no conectes nada (el flow termina).
   - Salida **"De lo contrario"** → siguiente paso.
3. **Paso B – juntar el mensaje.** **Condición** → `respuesta_definitiva` **tiene cualquier valor**:
   - **De lo contrario** (está vacío) → **Acciones → Establecer campo de usuario** `respuesta_definitiva` = `{ } Última entrada de texto`.
   - **Se cumple** (ya tiene algo) → **Acciones → Establecer campo de usuario** `respuesta_definitiva` = `{ } respuesta_definitiva` + escribí `, ` (coma y espacio) + `{ } Última entrada de texto`.
4. **Paso C – esperar.** Conectá los dos bloques de Acciones anteriores a un mismo **Retraso inteligente** de **10 segundos**.
5. **Paso D – ¿sigue habiendo algo?** **Condición** → `respuesta_definitiva` **tiene cualquier valor**.
   - **De lo contrario:** nada (otra vuelta ya lo mandó).
   - **Se cumple** → siguiente.
6. **Paso E – copiar y vaciar.** **Acciones**:
   - **Establecer campo de usuario** `mensaje_a_enviar` = `{ } respuesta_definitiva`.
   - **Borrar campo de usuario** `respuesta_definitiva`.
7. **Paso F – sacar los saltos de línea con ChatGPT.** **Acciones → + Acción → OpenAI** (la integración del paso 25) → acción de generar texto (ChatGPT):
   - Modelo: `gpt-4o-mini` (o el más barato que aparezca).
   - Prompt:
     ```
     Devolvé exactamente el mismo texto que te paso, sin cambiar, agregar, traducir ni corregir nada,
     con una sola diferencia: reemplazá cada salto de línea por un espacio.
     No modifiques los links (URLs). No pongas comillas ni explicaciones.
     Texto: {{mensaje_a_enviar}}
     ```
   - **Guardar la respuesta en el campo** `mensaje_a_enviar`.
8. **Paso G – control.** **Condición** → `mensaje_a_enviar` **tiene cualquier valor** → Se cumple → siguiente.
9. **Paso H – mandar a n8n.** **Acciones → + Acción → Realizar solicitud externa** → clic en la acción para configurarla:
   - **Tipo de solicitud:** `POST`.
   - **URL:** `https://bot.otormin.com.uy/webhook/otormin-manychat` (la Production URL del paso 20 C).
   - Pestaña **Encabezados** → **+ Agregar** → clave `X-Otormin-Token` → valor `TU_CLAVE_WEBHOOK`.
   - Pestaña **Cuerpo** → botón **"Agregar datos completos del contacto"** (*Add Full Contact Data*).
   - Pestaña **Mapeo de respuesta:** nada.
   - Pestaña **Prueba** → **Ejecutar**. Tiene que responder **200** con `{"status":"ok"}`. Puede llegarte una respuesta del bot a tu propio WhatsApp: es normal.
   - **Guardar.**
10. **Paso I – limpiar.** Siguiente bloque: **Acciones → Borrar campo de usuario** `mensaje_a_enviar`.
11. **Publicar.**

## Paso 32. Hacer que "Recibir mensajes" atienda TODOS los mensajes
1. ManyChat → **Configuración → WhatsApp** → **Respuesta predeterminada** (*Default Reply*). En algunas cuentas está en **Automatización → Respuesta predeterminada**.
2. Elegí el flow **`Recibir mensajes`**.
3. Frecuencia: **"Siempre"** (no "una vez cada 24 h").
4. Verificá que el disparador quede **activado (azul)**: viene apagado, y como dice el video, eso confunde siempre.

## Paso 33. Apagar lo que pueda responder por encima
En **Automatización**, revisá que no haya **palabras clave**, **mensaje de bienvenida** ni **pasos de IA** de ManyChat respondiendo en WhatsApp. Si hay, desactivalos, o el cliente recibe dos respuestas.

## Paso 34. Copiar los IDs de los flows a n8n
1. En ManyChat, abrí el flow **Enviar mensajes**. En la barra del navegador, la dirección tiene un pedazo que empieza con **`content`** (ej. `content20261021153000_123456`). Ese es el ID: copialo.
2. Hacé lo mismo con **Derivar a humano** y con **Cerrar conversación**, si lo hiciste.
3. En n8n, workflow **"Otormín - Bot WhatsApp (ManyChat)"** → doble clic en **"Configuración Otormín"**:
   - `FLOW_ENVIAR_MENSAJES` = ID de Enviar mensajes
   - `FLOW_NOTIFICAR_HUMANO` = ID de Derivar a humano
   - `FLOW_CERRAR_CONVERSACION` = ID de Cerrar conversación (o vacío)
4. En el workflow **"Otormín - Errores"** → nodo **"Configuración de avisos"**: los mismos `FLOW_ENVIAR_MENSAJES` y `FLOW_NOTIFICAR_HUMANO` → **Save** (sigue publicado).

---

# ETAPA 6 – Cargar los datos del cliente en n8n

## Paso 35. Nodo "Configuración Otormín"
Workflow del bot → doble clic en **"Configuración Otormín"**. Reemplazá cada `COMPLETAR` con la respuesta del cliente (paso 1):

| Variable | Respuesta del paso 1 | Ejemplo |
|---|---|---|
| `NOMBRE_ASESOR` | punto 6 | `Martín` |
| `DIRECCION` | punto 7 | `Av. Italia 1234, Montevideo (https://maps.app.goo.gl/...)` |
| `HORARIOS` | punto 8 | `Lunes a viernes de 9 a 19, sábados de 9 a 13. Domingos y feriados cerrado.` |
| `TELEFONO_SUCURSAL` | punto 9 | `2600 0000` |
| `TASA_FINANCIACION` | punto 10 | `24` (solo el número) |
| `ANTICIPO_MINIMO` | punto 10 | `30` (solo el número) |
| `CUOTAS_PERMITIDAS` | punto 10 | `12,24,36,48` |
| `REQUISITOS_FINANCIACION` | punto 10 | `Cédula, recibo de sueldo y constancia de domicilio` |
| `INFO_ADICIONAL` | puntos 11 a 13 | `Precios en dólares. Aceptamos transferencia, efectivo y tarjeta. Garantía de 3 meses en motor y caja. Entregamos en todo el país.` |
| `AGENDA_ACTIVA` | punto 17 | `si` (el bot agenda) o `no` (un vendedor confirma) |
| `DURACION_VISITA_MINUTOS` | — | `45` |

**No toques:** `NOMBRE_EMPRESA`, `ZONA_HORARIA`, `MANYCHAT_API_URL`, `USAR_BUFFER_N8N` (queda en `no`, porque los mensajes los junta ManyChat), `ESPERA_BUFFER_SEGUNDOS` y `MENSAJE_RESPALDO`.

Si el cliente no financia: en `TASA_FINANCIACION` poné `0` y explicalo en `INFO_ADICIONAL` (ej. "No financiamos, solo contado"). O dejalo en `COMPLETAR`: el bot deriva a un vendedor cuando le pidan cuotas.

## Paso 36. Stock y agenda
1. **Stock:** doble clic en el nodo **`consultar_stock`**:
   - Credencial: `Google Sheets Otormín`.
   - **Document:** "By URL" → pegá el link de la planilla del paso 14.
   - **Sheet:** `stock_autos`.
2. **Agenda:**
   - **Si `AGENDA_ACTIVA` = `si`:** doble clic en **`agendar_visita`** → credencial `Google Calendar Otormín` → en **Calendar** elegí el calendario del local de la lista.
   - **Si `AGENDA_ACTIVA` = `no`:** clic derecho en **`agendar_visita`** → **Deactivate**.
3. **Save.**

## Paso 37. Activar el bot
**Publish** (activar) el workflow **"Otormín - Bot WhatsApp (ManyChat)"**.
Tenés que tener los **3 workflows activos**.

---

# ETAPA 7 – Pruebas (con tu celular, antes de avisarle al cliente)

## Paso 38. Las 10 pruebas mínimas
Escribile al número de Otormín desde tu WhatsApp personal:

| # | Mandar | Tiene que pasar |
|---|---|---|
| 1 | `Hola` | A los ~10 s llega la respuesta. En ManyChat tu contacto queda con la etiqueta `nuevo`. En n8n → **Executions** aparece una ejecución verde |
| 2 | `Hola` · `busco una camioneta` · `hasta 25 mil` (rápido, 3 mensajes) | **Una sola** respuesta que tiene en cuenta los tres |
| 3 | `Hola` + Enter + `segunda línea` (en un mensaje) | Responde normal. Si no, revisá el paso 31 F |
| 4 | `¿Qué camionetas tienen?` | Responde con autos de la planilla (máximo 3) y sus fotos |
| 5 | `¿En cuántas cuotas me queda?` | Da números con la tasa y el anticipo del cliente, y aclara que es estimado |
| 6 | Un **audio** preguntando por un auto | Responde a lo que dijiste en el audio |
| 7 | Una **foto de tu auto** + `¿me lo toman en parte de pago?` | Dice qué auto ve, que un asesor lo contacta, y el chat aparece **abierto y asignado** en el Inbox con la notificación |
| 8 | Otro mensaje después del 7 | **No responde** (lo atiende un humano) |
| 9 | Desde el Inbox, en tu chat: **⚡ / Enviar automatización → "Reactivar bot"**, y después escribí `hola` | El bot vuelve a responder |
| 10 | `Gracias, nada más` | Se despide; la etiqueta pasa a `cerrada` |

Si algo falla:
- **En n8n → Executions**, la ejecución roja muestra en qué nodo se cortó.
- **En ManyChat → Automatización → Recibir mensajes → Ejecuciones**, ves si llegó a la Solicitud externa.
- La tabla "Solución de problemas" de `docs/MANYCHAT_SETUP.md` tiene los casos comunes.

---

# ETAPA 8 – Entrega

## Paso 39. Capacitar al equipo (30 minutos, por videollamada)
Mostrales esto en vivo:
1. **Dónde llegan los chats:** los que el bot pasa a una persona aparecen en **Bandeja de entrada → Abiertas**, asignados, con una notificación que dice el **motivo** y el **auto**.
2. **Desde dónde responder:** **siempre desde ManyChat** (web o app). Nunca desde la app de WhatsApp Business del celular.
3. **Cuando terminan con un cliente:** **⚡ → Enviar automatización → "Reactivar bot"**. Si se olvidan, el bot vuelve solo a las 12 horas.
4. **Para meterse en un chat que el bot no derivó:** **⚡ → "Tomar conversación"**.
5. **Filtros útiles:** por etiquetas `necesita_humano` (los que esperan a una persona), `lead_caliente` (los interesados en serio), `visita_agendada` y `sin_respuesta`.
6. **Stock:** la planilla tiene que estar al día. Si un auto se vende, `disponible` = `NO`.

## Paso 40. Copias de seguridad
1. **Copia diaria de la base:** en la Terminal del navegador de Hostinger:
   ```bash
   mkdir -p /root/backups
   (crontab -l 2>/dev/null; echo '0 3 * * * cd /root/otormin && docker compose exec -T postgres pg_dumpall -U otormin | gzip > /root/backups/otormin_$(date +\%F).sql.gz && find /root/backups -mtime +14 -delete') | crontab -
   ```
   Guarda una copia por día y borra las de más de 14 días.
2. **Copias del servidor completo:** hPanel → **VPS → (tu VPS) → Copias de seguridad / Instantáneas** → activá las copias automáticas o sacá una **instantánea** ahora que todo funciona.
3. Guardá en un lugar seguro: el `.env` (paso 9), la contraseña de n8n (paso 11) y la de root (paso 3).

## Paso 41. Primera semana
1. **Todos los días:**
   - Mirá **n8n → Executions** por si hay rojas, y revisá si llegó algún email de error.
   - Leé 5 o 10 conversaciones en el Inbox de ManyChat. Si el bot responde algo raro, ajustá el texto en n8n (nodo **"Agente Otormín" → System Message**) o los datos de "Configuración Otormín".
2. **Métricas:** en la terminal:
   ```bash
   cd /root/otormin && docker compose exec postgres psql -U otormin -d otormin -c "select * from metricas_diarias"
   ```
3. **Opcional:** crear la plantilla de seguimiento para los clientes que dejan de responder (sección 6.8 de `docs/MANYCHAT_SETUP.md`) y prenderla en el workflow de inactividad.

## Paso 42. Entrega formal al cliente
Entregale:
- **Accesos:**
  - n8n: `https://bot.otormin.com.uy` + usuario.
  - ManyChat: ya es de ellos.
  - Hostinger: si el VPS queda a su nombre, transferilo o dales acceso.
- **Un resumen de una página para el equipo** (lo del paso 39).
- **Qué pagan ellos todos los meses:** VPS de Hostinger, ManyChat Pro, el consumo de OpenAI y (solo si usan plantillas de seguimiento) los mensajes de plantilla de Meta.
- **Qué incluye tu soporte:** ajustes del bot, cambios de datos, monitoreo, y en cuánto tiempo respondés.

---

## Mantenimiento: actualizar n8n más adelante
1. **Antes:** sacá una instantánea en Hostinger (paso 40.2).
2. En la terminal:
   ```bash
   cd /root/otormin
   sed -i "s|^N8N_VERSION=.*|N8N_VERSION=2.XX.X|" .env   # la versión nueva
   docker compose pull && docker compose up -d
   ```
3. **Después:** repetí las pruebas 1, 5 y 7 del paso 38.
