# Puesta en marcha: conectar ManyChat y n8n (Otormín)

Esta guía arma la conexión **igual que el video de Nexumi** ("Conectar tu agente de n8n a ManyChat"), con lo que necesita Otormín:
derivación a humano, estados, `bot_activo`, Postgres, inactividad y errores.
Seguila en orden: cada paso usa datos del anterior.

```
Cliente (WhatsApp)
   │ escribe uno o varios mensajes
   ▼
ManyChat ─ flow "Recibir mensajes"
   │  junta los mensajes en respuesta_definitiva, espera 10 s,
   │  saca los saltos de línea (ChatGPT) y hace la Solicitud externa (POST)
   ▼
n8n /webhook/otormin-manychat ── responde "ok" al instante
   │  audios → Whisper · fotos → GPT-4o · texto → agente Otormín (stock, cuotas, agenda, pedir_humano)
   ▼
API de ManyChat
   ├─ setCustomFields: parte_1, parte_2, parte_3 (y foto_1..3), estado, motivo...
   ├─ sendFlow "Derivar a humano" (si corresponde): abre y asigna el chat en el Inbox y avisa al equipo
   └─ sendFlow "Enviar mensajes": ManyChat le manda al cliente parte_1, parte_2, parte_3 y borra los campos
```

---

## 0. Requisitos

| Qué | Para qué |
|---|---|
| **ManyChat Pro** (verificalo en tu plan) | API, Solicitud externa y Live Chat con equipo |
| **Número de WhatsApp conectado a ManyChat** | Canal del bot |
| **Integración de OpenAI en ManyChat** | Paso "sacar saltos de línea" del flow, como en el video |
| **Servidor Linux con Docker** (2 GB de RAM alcanzan) y un **dominio** (ej. `bot.otormin.com.uy`) apuntando a su IP, con los puertos 80 y 443 abiertos | n8n 24/7 con HTTPS. ManyChat exige `https` |
| **API key de OpenAI** | Agente, audios (Whisper) y fotos (GPT-4o) en n8n |
| **Cuenta de Google** | Stock (Sheets) y agenda de visitas (Calendar) |
| **Una casilla para los avisos** (SMTP) | Avisos de error al admin |

> **WhatsApp en "coexistencia"** (mismo número en la app WhatsApp Business del celular y en ManyChat): lo que un vendedor responde **desde la app del celular no lo ve ManyChat** y el bot lo puede pisar. Respondan siempre desde el Inbox de ManyChat (web o app de ManyChat).

---

## 1. Levantar el servidor

```bash
git clone <este repo> otormin && cd otormin
cp .env.example .env
nano .env        # completar N8N_HOST, ACME_EMAIL, claves (openssl rand -hex 32)
docker compose --profile https up -d
docker compose ps    # todos "healthy" después de ~1 minuto
```

- La primera vez Postgres crea las bases `n8n` y `otormin` y aplica `sql/schema.sql` solo.
- Si ya tenés un proxy HTTPS propio, levantá sin Caddy (`docker compose up -d`) y apuntá tu proxy a `127.0.0.1:5678`.
- Logs: `docker compose logs -f n8n n8n-worker`.

---

## 2. Usuario de n8n y API key

1. Entrá a `https://TU_DOMINIO` y creá el usuario administrador.
2. **Settings → n8n API → Create an API key**. Copiala: la usa el workflow de errores.

---

## 3. Credenciales en n8n (con estos nombres EXACTOS)

**Overview → Credentials → Create credential**. Si el nombre coincide exacto, al importar los workflows n8n las vincula solas.

| Nombre exacto | Tipo | Qué cargar |
|---|---|---|
| `ManyChat API` | Header Auth | Name: `Authorization` · Value: `Bearer TU_TOKEN_DE_MANYCHAT` (paso 5.2) |
| `ManyChat webhook (clave)` | Header Auth | Name: `X-Otormin-Token` · Value: una clave larga inventada (`openssl rand -hex 24`). La misma va en la Solicitud externa (paso 6.1) |
| `OpenAI Otormín` | OpenAI | API key |
| `Postgres Otormín` | Postgres | Host `postgres` · Database `otormin` · User/Password del `.env` · Port `5432` · SSL `Disable` |
| `Redis Otormín` | Redis | Host `redis` · Port `6379` · Password `REDIS_PASSWORD` · **Database Number `1`** |
| `Google Sheets Otormín` | Google Sheets OAuth2 API | Cuenta con la planilla de stock |
| `Google Calendar Otormín` | Google Calendar OAuth2 API | Cuenta del calendario del local |
| `SMTP avisos Otormín` | SMTP | Servidor de correo para los avisos |
| `n8n API (errores)` | n8n API | API Key del paso 2 · Base URL `http://n8n:5678/api/v1` |

> El token de ManyChat (el que en el video se saca de **Configuración → API**) vive solo en la credencial de n8n. Los JSON de los workflows no tienen ninguna clave.

---

## 4. Importar los workflows (en este orden)

**Overview → Create workflow → menú ⋯ → Import from File**, y después **Save**.

1. **`workflows/otormin_errores.json`**
   - En **Configuración de avisos** completá `EMAIL_ADMIN` y `EMAIL_REMITENTE`. Los dos `FLOW_...` los cargás en el paso 6.4.
   - **Activalo (Publish).** En n8n 2.x, si el workflow de errores no está activo, no se ejecuta.
2. **`workflows/otormin_inactividad.json`**
   - **Settings → Error workflow** → "Otormín - Errores (aviso al admin)".
   - Activalo.
3. **`workflows/otormin_bot.json`**
   - **Settings → Error workflow** → "Otormín - Errores (aviso al admin)".
   - **Todavía no lo actives** (primero los pasos 5 a 7).

Revisá que ningún nodo muestre el aviso rojo de credencial faltante. Si reimportás el bot más adelante, **borrá o desactivá antes el viejo**: dos workflows con el mismo webhook se pisan.

> **Igual que en el video:** el primer nodo es el Webhook, y ManyChat recibe un "ok" al instante. El video usa un nodo *Respond to Webhook* justo después del webhook; acá el Webhook está en **Respond: Immediately**, que hace lo mismo. La respuesta real llega después, por los dos nodos HTTP del final (*setCustomFields* + *sendFlow*).

---

## 5. ManyChat: preparar la cuenta

### 5.1 Conectar WhatsApp
**Configuración → Canales → WhatsApp → Conectar** y seguí el asistente de Meta.

### 5.2 Token de la API
**Configuración → API → Generar**. Pegalo en la credencial `ManyChat API` de n8n como `Bearer TOKEN`.

### 5.3 Campos personalizados
**Configuración → Campos → + Nuevo campo de usuario**, todos de tipo **Texto**, con estos nombres exactos:

| Campo | Lo usa | Para qué |
|---|---|---|
| `respuesta_definitiva` | Flow "Recibir mensajes" | Va juntando los mensajes seguidos del cliente (como en el video) |
| `mensaje_a_enviar` | Flow "Recibir mensajes" | Copia de lo juntado: se limpia y se manda a n8n (ver nota del paso 6.1) |
| `parte_1`, `parte_2`, `parte_3` | n8n → flow "Enviar mensajes" | La respuesta del bot partida en hasta 3 burbujas (como en el video) |
| `foto_1`, `foto_2`, `foto_3` | n8n → flow "Enviar mensajes" | Fotos de autos del stock que manda el bot |
| `bot_activo` | Todo | `si` / `no`. **Vacío cuenta como `si`**. Con `no`, el bot no responde |
| `estado_conversacion` | n8n | `nuevo`, `en_conversacion`, `lead_caliente`, `visita_agendada`, `necesita_humano`, `cerrada`, `sin_respuesta` |
| `motivo_derivacion` | n8n | Por qué se derivó (qué quiere, qué auto, por qué) |
| `auto_interes` | n8n | Vehículo que le interesa al cliente |

### 5.4 Etiquetas (tags)
**Configuración → Etiquetas**: `nuevo`, `en_conversacion`, `lead_caliente`, `visita_agendada`, `necesita_humano`, `cerrada`, `sin_respuesta`.
n8n deja un solo tag de estado por contacto (saca el anterior y pone el nuevo). Así podés filtrar el Inbox por estado.

### 5.5 Integración de OpenAI (para el paso de ChatGPT del video)
**Configuración → Integraciones → OpenAI → Conectar** con una API key de OpenAI. Puede ser la misma que usa n8n.

### 5.6 Comportamiento del Live Chat
**Configuración → Live Chat** (o *Inbox*):
- **Pausa de automatización al responder:** cuando un agente escribe desde el Live Chat, ManyChat pausa las automatizaciones de ese contacto. **Recomendado: 2 horas.**
- **Apertura de conversaciones:** que la conversación **se abra explícitamente**. Así en *Abiertas* quedan solo los chats que el bot derivó, y el resto igual se lee en *Cerradas* o *Todas*.
- Cada vendedor con la **app de ManyChat** y las notificaciones activadas.

---

## 6. ManyChat: los flows

**Automatización → + Nueva automatización**. Al terminar cada uno, **Publicar**.

### 6.1 Flow "Recibir mensajes" (el del video, con dos agregados)

**Disparador:** *El usuario envía un mensaje de WhatsApp*.
Para que tome **todos** los mensajes: **Configuración → WhatsApp → Respuesta predeterminada** → elegí este flow. Dejalo en **"Siempre"** y verificá que el disparador quede **activado (azul)**: viene desactivado y eso suele confundir (lo dice el video).

Pasos, en orden:

```
[1] Condición: bot_activo es "no"
      ├─ Sí → (fin: lo atiende un humano, el bot no hace nada)
      └─ No ↓
[2] Condición: respuesta_definitiva tiene cualquier valor
      ├─ No → Acción: Establecer campo respuesta_definitiva = {{Última entrada de texto}}
      └─ Sí → Acción: Establecer campo respuesta_definitiva = {{respuesta_definitiva}}, {{Última entrada de texto}}
[3] Retraso inteligente (Smart Delay): 10 segundos
[4] Condición: respuesta_definitiva tiene cualquier valor
      └─ No → (fin: otro mensaje ya se encargó)
[5] Acción: Establecer campo mensaje_a_enviar = {{respuesta_definitiva}}
    Acción: Borrar campo respuesta_definitiva
[6] Acción de ChatGPT (OpenAI): sacar los saltos de línea de mensaje_a_enviar → guardar en mensaje_a_enviar
[7] Condición: mensaje_a_enviar tiene cualquier valor
      └─ No → (fin)
[8] Solicitud externa (POST) a n8n  ← ver detalle abajo
[9] Acción: Borrar campo mensaje_a_enviar
```

**Cómo funciona el paso [2]:** el cliente escribe "Hola" y se guarda "Hola". Si a los 3 segundos escribe "¿cómo estás?", el flow vuelve a arrancar. Como `respuesta_definitiva` ya tiene valor, va por arriba y queda "Hola, ¿cómo estás?". Recién cuando pasan 10 segundos sin mensajes nuevos, se manda todo junto.

**Los dos agregados respecto del video:**
- **[1] `bot_activo`:** si un humano está atendiendo, el bot no junta ni manda nada.
- **[5] Copiar a `mensaje_a_enviar` antes del paso de ChatGPT:** en el video, si el cliente escribe justo mientras ChatGPT limpia el texto, ese mensaje se pisa y se pierde. Con la copia, el mensaje nuevo arranca una vuelta nueva y no se pierde nada.

**Prompt del paso [6] (ChatGPT):**
```
Devolvé exactamente el mismo texto que te paso, sin cambiar, agregar, traducir ni corregir nada,
con una sola diferencia: reemplazá cada salto de línea por un espacio.
No modifiques los links (URLs). No pongas comillas ni explicaciones.
Texto: {{mensaje_a_enviar}}
```
Guardá la respuesta en el campo `mensaje_a_enviar`. Como dice el video, sin este paso un mensaje con saltos de línea rompe la Solicitud externa.

**Paso [8], la Solicitud externa** (*Acción → Automatización → Realizar una solicitud externa*):
- **Tipo de solicitud:** `POST`
- **URL:** la **Production URL** del nodo *Webhook ManyChat* de n8n: `https://TU_DOMINIO/webhook/otormin-manychat`. No uses la que dice `/webhook-test/`.
- **Encabezados:**
  - `X-Otormin-Token` = la misma clave de la credencial `ManyChat webhook (clave)`.
  - Opcional, como en el video: `mensaje` = `{{mensaje_a_enviar}}`. n8n lee primero el cuerpo, porque los encabezados no llevan bien los acentos.
- **Cuerpo:** **Full Contact Data** (botón *Agregar datos completos del contacto*), igual que en el video. Ahí viajan el ID del contacto, el nombre, el teléfono, `mensaje_a_enviar` y `bot_activo`.
- **Respuesta:** nada. n8n contesta "ok" al instante y la respuesta del bot llega por el flow "Enviar mensajes".
- **Probar:** tiene que dar **200** y `{"status":"ok"}`.

> **Audios y fotos:** cuando el cliente manda un audio o una foto, la *Última entrada de texto* trae la URL del archivo. Por eso `respuesta_definitiva` puede quedar como `hola, https://…/audio.ogg, https://…/foto.jpg`. n8n separa cada adjunto, transcribe los audios, analiza las fotos y lo junta todo en orden antes de pasárselo al agente.

**Revisá que ninguna otra automatización responda mensajes de WhatsApp** (keywords, bienvenida, pasos de IA de ManyChat). Si no, el cliente recibe dos respuestas.

### 6.2 Flow "Enviar mensajes" (el segundo del video)
Sin disparador: lo dispara n8n con `sendFlow`.

```
[1] Mensaje de WhatsApp: {{parte_1}}
[2] Condición: parte_2 tiene cualquier valor → Sí: Mensaje {{parte_2}}
[3] Condición: parte_3 tiene cualquier valor → Sí: Mensaje {{parte_3}}
[4] Condición: foto_1 tiene cualquier valor → Sí: enviar foto_1   (ídem foto_2 y foto_3)
[5] Acción: Borrar campos parte_1, parte_2, parte_3, foto_1, foto_2, foto_3
```

- Entre burbujas podés poner un **Retraso inteligente de 1 a 2 segundos** o el indicador de "escribiendo", para que parezca una persona.
- **Fotos:** si el bloque de imagen de tu cuenta acepta una URL desde un campo, usalo con `{{foto_1}}`. Si no, mandá un mensaje de texto con `{{foto_1}}` y WhatsApp muestra la vista previa. Las `foto_url` del stock tienen que ser links directos y públicos.
- **El borrado del paso [5] va siempre al final**, por cualquier camino. El video lo hace por ramas (si no hay parte 2, borra la 1; si hay 3, borra las tres). Borrar todo al final es lo mismo y es más simple.

### 6.3 Flow "Derivar a humano" (lo dispara n8n)
Sin disparador. Un bloque de **Acciones**:
1. **Live Chat → Marcar conversación como abierta**
2. **Live Chat → Asignar conversación** → equipo de ventas o un vendedor
3. **Notificar a administradores** → app y/o email. Texto sugerido:
   `Cliente {{First Name}} ({{Phone}}) necesita un asesor. Motivo: {{motivo_derivacion}}. Auto: {{auto_interes}}`

**Sin mensajes al cliente**: el aviso "un asesor te contacta enseguida" lo manda n8n por "Enviar mensajes". n8n lo dispara **después** de poner `bot_activo = no`, el tag `necesita_humano` y el `motivo_derivacion`.

### 6.4 Cómo sacar el ID de cada flow (`flow_ns`)
Es lo que el video muestra como "el ID del flujo" que va en el nodo HTTP. Hay dos formas:
- **Desde la URL:** abrí el flow en el editor. La dirección tiene un tramo `content20XXXXXXXXXXXX_XXXXXX`, y eso es el ID.
- **Por la API:**
  ```bash
  curl -s https://api.manychat.com/fb/page/getFlows -H "Authorization: Bearer TU_TOKEN" | python3 -m json.tool
  ```

Dónde va cada ID:

| Flow | Variable | Nodo de n8n |
|---|---|---|
| Enviar mensajes | `FLOW_ENVIAR_MENSAJES` | **Configuración Otormín** (bot) **y** **Configuración de avisos** (errores) |
| Derivar a humano | `FLOW_NOTIFICAR_HUMANO` | **Configuración Otormín** **y** **Configuración de avisos** |
| Cerrar conversación (opcional) | `FLOW_CERRAR_CONVERSACION` | **Configuración Otormín** |
| Seguimiento (opcional) | `FLOW_SEGUIMIENTO_PLANTILLA` | **Configuración inactividad** |

### 6.5 Flow "Reactivar bot" (lo usa el vendedor al terminar)
Acciones:
1. Establecer `bot_activo` = `si` y `estado_conversacion` = `en_conversacion`.
2. Quitar la etiqueta `necesita_humano` y agregar `en_conversacion`.
3. **Solicitud externa** POST a la misma URL de n8n, con el encabezado `X-Otormin-Token`. Cuerpo JSON:
   ```json
   { "subscriber_id": "{{Contact Id}}", "evento": "reactivar" }
   ```
   Sirve para que Postgres sepa que el bot volvió.
4. (opcional) **Live Chat → Marcar conversación como cerrada**.

Hay dos formas de reactivar desde el Inbox:
- **Acción rápida:** en el chat, botón de automatizaciones del cuadro de texto → enviar el flow **"Reactivar bot"**.
- **A mano:** en el panel del contacto, campo `bot_activo` = `si`.

**Reseteo automático:** si nadie lo reactiva, a las **12 h** de la derivación el workflow de inactividad pone `bot_activo = si` (`HORAS_REACTIVACION_BOT`).

### 6.6 Flow "Tomar conversación" (opcional)
Para cuando un vendedor quiere meterse en un chat que el bot no derivó:
1. `bot_activo` = `no`, `estado_conversacion` = `necesita_humano`, etiqueta `necesita_humano`.
2. **Marcar conversación como abierta** y **Asignar conversación** (a sí mismo).
3. **Solicitud externa** POST a n8n con `{ "subscriber_id": "{{Contact Id}}", "evento": "tomar" }`. El reseteo automático cuenta las horas desde ahí.

### 6.7 Flow "Cerrar conversación" (opcional)
Una acción: **Live Chat → Marcar conversación como cerrada**. n8n lo dispara cuando el agente marca `cerrada` (el cliente se despidió o resolvió).
Si tu cuenta no tiene esa acción, dejá `FLOW_CERRAR_CONVERSACION` vacío: el estado igual queda en el campo y en la etiqueta. La API de ManyChat no tiene endpoint para abrir o cerrar conversaciones; por eso se hace con flows.

### 6.8 Flow "Seguimiento" con plantilla (opcional, apagado por defecto)
WhatsApp solo deja mandar mensajes libres **dentro de las 24 h** desde el último mensaje del cliente. Después, solo **plantillas aprobadas por Meta**.
1. Creá la plantilla en **Configuración → WhatsApp → Plantillas de mensajes** (categoría *Marketing*). Ejemplo:
   `Hola {{1}}, te escribimos de Otormín Automóviles. ¿Pudiste ver las opciones que te pasamos? Si querés seguimos por acá.`
2. Esperá la aprobación.
3. Hacé el flow con la plantilla como **primer** mensaje.
4. En **Configuración inactividad**: `FLOW_SEGUIMIENTO_PLANTILLA` = ID del flow y `SEGUIMIENTO_ACTIVO` = `si`.

Se manda una sola vez por cliente, cuando queda en `sin_respuesta`.

### 6.9 Reglas opcionales (avisos sin apagar el bot)
**Automatización → Reglas**: *cuando se agrega la etiqueta `visita_agendada`* (o `lead_caliente`) → **Notificar a administradores**.

---

## 7. Completar la configuración en n8n

### 7.1 Nodo "Configuración Otormín" (bot)
Mientras un dato diga `COMPLETAR`, el agente no lo inventa: dice que lo confirma con el equipo.

| Variable | Ejemplo | Para qué |
|---|---|---|
| `NOMBRE_ASESOR` | `Martín` | Nombre con el que se presenta el bot |
| `DIRECCION` | `Av. Italia 1234, Montevideo` | Dirección del local |
| `HORARIOS` | `Lunes a viernes de 9 a 19, sábados de 9 a 13` | Horarios (y para agendar) |
| `TELEFONO_SUCURSAL` | `2600 0000` | Teléfono fijo |
| `TASA_FINANCIACION` | `24` | Tasa anual en %. Sin cargar, el bot no da cuotas y deriva |
| `ANTICIPO_MINIMO` | `30` | Anticipo mínimo en % |
| `CUOTAS_PERMITIDAS` | `12,24,36,48,60` | Planes |
| `REQUISITOS_FINANCIACION` | `Cédula, recibo de sueldo y constancia de domicilio` | Lo que se pide para financiar |
| `AGENDA_ACTIVA` | `si` / `no` | Si el bot agenda visitas en Google Calendar |
| `DURACION_VISITA_MINUTOS` | `45` | Duración del turno |
| `FLOW_ENVIAR_MENSAJES` | `content2026…` | ID del flow del paso 6.2 (**obligatorio**) |
| `FLOW_NOTIFICAR_HUMANO` | `content2026…` | ID del flow del paso 6.3 |
| `FLOW_CERRAR_CONVERSACION` | vacío o `content2026…` | ID del flow del paso 6.7 |
| `USAR_BUFFER_N8N` | `no` | Los mensajes seguidos ya los junta ManyChat. Con `si`, n8n además espera `ESPERA_BUFFER_SEGUNDOS` y junta en Redis |
| `MENSAJE_RESPALDO` | (ya cargado) | Lo que recibe el cliente si el agente falla |

### 7.2 Stock (nodo `consultar_stock`)
Planilla con **las mismas columnas que el demo** (`id, tipo, marca, modelo, version, anio, km, combustible, transmision, traccion, color, puertas, precio_usd, precio_ars, condicion, disponible, sucursal, foto_url, descripcion, destacado, fecha_ingreso`).
**Ahora apunta a la planilla del demo (AutoNova): cambiala por la de Otormín.** Las `foto_url` tienen que ser links directos y públicos.

### 7.3 Agenda (nodo `agendar_visita`)
- Elegí el calendario del local (ahora tiene un ID de ejemplo).
- **Para desactivarla:** `AGENDA_ACTIVA` = `no` y desactivá el nodo (clic derecho → *Deactivate*). Sin agenda, o si la agenda falla, el bot no promete el turno: deriva a un asesor.

### 7.4 Activar
Guardá y **activá (Publish)** el workflow del bot.

---

## 8. Probar la conexión

Desde un celular que no sea el del negocio:
1. **"Hola"**. Tiene que pasar todo esto:
   - En ManyChat, el flow "Recibir mensajes" corre.
   - A los ~10 s aparece una ejecución verde en n8n.
   - El contacto queda con `estado_conversacion = nuevo` y la etiqueta `nuevo`.
   - Llega la respuesta en 1 a 3 burbujas.
2. **Tres mensajes seguidos** (`Hola` · `busco una camioneta` · `hasta 25 mil`) → **una sola** respuesta que tiene en cuenta todo.
3. **Mensaje con saltos de línea** (`Hola` + Enter + `segunda línea`) → tiene que responder normal. Si no, revisá el paso de ChatGPT [6].
4. **Un audio** y **una foto** de un auto.
5. Seguí con [`docs/PRUEBAS.md`](PRUEBAS.md).

---

## 9. El día a día del equipo

- Los chats derivados aparecen **abiertos y asignados** en el Inbox, con la notificación que trae el motivo y el auto.
- **Respondan siempre desde ManyChat**, no desde la app de WhatsApp Business.
- Al terminar: flow **"Reactivar bot"** (o `bot_activo = si`). Si se olvidan, se reactiva solo a las 12 h.
- Para meterse en un chat que el bot no derivó: flow **"Tomar conversación"**.
- Para ver los clientes por estado, filtrá por etiquetas: `necesita_humano`, `lead_caliente`, `visita_agendada`, `sin_respuesta`.

---

## 10. La ventana de 24 h

| Situación | Qué se puede mandar |
|---|---|
| El cliente escribió hace menos de 24 h | Cualquier mensaje (el bot siempre responde dentro de esta ventana) |
| Pasaron más de 24 h | Solo una **plantilla aprobada**, con `sendFlow` a un flow que empiece con la plantilla (paso 6.8) |
| El cliente responde la plantilla | Se abre otra ventana de 24 h |

---

## 11. Qué está verificado y qué hay que confirmar en tu cuenta

**Verificado:**
- Los tres workflows se importaron y activaron en **n8n 2.44.4** (principal + worker en modo queue, Postgres, Redis).
- Se probaron de punta a punta con una API de ManyChat y de OpenAI **simuladas**. El simulador hace lo mismo que el flow "Enviar mensajes": manda las partes y borra los campos. Resultados en `docs/PRUEBAS.md`.
- Los endpoints contra la documentación de la API de ManyChat: `setCustomFields`, `setCustomFieldByName`, `sendFlow`, `getInfo`, `addTagByName`/`removeTagByName`.

**A confirmar en tu cuenta de ManyChat** (no lo pude probar contra la cuenta real):
- **Nombres en la interfaz:** los de menús y acciones pueden variar un poco según el idioma y la versión de ManyChat.
- **Bloque de imagen:** que acepte una URL desde un campo para las fotos. Si no, se mandan como link.
- **Retraso inteligente:** que un mensaje nuevo del cliente no corte el retraso del flow anterior. Cualquiera sea el comportamiento, la condición [4] evita que se mande dos veces.

---

## Solución de problemas

| Síntoma | Qué revisar |
|---|---|
| No responde y en n8n no hay ejecución | URL de la Solicitud externa (`/webhook/`, no `/webhook-test/`), que el bot esté activo, el encabezado `X-Otormin-Token`, el paso de ChatGPT (saltos de línea) |
| Hay ejecución en n8n pero no llega nada | `FLOW_ENVIAR_MENSAJES` mal copiado o el flow "Enviar mensajes" sin publicar. Los campos `parte_1..3` deben existir con esos nombres exactos |
| Responde dos veces | Otra automatización de ManyChat también responde (keywords, bienvenida) |
| Responde a cada mensaje por separado | El flow "Recibir mensajes" no concatena: revisá las dos ramas del paso [2] y el retraso de 10 s |
| La ejecución termina en "Fin: lo atiende un humano" | El contacto tiene `bot_activo = no` |
| No llega el aviso de derivación | `FLOW_NOTIFICAR_HUMANO` mal copiado, o el flow sin publicar |
| El workflow de errores no corre | En n8n 2.x tiene que estar **activo** y elegido como *Error workflow* de los otros dos |
| `403` al probar la Solicitud externa | `X-Otormin-Token` distinto al de la credencial `ManyChat webhook (clave)` |
