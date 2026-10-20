# guznova
Automatizaciones De Ia para Mi Empresaa

## Bot de WhatsApp 24/7 para Otormín Automóviles (n8n + ManyChat)

Agente de ventas con IA que atiende por WhatsApp a toda hora y entiende texto, audios y fotos. Trabaja dentro de ManyChat, que es el inbox donde el equipo lee los chats y responde cuando hace falta un humano.
Está adaptado del workflow demo "Nico / AutoNova" (Telegram): reutiliza el procesamiento multimodal, la memoria en Postgres, la herramienta de financiación, el parseo tolerante de la respuesta y el estilo del prompt.

La conexión con ManyChat sigue el método del video de Nexumi ("conectar tu agente de n8n a ManyChat"):
- **Flow "Recibir mensajes" (ManyChat):** junta los mensajes seguidos en `respuesta_definitiva`, espera 10 s, saca los saltos de línea con ChatGPT y hace la Solicitud externa a n8n con el Full Contact Data.
- **n8n:** responde "ok" al instante; separa audios y fotos (puede haber varios por turno), los procesa y los junta, y corre el agente.
- **Envío:** n8n guarda `parte_1`, `parte_2`, `parte_3` (y `foto_1..3`) con `setCustomFields` y dispara con `sendFlow` el **flow "Enviar mensajes"**, que se las manda al cliente y borra los campos.

**Para ponerlo en marcha seguí [`docs/MANYCHAT_SETUP.md`](docs/MANYCHAT_SETUP.md)** y después probá con [`docs/PRUEBAS.md`](docs/PRUEBAS.md).

### Qué hay en el repo

| Archivo | Qué es |
|---|---|
| `workflows/otormin_bot.json` | Workflow principal: webhook de ManyChat → idempotencia → audios y fotos → agente → derivación y estados → `parte_1..3` + flow "Enviar mensajes". El buffer de Redis de n8n queda opcional (`USAR_BUFFER_N8N`) |
| `workflows/otormin_inactividad.json` | Cada 1 hora: marca `sin_respuesta` (más de 24 h sin respuesta del cliente) y reactiva bots apagados hace más de 12 h. Seguimiento con plantilla opcional (apagado) |
| `workflows/otormin_errores.json` | Error Trigger: email al admin y, si había un cliente esperando, mensaje de respaldo + derivación |
| `sql/schema.sql` | Tablas `conversaciones` y `eventos_conversacion`, memoria del agente y vistas de métricas |
| `sql/init/01_crear_base_otormin.sh` | Crea la base `otormin` y aplica el schema la primera vez que arranca Postgres |
| `docker-compose.yml`, `.env.example`, `Caddyfile` | n8n 2.44.4 en modo queue (principal + worker), Postgres 17, Redis 7 y Caddy (HTTPS automático), con reinicio automático |
| `docs/MANYCHAT_SETUP.md` | Paso a paso: servidor, credenciales, importación y ManyChat (campos, etiquetas, flows "Recibir mensajes" y "Enviar mensajes", derivación, Live Chat, plantillas) |
| `docs/PRUEBAS.md` | 24 casos de prueba con el resultado esperado |

### Cómo funciona el control humano

1. **`bot_activo`** (campo de ManyChat): con `no`, n8n no responde, solo registra el mensaje. Vacío cuenta como `si`.
2. **Derivación:** cuando el agente usa `pedir_humano` (o falla), n8n hace en este orden:
   1. `bot_activo = no`
   2. `motivo_derivacion` + tag `necesita_humano`
   3. `sendFlow` al flow "Derivar a humano" (lo abre y asigna en el Live Chat, y avisa a los admins)
   4. mensaje al cliente (por el flow "Enviar mensajes")
3. **Si un humano escribe desde el Inbox,** ManyChat pausa la automatización (configurable). Además, el flow "Recibir mensajes" no hace nada si `bot_activo = no`, y n8n relee `bot_activo` justo antes de enviar, por si alguien tomó el chat mientras el agente pensaba.
4. **Reactivación:** el vendedor usa el flow "Reactivar bot" (o pone `bot_activo = si`). Si nadie lo hace, se reactiva solo a las 12 h. Los flows "Tomar conversación" y "Reactivar bot" le avisan a n8n para que Postgres quede al día.

### Estados de la conversación
`nuevo` · `en_conversacion` · `lead_caliente` · `visita_agendada` · `necesita_humano` · `cerrada` · `sin_respuesta`

Cada estado se refleja en el campo `estado_conversacion` y en un tag del mismo nombre (uno solo a la vez), y queda en Postgres con su historial.

### API de ManyChat que se usa
- `POST /fb/sending/sendFlow` (flows "Enviar mensajes", "Derivar a humano", "Cerrar conversación" y "Seguimiento")
- `GET /fb/subscriber/getInfo`
- `POST /fb/subscriber/setCustomFieldByName` y `setCustomFields`
- `POST /fb/subscriber/addTagByName` y `removeTagByName`

La API **no tiene** endpoints para el Live Chat (abrir, cerrar, asignar, pausar): eso se hace con flows que n8n dispara con `sendFlow`.

### Decisiones tomadas por defecto (se pueden cambiar)
- **Visitas:** si el cliente quiere ir a ver un auto, el bot **agenda** (Google Calendar) y sigue activo. Para enterarse sin apagar el bot, hay una regla opcional en ManyChat que avisa cuando aparece el tag `visita_agendada`. **Reservar, señar, cerrar o negociar el precio → deriva a un humano.**
- **Reseteo automático del bot:** 12 h desde la derivación o desde que un humano lo apagó (`HORAS_REACTIVACION_BOT`).
- **Avisos de error:** por email (el WhatsApp al admin es opcional, porque solo llega si el admin tiene la ventana de 24 h abierta).
- **Modelos:** los mismos del demo (agente, GPT-4o para fotos, Whisper para audios).
- **Stock:** las mismas columnas que el demo; `precio_ars` puede quedar vacío.
- **Financiación:** `ANTICIPO_MINIMO` en %, se financia hasta el resto del precio, planes de 12 a 60 cuotas, precios en USD. Mientras la tasa o el anticipo digan `COMPLETAR`, el bot no da cuotas y deriva.
- **Mientras un dato del negocio diga `COMPLETAR`,** el agente no lo inventa.
