CREATE TABLE IF NOT EXISTS servicio_monitoreo_programado (
 propuesta_id TEXT PRIMARY KEY REFERENCES propuestas_economicas(propuesta_id) ON DELETE RESTRICT,
 sitio TEXT NOT NULL CHECK(length(sitio) BETWEEN 1 AND 500),
 intervalo_min INTEGER NOT NULL CHECK(intervalo_min IN (15,30,60,360,1440)),
 umbral_ms INTEGER NOT NULL CHECK(umbral_ms BETWEEN 100 AND 10000),
 habilitado INTEGER NOT NULL CHECK(habilitado IN (0,1)),
 proxima TEXT NOT NULL,
 version INTEGER NOT NULL DEFAULT 1 CHECK(version>0),
 fecha_actualizacion TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_monitoreo_programado ON servicio_monitoreo_programado(habilitado,proxima);
