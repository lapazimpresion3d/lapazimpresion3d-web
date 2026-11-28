-- Solicitudes originadas en un negocio autenticado. Contenido público explícito.
CREATE TABLE IF NOT EXISTS servicio_soporte_cliente (
 soporte_id TEXT PRIMARY KEY REFERENCES servicio_soporte(id) ON DELETE RESTRICT,
 vinculo_id TEXT NOT NULL REFERENCES servicio_vinculos(id) ON DELETE RESTRICT,
 solicitud_externa TEXT NOT NULL,
 titulo TEXT NOT NULL CHECK(length(trim(titulo)) BETWEEN 3 AND 120),
 descripcion TEXT NOT NULL CHECK(length(trim(descripcion)) BETWEEN 3 AND 2000),
 categoria TEXT NOT NULL CHECK(categoria IN ('funcionamiento','ayuda','modificacion','suscripcion','nueva_funcion','mejora','otro')),
 modulo TEXT NOT NULL DEFAULT '' CHECK(length(modulo)<=120),
 impacto TEXT NOT NULL CHECK(impacto IN ('bajo','parcial','bloqueante')),
 fecha_registro TEXT NOT NULL,
 UNIQUE(vinculo_id,solicitud_externa)
);
CREATE INDEX IF NOT EXISTS idx_soporte_cliente_vinculo ON servicio_soporte_cliente(vinculo_id,fecha_registro DESC);
