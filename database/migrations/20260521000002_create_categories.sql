-- 20260521000002_create_categories.sql
-- CoreX Database

-- ============================================
-- SCRIPT: 20260521000002_create_categories.sql
-- DESCRIPCIÓN: Creación de tablas de categorías y gestión jerárquica
-- FECHA: 2026-05-21
-- AUTOR: Sistema de Base de Datos
-- ============================================

-- ============================================
-- 1. TABLA PRINCIPAL DE CATEGORÍAS
-- ============================================

CREATE TABLE IF NOT EXISTS `categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (UUID()),
    `parent_id` BIGINT UNSIGNED NULL DEFAULT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` TEXT NULL DEFAULT NULL,
    `short_description` VARCHAR(255) NULL DEFAULT NULL,
    
    -- Imágenes y medios
    `image` VARCHAR(255) NULL DEFAULT NULL,
    `banner_image` VARCHAR(255) NULL DEFAULT NULL,
    `icon` VARCHAR(100) NULL DEFAULT NULL,
    `icon_svg` TEXT NULL DEFAULT NULL,
    
    -- Posicionamiento y orden
    `order` INT DEFAULT 0,
    `level` INT DEFAULT 0,
    `path` VARCHAR(500) NULL DEFAULT NULL, -- Ruta jerárquica (ej: 1/5/12)
    
    -- SEO y metadatos
    `seo_title` VARCHAR(255) NULL DEFAULT NULL,
    `seo_description` TEXT NULL DEFAULT NULL,
    `seo_keywords` TEXT NULL DEFAULT NULL,
    `seo_canonical_url` VARCHAR(500) NULL DEFAULT NULL,
    
    -- Estado y visibilidad
    `status` ENUM('active', 'inactive', 'draft') DEFAULT 'active',
    `is_visible` BOOLEAN DEFAULT TRUE,
    `show_in_menu` BOOLEAN DEFAULT TRUE,
    `show_in_homepage` BOOLEAN DEFAULT FALSE,
    `is_featured` BOOLEAN DEFAULT FALSE,
    
    -- Métricas
    `product_count` INT DEFAULT 0,
    `total_products` INT DEFAULT 0,
    `total_sales` DECIMAL(10, 2) DEFAULT 0.00,
    `total_revenue` DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Configuración de productos
    `default_sort` VARCHAR(50) DEFAULT 'relevance',
    `products_per_page` INT DEFAULT 12,
    `filter_layout` ENUM('grid', 'list', 'both') DEFAULT 'grid',
    
    -- Filtros y atributos
    `available_filters` JSON NULL DEFAULT NULL, -- Filtros disponibles para esta categoría
    `custom_attributes` JSON NULL DEFAULT NULL, -- Atributos personalizados
    
    -- Metadatos de auditoría
    `created_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `updated_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `deleted_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    -- Índices y claves
    PRIMARY KEY (`id`),
    UNIQUE KEY `categories_slug_unique` (`slug`),
    UNIQUE KEY `categories_uuid_unique` (`uuid`),
    KEY `categories_parent_id_index` (`parent_id`),
    KEY `categories_status_index` (`status`),
    KEY `categories_order_index` (`order`),
    KEY `categories_level_index` (`level`),
    KEY `categories_created_at_index` (`created_at`),
    KEY `categories_deleted_at_index` (`deleted_at`),
    KEY `categories_path_index` (`path`(191)),
    KEY `categories_is_visible_index` (`is_visible`),
    KEY `categories_show_in_menu_index` (`show_in_menu`),
    KEY `categories_is_featured_index` (`is_featured`),
    KEY `categories_created_by_foreign` (`created_by`),
    KEY `categories_updated_by_foreign` (`updated_by`),
    KEY `categories_deleted_by_foreign` (`deleted_by`),
    
    -- Restricciones
    CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
    CONSTRAINT `categories_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `categories_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `categories_deleted_by_foreign` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. TABLA DE RELACIÓN CATEGORÍA-PRODUCTO
-- ============================================

CREATE TABLE IF NOT EXISTS `category_product` (
    `category_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `is_primary` BOOLEAN DEFAULT FALSE,
    `position` INT DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`category_id`, `product_id`),
    KEY `category_product_product_id_foreign` (`product_id`),
    KEY `category_product_is_primary_index` (`is_primary`),
    KEY `category_product_position_index` (`position`),
    
    CONSTRAINT `category_product_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
    CONSTRAINT `category_product_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. TABLA DE ATRIBUTOS DE CATEGORÍA
-- ============================================

CREATE TABLE IF NOT EXISTS `category_attributes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `category_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `type` ENUM('text', 'number', 'select', 'multiselect', 'color', 'size', 'boolean', 'date') DEFAULT 'text',
    `is_required` BOOLEAN DEFAULT FALSE,
    `is_filterable` BOOLEAN DEFAULT TRUE,
    `is_visible` BOOLEAN DEFAULT TRUE,
    `position` INT DEFAULT 0,
    `options` JSON NULL DEFAULT NULL, -- Opciones para select/multiselect
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `category_attributes_category_id_slug_unique` (`category_id`, `slug`),
    KEY `category_attributes_is_filterable_index` (`is_filterable`),
    KEY `category_attributes_position_index` (`position`),
    
    CONSTRAINT `category_attributes_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. TABLA DE VALORES DE ATRIBUTOS POR PRODUCTO
-- ============================================

CREATE TABLE IF NOT EXISTS `product_attribute_values` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `attribute_id` BIGINT UNSIGNED NOT NULL,
    `value` TEXT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `product_attribute_values_product_id_attribute_id_unique` (`product_id`, `attribute_id`),
    KEY `product_attribute_values_attribute_id_foreign` (`attribute_id`),
    
    CONSTRAINT `product_attribute_values_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `product_attribute_values_attribute_id_foreign` FOREIGN KEY (`attribute_id`) REFERENCES `category_attributes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. TABLA DE MARCAS
-- ============================================

CREATE TABLE IF NOT EXISTS `brands` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (UUID()),
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` TEXT NULL DEFAULT NULL,
    `logo` VARCHAR(255) NULL DEFAULT NULL,
    `banner` VARCHAR(255) NULL DEFAULT NULL,
    `website` VARCHAR(255) NULL DEFAULT NULL,
    `email` VARCHAR(255) NULL DEFAULT NULL,
    `phone` VARCHAR(20) NULL DEFAULT NULL,
    
    -- SEO
    `seo_title` VARCHAR(255) NULL DEFAULT NULL,
    `seo_description` TEXT NULL DEFAULT NULL,
    
    -- Estado
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `is_featured` BOOLEAN DEFAULT FALSE,
    `order` INT DEFAULT 0,
    
    -- Métricas
    `product_count` INT DEFAULT 0,
    
    -- Auditoría
    `created_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `updated_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `brands_slug_unique` (`slug`),
    UNIQUE KEY `brands_uuid_unique` (`uuid`),
    KEY `brands_status_index` (`status`),
    KEY `brands_is_featured_index` (`is_featured`),
    KEY `brands_order_index` (`order`),
    KEY `brands_deleted_at_index` (`deleted_at`),
    KEY `brands_created_by_foreign` (`created_by`),
    KEY `brands_updated_by_foreign` (`updated_by`),
    
    CONSTRAINT `brands_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `brands_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. TABLA DE RELACIÓN MARCA-CATEGORÍA
-- ============================================

CREATE TABLE IF NOT EXISTS `brand_category` (
    `brand_id` BIGINT UNSIGNED NOT NULL,
    `category_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`brand_id`, `category_id`),
    KEY `brand_category_category_id_foreign` (`category_id`),
    
    CONSTRAINT `brand_category_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE CASCADE,
    CONSTRAINT `brand_category_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. TABLA DE PLANTILLAS DE CATEGORÍA
-- ============================================

CREATE TABLE IF NOT EXISTS `category_templates` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` TEXT NULL DEFAULT NULL,
    `layout` JSON NULL DEFAULT NULL, -- Configuración de layout
    `sections` JSON NULL DEFAULT NULL, -- Secciones personalizadas
    `is_default` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `category_templates_slug_unique` (`slug`),
    KEY `category_templates_is_default_index` (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. TABLA DE ASIGNACIÓN DE PLANTILLA A CATEGORÍA
-- ============================================

CREATE TABLE IF NOT EXISTS `category_template_assignments` (
    `category_id` BIGINT UNSIGNED NOT NULL,
    `template_id` BIGINT UNSIGNED NOT NULL,
    `device_type` ENUM('desktop', 'tablet', 'mobile', 'all') DEFAULT 'all',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`category_id`, `template_id`, `device_type`),
    KEY `category_template_assignments_template_id_foreign` (`template_id`),
    
    CONSTRAINT `category_template_assignments_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
    CONSTRAINT `category_template_assignments_template_id_foreign` FOREIGN KEY (`template_id`) REFERENCES `category_templates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. TABLA DE HISTORIAL DE CATEGORÍAS
-- ============================================

CREATE TABLE IF NOT EXISTS `categories_history` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `category_id` BIGINT UNSIGNED NOT NULL,
    `action` ENUM('create', 'update', 'delete', 'restore') NOT NULL,
    `old_data` JSON NULL DEFAULT NULL,
    `new_data` JSON NULL DEFAULT NULL,
    `changed_by` BIGINT UNSIGNED NULL DEFAULT NULL,
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    `user_agent` TEXT NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`),
    KEY `categories_history_category_id_index` (`category_id`),
    KEY `categories_history_action_index` (`action`),
    KEY `categories_history_created_at_index` (`created_at`),
    KEY `categories_history_changed_by_foreign` (`changed_by`),
    
    CONSTRAINT `categories_history_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
    CONSTRAINT `categories_history_changed_by_foreign` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERCIÓN DE DATOS INICIALES
-- ============================================

-- Insertar categorías principales
INSERT INTO `categories` (`name`, `slug`, `description`, `level`, `order`, `status`, `is_visible`, `show_in_menu`) VALUES
('Electrónica', 'electronica', 'Productos electrónicos, dispositivos y gadgets', 0, 1, 'active', TRUE, TRUE),
('Ropa y Moda', 'ropa-moda', 'Prendas de vestir, calzado y accesorios de moda', 0, 2, 'active', TRUE, TRUE),
('Hogar y Jardín', 'hogar-jardin', 'Muebles, decoración y artículos para el hogar y jardín', 0, 3, 'active', TRUE, TRUE),
('Deportes', 'deportes', 'Equipamiento deportivo, ropa deportiva y accesorios', 0, 4, 'active', TRUE, TRUE),
('Libros', 'libros', 'Libros, ebooks, audiolibros y material educativo', 0, 5, 'active', TRUE, TRUE),
('Juguetes', 'juguetes', 'Juguetes y juegos para todas las edades', 0, 6, 'active', TRUE, TRUE),
('Salud y Belleza', 'salud-belleza', 'Productos de cuidado personal, cosméticos y salud', 0, 7, 'active', TRUE, TRUE),
('Alimentación', 'alimentacion', 'Alimentos, bebidas y productos gourmet', 0, 8, 'active', TRUE, TRUE);

-- Insertar subcategorías de Electrónica
INSERT INTO `categories` (`parent_id`, `name`, `slug`, `description`, `level`, `order`, `status`) VALUES
(1, 'Teléfonos Móviles', 'telefonos-moviles', 'Smartphones y teléfonos móviles', 1, 1, 'active'),
(1, 'Ordenadores', 'ordenadores', 'Laptops, desktops y componentes', 1, 2, 'active'),
(1, 'Tablets', 'tablets', 'Tablets y accesorios', 1, 3, 'active'),
(1, 'Audio', 'audio', 'Auriculares, parlantes y equipos de sonido', 1, 4, 'active'),
(1, 'Televisores', 'televisores', 'TVs y home theater', 1, 5, 'active'),
(1, 'Cámaras', 'camaras', 'Cámaras fotográficas y de video', 1, 6, 'active'),
(1, 'Videojuegos', 'videojuegos', 'Consolas y videojuegos', 1, 7, 'active'),
(1, 'Accesorios', 'accesorios-electronica', 'Cargadores, cables y fundas', 1, 8, 'active');

-- Insertar subcategorías de Ropa y Moda
INSERT INTO `categories` (`parent_id`, `name`, `slug`, `description`, `level`, `order`, `status`) VALUES
(2, 'Hombre', 'hombre', 'Ropa y accesorios para hombre', 1, 1, 'active'),
(2, 'Mujer', 'mujer', 'Ropa y accesorios para mujer', 1, 2, 'active'),
(2, 'Niños', 'ninos', 'Ropa y accesorios para niños', 1, 3, 'active'),
(2, 'Calzado', 'calzado', 'Zapatos, zapatillas y botas', 1, 4, 'active'),
(2, 'Accesorios', 'accesorios-moda', 'Bolsos, joyas y complementos', 1, 5, 'active'),
(2, 'Deportivo', 'deportivo-moda', 'Ropa deportiva y athleisure', 1, 6, 'active');

-- Insertar marcas iniciales
INSERT INTO `brands` (`name`, `slug`, `description`, `status`, `is_featured`, `order`) VALUES
('Apple', 'apple', 'Tecnología innovadora', 'active', TRUE, 1),
('Samsung', 'samsung', 'Electrónica de consumo', 'active', TRUE, 2),
('Sony', 'sony', 'Entretenimiento y electrónica', 'active', TRUE, 3),
('Nike', 'nike', 'Ropa y calzado deportivo', 'active', TRUE, 4),
('Adidas', 'adidas', 'Ropa y calzado deportivo', 'active', TRUE, 5),
('Zara', 'zara', 'Moda rápida', 'active', TRUE, 6),
('LG', 'lg', 'Electrodomésticos y electrónica', 'active', FALSE, 7),
('HP', 'hp', 'Ordenadores e impresoras', 'active', FALSE, 8),
('Dell', 'dell', 'Ordenadores y periféricos', 'active', FALSE, 9),
('Lenovo', 'lenovo', 'Ordenadores y tablets', 'active', FALSE, 10);

-- Insertar plantillas de categoría
INSERT INTO `category_templates` (`name`, `slug`, `description`, `is_default`) VALUES
('Estándar', 'standard', 'Plantilla estándar con grid de productos', TRUE),
('Destacados', 'featured', 'Plantilla con productos destacados', FALSE),
('Catálogo', 'catalog', 'Plantilla estilo catálogo', FALSE),
('Minimalista', 'minimal', 'Plantilla minimalista', FALSE);

-- ============================================
-- FUNCIONES Y PROCEDIMIENTOS ALMACENADOS
-- ============================================

-- Función para obtener la ruta completa de una categoría
DELIMITER $$
CREATE FUNCTION get_category_path(category_id BIGINT UNSIGNED)
RETURNS VARCHAR(500)
DETERMINISTIC
BEGIN
    DECLARE path VARCHAR(500);
    DECLARE temp_id BIGINT UNSIGNED;
    DECLARE temp_name VARCHAR(100);
    
    SET path = '';
    SET temp_id = category_id;
    
    WHILE temp_id IS NOT NULL DO
        SELECT name, parent_id INTO temp_name, temp_id
        FROM categories
        WHERE id = temp_id;
        
        IF path = '' THEN
            SET path = temp_name;
        ELSE
            SET path = CONCAT(temp_name, ' > ', path);
        END IF;
    END WHILE;
    
    RETURN path;
END$$
DELIMITER ;

-- Procedimiento para actualizar el nivel y path de categorías
DELIMITER $$
CREATE PROCEDURE update_category_hierarchy()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE cat_id BIGINT UNSIGNED;
    DECLARE cat_parent BIGINT UNSIGNED;
    DECLARE cat_level INT;
    DECLARE cat_path VARCHAR(500);
    
    DECLARE cur CURSOR FOR SELECT id, parent_id FROM categories WHERE deleted_at IS NULL;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO cat_id, cat_parent;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Calcular nivel
        SET cat_level = 0;
        SET cat_path = '';
        CALL calculate_category_level(cat_id, cat_parent, cat_level, cat_path);
        
        UPDATE categories 
        SET level = cat_level, path = cat_path 
        WHERE id = cat_id;
    END LOOP;
    
    CLOSE cur;
END$$
DELIMITER ;

-- Función para obtener subcategorías recursivamente
DELIMITER $$
CREATE FUNCTION get_subcategories(parent_id BIGINT UNSIGNED)
RETURNS TEXT
DETERMINISTIC
BEGIN
    DECLARE result TEXT DEFAULT '';
    DECLARE temp_id BIGINT UNSIGNED;
    DECLARE done INT DEFAULT FALSE;
    
    DECLARE cur CURSOR FOR SELECT id FROM categories WHERE parent_id = parent_id AND status = 'active' AND deleted_at IS NULL;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO temp_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        IF result = '' THEN
            SET result = temp_id;
        ELSE
            SET result = CONCAT(result, ',', temp_id);
        END IF;
        
        SET result = CONCAT(result, ',', get_subcategories(temp_id));
    END LOOP;
    
    CLOSE cur;
    
    RETURN result;
END$$
DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para actualizar slug automáticamente
DELIMITER $$
CREATE TRIGGER categories_before_insert
BEFORE INSERT ON `categories`
FOR EACH ROW
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        SET NEW.slug = LOWER(REPLACE(REPLACE(REPLACE(NEW.name, ' ', '-'), 'á', 'a'), 'é', 'e'));
        SET NEW.slug = REPLACE(REPLACE(REPLACE(NEW.slug, 'í', 'i'), 'ó', 'o'), 'ú', 'u');
    END IF;
    
    -- Calcular nivel basado en parent_id
    IF NEW.parent_id IS NULL THEN
        SET NEW.level = 0;
    ELSE
        SELECT level + 1 INTO NEW.level FROM categories WHERE id = NEW.parent_id;
    END IF;
END$$
DELIMITER ;

-- Trigger para actualizar contador de productos
DELIMITER $$
CREATE TRIGGER update_category_product_count
AFTER INSERT ON `category_product`
FOR EACH ROW
BEGIN
    UPDATE `categories` 
    SET `product_count` = (
        SELECT COUNT(*) FROM `category_product` WHERE `category_id` = NEW.category_id
    )
    WHERE `id` = NEW.category_id;
    
    -- Actualizar categorías padre recursivamente
    CALL update_parent_category_counts(NEW.category_id);
END$$
DELIMITER ;

-- ============================================
-- VISTAS
-- ============================================

-- Vista de categorías con información de subcategorías
CREATE OR REPLACE VIEW `categories_with_subcategories` AS
SELECT 
    c1.*,
    COUNT(DISTINCT c2.id) as subcategories_count,
    GROUP_CONCAT(DISTINCT c2.name ORDER BY c2.order SEPARATOR ', ') as subcategories_names
FROM `categories` c1
LEFT JOIN `categories` c2 ON c2.parent_id = c1.id AND c2.deleted_at IS NULL
WHERE c1.deleted_at IS NULL
GROUP BY c1.id;

-- Vista de jerarquía completa de categorías
CREATE OR REPLACE VIEW `category_hierarchy` AS
WITH RECURSIVE category_tree AS (
    -- Nivel raíz
    SELECT 
        id,
        parent_id,
        name,
        slug,
        level,
        order,
        status,
        CAST(name AS CHAR(1000)) as path_name,
        CAST(id AS CHAR(1000)) as path_id,
        1 as depth
    FROM `categories`
    WHERE parent_id IS NULL AND deleted_at IS NULL
    
    UNION ALL
    
    -- Niveles hijos recursivos
    SELECT 
        c.id,
        c.parent_id,
        c.name,
        c.slug,
        c.level,
        c.order,
        c.status,
        CONCAT(ct.path_name, ' > ', c.name),
        CONCAT(ct.path_id, '/', c.id),
        ct.depth + 1
    FROM `categories` c
    INNER JOIN category_tree ct ON c.parent_id = ct.id
    WHERE c.deleted_at IS NULL
)
SELECT * FROM category_tree
ORDER BY path_name;

-- Vista de estadísticas de categorías
CREATE OR REPLACE VIEW `category_statistics` AS
SELECT 
    COUNT(*) as total_categories,
    SUM(CASE WHEN parent_id IS NULL THEN 1 ELSE 0 END) as root_categories,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_categories,
    SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_categories,
    SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) as featured_categories,
    SUM(product_count) as total_products,
    AVG(product_count) as avg_products_per_category,
    MAX(level) as max_depth
FROM `categories`
WHERE deleted_at IS NULL;

-- ============================================
-- ÍNDICES ADICIONALES
-- ============================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_categories_parent_status ON `categories`(`parent_id`, `status`);
CREATE INDEX idx_categories_level_status ON `categories`(`level`, `status`);
CREATE INDEX idx_categories_order_status ON `categories`(`order`, `status`);
CREATE INDEX idx_category_product_category_position ON `category_product`(`category_id`, `position`);
CREATE INDEX idx_category_product_product_category ON `category_product`(`product_id`, `category_id`);

-- Índices fulltext para búsqueda en categorías
ALTER TABLE `categories` ADD FULLTEXT INDEX `idx_categories_fulltext` (`name`, `description`);

-- ============================================
-- COMENTARIOS DE TABLAS
-- ============================================

ALTER TABLE `categories` COMMENT = 'Tabla principal de categorías con estructura jerárquica';
ALTER TABLE `category_product` COMMENT = 'Relación entre categorías y productos';
ALTER TABLE `category_attributes` COMMENT = 'Atributos personalizables por categoría';
ALTER TABLE `product_attribute_values` COMMENT = 'Valores de atributos por producto';
ALTER TABLE `brands` COMMENT = 'Marcas de productos';
ALTER TABLE `brand_category` COMMENT = 'Relación entre marcas y categorías';
ALTER TABLE `category_templates` COMMENT = 'Plantillas de diseño por categoría';
ALTER TABLE `category_template_assignments` COMMENT = 'Asignación de plantillas a categorías';
ALTER TABLE `categories_history` COMMENT = 'Historial de cambios en categorías';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================