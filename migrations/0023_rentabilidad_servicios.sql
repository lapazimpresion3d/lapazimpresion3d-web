CREATE TABLE IF NOT EXISTS servicio_costos (
 id TEXT PRIMARY KEY,
 propuesta_id TEXT NOT NULL REFERENCES propuestas_economicas(propuesta_id) ON DELETE RESTRICT,
 fecha TEXT NOT NULL,
 categoria TEXT NOT NULL CHECK(categoria IN ('alojamiento','dominio','almacenamiento','licencias','comisiones','otros')),
 importe INTEGER NOT NULL CHECK(importe BETWEEN 1 AND 100000000),
 descripcion TEXT NOT NULL CHECK(length(trim(descripcion)) BETWEEN 3 AND 500),
 fecha_registro TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_servicio_costos ON servicio_costos(propuesta_id,fecha);
CREATE TABLE IF NOT EXISTS servicio_costeo_mensual (
 propuesta_id TEXT NOT NULL REFERENCES propuestas_economicas(propuesta_id) ON DELETE RESTRICT,
 mes TEXT NOT NULL,
 tarifa_hora INTEGER NOT NULL CHECK(tarifa_hora BETWEEN 0 AND 10000000),
 minutos_extra INTEGER NOT NULL CHECK(minutos_extra BETWEEN 0 AND 44640),
 version INTEGER NOT NULL DEFAULT 1 CHECK(version>0),
 fecha_actualizacion TEXT NOT NULL,
 PRIMARY KEY(propuesta_id,mes)
);
