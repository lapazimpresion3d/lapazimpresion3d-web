CREATE TABLE IF NOT EXISTS servicio_soporte (
 id TEXT PRIMARY KEY,
 propuesta_id TEXT NOT NULL REFERENCES propuestas_economicas(propuesta_id) ON DELETE RESTRICT,
 titulo TEXT NOT NULL, descripcion TEXT NOT NULL,
 tipo TEXT NOT NULL CHECK(tipo IN ('incidencia','mantenimiento','cambio_menor','adicional')),
 prioridad TEXT NOT NULL CHECK(prioridad IN ('baja','normal','alta','critica')),
 estado TEXT NOT NULL DEFAULT 'abierto' CHECK(estado IN ('abierto','en_proceso','espera_cliente','resuelto','cancelado')),
 origen TEXT NOT NULL CHECK(origen IN ('whatsapp','correo','telefono','presencial','interno','otro')),
 fecha_registro TEXT NOT NULL, fecha_actualizacion TEXT NOT NULL,
 version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_soporte_servicio ON servicio_soporte(propuesta_id,fecha_actualizacion DESC);
CREATE TABLE IF NOT EXISTS servicio_intervenciones (
 id TEXT PRIMARY KEY,
 soporte_id TEXT NOT NULL REFERENCES servicio_soporte(id) ON DELETE RESTRICT,
 descripcion TEXT NOT NULL,
 minutos INTEGER NOT NULL CHECK(minutos BETWEEN 0 AND 1440),
 fecha_trabajo TEXT NOT NULL,
 clasificacion TEXT NOT NULL CHECK(clasificacion IN ('soporte','mantenimiento','bolsa','adicional','sin_cargo')),
 autorizacion TEXT NOT NULL DEFAULT '',
 fecha_registro TEXT NOT NULL,
 CHECK(clasificacion<>'adicional' OR length(trim(autorizacion))>=3)
);
CREATE INDEX IF NOT EXISTS idx_intervenciones_soporte ON servicio_intervenciones(soporte_id,fecha_trabajo DESC);
