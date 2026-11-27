-- Renovaciones manuales, independientes de los anticipos y pagos iniciales.
CREATE TABLE IF NOT EXISTS suscripciones_cliente (
 propuesta_id TEXT PRIMARY KEY REFERENCES propuestas_economicas(propuesta_id) ON DELETE RESTRICT,
 inicio TEXT NOT NULL,
 mensualidad INTEGER NOT NULL CHECK(mensualidad BETWEEN 1 AND 100000000),
 total_mensual INTEGER NOT NULL CHECK(total_mensual=mensualidad+(mensualidad*16+50)/100),
 estado TEXT NOT NULL DEFAULT 'activo' CHECK(estado IN ('activo','suspendido','cancelado')),
 version INTEGER NOT NULL DEFAULT 1,
 fecha_actualizacion TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS pagos_mensualidad (
 id TEXT PRIMARY KEY,
 propuesta_id TEXT NOT NULL REFERENCES suscripciones_cliente(propuesta_id) ON DELETE RESTRICT,
 inicio TEXT NOT NULL,
 fin TEXT NOT NULL CHECK(fin>inicio),
 dia_ancla INTEGER NOT NULL CHECK(dia_ancla BETWEEN 1 AND 31),
 importe INTEGER NOT NULL CHECK(importe>0),
 fecha TEXT NOT NULL,
 metodo TEXT NOT NULL CHECK(metodo IN ('efectivo','transferencia','otro')),
 referencia TEXT NOT NULL DEFAULT '',
 fecha_registro TEXT NOT NULL,
 UNIQUE(propuesta_id,inicio)
);
CREATE INDEX IF NOT EXISTS idx_mensualidad_periodo ON pagos_mensualidad(propuesta_id,fin DESC);
