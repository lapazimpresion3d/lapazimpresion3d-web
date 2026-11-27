-- Control comercial interno. Aplicar tras respaldo y prueba local de D1.
CREATE TABLE IF NOT EXISTS propuestas_economicas (
 propuesta_id TEXT PRIMARY KEY REFERENCES quiz_propuestas(id) ON DELETE RESTRICT,
 paquete TEXT NOT NULL,
 alcance TEXT NOT NULL,
 implementacion INTEGER NOT NULL CHECK(implementacion BETWEEN 0 AND 100000000),
 fabricacion INTEGER NOT NULL CHECK(fabricacion BETWEEN 0 AND 100000000),
 extras INTEGER NOT NULL CHECK(extras BETWEEN 0 AND 100000000),
 mensualidad INTEGER NOT NULL CHECK(mensualidad BETWEEN 0 AND 100000000),
 iva_pct INTEGER NOT NULL DEFAULT 16 CHECK(iva_pct=16),
 total_inicial INTEGER NOT NULL CHECK(total_inicial>=0),
 total_mensual INTEGER NOT NULL CHECK(total_mensual>=0),
 version INTEGER NOT NULL DEFAULT 1 CHECK(version>=1),
 fecha_actualizacion TEXT NOT NULL,
 fecha_aceptacion TEXT,
 CHECK(paquete <> 'solo_fisico' OR (implementacion=0 AND mensualidad=0)),
 CHECK(total_inicial=implementacion+fabricacion+extras+((implementacion+fabricacion+extras)*16+50)/100),
 CHECK(total_mensual=mensualidad+(mensualidad*16+50)/100)
);
CREATE TABLE IF NOT EXISTS pagos_propuesta (
 id TEXT PRIMARY KEY,
 propuesta_id TEXT NOT NULL REFERENCES propuestas_economicas(propuesta_id) ON DELETE RESTRICT,
 importe INTEGER NOT NULL CHECK(importe BETWEEN 1 AND 348000000),
 fecha TEXT NOT NULL,
 metodo TEXT NOT NULL CHECK(metodo IN ('efectivo','transferencia','otro')),
 referencia TEXT NOT NULL DEFAULT '',
 fecha_registro TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pagos_propuesta ON pagos_propuesta(propuesta_id,fecha,fecha_registro);
