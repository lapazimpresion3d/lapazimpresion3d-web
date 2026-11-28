CREATE TABLE IF NOT EXISTS servicio_soporte_resoluciones (
 soporte_id TEXT NOT NULL REFERENCES servicio_soporte(id) ON DELETE RESTRICT,
 version_solucion INTEGER NOT NULL CHECK(version_solucion>0),
 solucion TEXT NOT NULL CHECK(length(trim(solucion)) BETWEEN 3 AND 2000),
 fecha_solucion TEXT NOT NULL,
 decision TEXT CHECK(decision IN ('confirmada','reabierta')),
 comentario TEXT NOT NULL DEFAULT '' CHECK(length(comentario)<=2000),
 fecha_decision TEXT,
 decision_id TEXT UNIQUE,
 PRIMARY KEY(soporte_id,version_solucion),
 CHECK((decision IS NULL AND fecha_decision IS NULL AND decision_id IS NULL) OR (decision IS NOT NULL AND fecha_decision IS NOT NULL AND decision_id IS NOT NULL))
);
