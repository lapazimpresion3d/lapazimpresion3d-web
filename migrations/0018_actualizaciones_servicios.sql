CREATE TABLE IF NOT EXISTS servicio_actualizaciones (
 id TEXT PRIMARY KEY,
 propuesta_id TEXT NOT NULL REFERENCES propuestas_economicas(propuesta_id) ON DELETE RESTRICT,
 fecha_aplicacion TEXT NOT NULL,
 version_anterior TEXT NOT NULL DEFAULT '',
 version_nueva TEXT NOT NULL,
 categoria TEXT NOT NULL CHECK(categoria IN ('seguridad','correccion','mejora','funcionalidad','compatibilidad','reversion')),
 titulo TEXT NOT NULL CHECK(length(trim(titulo)) BETWEEN 3 AND 120),
 descripcion TEXT NOT NULL CHECK(length(trim(descripcion)) BETWEEN 3 AND 2000),
 resultado TEXT NOT NULL CHECK(resultado IN ('correcto','parcial','fallido')),
 alcance TEXT NOT NULL CHECK(alcance IN ('incluido','adicional','sin_cargo')),
 autorizacion TEXT NOT NULL DEFAULT '',
 observaciones TEXT NOT NULL DEFAULT '',
 resumen_cliente TEXT NOT NULL DEFAULT '',
 fecha_registro TEXT NOT NULL,
 CHECK(alcance<>'adicional' OR length(trim(autorizacion))>=3)
);
CREATE INDEX IF NOT EXISTS idx_servicio_actualizaciones ON servicio_actualizaciones(propuesta_id,fecha_aplicacion DESC);
