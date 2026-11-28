CREATE TABLE IF NOT EXISTS proyecto_posventa (
 id TEXT PRIMARY KEY,
 proyecto_id TEXT NOT NULL REFERENCES proyectos_cliente(id) ON DELETE RESTRICT,
 fecha_reporte TEXT NOT NULL,
 origen TEXT NOT NULL CHECK(origen IN ('whatsapp','correo','telefono','presencial','interno','otro')),
 titulo TEXT NOT NULL CHECK(length(trim(titulo)) BETWEEN 3 AND 120),
 descripcion TEXT NOT NULL CHECK(length(trim(descripcion)) BETWEEN 3 AND 2000),
 garantia_hasta_registrada TEXT,
 cobertura TEXT NOT NULL DEFAULT 'por_evaluar' CHECK(cobertura IN ('por_evaluar','garantia','mantenimiento','adicional','sin_cargo','no_procede')),
 motivo TEXT NOT NULL DEFAULT '',
 autorizacion TEXT NOT NULL DEFAULT '',
 estado TEXT NOT NULL DEFAULT 'abierto' CHECK(estado IN ('abierto','en_proceso','espera_cliente','resuelto','cancelado')),
 solucion TEXT NOT NULL DEFAULT '',
 minutos INTEGER NOT NULL DEFAULT 0 CHECK(minutos BETWEEN 0 AND 10080),
 version INTEGER NOT NULL DEFAULT 1 CHECK(version>0),
 fecha_registro TEXT NOT NULL,
 fecha_actualizacion TEXT NOT NULL,
 CHECK(cobertura<>'adicional' OR length(trim(autorizacion))>=3)
);
CREATE INDEX IF NOT EXISTS idx_proyecto_posventa ON proyecto_posventa(proyecto_id,fecha_reporte DESC);
CREATE TABLE IF NOT EXISTS proyecto_posventa_historial (
 caso_id TEXT NOT NULL REFERENCES proyecto_posventa(id) ON DELETE RESTRICT,
 version INTEGER NOT NULL,
 cobertura TEXT NOT NULL,
 motivo TEXT NOT NULL,
 autorizacion TEXT NOT NULL,
 estado TEXT NOT NULL,
 solucion TEXT NOT NULL,
 minutos INTEGER NOT NULL,
 fecha_registro TEXT NOT NULL,
 PRIMARY KEY(caso_id,version)
);
