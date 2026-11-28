CREATE TABLE IF NOT EXISTS servicio_politicas_respaldos (
 propuesta_id TEXT NOT NULL REFERENCES propuestas_economicas(propuesta_id) ON DELETE RESTRICT,
 alcance TEXT NOT NULL CHECK(alcance IN ('datos','archivos','completo','configuracion')),
 frecuencia_dias INTEGER NOT NULL CHECK(frecuencia_dias BETWEEN 1 AND 365),
 retencion_dias INTEGER NOT NULL CHECK(retencion_dias BETWEEN 1 AND 3650),
 inicio TEXT NOT NULL,
 habilitada INTEGER NOT NULL CHECK(habilitada IN (0,1)),
 version INTEGER NOT NULL DEFAULT 1 CHECK(version>0),
 fecha_actualizacion TEXT NOT NULL,
 PRIMARY KEY(propuesta_id,alcance),
 CHECK(retencion_dias>=frecuencia_dias)
);
