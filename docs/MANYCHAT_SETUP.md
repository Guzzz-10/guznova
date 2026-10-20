# Puesta en marcha: conectar ManyChat y n8n (Otormín)

Esta guía va de cero a "el bot contesta por WhatsApp y el equipo atiende desde el Inbox de ManyChat".
Seguila en orden: cada paso usa datos del anterior.

```
Cliente (WhatsApp)
   │  escribe
   ▼
ManyChat ── Default Reply ──► External Request (POST) ──► n8n /webhook/otormin-manychat
   ▲                                                         │ buffer → audio/imagen → agente IA
   │                                                         ▼
   └──────────── API de ManyChat (sendContent, campos, tags, sendFlow) ◄──┘
                         │
                         └─► flow "Derivar a humano": abre el chat en el Inbox, lo asigna y avisa al equipo
```

---

## 0. Requisitos

| Qué | Para qué |
|---|---|
| **ManyChat Pro** (verificalo en tu plan) | API, External Request y Live Chat con equipo |
| **Número de WhatsApp conectado a ManyChat** | Canal del bot |
| **Servidor Linux con Docker** (2 GB de RAM alcanzan) y un **dominio** (ej. `bot.otormin.com.uy`) apuntando a su IP, con los puertos 80 y 443 abiertos | n8n 24/7 con HTTPS. ManyChat exige `https` |
| **API key de OpenAI** | Agente, transcripción de audios (Whisper) y análisis de fotos |
| **Cuenta de Google** | Planilla de stock (Sheets) y agenda de visitas (Calendar) |
| **Una casilla para los avisos** (SMTP: Gmail con "contraseña de aplicación", Zoho, etc.) | Avisos de error al admin |

> **Importante sobre WhatsApp en "coexistencia"** (mismo número en la app WhatsApp Business del celular y en ManyChat): lo que un vendedor responde **desde la app del celular no lo ve ManyChat**, así que el bot no se entera y puede pisarlo. Respondan siempre desde el Inbox de ManyChat (web o app de ManyChat).

---

## 1. Levantar el servidor

```bash
git clone <este repo> otormin && cd otormin
cp .env.example .env
nano .env        # completar N8N_HOST, ACME_EMAIL, claves (openssl rand -hex 32)
docker compose --profile https up -d
docker compose ps    # todos "healthy" después de ~1 minuto
```

- La primera vez Postgres crea las dos bases (`n8n` y `otormin`) y aplica `sql/schema.sql` solo.
- Si ya tenés un proxy HTTPS propio (Nginx, Traefik), levantá sin Caddy: `docker compose up -d`, y apuntá tu proxy a `127.0.0.1:5678`.
- Para ver logs: `docker compose logs -f n8n n8n-worker`.

---

## 2. Usuario de n8n y API key

1. Entrá a `https://TU_DOMINIO` y creá el usuario administrador.
2. **Settings → n8n API → Create an API key**. Copiala: la usa el workflow de errores para leer qué cliente quedó sin respuesta.

---

## 3. Credenciales en n8n (con estos nombres EXACTOS)

En **Overview → Credentials → Create credential**. Si el nombre coincide exacto, al importar los workflows n8n las vincula solas.

| Nombre exacto | Tipo de credencial | Qué cargar |
|---|---|---|
| `ManyChat API` | Header Auth | Name: `Authorization` · Value: `Bearer TU_TOKEN_DE_MANYCHAT` (paso 5.2) |
| `ManyChat webhook (clave)` | Header Auth | Name: `X-Otormin-Token` · Value: una clave larga inventada (`openssl rand -hex 24`). La misma va en ManyChat (paso 6.7) |
| `OpenAI Otormín` | OpenAI | API key |
| `Postgres Otormín` | Postgres | Host `postgres` · Database `otormin` · User y Password los del `.env` · Port `5432` · SSL `Disable` |
| `Redis Otormín` | Redis | Host `redis` · Port `6379` · Password `REDIS_PASSWORD` del `.env` · **Database Number `1`** |
| `Google Sheets Otormín` | Google Sheets OAuth2 API | Conectar con la cuenta de Google que tiene la planilla de stock |
| `Google Calendar Otormín` | Google Calendar OAuth2 API | Conectar con la cuenta del calendario del local |
| `SMTP avisos Otormín` | SMTP | Datos del servidor de correo para los avisos |
| `n8n API (errores)` | n8n API | API Key del paso 2 · Base URL `http://n8n:5678/api/v1` |

> El token de ManyChat y las demás claves viven solo en las credenciales de n8n (encriptadas con `N8N_ENCRYPTION_KEY`). Los JSON de los workflows no tienen ninguna clave.

---

## 4. Importar los workflows (en este orden)

En **Overview → Create workflow → menú ⋯ → Import from File**, después **Save**.

1. **`workflows/otormin_errores.json`**
   - Abrí el nodo **Configuración de avisos** y completá `EMAIL_ADMIN` y `EMAIL_REMITENTE`. `FLOW_NOTIFICAR_HUMANO` lo completás en el paso 6.2.
   - **Activalo (Publish).** En n8n 2.x un workflow de errores que no está activo **no se ejecuta**.
2. **`workflows/otormin_inactividad.json`**
   - En **Settings del workflow → Error workflow** elegí "Otormín - Errores (aviso al admin)".
   - Activalo.
3. **`workflows/otormin_bot.json`**
   - En **Settings → Error workflow** elegí "Otormín - Errores (aviso al admin)".
   - **Todavía no lo actives**: primero completá ManyChat (pasos 5 y 6) y la configuración (paso 7).

Después de importar, revisá que ningún nodo muestre el aviso rojo de credencial faltante. Si alguno quedó sin vincular, abrilo y elegí la credencial a mano.

> Si más adelante reimportás el bot, **borrá o desactivá antes el viejo**. Dos workflows con el mismo webhook (`otormin-manychat`) se pisan.

---

## 5. ManyChat: preparar la cuenta

### 5.1 Conectar WhatsApp
**Settings → Channels → WhatsApp → Connect** y seguí el asistente de Meta. Si ya está conectado, seguí.

### 5.2 Token de la API
**Settings → API → Generate your API Key**. Copialo y pegalo en la credencial `ManyChat API` de n8n como `Bearer TOKEN` (con la palabra Bearer y un espacio).

### 5.3 Campos de usuario
**Settings → Fields → User Fields → + New Field**. Los nombres van en minúscula y exactos:

| Campo | Tipo | Uso |
|---|---|---|
| `bot_activo` | Text | `si` / `no`. **Vacío cuenta como `si`** (contactos nuevos). Con `no`, n8n no responde |
| `estado_conversacion` | Text | Lo escribe n8n: `nuevo`, `en_conversacion`, `lead_caliente`, `visita_agendada`, `necesita_humano`, `cerrada`, `sin_respuesta` |
| `motivo_derivacion` | Text | Resumen de por qué se derivó (qué quiere, qué auto, por qué) |
| `auto_interes` | Text | Vehículo que le interesa al cliente |

> Si falta un campo, la llamada de la API que lo setea falla. `bot_activo` va en una llamada aparte, primero, para que la derivación nunca dependa de los otros campos.

### 5.4 Tags
**Settings → Tags → + New Tag**: `nuevo`, `en_conversacion`, `lead_caliente`, `visita_agendada`, `necesita_humano`, `cerrada`, `sin_respuesta`.
n8n deja **un solo tag de estado por contacto** (saca el anterior y pone el nuevo). Así podés filtrar el Inbox y los contactos por estado.

### 5.5 Comportamiento del Live Chat
En **Settings → Live Chat** (puede figurar como *Inbox* o *Live Chat Behavior*):
- **Pausa de automatización al responder:** cuando un agente escribe desde el Live Chat, ManyChat pausa las automatizaciones de ese contacto (30 min por defecto). Mientras dura, el Default Reply no se dispara y n8n no recibe nada. **Recomendado: 2 horas.** Es la red de seguridad para cuando un vendedor se mete sin derivar.
- **Apertura de conversaciones:** elegí que la conversación **se abra explícitamente** (no "cualquier mensaje abre la conversación"). Así en *Open* quedan solo los chats que el bot derivó, y el resto igual se puede leer en *Closed* o *All*.
- Que cada vendedor tenga la **app de ManyChat** con las notificaciones activadas.

---

## 6. ManyChat: crear los flows

En **Automation → + New Automation**. Ponele el nombre indicado y **Publish** al terminar.

### 6.1 Flow "Bot IA - Derivar a humano" (lo dispara n8n)
Sin trigger. Un bloque **Actions** con:
1. **Live Chat → Mark conversation as Open**
2. **Live Chat → Assign conversation** → el equipo de ventas o un vendedor (o round robin)
3. **Notify Admins** (Notificar a administradores) → app y/o email. Texto sugerido:
   `Cliente {{First Name}} ({{Phone}}) necesita un asesor. Motivo: {{motivo_derivacion}}. Auto: {{auto_interes}}`

**No pongas mensajes al cliente en este flow**: el mensaje lo manda n8n ("un asesor te contacta enseguida").

### 6.2 Cómo sacar el `flow_ns` de un flow
n8n dispara los flows por su identificador (`flow_ns`). Tenés dos formas de sacarlo:
- **Desde la URL**: abrí el flow en el editor. La URL tiene un tramo `content20XXXXXXXXXXXX_XXXXXX`, y eso es el `flow_ns`.
- **Por la API**:
  ```bash
  curl -s https://api.manychat.com/fb/page/getFlows -H "Authorization: Bearer TU_TOKEN" | python3 -m json.tool
  ```
  Buscá el flow por nombre y copiá el campo `ns`.

Pegá el `flow_ns` de "Derivar a humano" en:
- `FLOW_NOTIFICAR_HUMANO` del nodo **Configuración Otormín** (workflow del bot).
- `FLOW_NOTIFICAR_HUMANO` del nodo **Configuración de avisos** (workflow de errores).

### 6.3 Flow "Bot IA - Reactivar bot" (lo usa el vendedor al terminar)
Bloque **Actions**:
1. **Set Custom Field** `bot_activo` = `si`
2. **Set Custom Field** `estado_conversacion` = `en_conversacion`
3. **Remove Tag** `necesita_humano` · **Add Tag** `en_conversacion`
4. (opcional) **Live Chat → Mark conversation as Closed**

Hay dos formas de reactivar el bot desde el Inbox:
- **Acción rápida:** en el chat, el botón de automatizaciones del cuadro de texto (rayo o "Send Flow") → elegir **"Bot IA - Reactivar bot"**.
- **A mano:** en el panel derecho del contacto → **Fields** → `bot_activo` → `si`.

Si el chat muestra el ícono de pausa, el bot vuelve a hablar recién cuando termina la pausa (o cuando la reanudás desde ahí).

**Reseteo automático:** si nadie lo reactiva, el workflow de inactividad pone `bot_activo = si` a las **12 horas** de la derivación (`HORAS_REACTIVACION_BOT` en "Configuración inactividad"). Solo lo hace si en ManyChat sigue en `no`.

### 6.4 Flow "Bot IA - Tomar conversación" (opcional)
Para cuando un vendedor quiere meterse en un chat que el bot no derivó. Bloque **Actions**:
- `bot_activo` = `no`
- `estado_conversacion` = `necesita_humano`
- **Add Tag** `necesita_humano`
- **Mark conversation as Open** y **Assign conversation** (a sí mismo)

n8n registra la toma con el próximo mensaje del cliente, y el reseteo automático cuenta las horas desde ahí.

### 6.5 Flow "Bot IA - Cerrar conversación" (opcional)
Una sola acción: **Live Chat → Mark conversation as Closed**. Pegá su `flow_ns` en `FLOW_CERRAR_CONVERSACION`. Cuando el agente marca `cerrada` (el cliente se despidió o resolvió), n8n lo dispara.
Si tu cuenta no tiene esa acción, dejá `FLOW_CERRAR_CONVERSACION` vacío: el estado queda igual en el campo y el tag `cerrada`. La API de ManyChat no tiene endpoint para abrir o cerrar conversaciones; por eso se hace con flows.

### 6.6 Flow "Bot IA - Seguimiento" con plantilla (opcional, apagado por defecto)
WhatsApp solo deja mandar mensajes libres **dentro de las 24 h** desde el último mensaje del cliente. Fuera de esa ventana, solo **plantillas aprobadas por Meta**.
1. Creá la plantilla en **Settings → WhatsApp → Message Templates** (o desde el flow, bloque *WhatsApp Template* → *Create*). Categoría *Marketing*. Ejemplo:
   `Hola {{1}}, te escribimos de Otormín Automóviles. ¿Pudiste ver las opciones que te pasamos? Si querés seguimos por acá.`
2. Esperá la aprobación (de minutos a 24 h).
3. Creá el flow con la plantilla como **primer** mensaje (con un botón tipo "Sí, sigamos").
4. En el workflow de inactividad, nodo **Configuración inactividad**: pegá el `flow_ns` en `FLOW_SEGUIMIENTO_PLANTILLA` y poné `SEGUIMIENTO_ACTIVO` = `si`.

Se manda **una sola vez por cliente**, cuando queda en `sin_respuesta`. Si responde, la ventana se abre de nuevo y el bot sigue normal.

### 6.7 Flow de entrada: Default Reply → External Request (el más importante)
**Automation → Default Reply → pestaña WhatsApp → Edit / Start flow**:

1. Si aparece la opción de frecuencia, elegí **"Every time" (cada vez)**, no "una vez cada 24 h".
2. Agregá **Actions → Dev Tools → External Request**:
   - **Request type:** `POST`
   - **URL:** `https://TU_DOMINIO/webhook/otormin-manychat`. Es la URL de producción: no uses la que dice `/webhook-test/`.
   - **Headers:** `X-Otormin-Token` = la misma clave de la credencial `ManyChat webhook (clave)`, y `Content-Type` = `application/json`.
   - **Body:** elegí una de las dos opciones. Cada `{{...}}` se inserta con el botón de variables, no se escribe a mano.

   **Opción A — campos sueltos (recomendada):**
   ```json
   {
     "subscriber_id": "{{Contact Id}}",
     "nombre": "{{First Name}}",
     "apellido": "{{Last Name}}",
     "telefono": "{{Phone}}",
     "texto": "{{Last Text Input}}",
     "adjunto_url": "",
     "tipo": "",
     "bot_activo": "{{bot_activo}}",
     "ultima_interaccion": "{{Last Interaction}}"
   }
   ```
   **Opción B — Full Contact Data** (si la prueba de comillas del paso 8 falla con la A):
   ```json
   { "contacto": {{Full Contact Data}} }
   ```
   - **Response mapping:** nada. n8n contesta `{"status":"ok"}` al instante y la respuesta del bot va después por la API.
3. Probá con **Test the request**: tiene que dar **200** y `{"status":"ok"}`.
4. **Publish**.

Por qué se manda siempre, aunque `bot_activo` sea `no`: n8n registra el mensaje (para métricas y para detectar que un humano tomó el chat) y **no responde**. Si preferís ahorrar llamadas, poné antes del External Request una **Condition** "`bot_activo` no es `no`".

Por qué n8n responde enseguida: el External Request de ManyChat corta a los ~10 segundos, y el bot espera ~9 s para juntar mensajes seguidos y después piensa la respuesta.

**Revisá que ninguna otra automatización responda mensajes de WhatsApp** (keywords, mensaje de bienvenida, pasos de IA de ManyChat). Si no, el cliente recibe dos respuestas.

> **Audios y fotos:** en WhatsApp, ManyChat pone la URL del audio en *Last Text Input*. n8n detecta si ese texto es una URL de archivo, la descarga en el momento (esas URLs vencen) y decide por el tipo de archivo si es audio o foto. Si en tu cuenta las fotos no llegan como URL, se puede agregar un bloque *User Input / Data Collection* de tipo imagen que guarde la URL en un campo y mandarla en `adjunto_url`.

### 6.8 Reglas opcionales (avisos sin apagar el bot)
**Automation → Rules**:
- *Cuando se aplica el tag `visita_agendada`* → **Notify Admins** ("Visita agendada: {{First Name}} - {{auto_interes}}").
- *Cuando se aplica el tag `lead_caliente`* → **Notify Admins**, si quieren enterarse de los leads calientes aunque el bot siga atendiendo.

---

## 7. Completar la configuración en n8n

### 7.1 Nodo "Configuración Otormín" (workflow del bot)
Todo lo que dice `COMPLETAR` hay que cargarlo. Mientras diga `COMPLETAR`, el agente no inventa el dato: dice que lo confirma con el equipo.

| Variable | Ejemplo | Para qué |
|---|---|---|
| `NOMBRE_ASESOR` | `Martín` | Nombre con el que se presenta el bot |
| `DIRECCION` | `Av. Italia 1234, Montevideo` | Dirección del local |
| `HORARIOS` | `Lunes a viernes de 9 a 19, sábados de 9 a 13` | Horarios (y para agendar visitas) |
| `TELEFONO_SUCURSAL` | `2600 0000` | Teléfono fijo |
| `TASA_FINANCIACION` | `24` | Tasa anual en % (sin el signo). Sin cargar, el bot no da cuotas y deriva |
| `ANTICIPO_MINIMO` | `30` | Anticipo mínimo en % del precio |
| `CUOTAS_PERMITIDAS` | `12,24,36,48,60` | Planes disponibles |
| `REQUISITOS_FINANCIACION` | `Cédula, recibo de sueldo y constancia de domicilio` | Lo que se pide para financiar |
| `AGENDA_ACTIVA` | `si` / `no` | Si el bot agenda visitas en Google Calendar |
| `DURACION_VISITA_MINUTOS` | `45` | Duración del turno |
| `ESPERA_BUFFER_SEGUNDOS` | `9` | Cuánto espera para juntar mensajes seguidos |
| `PAUSA_ENTRE_MENSAJES_SEGUNDOS` | `1.2` | Pausa entre las burbujas de respuesta |
| `FLOW_NOTIFICAR_HUMANO` | `content2026…` | `flow_ns` del paso 6.1 |
| `FLOW_CERRAR_CONVERSACION` | vacío o `content2026…` | `flow_ns` del paso 6.5 |
| `MENSAJE_RESPALDO` | (ya cargado) | Lo que recibe el cliente si el agente falla |
| `ZONA_HORARIA` | `America/Montevideo` | No tocar |

### 7.2 Stock (nodo `consultar_stock`)
Usá una planilla con **las mismas columnas que el demo**: `id, tipo, marca, modelo, version, anio, km, combustible, transmision, traccion, color, puertas, precio_usd, precio_ars, condicion, disponible, sucursal, foto_url, descripcion, destacado, fecha_ingreso`.
- `precio_ars` se puede dejar vacío. Si la renombrás a `precio_uyu`, cambiá también la descripción de la herramienta.
- Las `foto_url` tienen que ser **links directos a la imagen** (que terminen en .jpg/.png o que abran la foto sola), públicos.
- En el nodo: elegí el documento y la hoja. **Ahora apunta a la planilla del demo (AutoNova), cambiala por la de Otormín.**

### 7.3 Agenda (nodo `agendar_visita`)
- Elegí el calendario del local (ahora tiene un ID de ejemplo `COMPLETAR@group.calendar.google.com`).
- **Para desactivarla:** poné `AGENDA_ACTIVA` = `no` y desactivá el nodo (clic derecho → *Deactivate*). Sin agenda, cuando el cliente quiere venir, el bot le pregunta día y horario y deriva a un asesor para que confirme.
- Si la agenda da error (por ejemplo, el calendario sin configurar), el bot no promete el turno: deriva a un asesor.

### 7.4 Modelo
El nodo **Modelo OpenAI** usa el mismo modelo que el demo. Se cambia ahí si hace falta.

### 7.5 Activar
Guardá y **activá (Publish)** el workflow del bot.

---

## 8. Probar la conexión

Desde un celular que no sea el del negocio, escribile al número:
1. **"Hola"** → en n8n, en **Executions**, tiene que aparecer una ejecución verde. En ManyChat, el contacto queda con `estado_conversacion = nuevo` y el tag `nuevo`, y te llega la respuesta.
2. **Prueba de comillas y saltos de línea** (obligatoria): mandá en un solo mensaje
   `Hola "che"` + Enter + `segunda línea`.
   Si no llega respuesta **y en n8n no aparece ninguna ejecución**, ManyChat está mandando el JSON sin escapar el texto: cambiá el body del External Request a la **Opción B** (paso 6.7).
3. **Un audio** y **una foto de un auto**. Si no los entiende, mirá en ManyChat el *Last Text Input* del contacto: tiene que ser una URL.
4. Seguí con todos los casos de [`docs/PRUEBAS.md`](PRUEBAS.md).

---

## 9. El día a día del equipo

- Los chats derivados aparecen **abiertos y asignados** en el Inbox, con una notificación que trae el motivo (`motivo_derivacion`) y el auto (`auto_interes`).
- **Respondan siempre desde ManyChat** (web o app de ManyChat), no desde la app de WhatsApp Business.
- Al terminar: flow **"Bot IA - Reactivar bot"** o `bot_activo = si`. Si se olvidan, se reactiva solo a las 12 h.
- Si un vendedor quiere meterse en un chat que el bot no derivó: flow **"Bot IA - Tomar conversación"**. Si escribe directo, la pausa de ManyChat lo cubre el tiempo configurado en el paso 5.5.
- Para ver los clientes por estado, filtrá por tags: `necesita_humano`, `lead_caliente`, `visita_agendada`, `sin_respuesta`.

---

## 10. La ventana de 24 h, en resumen

| Situación | Qué se puede mandar |
|---|---|
| El cliente escribió hace menos de 24 h | Cualquier mensaje (el bot siempre responde dentro de esta ventana) |
| Pasaron más de 24 h | Solo una **plantilla aprobada**, y únicamente con `sendFlow` a un flow que empiece con la plantilla |
| El cliente responde la plantilla | Se abre otra ventana de 24 h y todo vuelve a la normalidad |

El seguimiento automático de clientes `sin_respuesta` (paso 6.6) usa exactamente esto.

---

## 11. Qué está verificado y qué hay que confirmar en tu cuenta

**Verificado:**
- Contra la documentación de la API de ManyChat (Dynamic Block v2 para WhatsApp, `sendContent`, `sendFlow`, `getInfo`, `setCustomFields`, `addTagByName`/`removeTagByName`).
- Los tres workflows se importaron y activaron en **n8n 2.44.4** (principal + worker en modo queue, Postgres y Redis) y se probaron de punta a punta con una API de ManyChat y de OpenAI **simuladas**. Ver los resultados en `docs/PRUEBAS.md`.

**A confirmar en tu cuenta de ManyChat** (no lo pude probar contra la cuenta real):
- **Fotos por API:** que WhatsApp acepte las fotos por `sendContent`. Si las rechaza, el bot manda el link como texto (WhatsApp muestra la vista previa).
- **Escapado del JSON:** que el External Request escape bien las comillas y los saltos de línea (prueba del paso 8; si falla, Opción B).
- **URL de las fotos del cliente:** que también llegue en *Last Text Input*, igual que la de los audios.
- **Nombres en la interfaz:** los de menús y acciones (*Mark conversation as Open/Closed*, *Notify Admins*, *Live Chat Behavior*) pueden variar un poco según la versión de ManyChat.

---

## Solución de problemas

| Síntoma | Qué revisar |
|---|---|
| No responde y en n8n no hay ejecución | URL del External Request (`/webhook/`, no `/webhook-test/`), que el bot esté activo, que el header `X-Otormin-Token` coincida. Prueba de comillas (paso 8) |
| La ejecución termina en "Fin: lo atiende un humano" | El contacto tiene `bot_activo = no` |
| La ejecución termina en "Fin: un humano tomó el chat" | Alguien puso `bot_activo = no` mientras el agente pensaba (es lo esperado) |
| El cliente recibe dos respuestas | Otra automatización de ManyChat también responde (keywords, bienvenida) |
| Las fotos llegan como link | WhatsApp no aceptó la imagen por API: revisá que la `foto_url` sea un link directo y público |
| No llega el aviso de derivación | `FLOW_NOTIFICAR_HUMANO` mal copiado, o el flow no está publicado |
| El workflow de errores no corre | En n8n 2.x tiene que estar **activo**, y elegido como *Error workflow* en los Settings de los otros dos |
| `403` al probar el External Request | Header `X-Otormin-Token` distinto al de la credencial `ManyChat webhook (clave)` |
