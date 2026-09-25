-- 20260521000006_create_logs.sql
-- CoreX Database

-- ============================================
-- SCRIPT: 20260521000006_create_logs.sql
-- DESCRIPCIÓN: Creación de tablas de logs, auditoría y actividades
-- FECHA: 2026-05-21
-- AUTOR: Sistema de Base de Datos
-- ============================================

-- ============================================
-- 1. TABLA DE LOGS DEL SISTEMA
-- ============================================

CREATE TABLE IF NOT EXISTS `system_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (UUID()),
    `log_level` ENUM('debug', 'info', 'warning', 'error', 'critical') NOT NULL DEFAULT 'info',
    `channel` VARCHAR(100) NOT NULL DEFAULT 'app',
    `message` TEXT NOT NULL,
    `context` JSON NULL DEFAULT NULL,
    
    -- Información de origen
    `source_file` VARCHAR(500) NULL DEFAULT NULL,
    `source_line` INT NULL DEFAULT NULL,
    `source_class` VARCHAR(255) NULL DEFAULT NULL,
    `source_method` VARCHAR(255) NULL DEFAULT NULL,
    
    -- Información de usuario
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `user_email` VARCHAR(255) NULL DEFAULT NULL,
    `user_role` VARCHAR(100) NULL DEFAULT NULL,
    
    -- Información de solicitud
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    `user_agent` TEXT NULL DEFAULT NULL,
    `request_url` VARCHAR(500) NULL DEFAULT NULL,
    `request_method` VARCHAR(10) NULL DEFAULT NULL,
    `request_data` JSON NULL DEFAULT NULL,
    `response_status` INT NULL DEFAULT NULL,
    `execution_time` INT NULL DEFAULT NULL, -- tiempo en milisegundos
    
    -- Metadatos
    `session_id` VARCHAR(255) NULL DEFAULT NULL,
    `request_id` VARCHAR(255) NULL DEFAULT NULL,
    `trace_id` VARCHAR(255) NULL DEFAULT NULL,
    `span_id` VARCHAR(255) NULL DEFAULT NULL,
    
    -- Fechas
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    -- Índices y claves
    PRIMARY KEY (`id`),
    UNIQUE KEY `system_logs_uuid_unique` (`uuid`),
    KEY `system_logs_log_level_index` (`log_level`),
    KEY `system_logs_channel_index` (`channel`),
    KEY `system_logs_user_id_index` (`user_id`),
    KEY `system_logs_created_at_index` (`created_at`),
    KEY `system_logs_request_id_index` (`request_id`),
    KEY `system_logs_trace_id_index` (`trace_id`),
    KEY `system_logs_deleted_at_index` (`deleted_at`),
    KEY `system_logs_ip_address_index` (`ip_address`),
    
    CONSTRAINT `system_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. TABLA DE LOGS DE ACTIVIDAD DE USUARIOS
-- ============================================

CREATE TABLE IF NOT EXISTS `activity_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (UUID()),
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `user_email` VARCHAR(255) NULL DEFAULT NULL,
    `user_name` VARCHAR(255) NULL DEFAULT NULL,
    
    -- Acción realizada
    `action` VARCHAR(100) NOT NULL,
    `action_type` ENUM('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import', 'other') NOT NULL,
    `description` TEXT NULL DEFAULT NULL,
    
    -- Entidad afectada
    `entity_type` VARCHAR(100) NULL DEFAULT NULL,
    `entity_id` VARCHAR(255) NULL DEFAULT NULL,
    `old_values` JSON NULL DEFAULT NULL,
    `new_values` JSON NULL DEFAULT NULL,
    
    -- Información de la solicitud
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    `user_agent` TEXT NULL DEFAULT NULL,
    `request_url` VARCHAR(500) NULL DEFAULT NULL,
    `request_method` VARCHAR(10) NULL DEFAULT NULL,
    `request_data` JSON NULL DEFAULT NULL,
    
    -- Metadatos
    `session_id` VARCHAR(255) NULL DEFAULT NULL,
    `device_type` VARCHAR(50) NULL DEFAULT NULL,
    `browser` VARCHAR(100) NULL DEFAULT NULL,
    `platform` VARCHAR(100) NULL DEFAULT NULL,
    
    -- Fechas
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    -- Índices y claves
    PRIMARY KEY (`id`),
    UNIQUE KEY `activity_logs_uuid_unique` (`uuid`),
    KEY `activity_logs_user_id_index` (`user_id`),
    KEY `activity_logs_action_index` (`action`),
    KEY `activity_logs_action_type_index` (`action_type`),
    KEY `activity_logs_entity_type_entity_id_index` (`entity_type`, `entity_id`),
    KEY `activity_logs_created_at_index` (`created_at`),
    KEY `activity_logs_ip_address_index` (`ip_address`),
    KEY `activity_logs_deleted_at_index` (`deleted_at`),
    
    CONSTRAINT `activity_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. TABLA DE AUDITORÍA DE DATOS
-- ============================================

CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (UUID()),
    `auditable_type` VARCHAR(255) NOT NULL,
    `auditable_id` BIGINT UNSIGNED NOT NULL,
    `event` ENUM('created', 'updated', 'deleted', 'restored', 'force_deleted') NOT NULL,
    
    -- Valores
    `old_values` JSON NULL DEFAULT NULL,
    `new_values` JSON NULL DEFAULT NULL,
    
    -- Información del usuario
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `user_email` VARCHAR(255) NULL DEFAULT NULL,
    `user_role` VARCHAR(100) NULL DEFAULT NULL,
    
    -- Información de la solicitud
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    `user_agent` TEXT NULL DEFAULT NULL,
    `url` VARCHAR(500) NULL DEFAULT NULL,
    
    -- Metadatos
    `tags` JSON NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices y claves
    PRIMARY KEY (`id`),
    UNIQUE KEY `audit_logs_uuid_unique` (`uuid`),
    KEY `audit_logs_auditable_type_auditable_id_index` (`auditable_type`, `auditable_id`),
    KEY `audit_logs_event_index` (`event`),
    KEY `audit_logs_user_id_index` (`user_id`),
    KEY `audit_logs_created_at_index` (`created_at`),
    
    CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. TABLA DE LOGS DE ERRORES
-- ============================================

CREATE TABLE IF NOT EXISTS `error_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (UUID()),
    `error_code` VARCHAR(100) NULL DEFAULT NULL,
    `error_type` VARCHAR(255) NOT NULL,
    `error_message` TEXT NOT NULL,
    `stack_trace` LONGTEXT NULL DEFAULT NULL,
    
    -- Información adicional
    `file` VARCHAR(500) NULL DEFAULT NULL,
    `line` INT NULL DEFAULT NULL,
    `class` VARCHAR(255) NULL DEFAULT NULL,
    `method` VARCHAR(255) NULL DEFAULT NULL,
    
    -- Contexto
    `context` JSON NULL DEFAULT NULL,
    `previous_error` JSON NULL DEFAULT NULL,
    
    -- Información de usuario
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `user_email` VARCHAR(255) NULL DEFAULT NULL,
    
    -- Información de solicitud
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    `user_agent` TEXT NULL DEFAULT NULL,
    `request_url` VARCHAR(500) NULL DEFAULT NULL,
    `request_method` VARCHAR(10) NULL DEFAULT NULL,
    `request_data` JSON NULL DEFAULT NULL,
    `headers` JSON NULL DEFAULT NULL,
    
    -- Metadatos
    `session_id` VARCHAR(255) NULL DEFAULT NULL,
    `request_id` VARCHAR(255) NULL DEFAULT NULL,
    `trace_id` VARCHAR(255) NULL DEFAULT NULL,
    `resolved` BOOLEAN DEFAULT FALSE,
    `resolved_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `resolved_at` TIMESTAMP NULL DEFAULT NULL,
    `resolution_notes` TEXT NULL DEFAULT NULL,
    
    -- Fechas
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    -- Índices y claves
    PRIMARY KEY (`id`),
    UNIQUE KEY `error_logs_uuid_unique` (`uuid`),
    KEY `error_logs_error_type_index` (`error_type`),
    KEY `error_logs_error_code_index` (`error_code`),
    KEY `error_logs_user_id_index` (`user_id`),
    KEY `error_logs_created_at_index` (`created_at`),
    KEY `error_logs_resolved_index` (`resolved`),
    KEY `error_logs_request_id_index` (`request_id`),
    KEY `error_logs_trace_id_index` (`trace_id`),
    KEY `error_logs_deleted_at_index` (`deleted_at`),
    KEY `error_logs_resolved_by_foreign` (`resolved_by`),
    
    CONSTRAINT `error_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `error_logs_resolved_by_foreign` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. TABLA DE LOGS DE ACCESO
-- ============================================

CREATE TABLE IF NOT EXISTS `access_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (UUID()),
    
    -- Información de usuario
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `user_email` VARCHAR(255) NULL DEFAULT NULL,
    `user_role` VARCHAR(100) NULL DEFAULT NULL,
    
    -- Tipo de acceso
    `access_type` ENUM('login', 'logout', 'failed_login', 'password_reset', 'email_verification', 'api_access') NOT NULL,
    `success` BOOLEAN DEFAULT TRUE,
    `failure_reason` VARCHAR(255) NULL DEFAULT NULL,
    
    -- Información de autenticación
    `auth_method` VARCHAR(50) DEFAULT 'password',
    `provider` VARCHAR(50) NULL DEFAULT NULL, -- google, facebook, etc.
    `mfa_used` BOOLEAN DEFAULT FALSE,
    `mfa_method` VARCHAR(50) NULL DEFAULT NULL,
    
    -- Información de solicitud
    `ip_address` VARCHAR(45) NOT NULL,
    `user_agent` TEXT NULL DEFAULT NULL,
    `location` VARCHAR(255) NULL DEFAULT NULL,
    `city` VARCHAR(100) NULL DEFAULT NULL,
    `country` VARCHAR(100) NULL DEFAULT NULL,
    `latitude` DECIMAL(10, 8) NULL DEFAULT NULL,
    `longitude` DECIMAL(11, 8) NULL DEFAULT NULL,
    
    -- Metadatos
    `device_type` VARCHAR(50) NULL DEFAULT NULL,
    `browser` VARCHAR(100) NULL DEFAULT NULL,
    `platform` VARCHAR(100) NULL DEFAULT NULL,
    `session_id` VARCHAR(255) NULL DEFAULT NULL,
    
    -- Fechas
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    -- Índices y claves
    PRIMARY KEY (`id`),
    UNIQUE KEY `access_logs_uuid_unique` (`uuid`),
    KEY `access_logs_user_id_index` (`user_id`),
    KEY `access_logs_access_type_index` (`access_type`),
    KEY `access_logs_success_index` (`success`),
    KEY `access_logs_ip_address_index` (`ip_address`),
    KEY `access_logs_created_at_index` (`created_at`),
    KEY `access_logs_deleted_at_index` (`deleted_at`),
    
    CONSTRAINT `access_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. TABLA DE LOGS DE APIs
-- ============================================

CREATE TABLE IF NOT EXISTS `api_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (UUID()),
    
    -- Información de la API
    `api_key_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `api_key_name` VARCHAR(255) NULL DEFAULT NULL,
    `endpoint` VARCHAR(500) NOT NULL,
    `method` VARCHAR(10) NOT NULL,
    
    -- Solicitud
    `request_headers` JSON NULL DEFAULT NULL,
    `request_body` LONGTEXT NULL DEFAULT NULL,
    `request_size` INT NULL DEFAULT NULL,
    
    -- Respuesta
    `response_status` INT NOT NULL,
    `response_headers` JSON NULL DEFAULT NULL,
    `response_body` LONGTEXT NULL DEFAULT NULL,
    `response_size` INT NULL DEFAULT NULL,
    `response_time` INT NULL DEFAULT NULL, -- milisegundos
    
    -- Información de usuario
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `user_email` VARCHAR(255) NULL DEFAULT NULL,
    
    -- Información de solicitud
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    `user_agent` TEXT NULL DEFAULT NULL,
    
    -- Metadatos
    `request_id` VARCHAR(255) NULL DEFAULT NULL,
    `rate_limit_remaining` INT NULL DEFAULT NULL,
    `rate_limit_reset` TIMESTAMP NULL DEFAULT NULL,
    
    -- Fechas
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    -- Índices y claves
    PRIMARY KEY (`id`),
    UNIQUE KEY `api_logs_uuid_unique` (`uuid`),
    KEY `api_logs_api_key_id_index` (`api_key_id`),
    KEY `api_logs_endpoint_index` (`endpoint`(191)),
    KEY `api_logs_method_index` (`method`),
    KEY `api_logs_response_status_index` (`response_status`),
    KEY `api_logs_user_id_index` (`user_id`),
    KEY `api_logs_ip_address_index` (`ip_address`),
    KEY `api_logs_created_at_index` (`created_at`),
    KEY `api_logs_request_id_index` (`request_id`),
    KEY `api_logs_deleted_at_index` (`deleted_at`),
    
    CONSTRAINT `api_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. TABLA DE LOGS DE CONSOLA (JOBS, COMMANDS)
-- ============================================

CREATE TABLE IF NOT EXISTS `console_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (UUID()),
    
    -- Tipo de comando/job
    `type` ENUM('command', 'job', 'queue', 'schedule') NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `status` ENUM('started', 'processing', 'completed', 'failed', 'cancelled') NOT NULL,
    
    -- Argumentos y opciones
    `arguments` JSON NULL DEFAULT NULL,
    `options` JSON NULL DEFAULT NULL,
    
    -- Salida y errores
    `output` LONGTEXT NULL DEFAULT NULL,
    `error_output` LONGTEXT NULL DEFAULT NULL,
    `error_message` TEXT NULL DEFAULT NULL,
    
    -- Métricas
    `memory_usage` INT NULL DEFAULT NULL, -- MB
    `cpu_usage` DECIMAL(5, 2) NULL DEFAULT NULL, -- %
    `execution_time` INT NULL DEFAULT NULL, -- segundos
    
    -- Información del ejecutor
    `executed_by` VARCHAR(255) NULL DEFAULT NULL,
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    
    -- Fechas
    `started_at` TIMESTAMP NULL DEFAULT NULL,
    `completed_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    -- Índices y claves
    PRIMARY KEY (`id`),
    UNIQUE KEY `console_logs_uuid_unique` (`uuid`),
    KEY `console_logs_type_index` (`type`),
    KEY `console_logs_name_index` (`name`),
    KEY `console_logs_status_index` (`status`),
    KEY `console_logs_started_at_index` (`started_at`),
    KEY `console_logs_completed_at_index` (`completed_at`),
    KEY `console_logs_created_at_index` (`created_at`),
    KEY `console_logs_deleted_at_index` (`deleted_at`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. TABLA DE LOGS DE BASE DE DATOS
-- ============================================

CREATE TABLE IF NOT EXISTS `database_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (UUID()),
    
    -- Tipo de consulta
    `query_type` ENUM('select', 'insert', 'update', 'delete', 'ddl', 'other') NOT NULL,
    `query` LONGTEXT NOT NULL,
    `query_hash` VARCHAR(64) NULL DEFAULT NULL,
    
    -- Métricas
    `execution_time` DECIMAL(10, 2) NULL DEFAULT NULL, -- milisegundos
    `rows_affected` INT NULL DEFAULT NULL,
    `rows_returned` INT NULL DEFAULT NULL,
    
    -- Información de conexión
    `connection_name` VARCHAR(100) NULL DEFAULT NULL,
    `database_name` VARCHAR(100) NULL DEFAULT NULL,
    
    -- Contexto
    `caller_file` VARCHAR(500) NULL DEFAULT NULL,
    `caller_line` INT NULL DEFAULT NULL,
    `caller_method` VARCHAR(255) NULL DEFAULT NULL,
    
    -- Información de usuario
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `user_email` VARCHAR(255) NULL DEFAULT NULL,
    
    -- Información de solicitud
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    `request_id` VARCHAR(255) NULL DEFAULT NULL,
    
    -- Metadatos
    `slow_query` BOOLEAN DEFAULT FALSE,
    `explain_result` JSON NULL DEFAULT NULL,
    
    -- Fechas
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    -- Índices y claves
    PRIMARY KEY (`id`),
    UNIQUE KEY `database_logs_uuid_unique` (`uuid`),
    KEY `database_logs_query_type_index` (`query_type`),
    KEY `database_logs_query_hash_index` (`query_hash`),
    KEY `database_logs_slow_query_index` (`slow_query`),
    KEY `database_logs_execution_time_index` (`execution_time`),
    KEY `database_logs_user_id_index` (`user_id`),
    KEY `database_logs_created_at_index` (`created_at`),
    KEY `database_logs_deleted_at_index` (`deleted_at`),
    KEY `database_logs_request_id_index` (`request_id`),
    
    CONSTRAINT `database_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. TABLA DE LOGS DE SEGURIDAD
-- ============================================

CREATE TABLE IF NOT EXISTS `security_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (UUID()),
    
    -- Tipo de evento de seguridad
    `event_type` ENUM(
        'brute_force', 'suspicious_activity', 'unauthorized_access', 
        'permission_change', 'role_change', 'data_export', 
        'backup_created', 'backup_restored', 'config_change',
        'user_impersonation', 'api_abuse', 'ddos_attempt'
    ) NOT NULL,
    
    -- Severidad
    `severity` ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    
    -- Descripción
    `description` TEXT NOT NULL,
    `details` JSON NULL DEFAULT NULL,
    
    -- Información de origen
    `ip_address` VARCHAR(45) NOT NULL,
    `user_agent` TEXT NULL DEFAULT NULL,
    `location` VARCHAR(255) NULL DEFAULT NULL,
    
    -- Información de usuario
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `user_email` VARCHAR(255) NULL DEFAULT NULL,
    `affected_user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    
    -- Estado del incidente
    `status` ENUM('open', 'investigating', 'resolved', 'false_positive') DEFAULT 'open',
    `resolved_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `resolved_at` TIMESTAMP NULL DEFAULT NULL,
    `resolution_notes` TEXT NULL DEFAULT NULL,
    
    -- Metadatos
    `notified` BOOLEAN DEFAULT FALSE,
    `notified_at` TIMESTAMP NULL DEFAULT NULL,
    
    -- Fechas
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    -- Índices y claves
    PRIMARY KEY (`id`),
    UNIQUE KEY `security_logs_uuid_unique` (`uuid`),
    KEY `security_logs_event_type_index` (`event_type`),
    KEY `security_logs_severity_index` (`severity`),
    KEY `security_logs_status_index` (`status`),
    KEY `security_logs_user_id_index` (`user_id`),
    KEY `security_logs_affected_user_id_index` (`affected_user_id`),
    KEY `security_logs_ip_address_index` (`ip_address`),
    KEY `security_logs_created_at_index` (`created_at`),
    KEY `security_logs_deleted_at_index` (`deleted_at`),
    KEY `security_logs_resolved_by_foreign` (`resolved_by`),
    
    CONSTRAINT `security_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `security_logs_affected_user_id_foreign` FOREIGN KEY (`affected_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `security_logs_resolved_by_foreign` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. TABLA DE LOGS DE RENDIMIENTO
-- ============================================

CREATE TABLE IF NOT EXISTS `performance_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (UUID()),
    
    -- Métricas de rendimiento
    `metric_name` VARCHAR(255) NOT NULL,
    `metric_value` DECIMAL(15, 4) NOT NULL,
    `metric_unit` VARCHAR(50) DEFAULT 'ms',
    
    -- Etiquetas para agrupación
    `tags` JSON NULL DEFAULT NULL,
    
    -- Información de contexto
    `endpoint` VARCHAR(500) NULL DEFAULT NULL,
    `method` VARCHAR(10) NULL DEFAULT NULL,
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    
    -- Límites y umbrales
    `warning_threshold` DECIMAL(15, 4) NULL DEFAULT NULL,
    `critical_threshold` DECIMAL(15, 4) NULL DEFAULT NULL,
    `exceeded_warning` BOOLEAN DEFAULT FALSE,
    `exceeded_critical` BOOLEAN DEFAULT FALSE,
    
    -- Información adicional
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    `request_id` VARCHAR(255) NULL DEFAULT NULL,
    
    -- Fechas
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    -- Índices y claves
    PRIMARY KEY (`id`),
    UNIQUE KEY `performance_logs_uuid_unique` (`uuid`),
    KEY `performance_logs_metric_name_index` (`metric_name`),
    KEY `performance_logs_created_at_index` (`created_at`),
    KEY `performance_logs_exceeded_warning_index` (`exceeded_warning`),
    KEY `performance_logs_exceeded_critical_index` (`exceeded_critical`),
    KEY `performance_logs_user_id_index` (`user_id`),
    KEY `performance_logs_request_id_index` (`request_id`),
    KEY `performance_logs_deleted_at_index` (`deleted_at`),
    
    CONSTRAINT `performance_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRIGGERS PARA LOGS AUTOMÁTICOS
-- ============================================

-- Trigger para loguear cambios en usuarios
DELIMITER $$
CREATE TRIGGER audit_users_changes
AFTER UPDATE ON `users`
FOR EACH ROW
BEGIN
    IF OLD.updated_at != NEW.updated_at THEN
        INSERT INTO `audit_logs` (
            `auditable_type`, `auditable_id`, `event`, 
            `old_values`, `new_values`, `user_id`, `ip_address`
        ) VALUES (
            'User', NEW.id, 'updated',
            JSON_OBJECT(
                'email', OLD.email,
                'name', OLD.name,
                'role', OLD.role,
                'status', OLD.status
            ),
            JSON_OBJECT(
                'email', NEW.email,
                'name', NEW.name,
                'role', NEW.role,
                'status', NEW.status
            ),
            NEW.updated_by,
            @ip_address
        );
    END IF;
END$$
DELIMITER ;

-- Trigger para loguear eliminaciones de productos
DELIMITER $$
CREATE TRIGGER audit_products_deletion
BEFORE DELETE ON `products`
FOR EACH ROW
BEGIN
    INSERT INTO `audit_logs` (
        `auditable_type`, `auditable_id`, `event`, 
        `old_values`, `user_id`, `ip_address`
    ) VALUES (
        'Product', OLD.id, 'deleted',
        JSON_OBJECT(
            'name', OLD.name,
            'sku', OLD.sku,
            'price', OLD.price,
            'status', OLD.status
        ),
        @user_id,
        @ip_address
    );
END$$
DELIMITER ;

-- ============================================
-- ÍNDICES ADICIONALES
-- ============================================

-- Índices para búsqueda de logs por rango de fechas
CREATE INDEX idx_system_logs_date_level ON `system_logs`(`created_at`, `log_level`);
CREATE INDEX idx_activity_logs_date_action ON `activity_logs`(`created_at`, `action`);
CREATE INDEX idx_error_logs_date_type ON `error_logs`(`created_at`, `error_type`);
CREATE INDEX idx_access_logs_date_type ON `access_logs`(`created_at`, `access_type`);
CREATE INDEX idx_api_logs_date_status ON `api_logs`(`created_at`, `response_status`);
CREATE INDEX idx_security_logs_date_severity ON `security_logs`(`created_at`, `severity`);
CREATE INDEX idx_performance_logs_date_metric ON `performance_logs`(`created_at`, `metric_name`);

-- ============================================
-- VISTAS PARA REPORTES DE LOGS
-- ============================================

-- Vista de resumen de logs por día
CREATE OR REPLACE VIEW `logs_daily_summary` AS
SELECT 
    DATE(created_at) as log_date,
    COUNT(*) as total_logs,
    SUM(CASE WHEN log_level = 'error' THEN 1 ELSE 0 END) as errors,
    SUM(CASE WHEN log_level = 'warning' THEN 1 ELSE 0 END) as warnings,
    SUM(CASE WHEN log_level = 'info' THEN 1 ELSE 0 END) as info,
    SUM(CASE WHEN log_level = 'debug' THEN 1 ELSE 0 END) as debug,
    SUM(CASE WHEN log_level = 'critical' THEN 1 ELSE 0 END) as critical
FROM `system_logs`
WHERE deleted_at IS NULL
GROUP BY DATE(created_at)
ORDER BY log_date DESC;

-- Vista de actividad de usuarios
CREATE OR REPLACE VIEW `user_activity_summary` AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email as user_email,
    COUNT(al.id) as total_activities,
    MAX(al.created_at) as last_activity,
    COUNT(DISTINCT DATE(al.created_at)) as active_days,
    SUM(CASE WHEN al.action_type = 'create' THEN 1 ELSE 0 END) as creations,
    SUM(CASE WHEN al.action_type = 'update' THEN 1 ELSE 0 END) as updates,
    SUM(CASE WHEN al.action_type = 'delete' THEN 1 ELSE 0 END) as deletions
FROM `users` u
LEFT JOIN `activity_logs` al ON u.id = al.user_id AND al.deleted_at IS NULL
WHERE u.deleted_at IS NULL
GROUP BY u.id
ORDER BY last_activity DESC;

-- Vista de errores frecuentes
CREATE OR REPLACE VIEW `frequent_errors` AS
SELECT 
    error_type,
    error_code,
    error_message,
    COUNT(*) as occurrence_count,
    MIN(created_at) as first_occurrence,
    MAX(created_at) as last_occurrence,
    COUNT(DISTINCT user_id) as affected_users,
    COUNT(DISTINCT ip_address) as affected_ips
FROM `error_logs`
WHERE resolved = FALSE AND deleted_at IS NULL
GROUP BY error_type, error_code, error_message
HAVING occurrence_count > 5
ORDER BY occurrence_count DESC;

-- ============================================
-- PROCEDIMIENTOS ALMACENADOS PARA LIMPIEZA DE LOGS
-- ============================================

-- Procedimiento para limpiar logs antiguos
DELIMITER $$
CREATE PROCEDURE cleanup_old_logs(IN days_to_keep INT)
BEGIN
    DECLARE cutoff_date DATETIME;
    SET cutoff_date = DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
    
    -- Limpiar logs del sistema
    DELETE FROM `system_logs` WHERE created_at < cutoff_date;
    
    -- Limpiar activity logs
    DELETE FROM `activity_logs` WHERE created_at < cutoff_date;
    
    -- Limpiar access logs
    DELETE FROM `access_logs` WHERE created_at < cutoff_date;
    
    -- Limpiar performance logs (mantener más tiempo)
    DELETE FROM `performance_logs` WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
    
    -- Registrar la limpieza
    INSERT INTO `system_logs` (`log_level`, `channel`, `message`, `context`)
    VALUES ('info', 'maintenance', 'Log cleanup completed', JSON_OBJECT('days_kept', days_to_keep));
END$$
DELIMITER ;

-- ============================================
-- FUNCIONES PARA LOGS
-- ============================================

-- Función para obtener conteo de logs por nivel
DELIMITER $$
CREATE FUNCTION get_log_count_by_level(log_level_param VARCHAR(20))
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE log_count INT;
    
    SELECT COUNT(*) INTO log_count
    FROM `system_logs`
    WHERE log_level = log_level_param
        AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    RETURN log_count;
END$$
DELIMITER ;

-- ============================================
-- COMENTARIOS DE TABLAS
-- ============================================

ALTER TABLE `system_logs` COMMENT = 'Logs generales del sistema';
ALTER TABLE `activity_logs` COMMENT = 'Registro de actividades de usuarios';
ALTER TABLE `audit_logs` COMMENT = 'Auditoría de cambios en datos';
ALTER TABLE `error_logs` COMMENT = 'Registro de errores del sistema';
ALTER TABLE `access_logs` COMMENT = 'Registro de accesos y autenticaciones';
ALTER TABLE `api_logs` COMMENT = 'Logs de llamadas a APIs';
ALTER TABLE `console_logs` COMMENT = 'Logs de comandos y jobs';
ALTER TABLE `database_logs` COMMENT = 'Logs de consultas a base de datos';
ALTER TABLE `security_logs` COMMENT = 'Eventos de seguridad del sistema';
ALTER TABLE `performance_logs` COMMENT = 'Métricas de rendimiento';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================