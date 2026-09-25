-- 20260521000004_create_sales.sql
-- CoreX Database

-- ============================================
-- SCRIPT: 20260521000004_create_sales.sql
-- DESCRIPCIÓN: Creación de tablas de ventas, carritos y procesos de compra
-- FECHA: 2026-05-21
-- AUTOR: Sistema de Base de Datos
-- ============================================

-- ============================================
-- 1. TABLA DE CARRITO DE COMPRAS
-- ============================================

CREATE TABLE IF NOT EXISTS `carts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (UUID()),
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `session_id` VARCHAR(255) NULL DEFAULT NULL,
    `status` ENUM('active', 'abandoned', 'converted', 'expired') DEFAULT 'active',
    
    -- Totales del carrito
    `subtotal` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `discount_total` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `tax_total` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `shipping_total` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `total` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    
    -- Cupón aplicado
    `coupon_code` VARCHAR(100) NULL DEFAULT NULL,
    `coupon_discount` DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Métodos seleccionados
    `shipping_method` VARCHAR(100) NULL DEFAULT NULL,
    `payment_method` VARCHAR(100) NULL DEFAULT NULL,
    
    -- Direcciones
    `shipping_address` JSON NULL DEFAULT NULL,
    `billing_address` JSON NULL DEFAULT NULL,
    
    -- Preferencias
    `currency` VARCHAR(3) DEFAULT 'EUR',
    `language` VARCHAR(10) DEFAULT 'es',
    
    -- Fechas
    `last_activity` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expires_at` TIMESTAMP NULL DEFAULT NULL,
    `converted_at` TIMESTAMP NULL DEFAULT NULL,
    `abandoned_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    -- Índices y claves
    PRIMARY KEY (`id`),
    UNIQUE KEY `carts_uuid_unique` (`uuid`),
    KEY `carts_user_id_index` (`user_id`),
    KEY `carts_session_id_index` (`session_id`),
    KEY `carts_status_index` (`status`),
    KEY `carts_last_activity_index` (`last_activity`),
    KEY `carts_expires_at_index` (`expires_at`),
    KEY `carts_deleted_at_index` (`deleted_at`),
    
    CONSTRAINT `carts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. TABLA DE ITEMS DEL CARRITO
-- ============================================

CREATE TABLE IF NOT EXISTS `cart_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `cart_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `variant_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    
    -- Información del producto (snapshot)
    `product_name` VARCHAR(255) NOT NULL,
    `product_sku` VARCHAR(100) NOT NULL,
    `product_image` VARCHAR(255) NULL DEFAULT NULL,
    `variant_attributes` JSON NULL DEFAULT NULL,
    
    -- Cantidad y precios
    `quantity` INT NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `discount_amount` DECIMAL(10, 2) DEFAULT 0.00,
    `tax_amount` DECIMAL(10, 2) DEFAULT 0.00,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    
    -- Metadatos
    `notes` TEXT NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    KEY `cart_items_cart_id_index` (`cart_id`),
    KEY `cart_items_product_id_index` (`product_id`),
    KEY `cart_items_variant_id_index` (`variant_id`),
    UNIQUE KEY `cart_items_cart_id_product_id_variant_id_unique` (`cart_id`, `product_id`, `variant_id`),
    
    CONSTRAINT `cart_items_cart_id_foreign` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
    CONSTRAINT `cart_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `cart_items_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. TABLA DE CHECKOUTS (PROCESO DE COMPRA)
-- ============================================

CREATE TABLE IF NOT EXISTS `checkouts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (UUID()),
    `cart_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    
    -- Información del cliente
    `customer_info` JSON NOT NULL,
    
    -- Direcciones
    `shipping_address` JSON NOT NULL,
    `billing_address` JSON NOT NULL,
    
    -- Métodos seleccionados
    `shipping_method` VARCHAR(100) NOT NULL,
    `shipping_cost` DECIMAL(10, 2) NOT NULL,
    `payment_method` VARCHAR(100) NOT NULL,
    
    -- Totales
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `discount_total` DECIMAL(10, 2) DEFAULT 0.00,
    `tax_total` DECIMAL(10, 2) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    
    -- Cupón
    `coupon_code` VARCHAR(100) NULL DEFAULT NULL,
    `coupon_discount` DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Estado del checkout
    `step` ENUM('cart', 'information', 'shipping', 'payment', 'review', 'completed') DEFAULT 'cart',
    `status` ENUM('pending', 'processing', 'completed', 'failed', 'abandoned') DEFAULT 'pending',
    
    -- Comentarios
    `customer_notes` TEXT NULL DEFAULT NULL,
    
    -- IP y tracking
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    `user_agent` TEXT NULL DEFAULT NULL,
    
    -- Fechas
    `completed_at` TIMESTAMP NULL DEFAULT NULL,
    `expires_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `checkouts_uuid_unique` (`uuid`),
    KEY `checkouts_cart_id_index` (`cart_id`),
    KEY `checkouts_user_id_index` (`user_id`),
    KEY `checkouts_step_index` (`step`),
    KEY `checkouts_status_index` (`status`),
    KEY `checkouts_created_at_index` (`created_at`),
    KEY `checkouts_deleted_at_index` (`deleted_at`),
    
    CONSTRAINT `checkouts_cart_id_foreign` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
    CONSTRAINT `checkouts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. TABLA DE ÓRDENES (HEREDA DE CHECKOUT)
-- ============================================

CREATE TABLE IF NOT EXISTS `orders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_number` VARCHAR(50) NOT NULL,
    `uuid` CHAR(36) NOT NULL DEFAULT (UUID()),
    `checkout_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    
    -- Cliente
    `customer_name` VARCHAR(255) NOT NULL,
    `customer_email` VARCHAR(255) NOT NULL,
    `customer_phone` VARCHAR(20) NULL DEFAULT NULL,
    `customer_dni` VARCHAR(20) NULL DEFAULT NULL,
    
    -- Direcciones
    `shipping_address` JSON NOT NULL,
    `billing_address` JSON NOT NULL,
    
    -- Métodos
    `shipping_method` VARCHAR(100) NOT NULL,
    `shipping_cost` DECIMAL(10, 2) NOT NULL,
    `payment_method` VARCHAR(100) NOT NULL,
    
    -- Totales
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `discount_total` DECIMAL(10, 2) DEFAULT 0.00,
    `tax_total` DECIMAL(10, 2) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    
    -- Cupón
    `coupon_code` VARCHAR(100) NULL DEFAULT NULL,
    `coupon_discount` DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Estado de la orden
    `order_status` ENUM('pending', 'processing', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded') DEFAULT 'pending',
    `payment_status` ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') DEFAULT 'pending',
    `fulfillment_status` ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    
    -- Fechas importantes
    `order_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `payment_date` TIMESTAMP NULL DEFAULT NULL,
    `shipping_date` TIMESTAMP NULL DEFAULT NULL,
    `delivery_date` TIMESTAMP NULL DEFAULT NULL,
    `cancelled_at` TIMESTAMP NULL DEFAULT NULL,
    
    -- Envío
    `tracking_number` VARCHAR(100) NULL DEFAULT NULL,
    `tracking_url` VARCHAR(500) NULL DEFAULT NULL,
    `shipping_carrier` VARCHAR(100) NULL DEFAULT NULL,
    
    -- Pago
    `transaction_id` VARCHAR(255) NULL DEFAULT NULL,
    `payment_details` JSON NULL DEFAULT NULL,
    
    -- Notas
    `customer_notes` TEXT NULL DEFAULT NULL,
    `admin_notes` TEXT NULL DEFAULT NULL,
    `internal_notes` TEXT NULL DEFAULT NULL,
    
    -- Métricas
    `items_count` INT DEFAULT 0,
    `unique_items_count` INT DEFAULT 0,
    `total_weight` DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Auditoría
    `created_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `updated_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `deleted_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `orders_order_number_unique` (`order_number`),
    UNIQUE KEY `orders_uuid_unique` (`uuid`),
    UNIQUE KEY `orders_tracking_number_unique` (`tracking_number`),
    KEY `orders_checkout_id_index` (`checkout_id`),
    KEY `orders_user_id_index` (`user_id`),
    KEY `orders_customer_email_index` (`customer_email`),
    KEY `orders_order_status_index` (`order_status`),
    KEY `orders_payment_status_index` (`payment_status`),
    KEY `orders_fulfillment_status_index` (`fulfillment_status`),
    KEY `orders_order_date_index` (`order_date`),
    KEY `orders_created_by_foreign` (`created_by`),
    KEY `orders_updated_by_foreign` (`updated_by`),
    KEY `orders_deleted_by_foreign` (`deleted_by`),
    
    CONSTRAINT `orders_checkout_id_foreign` FOREIGN KEY (`checkout_id`) REFERENCES `checkouts` (`id`) ON DELETE CASCADE,
    CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `orders_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `orders_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `orders_deleted_by_foreign` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. TABLA DE ITEMS DE ORDEN
-- ============================================

CREATE TABLE IF NOT EXISTS `order_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `variant_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    
    -- Snapshot del producto
    `product_name` VARCHAR(255) NOT NULL,
    `product_sku` VARCHAR(100) NOT NULL,
    `product_image` VARCHAR(255) NULL DEFAULT NULL,
    `variant_attributes` JSON NULL DEFAULT NULL,
    
    -- Cantidad y precios
    `quantity` INT NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `discount_amount` DECIMAL(10, 2) DEFAULT 0.00,
    `tax_amount` DECIMAL(10, 2) DEFAULT 0.00,
    `tax_rate` DECIMAL(5, 2) DEFAULT 21.00,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    
    -- Estado del item
    `item_status` ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    `return_requested` BOOLEAN DEFAULT FALSE,
    `return_quantity` INT DEFAULT 0,
    `return_reason` TEXT NULL DEFAULT NULL,
    
    -- Fechas
    `shipped_at` TIMESTAMP NULL DEFAULT NULL,
    `delivered_at` TIMESTAMP NULL DEFAULT NULL,
    `cancelled_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    KEY `order_items_order_id_index` (`order_id`),
    KEY `order_items_product_id_index` (`product_id`),
    KEY `order_items_variant_id_index` (`variant_id`),
    KEY `order_items_item_status_index` (`item_status`),
    KEY `order_items_return_requested_index` (`return_requested`),
    
    CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `order_items_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. TABLA DE TRANSACCIONES DE PAGO
-- ============================================

CREATE TABLE IF NOT EXISTS `payment_transactions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `transaction_id` VARCHAR(255) NOT NULL,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `transaction_type` ENUM('authorization', 'capture', 'sale', 'refund', 'void') NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(3) DEFAULT 'EUR',
    `status` ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
    
    -- Información del pago
    `payment_method` VARCHAR(100) NOT NULL,
    `payment_processor` VARCHAR(100) NOT NULL,
    `card_last4` VARCHAR(4) NULL DEFAULT NULL,
    `card_brand` VARCHAR(50) NULL DEFAULT NULL,
    
    -- Respuestas
    `processor_response` JSON NULL DEFAULT NULL,
    `error_message` TEXT NULL DEFAULT NULL,
    
    -- Metadatos
    `customer_ip` VARCHAR(45) NULL DEFAULT NULL,
    `user_agent` TEXT NULL DEFAULT NULL,
    
    -- Fechas
    `processed_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `payment_transactions_transaction_id_unique` (`transaction_id`),
    KEY `payment_transactions_order_id_index` (`order_id`),
    KEY `payment_transactions_status_index` (`status`),
    KEY `payment_transactions_processed_at_index` (`processed_at`),
    
    CONSTRAINT `payment_transactions_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. TABLA DE HISTORIAL DE ÓRDENES
-- ============================================

CREATE TABLE IF NOT EXISTS `order_history` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `old_value` JSON NULL DEFAULT NULL,
    `new_value` JSON NULL DEFAULT NULL,
    `notes` TEXT NULL DEFAULT NULL,
    `performed_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    KEY `order_history_order_id_index` (`order_id`),
    KEY `order_history_action_index` (`action`),
    KEY `order_history_created_at_index` (`created_at`),
    KEY `order_history_performed_by_foreign` (`performed_by`),
    
    CONSTRAINT `order_history_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `order_history_performed_by_foreign` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. TABLA DE NOTIFICACIONES DE ÓRDENES
-- ============================================

CREATE TABLE IF NOT EXISTS `order_notifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `notification_type` ENUM('email', 'sms', 'whatsapp', 'push') NOT NULL,
    `recipient` VARCHAR(255) NOT NULL,
    `subject` VARCHAR(255) NULL DEFAULT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('pending', 'sent', 'failed', 'delivered') DEFAULT 'pending',
    `sent_at` TIMESTAMP NULL DEFAULT NULL,
    `error_message` TEXT NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    KEY `order_notifications_order_id_index` (`order_id`),
    KEY `order_notifications_status_index` (`status`),
    KEY `order_notifications_created_at_index` (`created_at`),
    
    CONSTRAINT `order_notifications_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. TABLA DE CARRITOS ABANDONADOS (RECUPERACIÓN)
-- ============================================

CREATE TABLE IF NOT EXISTS `abandoned_carts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `cart_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `email` VARCHAR(255) NULL DEFAULT NULL,
    `phone` VARCHAR(20) NULL DEFAULT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `items_count` INT DEFAULT 0,
    
    -- Estado de recuperación
    `recovery_status` ENUM('pending', 'email_sent', 'sms_sent', 'recovered', 'lost') DEFAULT 'pending',
    `reminder_count` INT DEFAULT 0,
    `last_reminder_at` TIMESTAMP NULL DEFAULT NULL,
    
    -- Fechas
    `abandoned_at` TIMESTAMP NOT NULL,
    `recovered_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    KEY `abandoned_carts_cart_id_index` (`cart_id`),
    KEY `abandoned_carts_user_id_index` (`user_id`),
    KEY `abandoned_carts_email_index` (`email`),
    KEY `abandoned_carts_recovery_status_index` (`recovery_status`),
    KEY `abandoned_carts_abandoned_at_index` (`abandoned_at`),
    
    CONSTRAINT `abandoned_carts_cart_id_foreign` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
    CONSTRAINT `abandoned_carts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. TABLA DE MÉTODOS DE ENVÍO
-- ============================================

CREATE TABLE IF NOT EXISTS `shipping_methods` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `description` TEXT NULL DEFAULT NULL,
    `carrier` VARCHAR(100) NOT NULL,
    `delivery_time` VARCHAR(100) NULL DEFAULT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `free_shipping_threshold` DECIMAL(10, 2) NULL DEFAULT NULL,
    `max_weight` DECIMAL(10, 2) NULL DEFAULT NULL,
    `countries` JSON NULL DEFAULT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `position` INT DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `shipping_methods_code_unique` (`code`),
    KEY `shipping_methods_is_active_index` (`is_active`),
    KEY `shipping_methods_position_index` (`position`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. TABLA DE MÉTODOS DE PAGO
-- ============================================

CREATE TABLE IF NOT EXISTS `payment_methods` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `description` TEXT NULL DEFAULT NULL,
    `processor` VARCHAR(100) NOT NULL,
    `processor_config` JSON NULL DEFAULT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `is_default` BOOLEAN DEFAULT FALSE,
    `position` INT DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `payment_methods_code_unique` (`code`),
    KEY `payment_methods_is_active_index` (`is_active`),
    KEY `payment_methods_is_default_index` (`is_default`),
    KEY `payment_methods_position_index` (`position`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar métodos de envío
INSERT INTO `shipping_methods` (`name`, `code`, `description`, `carrier`, `delivery_time`, `price`, `free_shipping_threshold`, `position`) VALUES
('Envío Estándar', 'standard', 'Entrega en 3-5 días hábiles', 'Correos', '3-5 días', 4.99, 50.00, 1),
('Envío Express', 'express', 'Entrega en 24-48 horas', 'DHL', '24-48h', 9.99, 100.00, 2),
('Envío Gratis', 'free', 'Envío gratuito en pedidos superiores a 50€', 'Correos', '5-7 días', 0.00, 50.00, 3),
('Recogida en Tienda', 'pickup', 'Recoge tu pedido en nuestra tienda', 'Pickup', '24h', 0.00, NULL, 4);

-- Insertar métodos de pago
INSERT INTO `payment_methods` (`name`, `code`, `description`, `processor`, `is_default`, `position`) VALUES
('Tarjeta de Crédito/Débito', 'credit_card', 'Pago seguro con tarjeta', 'stripe', TRUE, 1),
('PayPal', 'paypal', 'Paga con tu cuenta PayPal', 'paypal', FALSE, 2),
('Transferencia Bancaria', 'bank_transfer', 'Realiza una transferencia bancaria', 'manual', FALSE, 3),
('Contra Reembolso', 'cash_on_delivery', 'Paga al recibir el pedido', 'manual', FALSE, 4);

-- ============================================
-- ÍNDICES ADICIONALES
-- ============================================

-- Índices para carritos
CREATE INDEX idx_carts_user_status ON `carts`(`user_id`, `status`);
CREATE INDEX idx_carts_session_status ON `carts`(`session_id`, `status`);
CREATE INDEX idx_carts_activity_status ON `carts`(`last_activity`, `status`);

-- Índices para órdenes
CREATE INDEX idx_orders_user_status ON `orders`(`user_id`, `order_status`);
CREATE INDEX idx_orders_date_status ON `orders`(`order_date`, `order_status`);
CREATE INDEX idx_orders_email_status ON `orders`(`customer_email`, `order_status`);
CREATE INDEX idx_orders_total ON `orders`(`total`);

-- Índices para checkout
CREATE INDEX idx_checkouts_cart_status ON `checkouts`(`cart_id`, `status`);
CREATE INDEX idx_checkouts_user_step ON `checkouts`(`user_id`, `step`);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para actualizar totales del carrito
DELIMITER $$
CREATE TRIGGER update_cart_totals
AFTER INSERT ON `cart_items`
FOR EACH ROW
BEGIN
    UPDATE `carts` 
    SET 
        `subtotal` = (
            SELECT COALESCE(SUM(`subtotal`), 0) 
            FROM `cart_items` 
            WHERE `cart_id` = NEW.cart_id
        ),
        `total` = (
            SELECT COALESCE(SUM(`total`), 0) 
            FROM `cart_items` 
            WHERE `cart_id` = NEW.cart_id
        ),
        `updated_at` = NOW()
    WHERE `id` = NEW.cart_id;
END$$
DELIMITER ;

-- Trigger para generar número de orden automático
DELIMITER $$
CREATE TRIGGER generate_order_number
BEFORE INSERT ON `orders`
FOR EACH ROW
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        SET NEW.order_number = CONCAT('ORD-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(NEW.id, 6, '0'));
    END IF;
END$$
DELIMITER ;

-- Trigger para registrar historial de órdenes
DELIMITER $$
CREATE TRIGGER log_order_status_change
AFTER UPDATE ON `orders`
FOR EACH ROW
BEGIN
    IF OLD.order_status != NEW.order_status THEN
        INSERT INTO `order_history` (`order_id`, `action`, `old_value`, `new_value`, `performed_by`)
        VALUES (
            NEW.id, 
            'status_change',
            JSON_OBJECT('status', OLD.order_status),
            JSON_OBJECT('status', NEW.order_status),
            NEW.updated_by
        );
    END IF;
END$$
DELIMITER ;

-- Trigger para actualizar stock después de orden
DELIMITER $$
CREATE TRIGGER update_stock_after_order
AFTER INSERT ON `order_items`
FOR EACH ROW
BEGIN
    UPDATE `products` 
    SET `stock` = `stock` - NEW.quantity,
        `total_sales` = `total_sales` + NEW.quantity,
        `total_revenue` = `total_revenue` + NEW.total
    WHERE `id` = NEW.product_id;
    
    -- Si tiene variante, actualizar también
    IF NEW.variant_id IS NOT NULL THEN
        UPDATE `product_variants` 
        SET `stock` = `stock` - NEW.quantity
        WHERE `id` = NEW.variant_id;
    END IF;
END$$
DELIMITER ;

-- ============================================
-- VISTAS
-- ============================================

-- Vista de ventas diarias
CREATE OR REPLACE VIEW `daily_sales` AS
SELECT 
    DATE(o.order_date) as sale_date,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(DISTINCT o.user_id) as unique_customers,
    SUM(o.subtotal) as subtotal,
    SUM(o.discount_total) as discounts,
    SUM(o.tax_total) as taxes,
    SUM(o.shipping_cost) as shipping,
    SUM(o.total) as total_sales,
    SUM(oi.quantity) as items_sold
FROM `orders` o
LEFT JOIN `order_items` oi ON o.id = oi.order_id
WHERE o.order_status IN ('completed', 'delivered')
    AND o.deleted_at IS NULL
GROUP BY DATE(o.order_date)
ORDER BY sale_date DESC;

-- Vista de resumen de carritos abandonados
CREATE OR REPLACE VIEW `abandoned_cart_summary` AS
SELECT 
    ac.id,
    ac.email,
    ac.subtotal,
    ac.items_count,
    ac.abandoned_at,
    ac.recovery_status,
    ac.reminder_count,
    TIMESTAMPDIFF(HOUR, ac.abandoned_at, NOW()) as hours_abandoned,
    CASE 
        WHEN TIMESTAMPDIFF(HOUR, ac.abandoned_at, NOW()) <= 1 THEN 'recent'
        WHEN TIMESTAMPDIFF(HOUR, ac.abandoned_at, NOW()) <= 24 THEN 'day'
        WHEN TIMESTAMPDIFF(HOUR, ac.abandoned_at, NOW()) <= 168 THEN 'week'
        ELSE 'old'
    END as abandonment_age
FROM `abandoned_carts` ac
WHERE ac.recovery_status = 'pending';

-- ============================================
-- FUNCIONES
-- ============================================

-- Función para calcular el total de un carrito
DELIMITER $$
CREATE FUNCTION calculate_cart_total(cart_id BIGINT UNSIGNED)
RETURNS DECIMAL(10, 2)
DETERMINISTIC
BEGIN
    DECLARE total DECIMAL(10, 2);
    
    SELECT COALESCE(SUM(total), 0) INTO total
    FROM `cart_items`
    WHERE `cart_id` = cart_id;
    
    RETURN total;
END$$
DELIMITER ;

-- Función para obtener el estado de la orden en español
DELIMITER $$
CREATE FUNCTION get_order_status_es(status VARCHAR(50))
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    RETURN CASE status
        WHEN 'pending' THEN 'Pendiente'
        WHEN 'processing' THEN 'Procesando'
        WHEN 'confirmed' THEN 'Confirmado'
        WHEN 'shipped' THEN 'Enviado'
        WHEN 'delivered' THEN 'Entregado'
        WHEN 'completed' THEN 'Completado'
        WHEN 'cancelled' THEN 'Cancelado'
        WHEN 'refunded' THEN 'Reembolsado'
        ELSE status
    END;
END$$
DELIMITER ;

-- ============================================
-- COMENTARIOS DE TABLAS
-- ============================================

ALTER TABLE `carts` COMMENT = 'Carritos de compra de usuarios';
ALTER TABLE `cart_items` COMMENT = 'Items dentro del carrito de compras';
ALTER TABLE `checkouts` COMMENT = 'Proceso de checkout de compra';
ALTER TABLE `orders` COMMENT = 'Órdenes de compra completadas';
ALTER TABLE `order_items` COMMENT = 'Items de cada orden de compra';
ALTER TABLE `payment_transactions` COMMENT = 'Transacciones de pago';
ALTER TABLE `order_history` COMMENT = 'Historial de cambios de órdenes';
ALTER TABLE `order_notifications` COMMENT = 'Notificaciones de órdenes';
ALTER TABLE `abandoned_carts` COMMENT = 'Carritos abandonados para recuperación';
ALTER TABLE `shipping_methods` COMMENT = 'Métodos de envío disponibles';
ALTER TABLE `payment_methods` COMMENT = 'Métodos de pago disponibles';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================