-- Aplicar después de 0008, solo con autorización.
CREATE TABLE IF NOT EXISTS proyecto_avances_fotos (
 id TEXT PRIMARY KEY,
 proyecto_id TEXT NOT NULL REFERENCES proyectos_cliente(id) ON DELETE RESTRICT,
 version_avance INTEGER NOT NULL CHECK(version_avance>0),
 descripcion TEXT NOT NULL DEFAULT '',
 tipo_mime TEXT NOT NULL CHECK(tipo_mime IN ('image/jpeg','image/png','image/webp')),
 fecha_subida TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_avances_fotos ON proyecto_avances_fotos(proyecto_id,version_avance);
