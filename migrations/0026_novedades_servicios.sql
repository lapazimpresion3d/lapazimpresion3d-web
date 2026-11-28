CREATE TABLE IF NOT EXISTS servicio_novedades (
 id TEXT PRIMARY KEY,
 actualizacion_id TEXT NOT NULL REFERENCES servicio_actualizaciones(id) ON DELETE RESTRICT,
 vinculo_id TEXT NOT NULL REFERENCES servicio_vinculos(id) ON DELETE RESTRICT,
 titulo TEXT NOT NULL CHECK(length(trim(titulo)) BETWEEN 3 AND 120),
 resumen TEXT NOT NULL CHECK(length(trim(resumen)) BETWEEN 3 AND 2000),
 fecha_publicacion TEXT NOT NULL,
 fecha_retiro TEXT,
 motivo_retiro TEXT NOT NULL DEFAULT '',
 CHECK(fecha_retiro IS NULL OR length(trim(motivo_retiro))>=3)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_novedad_activa ON servicio_novedades(actualizacion_id) WHERE fecha_retiro IS NULL;
CREATE INDEX IF NOT EXISTS idx_novedades_vinculo ON servicio_novedades(vinculo_id,fecha_publicacion DESC);
