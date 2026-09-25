-- 20260521000005_create_sale_items.sql
-- CoreX Database

-- ============================================
-- SCRIPT: 20260521000005_create_sale_items.sql
-- DESCRIPCIÓN: Creación de tablas de ventas, pedidos y items de venta
-- FECHA: 2026-05-21
-- AUTOR: Sistema de Base de Datos
-- ============================================

-- ============================================
-- 1. TABLA DE PEDIDOS (ORDERS)
-- ============================================

CREATE TABLE IF NOT EXISTS `orders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (UUID()),
    `order_number` VARCHAR(50) NOT NULL,
    `tracking_number` VARCHAR(100) NULL DEFAULT NULL,
    
    -- Clientes
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `customer_name` VARCHAR(255) NOT NULL,
    `customer_email` VARCHAR(255) NOT NULL,
    `customer_phone` VARCHAR(20) NULL DEFAULT NULL,
    `customer_dni` VARCHAR(20) NULL DEFAULT NULL,
    
    -- Direcciones
    `billing_address` JSON NOT NULL,
    `shipping_address` JSON NOT NULL,
    `same_as_billing` BOOLEAN DEFAULT TRUE,
    
    -- Estado del pedido
    `status` ENUM('pending', 'processing', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'failed') DEFAULT 'pending',
    `payment_status` ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') DEFAULT 'pending',
    `fulfillment_status` ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    
    -- Fechas importantes
    `order_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `payment_date` TIMESTAMP NULL DEFAULT NULL,
    `shipping_date` TIMESTAMP NULL DEFAULT NULL,
    `delivery_date` TIMESTAMP NULL DEFAULT NULL,
    `cancelled_at` TIMESTAMP NULL DEFAULT NULL,
    `cancellation_reason` TEXT NULL DEFAULT NULL,
    
    -- Totales
    `subtotal` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `discount_total` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `tax_total` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `shipping_total` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `total` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    
    -- Cupones y descuentos
    `coupon_code` VARCHAR(100) NULL DEFAULT NULL,
    `coupon_discount` DECIMAL(10, 2) DEFAULT 0.00,
    `discount_reason` TEXT NULL DEFAULT NULL,
    
    -- Envío
    `shipping_method` VARCHAR(100) NOT NULL,
    `shipping_carrier` VARCHAR(100) NULL DEFAULT NULL,
    `shipping_tracking_url` VARCHAR(500) NULL DEFAULT NULL,
    `shipping_notes` TEXT NULL DEFAULT NULL,
    
    -- Pago
    `payment_method` VARCHAR(100) NOT NULL,
    `payment_processor` VARCHAR(100) NULL DEFAULT NULL,
    `transaction_id` VARCHAR(255) NULL DEFAULT NULL,
    `payment_details` JSON NULL DEFAULT NULL,
    
    -- Notas
    `customer_notes` TEXT NULL DEFAULT NULL,
    `admin_notes` TEXT NULL DEFAULT NULL,
    `internal_notes` TEXT NULL DEFAULT NULL,
    
    -- Métricas
    `items_count` INT DEFAULT 0,
    `unique_items_count` INT DEFAULT 0,
    `weight_total` DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Auditoría
    `created_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `updated_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `deleted_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    -- Índices y claves
    PRIMARY KEY (`id`),
    UNIQUE KEY `orders_order_number_unique` (`order_number`),
    UNIQUE KEY `orders_uuid_unique` (`uuid`),
    UNIQUE KEY `orders_tracking_number_unique` (`tracking_number`),
    KEY `orders_user_id_index` (`user_id`),
    KEY `orders_customer_email_index` (`customer_email`),
    KEY `orders_status_index` (`status`),
    KEY `orders_payment_status_index` (`payment_status`),
    KEY `orders_fulfillment_status_index` (`fulfillment_status`),
    KEY `orders_order_date_index` (`order_date`),
    KEY `orders_created_at_index` (`created_at`),
    KEY `orders_deleted_at_index` (`deleted_at`),
    KEY `orders_coupon_code_index` (`coupon_code`),
    KEY `orders_transaction_id_index` (`transaction_id`),
    KEY `orders_created_by_foreign` (`created_by`),
    KEY `orders_updated_by_foreign` (`updated_by`),
    KEY `orders_deleted_by_foreign` (`deleted_by`),
    
    -- Restricciones
    CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `orders_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `orders_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `orders_deleted_by_foreign` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. TABLA DE ITEMS DE PEDIDO (ORDER ITEMS)
-- ============================================

CREATE TABLE IF NOT EXISTS `order_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `variant_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    
    -- Información del producto (snapshot)
    `product_sku` VARCHAR(100) NOT NULL,
    `product_name` VARCHAR(255) NOT NULL,
    `product_image` VARCHAR(255) NULL DEFAULT NULL,
    `variant_attributes` JSON NULL DEFAULT NULL,
    
    -- Cantidades y precios
    `quantity` INT NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `discount_amount` DECIMAL(10, 2) DEFAULT 0.00,
    `tax_amount` DECIMAL(10, 2) DEFAULT 0.00,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    
    -- Estado del item
    `status` ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    `return_requested` BOOLEAN DEFAULT FALSE,
    `return_reason` TEXT NULL DEFAULT NULL,
    `return_status` ENUM('none', 'requested', 'approved', 'rejected', 'completed') DEFAULT 'none',
    
    -- Métricas adicionales
    `weight` DECIMAL(10, 2) NULL DEFAULT NULL,
    `tax_rate` DECIMAL(5, 2) DEFAULT 21.00,
    
    -- Fechas
    `shipped_at` TIMESTAMP NULL DEFAULT NULL,
    `delivered_at` TIMESTAMP NULL DEFAULT NULL,
    `cancelled_at` TIMESTAMP NULL DEFAULT NULL,
    
    -- Auditoría
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices y claves
    PRIMARY KEY (`id`),
    KEY `order_items_order_id_index` (`order_id`),
    KEY `order_items_product_id_index` (`product_id`),
    KEY `order_items_variant_id_index` (`variant_id`),
    KEY `order_items_status_index` (`status`),
    KEY `order_items_return_status_index` (`return_status`),
    UNIQUE KEY `order_items_order_id_product_id_variant_id_unique` (`order_id`, `product_id`, `variant_id`),
    
    -- Restricciones
    CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `order_items_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. TABLA DE TRANSACCIONES DE PAGO
-- ============================================

CREATE TABLE IF NOT EXISTS `payment_transactions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `transaction_id` VARCHAR(255) NOT NULL,
    `transaction_type` ENUM('payment', 'refund', 'authorization', 'capture') NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(3) DEFAULT 'EUR',
    `status` ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
    `payment_method` VARCHAR(100) NOT NULL,
    `payment_processor` VARCHAR(100) NOT NULL,
    `processor_response` JSON NULL DEFAULT NULL,
    `error_message` TEXT NULL DEFAULT NULL,
    `customer_ip` VARCHAR(45) NULL DEFAULT NULL,
    `card_last4` VARCHAR(4) NULL DEFAULT NULL,
    `card_brand` VARCHAR(50) NULL DEFAULT NULL,
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
-- 4. TABLA DE DEVOLUCIONES (RETURNS)
-- ============================================

CREATE TABLE IF NOT EXISTS `returns` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `return_number` VARCHAR(50) NOT NULL,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `status` ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
    
    -- Información de devolución
    `return_reason` TEXT NOT NULL,
    `return_details` TEXT NULL DEFAULT NULL,
    `return_type` ENUM('refund', 'exchange', 'repair') DEFAULT 'refund',
    
    -- Items devueltos
    `items` JSON NOT NULL,
    `total_items` INT DEFAULT 0,
    `total_amount` DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Método de reembolso
    `refund_method` VARCHAR(100) NULL DEFAULT NULL,
    `refund_amount` DECIMAL(10, 2) DEFAULT 0.00,
    `refund_transaction_id` VARCHAR(255) NULL DEFAULT NULL,
    
    -- Fechas
    `requested_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `approved_at` TIMESTAMP NULL DEFAULT NULL,
    `rejected_at` TIMESTAMP NULL DEFAULT NULL,
    `completed_at` TIMESTAMP NULL DEFAULT NULL,
    `shipped_at` TIMESTAMP NULL DEFAULT NULL,
    `received_at` TIMESTAMP NULL DEFAULT NULL,
    
    -- Auditoría
    `processed_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `admin_notes` TEXT NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `returns_return_number_unique` (`return_number`),
    KEY `returns_order_id_index` (`order_id`),
    KEY `returns_user_id_index` (`user_id`),
    KEY `returns_status_index` (`status`),
    KEY `returns_requested_at_index` (`requested_at`),
    KEY `returns_processed_by_foreign` (`processed_by`),
    
    CONSTRAINT `returns_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `returns_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `returns_processed_by_foreign` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. TABLA DE CUPONES Y DESCUENTOS
-- ============================================

CREATE TABLE IF NOT EXISTS `coupons` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL DEFAULT NULL,
    
    -- Tipo de descuento
    `discount_type` ENUM('percentage', 'fixed', 'free_shipping') NOT NULL,
    `discount_value` DECIMAL(10, 2) NOT NULL,
    `max_discount_amount` DECIMAL(10, 2) NULL DEFAULT NULL, -- Máximo descuento para porcentaje
    
    -- Condiciones
    `minimum_order_amount` DECIMAL(10, 2) DEFAULT 0.00,
    `maximum_order_amount` DECIMAL(10, 2) NULL DEFAULT NULL,
    `usage_limit` INT NULL DEFAULT NULL, -- Límite de usos total
    `usage_limit_per_user` INT NULL DEFAULT NULL, -- Límite por usuario
    `usage_count` INT DEFAULT 0,
    
    -- Restricciones
    `exclude_sale_items` BOOLEAN DEFAULT FALSE,
    `free_shipping` BOOLEAN DEFAULT FALSE,
    `apply_to` ENUM('all', 'first_order', 'specific_products', 'specific_categories') DEFAULT 'all',
    `product_ids` JSON NULL DEFAULT NULL,
    `category_ids` JSON NULL DEFAULT NULL,
    
    -- Fechas
    `valid_from` TIMESTAMP NOT NULL,
    `valid_to` TIMESTAMP NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `coupons_code_unique` (`code`),
    KEY `coupons_valid_dates_index` (`valid_from`, `valid_to`),
    KEY `coupons_discount_type_index` (`discount_type`),
    KEY `coupons_deleted_at_index` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. TABLA DE USO DE CUPONES
-- ============================================

CREATE TABLE IF NOT EXISTS `coupon_usage` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `coupon_id` BIGINT UNSIGNED NOT NULL,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `discount_amount` DECIMAL(10, 2) NOT NULL,
    `used_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    KEY `coupon_usage_coupon_id_index` (`coupon_id`),
    KEY `coupon_usage_order_id_index` (`order_id`),
    KEY `coupon_usage_user_id_index` (`user_id`),
    KEY `coupon_usage_used_at_index` (`used_at`),
    
    CONSTRAINT `coupon_usage_coupon_id_foreign` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
    CONSTRAINT `coupon_usage_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `coupon_usage_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. TABLA DE FACTURAS (INVOICES)
-- ============================================

CREATE TABLE IF NOT EXISTS `invoices` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `invoice_number` VARCHAR(50) NOT NULL,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `invoice_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `due_date` TIMESTAMP NULL DEFAULT NULL,
    
    -- Datos de facturación
    `billing_name` VARCHAR(255) NOT NULL,
    `billing_address` JSON NOT NULL,
    `billing_tax_id` VARCHAR(50) NULL DEFAULT NULL, -- NIF/CIF
    
    -- Totales
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `discount_total` DECIMAL(10, 2) DEFAULT 0.00,
    `tax_total` DECIMAL(10, 2) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    
    -- Estado
    `status` ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    `invoice_file` VARCHAR(255) NULL DEFAULT NULL,
    `email_sent` BOOLEAN DEFAULT FALSE,
    `email_sent_at` TIMESTAMP NULL DEFAULT NULL,
    
    -- Auditoría
    `created_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `invoices_invoice_number_unique` (`invoice_number`),
    KEY `invoices_order_id_index` (`order_id`),
    KEY `invoices_user_id_index` (`user_id`),
    KEY `invoices_status_index` (`status`),
    KEY `invoices_invoice_date_index` (`invoice_date`),
    KEY `invoices_created_by_foreign` (`created_by`),
    
    CONSTRAINT `invoices_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `invoices_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `invoices_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. TABLA DE HISTORIAL DE ESTADOS DE PEDIDO
-- ============================================

CREATE TABLE IF NOT EXISTS `order_status_history` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `notes` TEXT NULL DEFAULT NULL,
    `changed_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    KEY `order_status_history_order_id_index` (`order_id`),
    KEY `order_status_history_status_index` (`status`),
    KEY `order_status_history_created_at_index` (`created_at`),
    KEY `order_status_history_changed_by_foreign` (`changed_by`),
    
    CONSTRAINT `order_status_history_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `order_status_history_changed_by_foreign` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. TABLA DE MÉTODOS DE ENVÍO
-- ============================================

CREATE TABLE IF NOT EXISTS `shipping_methods` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL DEFAULT NULL,
    `carrier` VARCHAR(100) NOT NULL,
    `delivery_time` VARCHAR(100) NULL DEFAULT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `free_shipping_threshold` DECIMAL(10, 2) NULL DEFAULT NULL,
    `max_weight` DECIMAL(10, 2) NULL DEFAULT NULL,
    `countries` JSON NULL DEFAULT NULL,
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `position` INT DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `shipping_methods_slug_unique` (`slug`),
    KEY `shipping_methods_status_index` (`status`),
    KEY `shipping_methods_position_index` (`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. TABLA DE MÉTODOS DE PAGO
-- ============================================

CREATE TABLE IF NOT EXISTS `payment_methods` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL DEFAULT NULL,
    `processor` VARCHAR(100) NOT NULL,
    `processor_config` JSON NULL DEFAULT NULL,
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `is_default` BOOLEAN DEFAULT FALSE,
    `position` INT DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `payment_methods_slug_unique` (`slug`),
    KEY `payment_methods_status_index` (`status`),
    KEY `payment_methods_is_default_index` (`is_default`),
    KEY `payment_methods_position_index` (`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar métodos de envío
INSERT INTO `shipping_methods` (`name`, `slug`, `description`, `carrier`, `delivery_time`, `price`, `free_shipping_threshold`, `position`) VALUES
('Envío Estándar', 'standard', 'Entrega en 3-5 días hábiles', 'Correos', '3-5 días', 4.99, 50.00, 1),
('Envío Express', 'express', 'Entrega en 24-48 horas', 'DHL', '24-48h', 9.99, 100.00, 2),
('Envío Gratis', 'free', 'Envío gratuito en pedidos superiores a 50€', 'Correos', '5-7 días', 0.00, 50.00, 3),
('Recogida en Tienda', 'pickup', 'Recoge tu pedido en nuestra tienda física', 'Pickup', '24h', 0.00, NULL, 4);

-- Insertar métodos de pago
INSERT INTO `payment_methods` (`name`, `slug`, `description`, `processor`, `is_default`, `position`) VALUES
('Tarjeta de Crédito/Débito', 'credit_card', 'Pago seguro con tarjeta', 'stripe', TRUE, 1),
('PayPal', 'paypal', 'Paga con tu cuenta PayPal', 'paypal', FALSE, 2),
('Transferencia Bancaria', 'bank_transfer', 'Realiza una transferencia bancaria', 'manual', FALSE, 3),
('Contra Reembolso', 'cash_on_delivery', 'Paga al recibir el pedido', 'manual', FALSE, 4);

-- Insertar cupones de ejemplo
INSERT INTO `coupons` (`code`, `name`, `description`, `discount_type`, `discount_value`, `minimum_order_amount`, `valid_from`, `valid_to`) VALUES
('BIENVENIDA10', 'Bienvenida 10%', '10% de descuento para nuevos clientes', 'percentage', 10.00, 20.00, '2024-01-01 00:00:00', '2025-12-31 23:59:59'),
('ENVIOGRATIS', 'Envío Gratis', 'Envío gratis sin mínimo', 'free_shipping', 0.00, 0.00, '2024-01-01 00:00:00', '2025-12-31 23:59:59'),
('DESCUENTO20', '20% de Descuento', '20% de descuento en toda la tienda', 'percentage', 20.00, 50.00, '2024-06-01 00:00:00', '2024-06-30 23:59:59');

-- ============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

-- Índices para búsqueda de pedidos
CREATE INDEX idx_orders_customer_name ON `orders`(`customer_name`);
CREATE INDEX idx_orders_total ON `orders`(`total`);
CREATE INDEX idx_orders_status_payment ON `orders`(`status`, `payment_status`);
CREATE INDEX idx_orders_date_status ON `orders`(`order_date`, `status`);

-- Índices para items de pedido
CREATE INDEX idx_order_items_product_status ON `order_items`(`product_id`, `status`);
CREATE INDEX idx_order_items_order_status ON `order_items`(`order_id`, `status`);

-- Índices para devoluciones
CREATE INDEX idx_returns_order_status ON `returns`(`order_id`, `status`);
CREATE INDEX idx_returns_date_status ON `returns`(`requested_at`, `status`);

-- Índices para facturas
CREATE INDEX idx_invoices_user_status ON `invoices`(`user_id`, `status`);
CREATE INDEX idx_invoices_date_status ON `invoices`(`invoice_date`, `status`);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para generar número de orden automático
DELIMITER $$
CREATE TRIGGER orders_before_insert
BEFORE INSERT ON `orders`
FOR EACH ROW
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        SET NEW.order_number = CONCAT('ORD-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(NEW.id, 6, '0'));
    END IF;
    
    -- Calcular totales
    SET NEW.total = NEW.subtotal - NEW.discount_total + NEW.tax_total + NEW.shipping_total;
END$$
DELIMITER ;

-- Trigger para registrar historial de estado
DELIMITER $$
CREATE TRIGGER orders_after_update
AFTER UPDATE ON `orders`
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO `order_status_history` (`order_id`, `status`, `changed_by`)
        VALUES (NEW.id, NEW.status, NEW.updated_by);
    END IF;
END$$
DELIMITER ;

-- Trigger para actualizar stock después de cancelar pedido
DELIMITER $$
CREATE TRIGGER restore_stock_on_cancel
AFTER UPDATE ON `orders`
FOR EACH ROW
BEGIN
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
        UPDATE `products` p
        INNER JOIN `order_items` oi ON oi.product_id = p.id
        SET p.stock = p.stock + oi.quantity
        WHERE oi.order_id = NEW.id;
    END IF;
END$$
DELIMITER ;

-- ============================================
-- VISTAS
-- ============================================

-- Vista de resumen de pedidos
CREATE OR REPLACE VIEW `order_summary` AS
SELECT 
    o.id,
    o.order_number,
    o.order_date,
    o.customer_name,
    o.customer_email,
    o.status,
    o.payment_status,
    o.total,
    COUNT(oi.id) as items_count,
    SUM(oi.quantity) as total_items
FROM `orders` o
LEFT JOIN `order_items` oi ON o.id = oi.order_id
WHERE o.deleted_at IS NULL
GROUP BY o.id;

-- Vista de ventas diarias
CREATE OR REPLACE VIEW `daily_sales` AS
SELECT 
    DATE(o.order_date) as sale_date,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(DISTINCT o.user_id) as unique_customers,
    SUM(o.subtotal) as subtotal,
    SUM(o.discount_total) as discounts,
    SUM(o.tax_total) as taxes,
    SUM(o.shipping_total) as shipping,
    SUM(o.total) as total_sales,
    SUM(oi.quantity) as items_sold
FROM `orders` o
LEFT JOIN `order_items` oi ON o.id = oi.order_id
WHERE o.status IN ('completed', 'delivered')
    AND o.deleted_at IS NULL
GROUP BY DATE(o.order_date)
ORDER BY sale_date DESC;

-- Vista de productos más vendidos por período
CREATE OR REPLACE VIEW `top_selling_products` AS
SELECT 
    oi.product_id,
    p.name as product_name,
    COUNT(DISTINCT oi.order_id) as order_count,
    SUM(oi.quantity) as total_quantity,
    SUM(oi.total) as total_revenue,
    AVG(oi.unit_price) as average_price
FROM `order_items` oi
INNER JOIN `orders` o ON oi.order_id = o.id
INNER JOIN `products` p ON oi.product_id = p.id
WHERE o.status IN ('completed', 'delivered')
    AND o.deleted_at IS NULL
GROUP BY oi.product_id, p.name
ORDER BY total_revenue DESC
LIMIT 100;

-- ============================================
-- FUNCIONES
-- ============================================

-- Función para calcular total de pedido
DELIMITER $$
CREATE FUNCTION calculate_order_total(order_id BIGINT UNSIGNED)
RETURNS DECIMAL(10, 2)
DETERMINISTIC
BEGIN
    DECLARE total DECIMAL(10, 2);
    
    SELECT 
        SUM(oi.subtotal) - o.discount_total + o.tax_total + o.shipping_total INTO total
    FROM `orders` o
    LEFT JOIN `order_items` oi ON o.id = oi.order_id
    WHERE o.id = order_id
    GROUP BY o.id;
    
    RETURN COALESCE(total, 0);
END$$
DELIMITER ;

-- Función para obtener estado del pedido en español
DELIMITER $$
CREATE FUNCTION get_order_status_spanish(status VARCHAR(50))
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

ALTER TABLE `orders` COMMENT = 'Tabla principal de pedidos del sistema';
ALTER TABLE `order_items` COMMENT = 'Items individuales de cada pedido';
ALTER TABLE `payment_transactions` COMMENT = 'Transacciones de pago asociadas a pedidos';
ALTER TABLE `returns` COMMENT = 'Devoluciones y cambios de productos';
ALTER TABLE `coupons` COMMENT = 'Cupones de descuento';
ALTER TABLE `coupon_usage` COMMENT = 'Registro de uso de cupones';
ALTER TABLE `invoices` COMMENT = 'Facturas generadas para pedidos';
ALTER TABLE `order_status_history` COMMENT = 'Historial de cambios de estado de pedidos';
ALTER TABLE `shipping_methods` COMMENT = 'Métodos de envío disponibles';
ALTER TABLE `payment_methods` COMMENT = 'Métodos de pago disponibles';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================