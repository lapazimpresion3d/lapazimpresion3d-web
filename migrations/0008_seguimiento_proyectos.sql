-- Aplicar únicamente tras autorización y respaldo. No modifica estados existentes.
ALTER TABLE proyectos_cliente ADD COLUMN seguimiento_json TEXT NOT NULL DEFAULT '';
