-- CoreX HU-052 — permitir rol super_admin (Lamakinet)
-- Amplía el CHECK de users.role

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'cajero', 'super_admin'));
