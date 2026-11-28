CREATE TABLE IF NOT EXISTS servicio_respaldos (
 id TEXT PRIMARY KEY,
 propuesta_id TEXT NOT NULL REFERENCES propuestas_economicas(propuesta_id) ON DELETE RESTRICT,
 fecha_respaldo TEXT NOT NULL,
 alcance TEXT NOT NULL CHECK(alcance IN ('datos','archivos','completo','configuracion')),
 resultado TEXT NOT NULL CHECK(resultado IN ('correcto','parcial','fallido')),
 metodo TEXT NOT NULL CHECK(metodo IN ('manual','automatizado','proveedor')),
 referencia TEXT NOT NULL DEFAULT '' CHECK(length(referencia)<=200),
 observaciones TEXT NOT NULL DEFAULT '' CHECK(length(observaciones)<=2000),
 fecha_registro TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_servicio_respaldos ON servicio_respaldos(propuesta_id,fecha_respaldo DESC);
CREATE TABLE IF NOT EXISTS servicio_pruebas_restauracion (
 id TEXT PRIMARY KEY,
 respaldo_id TEXT NOT NULL REFERENCES servicio_respaldos(id) ON DELETE RESTRICT,
 fecha_prueba TEXT NOT NULL,
 resultado TEXT NOT NULL CHECK(resultado IN ('correcto','parcial','fallido')),
 minutos INTEGER NOT NULL CHECK(minutos BETWEEN 0 AND 10080),
 observaciones TEXT NOT NULL CHECK(length(trim(observaciones)) BETWEEN 3 AND 2000),
 fecha_registro TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_servicio_restauracion ON servicio_pruebas_restauracion(respaldo_id,fecha_prueba DESC);
