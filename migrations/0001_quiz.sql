CREATE TABLE IF NOT EXISTS quiz_diagnosticos (
 id TEXT PRIMARY KEY,
 fecha TEXT NOT NULL,
 servicio_id TEXT NOT NULL,
 ficha_json TEXT NOT NULL,
 estado TEXT NOT NULL DEFAULT 'nuevo' CHECK (estado IN ('nuevo','revisado'))
);
CREATE INDEX IF NOT EXISTS idx_quiz_fecha ON quiz_diagnosticos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_estado_fecha ON quiz_diagnosticos(estado,fecha DESC);
