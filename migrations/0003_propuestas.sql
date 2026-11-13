-- Solicitudes identificadas; no modifica diagnósticos antiguos.
CREATE TABLE IF NOT EXISTS quiz_propuestas (
 id TEXT PRIMARY KEY,
 folio TEXT NOT NULL UNIQUE,
 fecha TEXT NOT NULL,
 nombre TEXT NOT NULL,
 proyecto TEXT NOT NULL DEFAULT '',
 telefono TEXT NOT NULL,
 comentario TEXT NOT NULL DEFAULT '',
 servicio_id TEXT NOT NULL,
 ficha_json TEXT NOT NULL,
 estado TEXT NOT NULL DEFAULT 'nueva' CHECK(estado IN ('nueva','en_revision','contactado','cotizado','cerrado')),
 privacidad_aceptada INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_propuestas_fecha ON quiz_propuestas(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_propuestas_estado ON quiz_propuestas(estado,fecha DESC);
CREATE INDEX IF NOT EXISTS idx_propuestas_telefono ON quiz_propuestas(telefono);
