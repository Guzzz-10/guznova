-- =====================================================================
-- Otormín Automóviles - Bot de WhatsApp (n8n + ManyChat)
-- Esquema de la base de datos "otormin" (datos del negocio).
-- La base interna de n8n vive aparte (base "n8n").
--
-- Se ejecuta solo la primera vez que arranca el contenedor de Postgres
-- (ver sql/init/01_crear_base_otormin.sh). Para aplicarlo a mano:
--   docker compose exec -T postgres psql -U "$POSTGRES_USER" -d otormin < sql/schema.sql
-- Es idempotente: se puede correr varias veces sin romper nada.
-- =====================================================================

SET TIME ZONE 'America/Montevideo';

-- ---------------------------------------------------------------------
-- Una fila por cliente (contacto de ManyChat).
-- La usa el workflow principal en cada mensaje y el chequeo de
-- inactividad cada hora.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversaciones (
    subscriber_id               TEXT PRIMARY KEY,           -- Contact ID de ManyChat
    telefono                    TEXT,
    nombre                      TEXT,
    estado                      TEXT        NOT NULL DEFAULT 'nuevo',
    bot_activo                  BOOLEAN     NOT NULL DEFAULT TRUE,
    auto_interes                TEXT,                       -- ej: "Toyota Hilux 2021 (id 14)"
    motivo_derivacion           TEXT,
    ultimo_mensaje_cliente      TEXT,
    ultimo_mensaje_cliente_at   TIMESTAMPTZ,
    ultimo_mensaje_bot          TEXT,
    ultimo_mensaje_bot_at       TIMESTAMPTZ,
    derivado_at                 TIMESTAMPTZ,                -- cuándo el bot derivó a un humano
    tomado_at                   TIMESTAMPTZ,                -- cuándo un humano apagó el bot a mano
    reactivado_at               TIMESTAMPTZ,                -- última reactivación automática
    sin_respuesta_at            TIMESTAMPTZ,
    seguimiento_enviado_at      TIMESTAMPTZ,                -- plantilla de seguimiento (opcional)
    cerrada_at                  TIMESTAMPTZ,
    cantidad_mensajes_cliente   INTEGER     NOT NULL DEFAULT 0,
    cantidad_mensajes_bot       INTEGER     NOT NULL DEFAULT 0,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT conversaciones_estado_valido CHECK (estado IN (
        'nuevo', 'en_conversacion', 'lead_caliente', 'visita_agendada',
        'necesita_humano', 'cerrada', 'sin_respuesta'
    ))
);

CREATE INDEX IF NOT EXISTS conversaciones_estado_idx
    ON conversaciones (estado);

-- Para el chequeo de "sin_respuesta" (bot habló último hace más de 24 h)
CREATE INDEX IF NOT EXISTS conversaciones_ultimo_bot_idx
    ON conversaciones (ultimo_mensaje_bot_at)
    WHERE bot_activo;

-- Para la reactivación automática del bot
CREATE INDEX IF NOT EXISTS conversaciones_bot_apagado_idx
    ON conversaciones (derivado_at, tomado_at)
    WHERE NOT bot_activo;

-- ---------------------------------------------------------------------
-- Historial de eventos (métricas y auditoría).
-- tipo: mensaje_cliente | respuesta_bot | cambio_estado | derivacion |
--       tomado_por_humano | reactivacion | sin_respuesta | seguimiento | error
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS eventos_conversacion (
    id              BIGSERIAL PRIMARY KEY,
    subscriber_id   TEXT        NOT NULL REFERENCES conversaciones (subscriber_id) ON DELETE CASCADE,
    tipo            TEXT        NOT NULL,
    estado          TEXT,
    detalle         JSONB       NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS eventos_conversacion_sub_idx
    ON eventos_conversacion (subscriber_id, created_at DESC);
CREATE INDEX IF NOT EXISTS eventos_conversacion_tipo_idx
    ON eventos_conversacion (tipo, created_at DESC);

-- ---------------------------------------------------------------------
-- Memoria del agente (nodo "Memoria del cliente (Postgres)").
-- n8n la crea sola si no existe; la dejamos declarada para que quede
-- en la misma base y con índice por sesión.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS otormin_chat_histories (
    id          SERIAL PRIMARY KEY,
    session_id  VARCHAR(255) NOT NULL,
    message     JSONB        NOT NULL
);

CREATE INDEX IF NOT EXISTS otormin_chat_histories_session_idx
    ON otormin_chat_histories (session_id);

-- ---------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION otormin_set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS conversaciones_updated_at ON conversaciones;
CREATE TRIGGER conversaciones_updated_at
    BEFORE UPDATE ON conversaciones
    FOR EACH ROW EXECUTE FUNCTION otormin_set_updated_at();

-- ---------------------------------------------------------------------
-- Vistas de métricas (para Metabase, Looker Studio o una consulta rápida)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW metricas_estado_actual AS
SELECT estado,
       count(*)                                   AS clientes,
       count(*) FILTER (WHERE NOT bot_activo)     AS con_humano
FROM conversaciones
GROUP BY estado
ORDER BY clientes DESC;

CREATE OR REPLACE VIEW metricas_diarias AS
SELECT (created_at AT TIME ZONE 'America/Montevideo')::date AS dia,
       count(*) FILTER (WHERE tipo = 'mensaje_cliente')           AS mensajes_clientes,
       count(*) FILTER (WHERE tipo = 'respuesta_bot')             AS respuestas_bot,
       count(DISTINCT subscriber_id) FILTER (WHERE tipo = 'mensaje_cliente') AS clientes_activos,
       count(*) FILTER (WHERE tipo = 'derivacion')                AS derivaciones,
       count(*) FILTER (WHERE tipo = 'cambio_estado' AND estado = 'lead_caliente')   AS leads_calientes,
       count(*) FILTER (WHERE tipo = 'cambio_estado' AND estado = 'visita_agendada') AS visitas_agendadas,
       count(*) FILTER (WHERE tipo = 'sin_respuesta')             AS sin_respuesta,
       count(*) FILTER (WHERE tipo = 'error')                     AS errores
FROM eventos_conversacion
GROUP BY 1
ORDER BY 1 DESC;
