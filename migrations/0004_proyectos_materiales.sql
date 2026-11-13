-- Etapa 1: proyectos aceptados y materiales privados.
-- Ejecutar manualmente en D1 tras revisar la copia de seguridad.
-- No altera quiz_propuestas ni publica archivos.
CREATE TABLE IF NOT EXISTS proyectos_cliente (
  id TEXT PRIMARY KEY,
  propuesta_id TEXT NOT NULL UNIQUE,
  fecha_creacion TEXT NOT NULL,
  fecha_actualizacion TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'preparacion'
    CHECK (estado IN ('preparacion', 'recabando_materiales', 'en_desarrollo', 'en_revision', 'finalizado', 'cancelado')),
  acceso_token_hash TEXT,
  acceso_expira TEXT,
  acceso_revocado INTEGER NOT NULL DEFAULT 0 CHECK (acceso_revocado IN (0,1)),
  instrucciones TEXT NOT NULL DEFAULT '',
  FOREIGN KEY (propuesta_id) REFERENCES quiz_propuestas(id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_proyectos_estado ON proyectos_cliente(estado, fecha_actualizacion DESC);
CREATE INDEX IF NOT EXISTS idx_proyectos_token ON proyectos_cliente(acceso_token_hash);

CREATE TABLE IF NOT EXISTS proyecto_secciones (
  proyecto_id TEXT NOT NULL,
  clave TEXT NOT NULL CHECK (clave IN ('datos_negocio','servicios_productos','horarios_contacto','indicaciones')),
  contenido TEXT NOT NULL DEFAULT '',
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente','recibido','requiere_correccion','aprobado')),
  fecha_actualizacion TEXT NOT NULL,
  PRIMARY KEY (proyecto_id,clave),
  FOREIGN KEY (proyecto_id) REFERENCES proyectos_cliente(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS proyecto_archivos (
  id TEXT PRIMARY KEY,
  proyecto_id TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('logotipo','fotografias','documentos','otros')),
  nombre_original TEXT NOT NULL,
  clave_r2 TEXT NOT NULL UNIQUE,
  tipo_mime TEXT NOT NULL,
  tamano_bytes INTEGER NOT NULL CHECK (tamano_bytes > 0),
  fecha_subida TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'recibido'
    CHECK (estado IN ('recibido','requiere_correccion','aprobado')),
  FOREIGN KEY (proyecto_id) REFERENCES proyectos_cliente(id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_archivos_proyecto ON proyecto_archivos(proyecto_id,fecha_subida DESC);
