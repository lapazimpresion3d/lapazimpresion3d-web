CREATE TABLE IF NOT EXISTS servicio_retencion_copias (
 respaldo_id TEXT PRIMARY KEY REFERENCES servicio_respaldos(id) ON DELETE RESTRICT,
 protegida INTEGER NOT NULL CHECK(protegida IN (0,1)),
 motivo TEXT NOT NULL CHECK(length(trim(motivo)) BETWEEN 3 AND 1000),
 version INTEGER NOT NULL DEFAULT 1 CHECK(version>0),
 fecha_actualizacion TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS servicio_recuperaciones (
 id TEXT PRIMARY KEY,
 respaldo_id TEXT NOT NULL REFERENCES servicio_respaldos(id) ON DELETE RESTRICT,
 motivo TEXT NOT NULL CHECK(length(trim(motivo)) BETWEEN 3 AND 2000),
 estado TEXT NOT NULL DEFAULT 'solicitada' CHECK(estado IN ('solicitada','en_revision','prueba_registrada','cancelada')),
 prueba_id TEXT REFERENCES servicio_pruebas_restauracion(id) ON DELETE RESTRICT,
 observaciones TEXT NOT NULL DEFAULT '',
 version INTEGER NOT NULL DEFAULT 1 CHECK(version>0),
 fecha_registro TEXT NOT NULL,
 fecha_actualizacion TEXT NOT NULL,
 CHECK((estado='prueba_registrada' AND prueba_id IS NOT NULL) OR (estado<>'prueba_registrada' AND prueba_id IS NULL))
);
CREATE INDEX IF NOT EXISTS idx_recuperaciones_copia ON servicio_recuperaciones(respaldo_id,fecha_registro DESC);
