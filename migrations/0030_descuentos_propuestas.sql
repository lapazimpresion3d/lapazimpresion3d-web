-- Descuentos por propuesta. Los importes existentes siguen siendo netos y cumplen las restricciones originales.
-- Aplicar después de respaldo; los registros históricos conservan los mismos importes.
ALTER TABLE propuestas_economicas ADD COLUMN descuento_json TEXT NOT NULL DEFAULT '{}';
