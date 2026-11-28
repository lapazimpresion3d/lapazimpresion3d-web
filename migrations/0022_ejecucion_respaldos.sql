CREATE TABLE IF NOT EXISTS servicio_ejecuciones_respaldos (
 id TEXT PRIMARY KEY,
 propuesta_id TEXT NOT NULL REFERENCES propuestas_economicas(propuesta_id) ON DELETE RESTRICT,
 vinculo_id TEXT NOT NULL REFERENCES servicio_vinculos(id) ON DELETE RESTRICT,
 alcance TEXT NOT NULL CHECK(alcance IN ('datos','archivos','completo','configuracion')),
 fecha_programada TEXT NOT NULL,
 version_politica INTEGER NOT NULL CHECK(version_politica>0),
 estado TEXT NOT NULL CHECK(estado IN ('pendiente','en_proceso','correcto','parcial','fallido','incierto')),
 intentos INTEGER NOT NULL DEFAULT 0,
 fecha_creacion TEXT NOT NULL,
 fecha_actualizacion TEXT NOT NULL,
 referencia TEXT NOT NULL DEFAULT '',
 observaciones TEXT NOT NULL DEFAULT '',
 UNIQUE(propuesta_id,alcance,fecha_programada,version_politica)
);
CREATE INDEX IF NOT EXISTS idx_ejecuciones_respaldos ON servicio_ejecuciones_respaldos(estado,fecha_programada);
CREATE INDEX IF NOT EXISTS idx_ejecuciones_servicio ON servicio_ejecuciones_respaldos(propuesta_id,fecha_creacion DESC);
