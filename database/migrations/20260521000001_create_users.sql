-- 20260521000001_create_users.sql
-- CoreX Database

-- ============================================
-- SCRIPT: 20260521000001_create_users.sql
-- DESCRIPCIÓN: Creación de tablas de usuarios y sistemas relacionados
-- FECHA: 2026-05-21
-- AUTOR: Sistema de Base de Datos
-- ============================================

-- ============================================
-- 1. TABLA DE USUARIOS PRINCIPAL
-- ============================================

CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (UUID()),
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
    `password` VARCHAR(255) NOT NULL,
    `remember_token` VARCHAR(100) NULL DEFAULT NULL,
    
    -- Información personal
    `phone` VARCHAR(20) NULL DEFAULT NULL,
    `phone_verified_at` TIMESTAMP NULL DEFAULT NULL,
    `avatar` VARCHAR(255) NULL DEFAULT NULL,
    `bio` TEXT NULL DEFAULT NULL,
    `birth_date` DATE NULL DEFAULT NULL,
    `gender` ENUM('male', 'female', 'other', 'prefer_not_to_say') NULL DEFAULT NULL,
    
    -- Dirección
    `address` TEXT NULL DEFAULT NULL,
    `city` VARCHAR(100) NULL DEFAULT NULL,
    `state` VARCHAR(100) NULL DEFAULT NULL,
    `zip_code` VARCHAR(20) NULL DEFAULT NULL,
    `country` VARCHAR(100) DEFAULT 'España',
    
    -- Documentos
    `dni` VARCHAR(20) NULL DEFAULT NULL,
    `dni_verified` BOOLEAN DEFAULT FALSE,
    `tax_id` VARCHAR(50) NULL DEFAULT NULL, -- NIF/CIF para empresas
    
    -- Roles y permisos
    `role` ENUM('admin', 'user', 'moderator', 'editor', 'viewer') DEFAULT 'user',
    `permissions` JSON NULL DEFAULT NULL,
    
    -- Estado del usuario
    `status` ENUM('active', 'inactive', 'suspended', 'blocked', 'pending') DEFAULT 'pending',
    `is_active` BOOLEAN DEFAULT TRUE,
    `is_banned` BOOLEAN DEFAULT FALSE,
    `ban_reason` TEXT NULL DEFAULT NULL,
    `banned_at` TIMESTAMP NULL DEFAULT NULL,
    `suspended_until` TIMESTAMP NULL DEFAULT NULL,
    
    -- Autenticación
    `two_factor_secret` TEXT NULL DEFAULT NULL,
    `two_factor_recovery_codes` TEXT NULL DEFAULT NULL,
    `two_factor_enabled` BOOLEAN DEFAULT FALSE,
    `last_login_at` TIMESTAMP NULL DEFAULT NULL,
    `last_login_ip` VARCHAR(45) NULL DEFAULT NULL,
    `login_attempts` INT DEFAULT 0,
    `locked_until` TIMESTAMP NULL DEFAULT NULL,
    
    -- Preferencias
    `preferences` JSON NULL DEFAULT NULL,
    `language` VARCHAR(10) DEFAULT 'es',
    `timezone` VARCHAR(50) DEFAULT 'Europe/Madrid',
    `theme` VARCHAR(20) DEFAULT 'light',
    `notifications` JSON NULL DEFAULT NULL,
    
    -- Marketing y comunicación
    `newsletter_subscribed` BOOLEAN DEFAULT FALSE,
    `marketing_emails` BOOLEAN DEFAULT FALSE,
    `sms_notifications` BOOLEAN DEFAULT FALSE,
    `whatsapp_notifications` BOOLEAN DEFAULT FALSE,
    
    -- Métricas
    `total_orders` INT DEFAULT 0,
    `total_spent` DECIMAL(10, 2) DEFAULT 0.00,
    `last_order_at` TIMESTAMP NULL DEFAULT NULL,
    `customer_lifetime_value` DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Metadatos
    `created_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `updated_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `deleted_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    -- Índices y claves
    PRIMARY KEY (`id`),
    UNIQUE KEY `users_email_unique` (`email`),
    UNIQUE KEY `users_uuid_unique` (`uuid`),
    UNIQUE KEY `users_dni_unique` (`dni`),
    UNIQUE KEY `users_tax_id_unique` (`tax_id`),
    KEY `users_role_index` (`role`),
    KEY `users_status_index` (`status`),
    KEY `users_is_active_index` (`is_active`),
    KEY `users_email_verified_at_index` (`email_verified_at`),
    KEY `users_created_at_index` (`created_at`),
    KEY `users_deleted_at_index` (`deleted_at`),
    KEY `users_phone_index` (`phone`),
    KEY `users_last_login_at_index` (`last_login_at`),
    KEY `users_created_by_foreign` (`created_by`),
    KEY `users_updated_by_foreign` (`updated_by`),
    KEY `users_deleted_by_foreign` (`deleted_by`),
    
    -- Restricciones
    CONSTRAINT `users_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `users_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `users_deleted_by_foreign` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. TABLA DE DIRECCIONES DE USUARIO
-- ============================================

CREATE TABLE IF NOT EXISTS `user_addresses` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `address_type` ENUM('shipping', 'billing', 'both') DEFAULT 'both',
    `address_line1` VARCHAR(255) NOT NULL,
    `address_line2` VARCHAR(255) NULL DEFAULT NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` VARCHAR(100) NULL DEFAULT NULL,
    `zip_code` VARCHAR(20) NOT NULL,
    `country` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NULL DEFAULT NULL,
    `recipient_name` VARCHAR(100) NULL DEFAULT NULL,
    `is_default` BOOLEAN DEFAULT FALSE,
    `is_billing_default` BOOLEAN DEFAULT FALSE,
    `is_shipping_default` BOOLEAN DEFAULT FALSE,
    `latitude` DECIMAL(10, 8) NULL DEFAULT NULL,
    `longitude` DECIMAL(11, 8) NULL DEFAULT NULL,
    `notes` TEXT NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    KEY `user_addresses_user_id_index` (`user_id`),
    KEY `user_addresses_is_default_index` (`is_default`),
    KEY `user_addresses_deleted_at_index` (`deleted_at`),
    
    CONSTRAINT `user_addresses_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. TABLA DE SESIONES DE USUARIO
-- ============================================

CREATE TABLE IF NOT EXISTS `user_sessions` (
    `id` VARCHAR(255) NOT NULL,
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    `user_agent` TEXT NULL DEFAULT NULL,
    `payload` LONGTEXT NOT NULL,
    `last_activity` INT NOT NULL,
    `device` VARCHAR(100) NULL DEFAULT NULL,
    `browser` VARCHAR(100) NULL DEFAULT NULL,
    `platform` VARCHAR(100) NULL DEFAULT NULL,
    `is_current` BOOLEAN DEFAULT FALSE,
    `expires_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    KEY `user_sessions_user_id_index` (`user_id`),
    KEY `user_sessions_last_activity_index` (`last_activity`),
    KEY `user_sessions_is_current_index` (`is_current`),
    
    CONSTRAINT `user_sessions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. TABLA DE HISTORIAL DE LOGIN
-- ============================================

CREATE TABLE IF NOT EXISTS `user_login_history` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `ip_address` VARCHAR(45) NOT NULL,
    `user_agent` TEXT NULL DEFAULT NULL,
    `location` VARCHAR(255) NULL DEFAULT NULL,
    `device` VARCHAR(100) NULL DEFAULT NULL,
    `browser` VARCHAR(100) NULL DEFAULT NULL,
    `platform` VARCHAR(100) NULL DEFAULT NULL,
    `login_type` ENUM('email', 'google', 'facebook', 'github', '2fa') DEFAULT 'email',
    `success` BOOLEAN DEFAULT TRUE,
    `failure_reason` VARCHAR(255) NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    KEY `user_login_history_user_id_index` (`user_id`),
    KEY `user_login_history_created_at_index` (`created_at`),
    KEY `user_login_history_success_index` (`success`),
    
    CONSTRAINT `user_login_history_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. TABLA DE TOKENS DE RESETEO DE CONTRASEÑA
-- ============================================

CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
    `email` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    `user_agent` TEXT NULL DEFAULT NULL,
    `used` BOOLEAN DEFAULT FALSE,
    `used_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expires_at` TIMESTAMP NOT NULL,
    
    PRIMARY KEY (`email`),
    KEY `password_reset_tokens_token_index` (`token`),
    KEY `password_reset_tokens_expires_at_index` (`expires_at`),
    KEY `password_reset_tokens_used_index` (`used`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. TABLA DE VERIFICACIÓN DE EMAIL
-- ============================================

CREATE TABLE IF NOT EXISTS `email_verification_tokens` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    `user_agent` TEXT NULL DEFAULT NULL,
    `used` BOOLEAN DEFAULT FALSE,
    `used_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expires_at` TIMESTAMP NOT NULL,
    
    PRIMARY KEY (`id`),
    KEY `email_verification_tokens_user_id_index` (`user_id`),
    KEY `email_verification_tokens_token_index` (`token`),
    KEY `email_verification_tokens_expires_at_index` (`expires_at`),
    
    CONSTRAINT `email_verification_tokens_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. TABLA DE NOTIFICACIONES
-- ============================================

CREATE TABLE IF NOT EXISTS `notifications` (
    `id` CHAR(36) NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `notifiable_type` VARCHAR(255) NOT NULL,
    `notifiable_id` BIGINT UNSIGNED NOT NULL,
    `data` TEXT NOT NULL,
    `read_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`, `notifiable_id`),
    KEY `notifications_read_at_index` (`read_at`),
    KEY `notifications_created_at_index` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. TABLA DE ACTIVIDAD DE USUARIO
-- ============================================

CREATE TABLE IF NOT EXISTS `user_activities` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(100) NULL DEFAULT NULL,
    `entity_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `old_data` JSON NULL DEFAULT NULL,
    `new_data` JSON NULL DEFAULT NULL,
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    `user_agent` TEXT NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    KEY `user_activities_user_id_index` (`user_id`),
    KEY `user_activities_action_index` (`action`),
    KEY `user_activities_entity_type_entity_id_index` (`entity_type`, `entity_id`),
    KEY `user_activities_created_at_index` (`created_at`),
    
    CONSTRAINT `user_activities_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. TABLA DE PERMISOS
-- ============================================

CREATE TABLE IF NOT EXISTS `permissions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT NULL DEFAULT NULL,
    `group` VARCHAR(100) NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `permissions_slug_unique` (`slug`),
    KEY `permissions_group_index` (`group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. TABLA DE ROLES
-- ============================================

CREATE TABLE IF NOT EXISTS `roles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT NULL DEFAULT NULL,
    `level` INT DEFAULT 0,
    `is_default` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `roles_slug_unique` (`slug`),
    KEY `roles_level_index` (`level`),
    KEY `roles_is_default_index` (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. TABLA DE RELACIÓN ROL-PERMISO
-- ============================================

CREATE TABLE IF NOT EXISTS `role_permission` (
    `role_id` BIGINT UNSIGNED NOT NULL,
    `permission_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`role_id`, `permission_id`),
    KEY `role_permission_permission_id_foreign` (`permission_id`),
    
    CONSTRAINT `role_permission_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `role_permission_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 12. TABLA DE RELACIÓN USUARIO-ROL
-- ============================================

CREATE TABLE IF NOT EXISTS `user_role` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `role_id` BIGINT UNSIGNED NOT NULL,
    `assigned_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `assigned_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`user_id`, `role_id`),
    KEY `user_role_role_id_foreign` (`role_id`),
    KEY `user_role_assigned_by_foreign` (`assigned_by`),
    
    CONSTRAINT `user_role_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `user_role_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `user_role_assigned_by_foreign` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 13. TABLA DE PREFERENCIAS DE USUARIO
-- ============================================

CREATE TABLE IF NOT EXISTS `user_preferences` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `preference_key` VARCHAR(100) NOT NULL,
    `preference_value` TEXT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `user_preferences_user_id_preference_key_unique` (`user_id`, `preference_key`),
    
    CONSTRAINT `user_preferences_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 14. TABLA DE AUTENTICACIÓN SOCIAL
-- ============================================

CREATE TABLE IF NOT EXISTS `social_accounts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `provider` VARCHAR(50) NOT NULL,
    `provider_id` VARCHAR(255) NOT NULL,
    `provider_token` TEXT NULL DEFAULT NULL,
    `provider_refresh_token` TEXT NULL DEFAULT NULL,
    `avatar` VARCHAR(255) NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `social_accounts_provider_provider_id_unique` (`provider`, `provider_id`),
    KEY `social_accounts_user_id_index` (`user_id`),
    
    CONSTRAINT `social_accounts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERCIÓN DE DATOS INICIALES
-- ============================================

-- Insertar roles básicos
INSERT INTO `roles` (`name`, `slug`, `description`, `level`, `is_default`) VALUES
('Administrador', 'admin', 'Acceso completo al sistema', 100, FALSE),
('Usuario', 'user', 'Usuario estándar', 10, TRUE),
('Moderador', 'moderator', 'Puede moderar contenido', 50, FALSE),
('Editor', 'editor', 'Puede editar contenido', 30, FALSE),
('Visitante', 'viewer', 'Solo lectura', 5, FALSE);

-- Insertar permisos básicos
INSERT INTO `permissions` (`name`, `slug`, `description`, `group`) VALUES
-- Usuarios
('Ver usuarios', 'view_users', 'Permite ver la lista de usuarios', 'users'),
('Crear usuarios', 'create_users', 'Permite crear nuevos usuarios', 'users'),
('Editar usuarios', 'edit_users', 'Permite editar usuarios existentes', 'users'),
('Eliminar usuarios', 'delete_users', 'Permite eliminar usuarios', 'users'),
-- Productos
('Ver productos', 'view_products', 'Permite ver productos', 'products'),
('Crear productos', 'create_products', 'Permite crear productos', 'products'),
('Editar productos', 'edit_products', 'Permite editar productos', 'products'),
('Eliminar productos', 'delete_products', 'Permite eliminar productos', 'products'),
-- Ventas
('Ver ventas', 'view_sales', 'Permite ver ventas', 'sales'),
('Procesar ventas', 'process_sales', 'Permite procesar ventas', 'sales'),
('Reembolsar ventas', 'refund_sales', 'Permite reembolsar ventas', 'sales'),
-- Reportes
('Ver reportes', 'view_reports', 'Permite ver reportes', 'reports'),
('Exportar reportes', 'export_reports', 'Permite exportar reportes', 'reports'),
-- Configuración
('Ver configuración', 'view_settings', 'Permite ver configuración', 'settings'),
('Editar configuración', 'edit_settings', 'Permite editar configuración', 'settings');

-- Asignar permisos al rol de administrador
INSERT INTO `role_permission` (`role_id`, `permission_id`)
SELECT r.id, p.id
FROM `roles` r
CROSS JOIN `permissions` p
WHERE r.slug = 'admin';

-- Asignar permisos básicos al rol de usuario
INSERT INTO `role_permission` (`role_id`, `permission_id`)
SELECT r.id, p.id
FROM `roles` r
CROSS JOIN `permissions` p
WHERE r.slug = 'user' AND p.slug IN ('view_products', 'view_sales');

-- ============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

-- Índices compuestos para búsquedas frecuentes
CREATE INDEX idx_users_email_status ON `users`(`email`, `status`);
CREATE INDEX idx_users_role_status ON `users`(`role`, `status`);
CREATE INDEX idx_users_created_status ON `users`(`created_at`, `status`);
CREATE INDEX idx_users_last_login ON `users`(`last_login_at`);

-- Índices para la tabla de sesiones
CREATE INDEX idx_sessions_user_activity ON `user_sessions`(`user_id`, `last_activity`);
CREATE INDEX idx_sessions_activity ON `user_sessions`(`last_activity`);

-- Índices para historial de login
CREATE INDEX idx_login_history_user_date ON `user_login_history`(`user_id`, `created_at`);
CREATE INDEX idx_login_history_ip ON `user_login_history`(`ip_address`);

-- ============================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- ============================================

-- Trigger para actualizar total_orders del usuario
DELIMITER $$
CREATE TRIGGER update_user_total_orders
AFTER INSERT ON `orders`
FOR EACH ROW
BEGIN
    UPDATE `users` 
    SET `total_orders` = (
        SELECT COUNT(*) FROM `orders` WHERE `user_id` = NEW.user_id
    )
    WHERE `id` = NEW.user_id;
END$$
DELIMITER ;

-- Trigger para actualizar total_spent del usuario
DELIMITER $$
CREATE TRIGGER update_user_total_spent
AFTER INSERT ON `orders`
FOR EACH ROW
BEGIN
    UPDATE `users` 
    SET `total_spent` = (
        SELECT COALESCE(SUM(`total`), 0) FROM `orders` 
        WHERE `user_id` = NEW.user_id AND `status` = 'completed'
    )
    WHERE `id` = NEW.user_id;
END$$
DELIMITER ;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de usuarios activos
CREATE OR REPLACE VIEW `active_users` AS
SELECT 
    `id`,
    `name`,
    `email`,
    `role`,
    `last_login_at`,
    `total_orders`,
    `total_spent`,
    `created_at`
FROM `users`
WHERE `status` = 'active' 
    AND `is_active` = 1 
    AND `is_banned` = 0
    AND `deleted_at` IS NULL;

-- Vista de estadísticas de usuarios
CREATE OR REPLACE VIEW `user_statistics` AS
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN `status` = 'active' THEN 1 ELSE 0 END) as active_users,
    SUM(CASE WHEN `status` = 'inactive' THEN 1 ELSE 0 END) as inactive_users,
    SUM(CASE WHEN `status` = 'suspended' THEN 1 ELSE 0 END) as suspended_users,
    SUM(CASE WHEN `email_verified_at` IS NOT NULL THEN 1 ELSE 0 END) as verified_users,
    SUM(CASE WHEN `role` = 'admin' THEN 1 ELSE 0 END) as admin_users,
    SUM(CASE WHEN `role` = 'user' THEN 1 ELSE 0 END) as regular_users,
    SUM(CASE WHEN DATE(`created_at`) = CURDATE() THEN 1 ELSE 0 END) as new_today,
    SUM(CASE WHEN DATE(`created_at`) = CURDATE() - INTERVAL 1 DAY THEN 1 ELSE 0 END) as new_yesterday,
    SUM(CASE WHEN `last_login_at` >= NOW() - INTERVAL 24 HOUR THEN 1 ELSE 0 END) as active_24h,
    SUM(CASE WHEN `last_login_at` >= NOW() - INTERVAL 7 DAY THEN 1 ELSE 0 END) as active_7d,
    SUM(CASE WHEN `last_login_at` >= NOW() - INTERVAL 30 DAY THEN 1 ELSE 0 END) as active_30d
FROM `users`
WHERE `deleted_at` IS NULL;

-- ============================================
-- COMENTARIOS DE TABLAS Y COLUMNAS
-- ============================================

ALTER TABLE `users` COMMENT = 'Tabla principal de usuarios del sistema';
ALTER TABLE `user_addresses` COMMENT = 'Direcciones de envío y facturación de usuarios';
ALTER TABLE `user_sessions` COMMENT = 'Sesiones activas de usuarios';
ALTER TABLE `user_login_history` COMMENT = 'Historial de inicios de sesión';
ALTER TABLE `password_reset_tokens` COMMENT = 'Tokens para recuperación de contraseña';
ALTER TABLE `email_verification_tokens` COMMENT = 'Tokens para verificación de email';
ALTER TABLE `user_activities` COMMENT = 'Registro de actividades de usuarios';
ALTER TABLE `social_accounts` COMMENT = 'Cuentas de autenticación social vinculadas';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================