CREATE TABLE IF NOT EXISTS servicio_monitoreo (
 id TEXT PRIMARY KEY,
 propuesta_id TEXT NOT NULL REFERENCES propuestas_economicas(propuesta_id) ON DELETE RESTRICT,
 sitio TEXT NOT NULL CHECK(length(sitio) BETWEEN 1 AND 500),
 fecha_comprobacion TEXT NOT NULL,
 estado TEXT NOT NULL CHECK(estado IN ('disponible','degradado','no_disponible')),
 codigo_http INTEGER CHECK(codigo_http BETWEEN 100 AND 599),
 tiempo_ms INTEGER CHECK(tiempo_ms BETWEEN 0 AND 120000),
 observaciones TEXT NOT NULL DEFAULT '' CHECK(length(observaciones)<=1000),
 fecha_registro TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_servicio_monitoreo
ON servicio_monitoreo(propuesta_id,sitio,fecha_comprobacion DESC,fecha_registro DESC);
