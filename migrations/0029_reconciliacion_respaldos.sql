CREATE TABLE IF NOT EXISTS servicio_reconciliaciones_respaldos (
 id TEXT PRIMARY KEY,
 ejecucion_id TEXT NOT NULL REFERENCES servicio_ejecuciones_respaldos(id) ON DELETE RESTRICT,
 resultado TEXT NOT NULL CHECK(resultado IN ('verificada','no_encontrada','no_verificable')),
 motivo TEXT NOT NULL CHECK(length(trim(motivo)) BETWEEN 3 AND 1000),
 referencia TEXT NOT NULL DEFAULT '',
 fecha_registro TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reconciliaciones_ejecucion ON servicio_reconciliaciones_respaldos(ejecucion_id,fecha_registro DESC);
