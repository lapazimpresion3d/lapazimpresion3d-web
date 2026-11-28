-- Conversación separada de las intervenciones internas. No publica datos por sí sola.
CREATE TABLE IF NOT EXISTS servicio_soporte_mensajes (
 id TEXT PRIMARY KEY,
 soporte_id TEXT NOT NULL REFERENCES servicio_soporte(id) ON DELETE RESTRICT,
 autor TEXT NOT NULL CHECK(autor IN ('lapazimpresion3d','cliente')),
 texto TEXT NOT NULL CHECK(length(trim(texto)) BETWEEN 1 AND 3000),
 fecha_registro TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_soporte_mensajes ON servicio_soporte_mensajes(soporte_id,fecha_registro,id);
