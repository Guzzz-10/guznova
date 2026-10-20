# Casos de prueba – Bot Otormín

Cada caso dice **qué mandar por WhatsApp**, **qué tiene que pasar** y **dónde verificarlo**.

- **n8n → Executions:** la ejecución y por qué rama salió.
- **ManyChat → Contacts → (el contacto):** los campos `bot_activo`, `estado_conversacion`, `motivo_derivacion`, `auto_interes` y los tags.
- **Postgres** (consultas al final): las tablas `conversaciones` y `eventos_conversacion`.

La columna **"Local"** es el resultado de la corrida contra n8n 2.44.4 real (modo queue: principal + worker, Postgres y Redis), con la API de ManyChat y la de OpenAI **simuladas**. El simulador responde siempre igual, así que esa corrida valida el circuito (webhook → buffer → agente → ManyChat → Postgres), no la calidad de las respuestas del modelo. Eso hay que probarlo con WhatsApp real.

> Para probar desde cero con el mismo celular: en ManyChat borrá los campos y tags del contacto, y en Postgres:
> `DELETE FROM conversaciones WHERE telefono = '+598...';` (la memoria del agente está en `otormin_chat_histories`, `session_id = 'whatsapp-<subscriber_id>'`).

---

## Resumen

| # | Caso | Local |
|---|---|---|
| 1 | Texto simple | ✅ |
| 2 | Varios mensajes seguidos | ✅ 3 mensajes → 1 respuesta |
| 3 | Audio | ✅ |
| 4 | Foto del auto del cliente (permuta) | ✅ deriva con marca y modelo |
| 5 | Captura de una publicación | ⚠️ circuito igual al 4; la búsqueda en stock va con WhatsApp real |
| 6 | Pedido de humano | ✅ orden de derivación correcto |
| 7 | Cliente enojado | ✅ |
| 8 | Despedida | ✅ `cerrada` + flow de cierre (una vez) |
| 9 | Bot desactivado | ✅ no responde, solo registra |
| 10 | Un humano toma el chat mientras el bot piensa | ✅ no se envía nada |
| 11 | Inactividad (`sin_respuesta`) | ✅ |
| 12 | Reactivación automática del bot | ✅ |
| 13 | Reintento del webhook (idempotencia) | ✅ el duplicado se descarta |
| 14 | Falla del agente (OpenAI caído) | ✅ respaldo + derivación |
| 15 | Error en el workflow | ✅ email + respaldo, sin duplicar |
| 16 | Cuotas | ✅ cálculo correcto (USD 506/mes en el ejemplo) |
| 17 | Fotos del stock | ✅ 2 fotos; la que falla va como link |
| 18 | Agendar visita | ✅ si Calendar falla, no queda `visita_agendada` |
| 19 | Comillas y saltos de línea | ✅ con la Opción B; con WhatsApp real hay que probar la A |
| 20 | Audio o foto que no se puede descargar | ✅ pide que lo escriba |
| 21 | Webhook sin clave | ✅ 403 |

---

## 1. Texto simple
**Mandar:** `Hola, busco un auto`
**Esperado:**
- Responde en 1 a 3 burbujas cortas, de vos, con una sola pregunta.
- ManyChat: `estado_conversacion = nuevo` y tag `nuevo`.
- Postgres: fila en `conversaciones` con `estado = nuevo`; eventos `mensaje_cliente` y `respuesta_bot`.

## 2. Varios mensajes seguidos
**Mandar** en menos de 9 segundos: `Hola` · `busco una camioneta` · `hasta 25 mil dólares`
**Esperado:**
- **Una sola respuesta** que tiene en cuenta los tres mensajes.
- n8n: 3 ejecuciones. Dos terminan en "Fin: responde el mensaje siguiente" y una sigue hasta el agente.
- Postgres: 3 eventos `mensaje_cliente` y 1 `respuesta_bot`.

## 3. Audio
**Mandar:** un audio: *"Hola, quería saber si tienen una Toyota Hilux"*.
**Esperado:**
- Responde sobre la Hilux, como si el cliente lo hubiera escrito.
- n8n: pasa por "Descargar adjunto" → "¿Es audio?" → "Transcribir audio".
- Si no entiende el audio, revisá que en ManyChat el *Last Text Input* sea una URL (ver MANYCHAT_SETUP, paso 6.7).

## 4. Foto del auto del cliente (permuta)
**Mandar:** una foto de tu auto + `¿Me lo toman en parte de pago?`
**Esperado:**
- Confirma en una línea lo que ve (marca, modelo, estado aparente) y avisa que un asesor lo contacta para la tasación. No da un valor.
- ManyChat:
  - `bot_activo = no`
  - `estado_conversacion = necesita_humano` y tag `necesita_humano`
  - `motivo_derivacion` con "Permuta o tasación", la marca y el modelo
- Se dispara el flow "Derivar a humano": el chat aparece abierto y asignado en el Inbox, con la notificación.

## 5. Captura de una publicación
**Mandar:** captura de un aviso de MercadoLibre de un auto que esté en el stock + `¿Tienen este?`
**Esperado:**
- Identifica marca, modelo y año de la captura, lo busca con `consultar_stock` y responde con los datos y la foto del stock.
- Si no está, ofrece el más parecido.

## 6. Pedido de humano
**Mandar:** `Quiero hablar con una persona`
**Esperado** (en este orden, se ve en la ejecución):
1. "Apagar bot (bot_activo = no)"
2. "Guardar estado y datos en ManyChat" (`estado_conversacion` y `motivo_derivacion`)
3. "Poner tag del estado nuevo" (`necesita_humano`)
4. "Notificar al equipo (flow de ManyChat)"
5. "Enviar mensaje 1": *"…un asesor te contacta enseguida"*

Después, mandá otro mensaje: **no responde** (ver caso 9).

## 7. Cliente enojado
**Mandar:** `Esto es una estafa, me tienen podrido, nadie me contesta`
**Esperado:**
- Responde con empatía y avisa que pasa la consulta a un asesor. No discute ni sigue vendiendo.
- Derivación completa como en el caso 6, con motivo "Cliente molesto o con un reclamo".

## 8. Despedida
**Mandar** (después de una charla): `Perfecto, gracias, nada más`
**Esperado:**
- Se despide en una línea.
- ManyChat: `estado_conversacion = cerrada` y tag `cerrada`.
- Si configuraste `FLOW_CERRAR_CONVERSACION`, la conversación se cierra en el Inbox (el flow corre una sola vez).

## 9. Bot desactivado
**Preparar:** en ManyChat, poné `bot_activo = no` en tu contacto.
**Mandar:** `Hola?`
**Esperado:**
- **No responde nada.**
- n8n: la ejecución termina en "Fin: lo atiende un humano".
- Postgres: se registra el `mensaje_cliente` y `bot_activo = false`.

## 10. Un humano toma el chat mientras el bot piensa
**Mandar** un mensaje y, en los ~9 segundos siguientes, poner `bot_activo = no` desde ManyChat.
**Esperado:**
- No se envía la respuesta del agente.
- n8n: termina en "Registrar que lo tomó un humano".

## 11. Inactividad (`sin_respuesta`)
**Preparar:** una charla donde el bot habló último. Para no esperar 24 h, bajá `HORAS_SIN_RESPUESTA` a `0` en "Configuración inactividad" y ejecutá el workflow a mano (*Execute workflow*). Después volvelo a `24`.
**Esperado:**
- ManyChat: `estado_conversacion = sin_respuesta`; sale el tag anterior y entra `sin_respuesta`.
- Postgres: evento `sin_respuesta`.
- Con `SEGUIMIENTO_ACTIVO = si`: llega la plantilla de seguimiento, una sola vez por cliente.
- **No marca** a quien está `necesita_humano`, `visita_agendada` o `cerrada`, ni a quien escribió último.

## 12. Reactivación automática del bot
**Preparar:** un contacto derivado (caso 6). Bajá `HORAS_REACTIVACION_BOT` a `0` y ejecutá el workflow a mano.
**Esperado:**
- ManyChat: `bot_activo = si`, `estado_conversacion = en_conversacion`; sale el tag `necesita_humano` y entra `en_conversacion`.
- Si el vendedor ya lo había reactivado, solo se sincroniza Postgres.
- Un mensaje nuevo del cliente vuelve a tener respuesta del bot.

## 13. Reintento del webhook (idempotencia)
**Probar con curl** (mismo cuerpo dos veces seguidas):
```bash
BODY='{"subscriber_id":"999","texto":"Hola","ultima_interaccion":"2026-10-20T10:00:00Z"}'
for i in 1 2; do curl -s -X POST https://TU_DOMINIO/webhook/otormin-manychat \
  -H 'Content-Type: application/json' -H "X-Otormin-Token: TU_CLAVE" -d "$BODY"; done
```
**Esperado:** la segunda ejecución termina en "Fin: mensaje repetido" y no hay respuesta duplicada. La clave de Redis dura 60 s.

## 14. Falla del agente
**Preparar:** cambiá la API key de la credencial `OpenAI Otormín` por una inválida (después restaurala).
**Mandar:** `Hola`
**Esperado:**
- El cliente recibe el `MENSAJE_RESPALDO`: *"¡Perdón! Tuve un problema…"*.
- Se deriva a humano, con motivo "Falla técnica del asesor virtual…".
- n8n: el agente sale por la rama de error → "Armar respuesta de respaldo".

## 15. Error en el workflow (workflow de errores)
Cualquier error que corte la ejecución del bot (por ejemplo, Postgres caído más de lo que tolera un reintento) dispara "Otormín - Errores".
**Esperado:**
- Email al `EMAIL_ADMIN` con el workflow, la ejecución, el nodo y el error.
- Si el cliente todavía no había recibido respuesta: mensaje de respaldo + derivación.
- Como máximo **un respaldo cada 10 minutos por cliente** (los siguientes errores se registran con `respaldo_enviado = false`).
- El workflow de errores tiene que estar **activo**.

## 16. Cuotas
**Mandar:** `¿En cuántas cuotas me queda la [auto del stock]?`
**Esperado:**
- Usa `calcular_financiacion` con la tasa y el anticipo de la configuración.
- Aclara que la cuota es estimada y depende de la evaluación crediticia.
- Estado `lead_caliente`.
- Ejemplo de control: USD 20.000, 30 % de anticipo, 36 cuotas, 18 % anual → anticipo USD 6.000, cuota **USD 506**, total USD 24.221.
- Si `TASA_FINANCIACION` o `ANTICIPO_MINIMO` dicen `COMPLETAR`: no da números y deriva.

## 17. Fotos del stock
**Mandar:** `Mandame fotos de las camionetas que tengan`
**Esperado:**
- Máximo 3 autos con datos y, al final, sus fotos (máximo 3).
- Si una foto no se puede mandar como imagen, llega el link como texto.

## 18. Agendar visita
**Mandar:** `¿Puedo ir el sábado a las 11 a ver la Hilux?` → dar nombre y confirmar.
**Esperado:**
- Crea el evento en Google Calendar (título con nombre y auto; WhatsApp en la descripción).
- Estado `visita_agendada`.
- Si Calendar da error o la agenda está desactivada: **no promete el turno**, el estado queda `lead_caliente` y deriva a un asesor.

## 19. Comillas y saltos de línea (prueba de instalación)
**Mandar** en un mensaje: `Hola "che"` + Enter + `segunda línea`
**Esperado:** responde normal.
**Si no responde y en n8n no hay ejecución:** ManyChat no está escapando el texto en el JSON. Pasá el body del External Request a la **Opción B** (`{"contacto": {{Full Contact Data}}}`, ver MANYCHAT_SETUP, paso 6.7).

## 20. Audio o foto que no se puede descargar
**Esperado:**
- El bot pide con amabilidad que lo reenvíe o que lo escriba. No se cuelga.
- n8n: "Respaldo: no se pudo descargar".

## 21. Webhook sin clave
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://TU_DOMINIO/webhook/otormin-manychat -d '{}'
```
**Esperado:** `403`.

---

## Consultas útiles (Postgres)

Entrar: `docker compose exec postgres psql -U otormin -d otormin`

```sql
-- Estado de un cliente
SELECT * FROM conversaciones WHERE telefono LIKE '%99123456%';

-- Últimos eventos
SELECT created_at, subscriber_id, tipo, estado, detalle
FROM eventos_conversacion ORDER BY id DESC LIMIT 30;

-- Clientes por estado y cuántos están con un humano
SELECT * FROM metricas_estado_actual;

-- Actividad por día: mensajes, derivaciones, leads, visitas, errores
SELECT * FROM metricas_diarias LIMIT 14;

-- Clientes con el bot apagado y desde cuándo
SELECT subscriber_id, nombre, estado, derivado_at, tomado_at, motivo_derivacion
FROM conversaciones WHERE NOT bot_activo ORDER BY derivado_at DESC NULLS LAST;
```
