# Casos de prueba – Bot Otormín

Cada caso dice **qué mandar por WhatsApp**, **qué tiene que pasar** y **dónde verificarlo**:
- **ManyChat:** en *Automatización → (flow) → Ejecuciones*, y en el contacto (campos y etiquetas).
- **n8n:** en **Executions**, para ver la ejecución y por qué rama salió.
- **Postgres:** las tablas `conversaciones` y `eventos_conversacion` (consultas al final).

La columna **"Local"** es el resultado de la corrida contra n8n 2.44.4 real, en modo queue (principal + worker), con Postgres y Redis.
- **Qué se simuló:** las API de ManyChat y OpenAI. El simulador de ManyChat hace lo mismo que el flow "Enviar mensajes": manda `parte_1..3` y las fotos, y borra los campos. Los mensajes llegaron como los manda el flow "Recibir mensajes": Full Contact Data, con el texto ya juntado.
- **Qué valida eso:** el circuito completo (n8n → ManyChat → Postgres).
- **Qué no valida:** el flow de ManyChat en sí, ni la calidad de las respuestas del modelo. Eso hay que probarlo con WhatsApp real.

> Para empezar de cero con el mismo celular:
> - En ManyChat, borrá los campos y las etiquetas del contacto.
> - En Postgres: `DELETE FROM conversaciones WHERE telefono LIKE '%TU_NUMERO%';`
> - La memoria del agente está en `otormin_chat_histories`, con `session_id = 'whatsapp-<subscriber_id>'`.

---

## Resumen

| # | Caso | Local |
|---|---|---|
| 1 | Texto simple | ✅ |
| 2 | Varios mensajes seguidos (los junta ManyChat) | ✅ en n8n llega 1 texto y sale 1 respuesta. El flow de ManyChat va con WhatsApp real |
| 3 | Audio | ✅ |
| 4 | Foto del auto del cliente (permuta) | ✅ deriva con marca y modelo |
| 5 | Texto + audio + foto en el mismo turno | ✅ se procesan los dos adjuntos y se juntan en orden |
| 6 | Captura de una publicación | ⚠️ mismo circuito que el 4; la búsqueda en el stock va con WhatsApp real |
| 7 | Pedido de humano | ✅ orden de derivación correcto |
| 8 | Cliente enojado | ✅ |
| 9 | Despedida | ✅ `cerrada` + flow de cierre (una vez) |
| 10 | Bot desactivado | ✅ n8n no responde, solo registra |
| 11 | Un humano toma el chat mientras el bot piensa | ✅ no se envía nada |
| 12 | Vendedor: "Tomar conversación" / "Reactivar bot" | ✅ Postgres sincronizado |
| 13 | Inactividad (`sin_respuesta`) | ✅ |
| 14 | Reactivación automática del bot | ✅ |
| 15 | Reintento de la Solicitud externa (idempotencia) | ✅ el duplicado se descarta |
| 16 | Falla del agente (OpenAI caído) | ✅ respaldo + derivación |
| 17 | Error en el workflow | ✅ email + respaldo por "Enviar mensajes", sin duplicar |
| 18 | Cuotas | ✅ USD 506/mes en el ejemplo |
| 19 | Fotos del stock | ✅ van en `foto_1..3` |
| 20 | Agendar visita | ✅ si Calendar falla, no queda `visita_agendada` |
| 21 | Saltos de línea y comillas | ✅ en n8n. El paso de ChatGPT de ManyChat va con WhatsApp real |
| 22 | Audio o foto que no se puede descargar | ✅ pide que lo escriba |
| 23 | Buffer de n8n opcional (`USAR_BUFFER_N8N = si`) | ✅ 3 llamadas → 1 respuesta |
| 24 | Webhook sin clave | ✅ 403 |

---

## 1. Texto simple
**Mandar:** `Hola, busco un auto`
**Esperado:**
- A los ~10 s (la espera del flow) responde en 1 a 3 burbujas cortas, de vos, con una sola pregunta.
- n8n: guarda `parte_1` (y `parte_2` y `parte_3` si hacen falta) y dispara "Enviar mensajes". Al final, esos campos quedan vacíos.
- ManyChat: `estado_conversacion = nuevo` y la etiqueta `nuevo`.

## 2. Varios mensajes seguidos
**Mandar** en menos de 10 segundos: `Hola` · `busco una camioneta` · `hasta 25 mil dólares`
**Esperado:**
- **Una sola respuesta** que tiene en cuenta los tres mensajes.
- En ManyChat, el flow "Recibir mensajes" corre 3 veces y `respuesta_definitiva` va quedando `Hola, busco una camioneta, hasta 25 mil dólares`. Solo una de las vueltas hace la Solicitud externa; las otras terminan en la condición [4].
- n8n: **una** ejecución.

## 3. Audio
**Mandar:** un audio: *"Hola, quería saber si tienen una Toyota Hilux"*.
**Esperado:**
- Responde sobre la Hilux.
- n8n: "Separar adjuntos" → "Descargar adjunto" → "¿Es audio?" → "Transcribir audio".

## 4. Foto del auto del cliente (permuta)
**Mandar:** foto de tu auto y `¿Me lo toman en parte de pago?`
**Esperado:**
- Confirma en una línea lo que ve (marca, modelo, estado aparente), avisa que un asesor lo contacta para la tasación y no da un valor.
- ManyChat:
  - `bot_activo = no`
  - `estado_conversacion = necesita_humano` y la etiqueta `necesita_humano`
  - `motivo_derivacion` con "Permuta o tasación", la marca y el modelo
- El chat aparece abierto y asignado en el Inbox, con la notificación.

## 5. Texto + audio + foto en el mismo turno
**Mandar** en menos de 10 s: `hola` · un audio · una foto · `¿tienen esta?`
**Esperado:**
- Una sola respuesta que tiene en cuenta todo.
- n8n: los dos adjuntos se procesan en paralelo y "Juntar adjuntos" + "Unir adjuntos" arman un solo texto para el agente, en orden:
  `hola, ¿tienen esta?` + `[Audio del cliente, transcripción]: …` + `[Imagen del cliente] Análisis…`

## 6. Captura de una publicación
**Mandar:** captura de un aviso (MercadoLibre, etc.) de un auto que esté en el stock y `¿Tienen este?`
**Esperado:**
- Identifica marca, modelo y año, lo busca con `consultar_stock` y responde con los datos y la foto del stock.
- Si no está, ofrece el más parecido.

## 7. Pedido de humano
**Mandar:** `Quiero hablar con una persona`
**Esperado** (en este orden, se ve en la ejecución de n8n):
1. "Apagar bot (bot_activo = no)"
2. "Guardar estado y datos en ManyChat" (`estado_conversacion`, `motivo_derivacion`)
3. "Poner tag del estado nuevo" (`necesita_humano`)
4. "Notificar al equipo (flow de ManyChat)"
5. "Guardar respuesta en ManyChat (parte_1..3)" → "Disparar flow \"Enviar mensajes\"": *"…un asesor te contacta enseguida"*

Después mandá otro mensaje: **no responde** (caso 10).

## 8. Cliente enojado
**Mandar:** `Esto es una estafa, me tienen podrido, nadie me contesta`
**Esperado:**
- Empatía y aviso de que pasa la consulta a un asesor.
- Derivación completa como en el caso 7, con motivo "Cliente molesto o con un reclamo".

## 9. Despedida
**Mandar** (después de charlar): `Perfecto, gracias, nada más`
**Esperado:**
- Se despide en una línea.
- `estado_conversacion = cerrada` y la etiqueta `cerrada`.
- Con `FLOW_CERRAR_CONVERSACION` cargado, la conversación se cierra en el Inbox, una sola vez.

## 10. Bot desactivado
**Preparar:** `bot_activo = no` en tu contacto.
**Mandar:** `Hola?`
**Esperado:**
- **No responde.**
- En ManyChat, el flow termina en la condición [1].
- Si igual llegara a n8n, la ejecución termina en "Fin: lo atiende un humano".

## 11. Un humano toma el chat mientras el bot piensa
**Mandar** un mensaje y, justo después de que salga la Solicitud externa (a los ~10 s), poner `bot_activo = no` en ManyChat.
**Esperado:**
- No se envía la respuesta.
- n8n: termina en "Registrar que lo tomó un humano".

## 12. Vendedor: "Tomar conversación" y "Reactivar bot"
**Probar:** desde el Inbox, enviá el flow "Tomar conversación" a un contacto y después "Reactivar bot".
**Esperado:**
- **Con "Tomar":**
  - `bot_activo = no` y la etiqueta `necesita_humano`.
  - En n8n, una ejecución que pasa por "Registrar aviso del vendedor".
  - En Postgres, `tomado_at` con la hora.
- **Con "Reactivar":**
  - `bot_activo = si` y la etiqueta `en_conversacion`.
  - En Postgres, `bot_activo = true` y el evento `reactivacion`.
  - Un mensaje nuevo del cliente vuelve a tener respuesta.

## 13. Inactividad (`sin_respuesta`)
**Preparar:** una charla donde el bot habló último. Bajá `HORAS_SIN_RESPUESTA` a `0` en "Configuración inactividad", ejecutá el workflow a mano y después volvelo a `24`.
**Esperado:**
- `estado_conversacion = sin_respuesta`: sale la etiqueta anterior y entra `sin_respuesta`.
- Postgres: evento `sin_respuesta`.
- Con `SEGUIMIENTO_ACTIVO = si`: llega la plantilla, una sola vez por cliente.
- **No marca** a quien está `necesita_humano`, `visita_agendada` o `cerrada`, ni a quien escribió último.

## 14. Reactivación automática del bot
**Preparar:** un contacto derivado (caso 7). Bajá `HORAS_REACTIVACION_BOT` a `0` y ejecutá el workflow a mano.
**Esperado:**
- `bot_activo = si` y `estado_conversacion = en_conversacion`; la etiqueta `necesita_humano` pasa a `en_conversacion`.
- Si el vendedor ya lo había reactivado, solo se sincroniza Postgres.

## 15. Reintento de la Solicitud externa (idempotencia)
```bash
BODY='{"subscriber_id":"999","mensaje":"Hola","ultima_interaccion":"2026-10-20T10:00:00Z"}'
for i in 1 2; do curl -s -X POST https://TU_DOMINIO/webhook/otormin-manychat \
  -H 'Content-Type: application/json' -H "X-Otormin-Token: TU_CLAVE" -d "$BODY"; done
```
**Esperado:** la segunda ejecución termina en "Fin: mensaje repetido" (la clave de Redis dura 60 s).

## 16. Falla del agente
**Preparar:** poné una API key inválida en `OpenAI Otormín` (después restaurala).
**Mandar:** `Hola`
**Esperado:**
- Llega el `MENSAJE_RESPALDO` (*"¡Perdón! Tuve un problema…"*) por "Enviar mensajes".
- Se deriva a humano con motivo "Falla técnica del asesor virtual…".

## 17. Error en el workflow
Cualquier error que corte la ejecución del bot dispara "Otormín - Errores".
**Esperado:**
- Email al `EMAIL_ADMIN` con el workflow, la ejecución, el nodo y el error.
- Si el cliente todavía no había recibido respuesta:
  - se guarda el `MENSAJE_RESPALDO` en `parte_1` y se dispara "Enviar mensajes";
  - además: `bot_activo = no`, la etiqueta `necesita_humano` y el aviso al equipo.
- Como máximo **un respaldo cada 10 minutos por cliente**.

## 18. Cuotas
**Mandar:** `¿En cuántas cuotas me queda la [auto del stock]?`
**Esperado:**
- Usa `calcular_financiacion` con la tasa y el anticipo de la configuración, aclara que la cuota es estimada y el estado pasa a `lead_caliente`.
- **Control del cálculo:** USD 20.000, 30 % de anticipo, 36 cuotas, 18 % anual → anticipo USD 6.000, cuota **USD 506**, total USD 24.221.
- **Sin configurar:** si `TASA_FINANCIACION` o `ANTICIPO_MINIMO` dicen `COMPLETAR`, no da números y deriva.

## 19. Fotos del stock
**Mandar:** `Mandame fotos de las camionetas que tengan`
**Esperado:**
- Máximo 3 autos.
- n8n guarda `foto_1..3` junto con las partes, y el flow "Enviar mensajes" las manda después de los textos.

## 20. Agendar visita
**Mandar:** `¿Puedo ir el sábado a las 11 a ver la Hilux?`, y después dar el nombre y confirmar.
**Esperado:**
- Crea el evento en Google Calendar y el estado pasa a `visita_agendada`.
- **Si Calendar falla o la agenda está apagada:** no promete el turno, queda en `lead_caliente` y deriva.

## 21. Saltos de línea y comillas
**Mandar** en un mensaje: `Hola "che"` + Enter + `segunda línea`
**Esperado:**
- Responde normal.
- En ManyChat, el paso de ChatGPT [6] deja `mensaje_a_enviar` en una sola línea antes de la Solicitud externa.

## 22. Audio o foto que no se puede descargar
**Esperado:**
- Pide con amabilidad que lo reenvíe o lo escriba.
- n8n: "Respaldo: no se pudo descargar".

## 23. Buffer de n8n opcional
**Preparar:** `USAR_BUFFER_N8N = si`. Solo hace falta si querés una segunda capa además de la de ManyChat.
**Esperado:**
- Si llegan varias Solicitudes externas del mismo cliente en menos de `ESPERA_BUFFER_SEGUNDOS`, sale una sola respuesta.
- Las otras ejecuciones terminan en "Fin: responde el mensaje siguiente".

## 24. Webhook sin clave
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

-- Actividad por día
SELECT * FROM metricas_diarias LIMIT 14;

-- Bots apagados y desde cuándo
SELECT subscriber_id, nombre, estado, derivado_at, tomado_at, motivo_derivacion
FROM conversaciones WHERE NOT bot_activo ORDER BY derivado_at DESC NULLS LAST;
```
