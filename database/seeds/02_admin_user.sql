-- 02_admin_user.sql
-- CoreX Database

-- ============================================
-- SCRIPT: database/seeds/02_admin_user.sql
-- DESCRIPCIÓN: Seeding de usuario administrador y datos iniciales
-- FECHA: 2026-05-21
-- AUTOR: Sistema de Base de Datos
-- ============================================

-- ============================================
-- NOTA IMPORTANTE SOBRE CONTRASEÑAS
-- ============================================
-- Las contraseñas están hasheadas con bcrypt
-- Contraseña por defecto: Admin123!
-- Puedes cambiarla después del primer inicio de sesión
-- Hash generado con costo 10
-- ============================================

-- ============================================
-- 1. USUARIO ADMINISTRADOR PRINCIPAL
-- ============================================

-- Insertar usuario administrador
INSERT INTO `users` (
    `name`,
    `email`,
    `password`,
    `role`,
    `status`,
    `is_active`,
    `email_verified_at`,
    `phone`,
    `language`,
    `timezone`,
    `newsletter_subscribed`,
    `marketing_emails`,
    `preferences`,
    `created_at`,
    `updated_at`
) VALUES (
    'Administrador',
    'admin@empresa.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Admin123!
    'admin',
    'active',
    1,
    NOW(),
    '+34 900 123 456',
    'es',
    'Europe/Madrid',
    1,
    1,
    JSON_OBJECT(
        'dashboard_layout', 'default',
        'notifications_enabled', TRUE,
        'email_notifications', TRUE,
        'push_notifications', TRUE
    ),
    NOW(),
    NOW()
);

-- ============================================
-- 2. USUARIOS DE PRUEBA (OPCIONAL)
-- ============================================

-- Usuario regular de prueba
INSERT INTO `users` (
    `name`,
    `email`,
    `password`,
    `role`,
    `status`,
    `is_active`,
    `email_verified_at`,
    `phone`,
    `address`,
    `city`,
    `zip_code`,
    `country`,
    `language`,
    `timezone`,
    `created_at`,
    `updated_at`
) VALUES (
    'Usuario Prueba',
    'usuario@example.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Admin123!
    'user',
    'active',
    1,
    NOW(),
    '+34 600 123 456',
    'Calle Principal 123',
    'Madrid',
    '28001',
    'España',
    'es',
    'Europe/Madrid',
    NOW(),
    NOW()
);

-- Usuario verificador/moderador
INSERT INTO `users` (
    `name`,
    `email`,
    `password`,
    `role`,
    `status`,
    `is_active`,
    `email_verified_at`,
    `phone`,
    `created_at`,
    `updated_at`
) VALUES (
    'Moderador',
    'moderador@empresa.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Admin123!
    'moderator',
    'active',
    1,
    NOW(),
    '+34 600 789 012',
    NOW(),
    NOW()
);

-- ============================================
-- 3. DIRECCIONES DEL USUARIO ADMIN
-- ============================================

-- Obtener ID del administrador
SET @admin_id = (SELECT id FROM users WHERE email = 'admin@empresa.com' LIMIT 1);

-- Dirección principal del administrador
INSERT INTO `user_addresses` (
    `user_id`,
    `address_type`,
    `address_line1`,
    `address_line2`,
    `city`,
    `state`,
    `zip_code`,
    `country`,
    `phone`,
    `recipient_name`,
    `is_default`,
    `is_billing_default`,
    `is_shipping_default`,
    `created_at`
) VALUES (
    @admin_id,
    'both',
    'Calle Empresa 123',
    'Oficina 4B',
    'Madrid',
    'Madrid',
    '28001',
    'España',
    '+34 900 123 456',
    'Administrador',
    1,
    1,
    1,
    NOW()
);

-- Dirección secundaria (envío)
INSERT INTO `user_addresses` (
    `user_id`,
    `address_type`,
    `address_line1`,
    `city`,
    `state`,
    `zip_code`,
    `country`,
    `phone`,
    `recipient_name`,
    `is_default`,
    `is_billing_default`,
    `is_shipping_default`,
    `created_at`
) VALUES (
    @admin_id,
    'shipping',
    'Avenida Principal 456',
    'Barcelona',
    'Barcelona',
    '08001',
    'España',
    '+34 900 123 457',
    'Administrador (Envíos)',
    0,
    0,
    0,
    NOW()
);

-- ============================================
-- 4. PREFERENCIAS DEL ADMINISTRADOR
-- ============================================

INSERT INTO `user_preferences` (`user_id`, `preference_key`, `preference_value`) VALUES
(@admin_id, 'dashboard_widgets', JSON_ARRAY('sales', 'users', 'products', 'orders')),
(@admin_id, 'default_page', 'dashboard'),
(@admin_id, 'items_per_page', '25'),
(@admin_id, 'date_format', 'dd/mm/yyyy'),
(@admin_id, 'notifications', JSON_OBJECT(
    'email', JSON_OBJECT('orders', TRUE, 'users', TRUE, 'products', TRUE),
    'push', JSON_OBJECT('orders', TRUE, 'users', FALSE, 'products', FALSE),
    'whatsapp', JSON_OBJECT('orders', FALSE, 'users', FALSE, 'products', FALSE)
));

-- ============================================
-- 5. ASIGNACIÓN DE ROLES (SI USAS TABLA user_role)
-- ============================================

-- Obtener IDs de roles
SET @admin_role_id = (SELECT id FROM roles WHERE slug = 'admin' LIMIT 1);
SET @user_role_id = (SELECT id FROM roles WHERE slug = 'user' LIMIT 1);
SET @moderator_role_id = (SELECT id FROM roles WHERE slug = 'moderator' LIMIT 1);

-- Asignar rol admin al administrador
INSERT INTO `user_role` (`user_id`, `role_id`, `assigned_by`, `assigned_at`) VALUES
(@admin_id, @admin_role_id, @admin_id, NOW());

-- Asignar rol user al usuario de prueba
SET @test_user_id = (SELECT id FROM users WHERE email = 'usuario@example.com' LIMIT 1);
INSERT INTO `user_role` (`user_id`, `role_id`, `assigned_by`, `assigned_at`) VALUES
(@test_user_id, @user_role_id, @admin_id, NOW());

-- Asignar rol moderator al moderador
SET @moderator_user_id = (SELECT id FROM users WHERE email = 'moderador@empresa.com' LIMIT 1);
INSERT INTO `user_role` (`user_id`, `role_id`, `assigned_by`, `assigned_at`) VALUES
(@moderator_user_id, @moderator_role_id, @admin_id, NOW());

-- ============================================
-- 6. ACTIVIDAD INICIAL DEL ADMINISTRADOR
-- ============================================

-- Registrar login inicial
INSERT INTO `user_login_history` (
    `user_id`,
    `ip_address`,
    `user_agent`,
    `location`,
    `device`,
    `browser`,
    `platform`,
    `login_type`,
    `success`,
    `created_at`
) VALUES (
    @admin_id,
    '127.0.0.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Localhost',
    'Desktop',
    'Chrome',
    'Windows',
    'email',
    1,
    NOW()
);

-- Registrar actividad inicial
INSERT INTO `user_activities` (
    `user_id`,
    `action`,
    `entity_type`,
    `ip_address`,
    `user_agent`,
    `created_at`
) VALUES
(@admin_id, 'user_created', 'User', '127.0.0.1', 'System', NOW()),
(@admin_id, 'role_assigned', 'Role', '127.0.0.1', 'System', NOW()),
(@admin_id, 'system_initialized', 'System', '127.0.0.1', 'System', NOW());

-- ============================================
-- 7. SESIÓN INICIAL (OPCIONAL)
-- ============================================

INSERT INTO `user_sessions` (
    `id`,
    `user_id`,
    `ip_address`,
    `user_agent`,
    `payload`,
    `last_activity`,
    `device`,
    `browser`,
    `platform`,
    `is_current`,
    `expires_at`
) VALUES (
    'initial_session_' || UUID(),
    @admin_id,
    '127.0.0.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    '{}',
    UNIX_TIMESTAMP(),
    'Desktop',
    'Chrome',
    'Windows',
    0,
    DATE_ADD(NOW(), INTERVAL 7 DAY)
);

-- ============================================
-- 8. PERMISOS ADICIONALES (OPCIONAL)
-- ============================================

-- Obtener IDs de permisos disponibles
SET @view_users_perm_id = (SELECT id FROM permissions WHERE slug = 'view_users' LIMIT 1);
SET @create_users_perm_id = (SELECT id FROM permissions WHERE slug = 'create_users' LIMIT 1);
SET @edit_users_perm_id = (SELECT id FROM permissions WHERE slug = 'edit_users' LIMIT 1);
SET @delete_users_perm_id = (SELECT id FROM permissions WHERE slug = 'delete_users' LIMIT 1);
SET @view_products_perm_id = (SELECT id FROM permissions WHERE slug = 'view_products' LIMIT 1);
SET @create_products_perm_id = (SELECT id FROM permissions WHERE slug = 'create_products' LIMIT 1);
SET @edit_products_perm_id = (SELECT id FROM permissions WHERE slug = 'edit_products' LIMIT 1);
SET @delete_products_perm_id = (SELECT id FROM permissions WHERE slug = 'delete_products' LIMIT 1);
SET @view_sales_perm_id = (SELECT id FROM permissions WHERE slug = 'view_sales' LIMIT 1);
SET @view_reports_perm_id = (SELECT id FROM permissions WHERE slug = 'view_reports' LIMIT 1);
SET @view_settings_perm_id = (SELECT id FROM permissions WHERE slug = 'view_settings' LIMIT 1);
SET @edit_settings_perm_id = (SELECT id FROM permissions WHERE slug = 'edit_settings' LIMIT 1);

-- Asignar permisos al rol admin (si no se asignaron automáticamente)
INSERT IGNORE INTO `role_permission` (`role_id`, `permission_id`) VALUES
(@admin_role_id, @view_users_perm_id),
(@admin_role_id, @create_users_perm_id),
(@admin_role_id, @edit_users_perm_id),
(@admin_role_id, @delete_users_perm_id),
(@admin_role_id, @view_products_perm_id),
(@admin_role_id, @create_products_perm_id),
(@admin_role_id, @edit_products_perm_id),
(@admin_role_id, @delete_products_perm_id),
(@admin_role_id, @view_sales_perm_id),
(@admin_role_id, @view_reports_perm_id),
(@admin_role_id, @view_settings_perm_id),
(@admin_role_id, @edit_settings_perm_id);

-- Asignar permisos básicos al rol user
INSERT IGNORE INTO `role_permission` (`role_id`, `permission_id`) VALUES
(@user_role_id, @view_products_perm_id),
(@user_role_id, @view_sales_perm_id);

-- Asignar permisos al rol moderator
INSERT IGNORE INTO `role_permission` (`role_id`, `permission_id`) VALUES
(@moderator_role_id, @view_users_perm_id),
(@moderator_role_id, @view_products_perm_id),
(@moderator_role_id, @edit_products_perm_id),
(@moderator_role_id, @view_sales_perm_id),
(@moderator_role_id, @view_reports_perm_id);

-- ============================================
-- 9. LOGS DE AUDITORÍA INICIALES
-- ============================================

-- Registrar la creación del usuario admin
INSERT INTO `audit_logs` (
    `auditable_type`,
    `auditable_id`,
    `event`,
    `new_values`,
    `user_id`,
    `ip_address`,
    `created_at`
) VALUES (
    'User',
    @admin_id,
    'created',
    JSON_OBJECT(
        'name', 'Administrador',
        'email', 'admin@empresa.com',
        'role', 'admin'
    ),
    @admin_id,
    '127.0.0.1',
    NOW()
);

-- Registrar log del sistema
INSERT INTO `system_logs` (
    `log_level`,
    `channel`,
    `message`,
    `context`,
    `user_id`,
    `ip_address`,
    `created_at`
) VALUES (
    'info',
    'system',
    'Usuario administrador creado correctamente',
    JSON_OBJECT('email', 'admin@empresa.com', 'role', 'admin'),
    @admin_id,
    '127.0.0.1',
    NOW()
);

-- ============================================
-- 10. VERIFICACIÓN DE DATOS
-- ============================================

SELECT '=== USUARIOS CREADOS ===' as '';
SELECT 
    id,
    name,
    email,
    role,
    status,
    CASE WHEN email_verified_at IS NOT NULL THEN 'Verificado' ELSE 'No verificado' END as email_status,
    created_at
FROM users 
WHERE email IN ('admin@empresa.com', 'usuario@example.com', 'moderador@empresa.com');

SELECT '=== ROLES ASIGNADOS ===' as '';
SELECT 
    u.name,
    u.email,
    r.name as role_name,
    ur.assigned_at
FROM user_role ur
JOIN users u ON u.id = ur.user_id
JOIN roles r ON r.id = ur.role_id
WHERE u.email IN ('admin@empresa.com', 'usuario@example.com', 'moderador@empresa.com');

SELECT '=== PERMISOS ASIGNADOS AL ADMIN ===' as '';
SELECT 
    p.name,
    p.slug,
    p.group
FROM role_permission rp
JOIN permissions p ON p.id = rp.permission_id
WHERE rp.role_id = @admin_role_id
ORDER BY p.group, p.name;

SELECT '=== DIRECCIONES DEL ADMIN ===' as '';
SELECT 
    address_type,
    address_line1,
    city,
    zip_code,
    country,
    phone,
    CASE 
        WHEN is_default THEN 'Sí' 
        ELSE 'No' 
    END as is_default
FROM user_addresses
WHERE user_id = @admin_id;

-- ============================================
-- 11. MENSAJES FINALES
-- ============================================

SELECT '============================================' as '';
SELECT '✅ SEEDING DE USUARIO ADMIN COMPLETADO' as '';
SELECT '============================================' as '';
SELECT '📧 Email admin: admin@empresa.com' as '';
SELECT '🔑 Contraseña: Admin123!' as '';
SELECT '============================================' as '';
SELECT '⚠️  CAMBIA LA CONTRASEÑA EN EL PRIMER INICIO DE SESIÓN' as '';
SELECT '============================================' as '';

-- ============================================
-- 12. SCRIPT DE CAMBIO DE CONTRASEÑA (OPCIONAL)
-- ============================================

-- Si deseas cambiar la contraseña del admin después del seeding:
-- UPDATE users SET password = 'NUEVO_HASH' WHERE email = 'admin@empresa.com';

-- Para generar un nuevo hash de contraseña (ejecutar en PHP):
-- password_hash('tu_contraseña', PASSWORD_BCRYPT, ['cost' => 10]);

-- ============================================
-- FIN DEL SCRIPT DE SEEDING
-- ============================================