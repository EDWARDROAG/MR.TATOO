-- 20260521000003_create_products.sql
-- CoreX Database

-- ============================================
-- SCRIPT: 20260521000003_create_products.sql
-- DESCRIPCIÓN: Creación de tablas de productos y gestión de inventario
-- FECHA: 2026-05-21
-- AUTOR: Sistema de Base de Datos
-- ============================================

-- ============================================
-- 1. TABLA PRINCIPAL DE PRODUCTOS
-- ============================================

CREATE TABLE IF NOT EXISTS `products` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (UUID()),
    `sku` VARCHAR(100) NOT NULL,
    `barcode` VARCHAR(100) NULL DEFAULT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(280) NOT NULL,
    `short_description` VARCHAR(500) NULL DEFAULT NULL,
    `description` LONGTEXT NULL DEFAULT NULL,
    
    -- Precios
    `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `compare_at_price` DECIMAL(10, 2) NULL DEFAULT NULL, -- Precio de comparación (antes)
    `cost_per_item` DECIMAL(10, 2) NULL DEFAULT NULL, -- Costo por unidad
    `margin` DECIMAL(5, 2) NULL DEFAULT NULL, -- Margen de beneficio
    
    -- Impuestos
    `taxable` BOOLEAN DEFAULT TRUE,
    `tax_rate` DECIMAL(5, 2) DEFAULT 21.00, -- Tasa de impuesto (%)
    `tax_class` VARCHAR(50) DEFAULT 'standard',
    
    -- Stock e inventario
    `stock` INT DEFAULT 0,
    `stock_status` ENUM('in_stock', 'out_of_stock', 'backorder', 'preorder') DEFAULT 'out_of_stock',
    `low_stock_threshold` INT DEFAULT 5,
    `backorder_allowed` BOOLEAN DEFAULT FALSE,
    `sold_individual` BOOLEAN DEFAULT FALSE, -- Solo se puede comprar 1 unidad
    `manage_stock` BOOLEAN DEFAULT TRUE,
    
    -- Dimensiones y peso
    `weight` DECIMAL(10, 2) NULL DEFAULT NULL, -- Peso en gramos
    `weight_unit` ENUM('g', 'kg', 'lb', 'oz') DEFAULT 'g',
    `length` DECIMAL(10, 2) NULL DEFAULT NULL, -- Largo en cm
    `width` DECIMAL(10, 2) NULL DEFAULT NULL, -- Ancho en cm
    `height` DECIMAL(10, 2) NULL DEFAULT NULL, -- Alto en cm
    `dimension_unit` ENUM('cm', 'm', 'in', 'ft') DEFAULT 'cm',
    
    -- Imágenes y medios
    `main_image` VARCHAR(255) NULL DEFAULT NULL,
    `gallery` JSON NULL DEFAULT NULL,
    `video_url` VARCHAR(255) NULL DEFAULT NULL,
    
    -- Estado y visibilidad
    `status` ENUM('active', 'inactive', 'draft', 'archived') DEFAULT 'draft',
    `visibility` ENUM('visible', 'hidden', 'catalog', 'search') DEFAULT 'visible',
    `featured` BOOLEAN DEFAULT FALSE,
    `new` BOOLEAN DEFAULT FALSE,
    `on_sale` BOOLEAN DEFAULT FALSE,
    `best_seller` BOOLEAN DEFAULT FALSE,
    
    -- Fechas especiales
    `publish_date` TIMESTAMP NULL DEFAULT NULL,
    `sale_start_date` TIMESTAMP NULL DEFAULT NULL,
    `sale_end_date` TIMESTAMP NULL DEFAULT NULL,
    
    -- SEO
    `seo_title` VARCHAR(255) NULL DEFAULT NULL,
    `seo_description` TEXT NULL DEFAULT NULL,
    `seo_keywords` TEXT NULL DEFAULT NULL,
    `seo_canonical_url` VARCHAR(500) NULL DEFAULT NULL,
    
    -- Metadatos
    `tags` JSON NULL DEFAULT NULL,
    `attributes` JSON NULL DEFAULT NULL,
    `meta_data` JSON NULL DEFAULT NULL,
    
    -- Reviews y calificaciones
    `rating` DECIMAL(3, 2) DEFAULT 0.00,
    `reviews_count` INT DEFAULT 0,
    
    -- Ventas y rendimiento
    `total_sales` INT DEFAULT 0,
    `total_revenue` DECIMAL(10, 2) DEFAULT 0.00,
    `views_count` INT DEFAULT 0,
    
    -- Auditoría
    `created_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `updated_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `deleted_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    -- Índices y claves
    PRIMARY KEY (`id`),
    UNIQUE KEY `products_sku_unique` (`sku`),
    UNIQUE KEY `products_slug_unique` (`slug`),
    UNIQUE KEY `products_uuid_unique` (`uuid`),
    UNIQUE KEY `products_barcode_unique` (`barcode`),
    KEY `products_name_index` (`name`),
    KEY `products_status_index` (`status`),
    KEY `products_price_index` (`price`),
    KEY `products_stock_index` (`stock`),
    KEY `products_featured_index` (`featured`),
    KEY `products_on_sale_index` (`on_sale`),
    KEY `products_new_index` (`new`),
    KEY `products_best_seller_index` (`best_seller`),
    KEY `products_created_at_index` (`created_at`),
    KEY `products_deleted_at_index` (`deleted_at`),
    KEY `products_publish_date_index` (`publish_date`),
    KEY `products_created_by_foreign` (`created_by`),
    KEY `products_updated_by_foreign` (`updated_by`),
    KEY `products_deleted_by_foreign` (`deleted_by`),
    
    -- Restricciones
    CONSTRAINT `products_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `products_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `products_deleted_by_foreign` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. TABLA DE VARIANTES DE PRODUCTO
-- ============================================

CREATE TABLE IF NOT EXISTS `product_variants` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `sku` VARCHAR(100) NOT NULL,
    `barcode` VARCHAR(100) NULL DEFAULT NULL,
    `name` VARCHAR(255) NOT NULL,
    `attributes` JSON NOT NULL, -- Ej: {"size": "M", "color": "Red"}
    
    -- Precios de variante
    `price` DECIMAL(10, 2) NULL DEFAULT NULL, -- NULL = usa precio del producto
    `compare_at_price` DECIMAL(10, 2) NULL DEFAULT NULL,
    `cost_per_item` DECIMAL(10, 2) NULL DEFAULT NULL,
    
    -- Stock de variante
    `stock` INT DEFAULT 0,
    `stock_status` ENUM('in_stock', 'out_of_stock', 'backorder') DEFAULT 'out_of_stock',
    `low_stock_threshold` INT DEFAULT 5,
    `backorder_allowed` BOOLEAN DEFAULT FALSE,
    
    -- Imagen de variante
    `image` VARCHAR(255) NULL DEFAULT NULL,
    
    -- Peso de variante
    `weight` DECIMAL(10, 2) NULL DEFAULT NULL,
    
    -- Estado
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    
    -- Posición
    `position` INT DEFAULT 0,
    
    -- Auditoría
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `product_variants_sku_unique` (`sku`),
    UNIQUE KEY `product_variants_barcode_unique` (`barcode`),
    UNIQUE KEY `product_variants_product_id_attributes_unique` (`product_id`, `attributes`(255)),
    KEY `product_variants_product_id_index` (`product_id`),
    KEY `product_variants_status_index` (`status`),
    KEY `product_variants_deleted_at_index` (`deleted_at`),
    
    CONSTRAINT `product_variants_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. TABLA DE IMÁGENES DE PRODUCTO
-- ============================================

CREATE TABLE IF NOT EXISTS `product_images` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `variant_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `thumbnail_url` VARCHAR(500) NULL DEFAULT NULL,
    `medium_url` VARCHAR(500) NULL DEFAULT NULL,
    `large_url` VARCHAR(500) NULL DEFAULT NULL,
    `alt_text` VARCHAR(255) NULL DEFAULT NULL,
    `title` VARCHAR(255) NULL DEFAULT NULL,
    `caption` TEXT NULL DEFAULT NULL,
    `position` INT DEFAULT 0,
    `is_main` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    KEY `product_images_product_id_index` (`product_id`),
    KEY `product_images_variant_id_index` (`variant_id`),
    KEY `product_images_is_main_index` (`is_main`),
    KEY `product_images_position_index` (`position`),
    KEY `product_images_deleted_at_index` (`deleted_at`),
    
    CONSTRAINT `product_images_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `product_images_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. TABLA DE CATEGORÍAS DE PRODUCTO
-- ============================================

-- Nota: Esta tabla ya fue creada en el script de categorías
-- Se incluye aquí como referencia

-- ============================================
-- 5. TABLA DE ETIQUETAS DE PRODUCTO
-- ============================================

CREATE TABLE IF NOT EXISTS `product_tags` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `tag` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    KEY `product_tags_product_id_index` (`product_id`),
    KEY `product_tags_tag_index` (`tag`),
    UNIQUE KEY `product_tags_product_id_tag_unique` (`product_id`, `tag`),
    
    CONSTRAINT `product_tags_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. TABLA DE ATRIBUTOS GLOBALES
-- ============================================

CREATE TABLE IF NOT EXISTS `product_attributes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `type` ENUM('text', 'number', 'select', 'multiselect', 'color', 'size', 'boolean', 'date') DEFAULT 'text',
    `is_global` BOOLEAN DEFAULT TRUE,
    `is_filterable` BOOLEAN DEFAULT TRUE,
    `is_visible` BOOLEAN DEFAULT TRUE,
    `position` INT DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `product_attributes_slug_unique` (`slug`),
    KEY `product_attributes_is_filterable_index` (`is_filterable`),
    KEY `product_attributes_position_index` (`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. TABLA DE VALORES DE ATRIBUTOS
-- ============================================

CREATE TABLE IF NOT EXISTS `product_attribute_terms` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `attribute_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` TEXT NULL DEFAULT NULL,
    `color` VARCHAR(20) NULL DEFAULT NULL, -- Para atributos de tipo color
    `image` VARCHAR(255) NULL DEFAULT NULL,
    `position` INT DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `product_attribute_terms_attribute_id_slug_unique` (`attribute_id`, `slug`),
    KEY `product_attribute_terms_position_index` (`position`),
    
    CONSTRAINT `product_attribute_terms_attribute_id_foreign` FOREIGN KEY (`attribute_id`) REFERENCES `product_attributes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. TABLA DE RELACIÓN PRODUCTO-ATRIBUTO
-- ============================================

CREATE TABLE IF NOT EXISTS `product_attribute_values` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `attribute_id` BIGINT UNSIGNED NOT NULL,
    `term_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `value` TEXT NULL DEFAULT NULL, -- Para valores personalizados
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `product_attribute_values_product_id_attribute_id_unique` (`product_id`, `attribute_id`),
    KEY `product_attribute_values_attribute_id_index` (`attribute_id`),
    KEY `product_attribute_values_term_id_index` (`term_id`),
    
    CONSTRAINT `product_attribute_values_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `product_attribute_values_attribute_id_foreign` FOREIGN KEY (`attribute_id`) REFERENCES `product_attributes` (`id`) ON DELETE CASCADE,
    CONSTRAINT `product_attribute_values_term_id_foreign` FOREIGN KEY (`term_id`) REFERENCES `product_attribute_terms` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. TABLA DE RESEÑAS DE PRODUCTOS
-- ============================================

CREATE TABLE IF NOT EXISTS `product_reviews` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `order_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `rating` INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    `title` VARCHAR(255) NULL DEFAULT NULL,
    `comment` TEXT NOT NULL,
    `advantages` TEXT NULL DEFAULT NULL,
    `disadvantages` TEXT NULL DEFAULT NULL,
    `verified_purchase` BOOLEAN DEFAULT FALSE,
    `status` ENUM('pending', 'approved', 'rejected', 'spam') DEFAULT 'pending',
    `helpful_count` INT DEFAULT 0,
    `unhelpful_count` INT DEFAULT 0,
    `images` JSON NULL DEFAULT NULL,
    `moderated_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `moderated_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    KEY `product_reviews_product_id_index` (`product_id`),
    KEY `product_reviews_user_id_index` (`user_id`),
    KEY `product_reviews_status_index` (`status`),
    KEY `product_reviews_rating_index` (`rating`),
    KEY `product_reviews_created_at_index` (`created_at`),
    KEY `product_reviews_order_id_index` (`order_id`),
    KEY `product_reviews_moderated_by_foreign` (`moderated_by`),
    
    CONSTRAINT `product_reviews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `product_reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `product_reviews_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
    CONSTRAINT `product_reviews_moderated_by_foreign` FOREIGN KEY (`moderated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. TABLA DE RELACIONES DE PRODUCTOS
-- ============================================

CREATE TABLE IF NOT EXISTS `product_relations` (
    `product_id` BIGINT UNSIGNED NOT NULL,
    `related_product_id` BIGINT UNSIGNED NOT NULL,
    `relation_type` ENUM('upsell', 'cross_sell', 'related', 'bundle') DEFAULT 'related',
    `position` INT DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`product_id`, `related_product_id`),
    KEY `product_relations_related_product_id_foreign` (`related_product_id`),
    KEY `product_relations_relation_type_index` (`relation_type`),
    
    CONSTRAINT `product_relations_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `product_relations_related_product_id_foreign` FOREIGN KEY (`related_product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. TABLA DE DESCUENTOS POR PRODUCTO
-- ============================================

CREATE TABLE IF NOT EXISTS `product_discounts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `variant_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `discount_type` ENUM('percentage', 'fixed') NOT NULL,
    `discount_value` DECIMAL(10, 2) NOT NULL,
    `start_date` TIMESTAMP NOT NULL,
    `end_date` TIMESTAMP NOT NULL,
    `min_quantity` INT DEFAULT 1,
    `max_quantity` INT NULL DEFAULT NULL,
    `apply_to` ENUM('all', 'first_purchase', 'members_only') DEFAULT 'all',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    KEY `product_discounts_product_id_index` (`product_id`),
    KEY `product_discounts_variant_id_index` (`variant_id`),
    KEY `product_discounts_dates_index` (`start_date`, `end_date`),
    KEY `product_discounts_deleted_at_index` (`deleted_at`),
    
    CONSTRAINT `product_discounts_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `product_discounts_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 12. TABLA DE MOVIMIENTOS DE INVENTARIO
-- ============================================

CREATE TABLE IF NOT EXISTS `inventory_movements` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `variant_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `movement_type` ENUM('purchase', 'sale', 'return', 'adjustment', 'transfer') NOT NULL,
    `quantity` INT NOT NULL,
    `previous_stock` INT NOT NULL,
    `new_stock` INT NOT NULL,
    `reference_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `reference_type` VARCHAR(100) NULL DEFAULT NULL,
    `reason` TEXT NULL DEFAULT NULL,
    `performed_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    KEY `inventory_movements_product_id_index` (`product_id`),
    KEY `inventory_movements_variant_id_index` (`variant_id`),
    KEY `inventory_movements_movement_type_index` (`movement_type`),
    KEY `inventory_movements_created_at_index` (`created_at`),
    KEY `inventory_movements_performed_by_foreign` (`performed_by`),
    
    CONSTRAINT `inventory_movements_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `inventory_movements_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE,
    CONSTRAINT `inventory_movements_performed_by_foreign` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 13. TABLA DE PRECIOS POR CLIENTE (B2B)
-- ============================================

CREATE TABLE IF NOT EXISTS `customer_prices` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `variant_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `customer_id` BIGINT UNSIGNED NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `min_quantity` INT DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `customer_prices_product_id_variant_id_customer_id_unique` (`product_id`, `variant_id`, `customer_id`, `min_quantity`),
    KEY `customer_prices_customer_id_index` (`customer_id`),
    KEY `customer_prices_variant_id_index` (`variant_id`),
    
    CONSTRAINT `customer_prices_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `customer_prices_variant_id_foreign` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE,
    CONSTRAINT `customer_prices_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar atributos globales
INSERT INTO `product_attributes` (`name`, `slug`, `type`, `is_global`, `is_filterable`, `position`) VALUES
('Tamaño', 'size', 'size', TRUE, TRUE, 1),
('Color', 'color', 'color', TRUE, TRUE, 2),
('Material', 'material', 'select', TRUE, TRUE, 3),
('Marca', 'brand', 'select', TRUE, TRUE, 4);

-- Insertar términos de atributos
INSERT INTO `product_attribute_terms` (`attribute_id`, `name`, `slug`, `color`, `position`) VALUES
-- Tamaños
(1, 'XS', 'xs', NULL, 1),
(1, 'S', 's', NULL, 2),
(1, 'M', 'm', NULL, 3),
(1, 'L', 'l', NULL, 4),
(1, 'XL', 'xl', NULL, 5),
(1, 'XXL', 'xxl', NULL, 6),
-- Colores
(2, 'Rojo', 'red', '#FF0000', 1),
(2, 'Azul', 'blue', '#0000FF', 2),
(2, 'Verde', 'green', '#00FF00', 3),
(2, 'Negro', 'black', '#000000', 4),
(2, 'Blanco', 'white', '#FFFFFF', 5),
(2, 'Amarillo', 'yellow', '#FFFF00', 6),
(2, 'Rosa', 'pink', '#FFC0CB', 7),
-- Materiales
(3, 'Algodón', 'cotton', NULL, 1),
(3, 'Poliéster', 'polyester', NULL, 2),
(3, 'Lana', 'wool', NULL, 3),
(3, 'Cuero', 'leather', NULL, 4),
(3, 'Plástico', 'plastic', NULL, 5),
(3, 'Metal', 'metal', NULL, 6),
-- Marcas
(4, 'Nike', 'nike', NULL, 1),
(4, 'Adidas', 'adidas', NULL, 2),
(4, 'Zara', 'zara', NULL, 3),
(4, 'H&M', 'hm', NULL, 4),
(4, 'Apple', 'apple', NULL, 5),
(4, 'Samsung', 'samsung', NULL, 6);

-- ============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

-- Índices para búsquedas en productos
CREATE INDEX idx_products_status_price ON `products`(`status`, `price`);
CREATE INDEX idx_products_featured_status ON `products`(`featured`, `status`);
CREATE INDEX idx_products_on_sale_status ON `products`(`on_sale`, `status`);
CREATE INDEX idx_products_rating ON `products`(`rating`);

-- Índices fulltext para búsqueda
ALTER TABLE `products` ADD FULLTEXT INDEX `idx_products_fulltext` (`name`, `description`, `short_description`);

-- Índices para variantes
CREATE INDEX idx_product_variants_product_status ON `product_variants`(`product_id`, `status`);
CREATE INDEX idx_product_variants_sku ON `product_variants`(`sku`);

-- Índices para reseñas
CREATE INDEX idx_product_reviews_rating_status ON `product_reviews`(`rating`, `status`);
CREATE INDEX idx_product_reviews_product_status ON `product_reviews`(`product_id`, `status`);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para actualizar slug automáticamente
DELIMITER $$
CREATE TRIGGER products_before_insert
BEFORE INSERT ON `products`
FOR EACH ROW
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        SET NEW.slug = LOWER(REPLACE(REPLACE(REPLACE(NEW.name, ' ', '-'), 'á', 'a'), 'é', 'e'));
        SET NEW.slug = REPLACE(REPLACE(REPLACE(NEW.slug, 'í', 'i'), 'ó', 'o'), 'ú', 'u');
        SET NEW.slug = REPLACE(NEW.slug, 'ñ', 'n');
    END IF;
    
    -- Generar SKU si no existe
    IF NEW.sku IS NULL OR NEW.sku = '' THEN
        SET NEW.sku = CONCAT('PRD', LPAD(NEW.id, 8, '0'));
    END IF;
    
    -- Actualizar stock_status basado en stock
    IF NEW.stock <= 0 THEN
        SET NEW.stock_status = 'out_of_stock';
    ELSE
        SET NEW.stock_status = 'in_stock';
    END IF;
    
    -- Actualizar on_sale basado en precios
    IF NEW.compare_at_price IS NOT NULL AND NEW.compare_at_price > NEW.price THEN
        SET NEW.on_sale = TRUE;
    ELSE
        SET NEW.on_sale = FALSE;
    END IF;
END$$
DELIMITER ;

-- Trigger para actualizar stock después de una venta
DELIMITER $$
CREATE TRIGGER update_product_stock_after_order
AFTER INSERT ON `order_items`
FOR EACH ROW
BEGIN
    UPDATE `products` 
    SET `stock` = `stock` - NEW.quantity,
        `total_sales` = `total_sales` + NEW.quantity,
        `total_revenue` = `total_revenue` + (NEW.price * NEW.quantity)
    WHERE `id` = NEW.product_id;
    
    -- Registrar movimiento de inventario
    INSERT INTO `inventory_movements` (
        `product_id`, 
        `movement_type`, 
        `quantity`, 
        `previous_stock`, 
        `new_stock`,
        `reference_id`,
        `reference_type`
    ) VALUES (
        NEW.product_id,
        'sale',
        -NEW.quantity,
        (SELECT stock FROM products WHERE id = NEW.product_id) + NEW.quantity,
        (SELECT stock FROM products WHERE id = NEW.product_id),
        NEW.order_id,
        'order'
    );
END$$
DELIMITER ;

-- Trigger para actualizar rating promedio de producto
DELIMITER $$
CREATE TRIGGER update_product_rating
AFTER INSERT ON `product_reviews`
FOR EACH ROW
BEGIN
    IF NEW.status = 'approved' THEN
        UPDATE `products` 
        SET `rating` = (
            SELECT AVG(rating) 
            FROM `product_reviews` 
            WHERE product_id = NEW.product_id AND status = 'approved'
        ),
        `reviews_count` = (
            SELECT COUNT(*) 
            FROM `product_reviews` 
            WHERE product_id = NEW.product_id AND status = 'approved'
        )
        WHERE `id` = NEW.product_id;
    END IF;
END$$
DELIMITER ;

-- ============================================
-- VISTAS
-- ============================================

-- Vista de productos con información de precios
CREATE OR REPLACE VIEW `product_prices` AS
SELECT 
    p.id,
    p.name,
    p.slug,
    p.price as regular_price,
    p.compare_at_price,
    CASE 
        WHEN p.compare_at_price IS NOT NULL AND p.compare_at_price > p.price 
        THEN ROUND(((p.compare_at_price - p.price) / p.compare_at_price) * 100, 2)
        ELSE 0
    END as discount_percentage,
    p.on_sale,
    p.stock,
    p.stock_status,
    p.rating,
    p.reviews_count
FROM `products` p
WHERE p.deleted_at IS NULL;

-- Vista de productos más vendidos
CREATE OR REPLACE VIEW `best_selling_products` AS
SELECT 
    p.id,
    p.name,
    p.slug,
    p.price,
    p.total_sales as quantity_sold,
    p.total_revenue,
    p.stock,
    p.rating
FROM `products` p
WHERE p.deleted_at IS NULL AND p.total_sales > 0
ORDER BY p.total_sales DESC
LIMIT 100;

-- Vista de productos con bajo stock
CREATE OR REPLACE VIEW `low_stock_products` AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.stock,
    p.low_stock_threshold,
    CASE 
        WHEN p.stock <= 0 THEN 'Sin stock'
        WHEN p.stock <= p.low_stock_threshold THEN 'Stock bajo'
        ELSE 'Stock normal'
    END as stock_status
FROM `products` p
WHERE p.deleted_at IS NULL 
    AND p.manage_stock = 1 
    AND p.stock <= p.low_stock_threshold
ORDER BY p.stock ASC;

-- ============================================
-- FUNCIONES
-- ============================================

-- Función para obtener precio con descuento
DELIMITER $$
CREATE FUNCTION get_discounted_price(
    product_id BIGINT UNSIGNED,
    quantity INT
) 
RETURNS DECIMAL(10, 2)
DETERMINISTIC
BEGIN
    DECLARE base_price DECIMAL(10, 2);
    DECLARE discounted_price DECIMAL(10, 2);
    DECLARE discount_value DECIMAL(10, 2);
    DECLARE discount_type VARCHAR(20);
    
    -- Obtener precio base
    SELECT price INTO base_price FROM products WHERE id = product_id;
    SET discounted_price = base_price;
    
    -- Buscar descuento activo
    SELECT discount_value, discount_type INTO discount_value, discount_type
    FROM product_discounts
    WHERE product_id = product_id 
        AND start_date <= NOW() 
        AND end_date >= NOW()
        AND min_quantity <= quantity
        AND (max_quantity IS NULL OR max_quantity >= quantity)
    LIMIT 1;
    
    -- Aplicar descuento si existe
    IF discount_value IS NOT NULL THEN
        IF discount_type = 'percentage' THEN
            SET discounted_price = base_price * (1 - discount_value / 100);
        ELSE
            SET discounted_price = base_price - discount_value;
        END IF;
    END IF;
    
    RETURN GREATEST(discounted_price, 0);
END$$
DELIMITER ;

-- ============================================
-- COMENTARIOS DE TABLAS
-- ============================================

ALTER TABLE `products` COMMENT = 'Tabla principal de productos del sistema';
ALTER TABLE `product_variants` COMMENT = 'Variantes de productos (talla, color, etc)';
ALTER TABLE `product_images` COMMENT = 'Galería de imágenes de productos';
ALTER TABLE `product_tags` COMMENT = 'Etiquetas asociadas a productos';
ALTER TABLE `product_attributes` COMMENT = 'Atributos globales de productos';
ALTER TABLE `product_attribute_terms` COMMENT = 'Valores posibles de atributos';
ALTER TABLE `product_attribute_values` COMMENT = 'Valores de atributos asignados a productos';
ALTER TABLE `product_reviews` COMMENT = 'Reseñas y valoraciones de productos';
ALTER TABLE `product_relations` COMMENT = 'Relaciones entre productos (upsell, cross-sell, relacionados)';
ALTER TABLE `product_discounts` COMMENT = 'Descuentos especiales por producto';
ALTER TABLE `inventory_movements` COMMENT = 'Historial de movimientos de inventario';
ALTER TABLE `customer_prices` COMMENT = 'Precios personal