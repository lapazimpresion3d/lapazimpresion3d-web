-- Conserva la versión anterior y su decisión dentro de la misma escritura.
CREATE TABLE IF NOT EXISTS proyecto_revisiones (
 proyecto_id TEXT NOT NULL REFERENCES proyecto_entregas(proyecto_id) ON DELETE RESTRICT,
 version INTEGER NOT NULL CHECK(version>0),
 modalidad TEXT NOT NULL, revision TEXT NOT NULL, vista_previa TEXT NOT NULL,
 notas_revision TEXT NOT NULL, decision TEXT NOT NULL, comentario TEXT NOT NULL,
 fecha_decision TEXT, origen_decision TEXT, fecha_archivo TEXT NOT NULL,
 PRIMARY KEY(proyecto_id,version)
);
CREATE TRIGGER IF NOT EXISTS archivar_revision_anterior
BEFORE UPDATE OF version ON proyecto_entregas
WHEN NEW.version>OLD.version
BEGIN
 INSERT INTO proyecto_revisiones(proyecto_id,version,modalidad,revision,vista_previa,notas_revision,decision,comentario,fecha_decision,origen_decision,fecha_archivo)
 VALUES(OLD.proyecto_id,OLD.version,OLD.modalidad,OLD.revision,OLD.vista_previa,OLD.notas_revision,OLD.decision,OLD.comentario,OLD.fecha_decision,OLD.origen_decision,NEW.fecha_actualizacion);
END;
