CREATE TABLE IF NOT EXISTS servicio_soporte_evidencias (
 id TEXT PRIMARY KEY,
 soporte_id TEXT NOT NULL REFERENCES servicio_soporte(id) ON DELETE RESTRICT,
 clave_r2 TEXT NOT NULL UNIQUE,
 autor TEXT NOT NULL CHECK(autor IN ('cliente','lapazimpresion3d')),
 visibilidad TEXT NOT NULL CHECK(visibilidad IN ('cliente','interna')),
 descripcion TEXT NOT NULL DEFAULT '' CHECK(length(descripcion)<=500),
 tipo_mime TEXT NOT NULL CHECK(tipo_mime IN ('image/jpeg','image/png','image/webp')),
 tamano_bytes INTEGER NOT NULL CHECK(tamano_bytes BETWEEN 12 AND 4194304),
 sha256 TEXT NOT NULL CHECK(length(sha256)=64),
 fecha_registro TEXT NOT NULL,
 CHECK(autor<>'cliente' OR visibilidad='cliente')
);
CREATE INDEX IF NOT EXISTS idx_soporte_evidencias ON servicio_soporte_evidencias(soporte_id,fecha_registro);
