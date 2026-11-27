CREATE TABLE IF NOT EXISTS proyecto_entregas (
 proyecto_id TEXT PRIMARY KEY REFERENCES proyectos_cliente(id) ON DELETE RESTRICT,
 modalidad TEXT NOT NULL CHECK(modalidad IN ('web','fisica','combinada')),
 revision TEXT NOT NULL, vista_previa TEXT NOT NULL DEFAULT '', notas_revision TEXT NOT NULL DEFAULT '',
 version INTEGER NOT NULL DEFAULT 1 CHECK(version>0),
 decision TEXT NOT NULL DEFAULT 'pendiente' CHECK(decision IN ('pendiente','aprobado','requiere_cambios')),
 comentario TEXT NOT NULL DEFAULT '', fecha_decision TEXT,
 origen_decision TEXT CHECK(origen_decision IN ('cliente','administrador')),
 tipo_dominio TEXT NOT NULL DEFAULT 'no_aplica' CHECK(tipo_dominio IN ('no_aplica','propio','subdominio')),
 url_final TEXT NOT NULL DEFAULT '', fecha_entrega TEXT, fecha_publicacion TEXT, garantia_hasta TEXT,
 fecha_actualizacion TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS proyecto_cambios (
 id TEXT PRIMARY KEY, proyecto_id TEXT NOT NULL REFERENCES proyecto_entregas(proyecto_id) ON DELETE RESTRICT,
 descripcion TEXT NOT NULL, fecha_registro TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_proyecto_cambios ON proyecto_cambios(proyecto_id,fecha_registro DESC);
