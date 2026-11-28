CREATE TABLE IF NOT EXISTS servicio_costos_correcciones (
 id TEXT PRIMARY KEY,
 costo_id TEXT NOT NULL REFERENCES servicio_costos(id) ON DELETE RESTRICT,
 version INTEGER NOT NULL CHECK(version>0),
 accion TEXT NOT NULL CHECK(accion IN ('editar','anular')),
 fecha TEXT NOT NULL,
 categoria TEXT NOT NULL CHECK(categoria IN ('alojamiento','dominio','almacenamiento','licencias','comisiones','otros')),
 importe INTEGER NOT NULL CHECK(importe BETWEEN 1 AND 100000000),
 descripcion TEXT NOT NULL CHECK(length(trim(descripcion)) BETWEEN 3 AND 500),
 motivo TEXT NOT NULL CHECK(length(trim(motivo)) BETWEEN 3 AND 1000),
 fecha_registro TEXT NOT NULL,
 UNIQUE(costo_id,version)
);
CREATE VIEW IF NOT EXISTS servicio_costos_vigentes AS
SELECT c.id,c.propuesta_id,COALESCE(r.fecha,c.fecha) AS fecha,
 COALESCE(r.categoria,c.categoria) AS categoria,COALESCE(r.importe,c.importe) AS importe,
 COALESCE(r.descripcion,c.descripcion) AS descripcion,c.fecha_registro,
 COALESCE(r.version,0) AS version,COALESCE(r.accion,'original') AS accion
FROM servicio_costos c LEFT JOIN servicio_costos_correcciones r
 ON r.costo_id=c.id AND r.version=(SELECT MAX(z.version) FROM servicio_costos_correcciones z WHERE z.costo_id=c.id);
