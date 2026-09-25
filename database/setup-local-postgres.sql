-- CoreX — Configuración inicial PostgreSQL LOCAL (sin Docker)
-- La contraseña de corex_user debe coincidir con DB_PASSWORD en backend/.env
-- Ejecutar con: database/setup-local.ps1

CREATE USER corex_user WITH PASSWORD 'CHANGE_ME';

CREATE DATABASE corex_db OWNER corex_user;

GRANT ALL PRIVILEGES ON DATABASE corex_db TO corex_user;
