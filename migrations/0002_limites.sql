-- Ventanas de limitación de intentos; claves HMAC no reversibles.
CREATE TABLE IF NOT EXISTS quiz_limites (
 clave TEXT PRIMARY KEY,
 accion TEXT NOT NULL,
 contador INTEGER NOT NULL,
 caduca INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_quiz_limites_caduca ON quiz_limites(caduca);
