-- Asociación administrativa; no concede acceso externo.
CREATE TABLE IF NOT EXISTS servicio_vinculos (
 id TEXT PRIMARY KEY,
 propuesta_id TEXT NOT NULL REFERENCES propuestas_economicas(propuesta_id) ON DELETE RESTRICT,
 plataforma TEXT NOT NULL CHECK(length(plataforma) BETWEEN 1 AND 80),
 negocio_externo TEXT NOT NULL CHECK(length(negocio_externo) BETWEEN 1 AND 128),
 estado TEXT NOT NULL DEFAULT 'registrado' CHECK(estado IN ('registrado','revocado')),
 fecha_registro TEXT NOT NULL,
 fecha_revocacion TEXT,
 motivo_revocacion TEXT NOT NULL DEFAULT '',
 CHECK((estado='registrado' AND fecha_revocacion IS NULL) OR (estado='revocado' AND fecha_revocacion IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_vinculo_negocio_registrado ON servicio_vinculos(plataforma,negocio_externo) WHERE estado='registrado';
CREATE UNIQUE INDEX IF NOT EXISTS idx_vinculo_servicio_registrado ON servicio_vinculos(propuesta_id) WHERE estado='registrado';
CREATE INDEX IF NOT EXISTS idx_vinculo_historial ON servicio_vinculos(propuesta_id,fecha_registro DESC);
