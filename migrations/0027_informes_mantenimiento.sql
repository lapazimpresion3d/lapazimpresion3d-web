CREATE TABLE IF NOT EXISTS servicio_informes_mensuales (
 id TEXT PRIMARY KEY,
 vinculo_id TEXT NOT NULL REFERENCES servicio_vinculos(id) ON DELETE RESTRICT,
 mes TEXT NOT NULL CHECK(length(mes)=7),
 titulo TEXT NOT NULL CHECK(length(trim(titulo)) BETWEEN 3 AND 120),
 resumen TEXT NOT NULL CHECK(length(trim(resumen)) BETWEEN 3 AND 4000),
 fecha_publicacion TEXT NOT NULL,
 fecha_retiro TEXT,
 motivo_retiro TEXT NOT NULL DEFAULT '',
 CHECK(fecha_retiro IS NULL OR length(trim(motivo_retiro))>=3)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_informe_mensual_activo ON servicio_informes_mensuales(vinculo_id,mes) WHERE fecha_retiro IS NULL;
CREATE INDEX IF NOT EXISTS idx_informes_mensuales ON servicio_informes_mensuales(vinculo_id,mes DESC,fecha_publicacion DESC);
