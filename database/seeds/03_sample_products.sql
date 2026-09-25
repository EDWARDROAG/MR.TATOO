-- 03_sample_products.sql
-- CoreX Database

-- ============================================
-- SCRIPT: database/seeds/03_sample_products.sql
-- DESCRIPCIÓN: Seeding de productos de ejemplo
-- FECHA: 2026-05-21
-- AUTOR: Sistema de Base de Datos
-- ============================================

-- ============================================
-- 1. PRODUCTOS DE ELECTRÓNICA
-- ============================================

-- Obtener IDs de categorías
SET @electronics_id = (SELECT id FROM categories WHERE slug = 'electronica' LIMIT 1);
SET @phones_id = (SELECT id FROM categories WHERE slug = 'telefonos-moviles' LIMIT 1);
SET @laptops_id = (SELECT id FROM categories WHERE slug = 'ordenadores' LIMIT 1);
SET @audio_id = (SELECT id FROM categories WHERE slug = 'audio' LIMIT 1);

-- Obtener IDs de marcas
SET @apple_id = (SELECT id FROM brands WHERE slug = 'apple' LIMIT 1);
SET @samsung_id = (SELECT id FROM brands WHERE slug = 'samsung' LIMIT 1);
SET @sony_id = (SELECT id FROM brands WHERE slug = 'sony' LIMIT 1);
SET @xiaomi_id = (SELECT id FROM brands WHERE slug = 'xiaomi' LIMIT 1);
SET @hp_id = (SELECT id FROM brands WHERE slug = 'hp' LIMIT 1);

-- ============================================
-- Producto 1: iPhone 15 Pro
-- ============================================
INSERT INTO `products` (
    `sku`, `name`, `slug`, `short_description`, `description`, 
    `price`, `compare_at_price`, `cost_per_item`, `margin`,
    `stock`, `stock_status`, `low_stock_threshold`,
    `weight`, `status`, `featured`, `new`, `on_sale`,
    `brand_id`, `main_image`, `tags`, `rating`, `views_count`,
    `seo_title`, `seo_description`,
    `created_at`, `updated_at`
) VALUES (
    'APP-IP15P-128', 'iPhone 15 Pro', 'iphone-15-pro',
    'El iPhone 15 Pro con tecnología revolucionaria y diseño premium',
    'El iPhone 15 Pro presenta un diseño de titanio, chip A17 Pro, sistema de cámaras profesionales y USB-C. La pantalla Super Retina XDR de 6.1 pulgadas con ProMotion ofrece una experiencia visual increíble. La cámara principal de 48MP captura fotos con calidad profesional.',
    1099.99, 1299.99, 800.00, 27.27,
    50, 'in_stock', 10,
    187, 'active', 1, 1, 1,
    @apple_id, '/images/products/iphone15pro.jpg',
    JSON_ARRAY('iphone', 'apple', 'smartphone', '5g'),
    4.8, 15000,
    'iPhone 15 Pro - Apple | Oferta Especial',
    'Compra el nuevo iPhone 15 Pro con chip A17 Pro, cámara de 48MP y diseño en titanio. Envío gratis y garantía oficial.',
    NOW(), NOW()
);

-- Producto 2: Samsung Galaxy S24 Ultra
INSERT INTO `products` (
    `sku`, `name`, `slug`, `short_description`, `description`,
    `price`, `compare_at_price`, `cost_per_item`, `margin`,
    `stock`, `stock_status`, `low_stock_threshold`,
    `weight`, `status`, `featured`, `new`, `on_sale`,
    `brand_id`, `main_image`, `tags`, `rating`, `views_count`,
    `seo_title`, `seo_description`,
    `created_at`, `updated_at`
) VALUES (
    'SAM-S24U-256', 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra',
    'El mejor smartphone Android con cámara de 200MP y S Pen integrado',
    'El Galaxy S24 Ultra redefine lo que es posible con su cámara de 200MP, zoom espacial de 100x, procesador Snapdragon 8 Gen 3 y batería de 5000mAh. Incluye S Pen para máxima productividad y pantalla Dynamic AMOLED 2X de 6.8 pulgadas.',
    1249.99, 1399.99, 950.00, 24.00,
    35, 'in_stock', 10,
    232, 'active', 1, 1, 1,
    @samsung_id, '/images/products/s24ultra.jpg',
    JSON_ARRAY('samsung', 'galaxy', 'smartphone', 'android'),
    4.7, 12000,
    'Samsung Galaxy S24 Ultra - 200MP | Oferta',
    'Descubre el Samsung Galaxy S24 Ultra con cámara de 200MP, S Pen y batería de larga duración. Compra ahora con envío gratis.',
    NOW(), NOW()
);

-- Producto 3: MacBook Pro M3
INSERT INTO `products` (
    `sku`, `name`, `slug`, `short_description`, `description`,
    `price`, `compare_at_price`, `stock`, `weight`,
    `status`, `featured`, `brand_id`, `main_image`, `tags`, `rating`,
    `created_at`, `updated_at`
) VALUES (
    'APP-MBP-M3-14', 'MacBook Pro 14" M3', 'macbook-pro-m3',
    'El MacBook Pro más potente con chip M3, perfecto para profesionales',
    'El nuevo MacBook Pro con chip M3 ofrece un rendimiento revolucionario con CPU de 12 núcleos, GPU de 18 núcleos y 36GB de memoria unificada. Pantalla Liquid Retina XDR de 14.2 pulgadas, batería para todo el día y sistema de refrigeración activa.',
    1999.99, 2299.99, 25, 1600,
    'active', 1, @apple_id, '/images/products/macbook-m3.jpg',
    JSON_ARRAY('macbook', 'apple', 'laptop', 'm3'),
    4.9, NOW(), NOW()
);

-- Producto 4: Sony WH-1000XM5
INSERT INTO `products` (
    `sku`, `name`, `slug`, `short_description`, `description`,
    `price`, `compare_at_price`, `stock`, `weight`,
    `status`, `featured`, `brand_id`, `main_image`, `tags`, `rating`,
    `created_at`, `updated_at`
) VALUES (
    'SNY-WH1000XM5', 'Sony WH-1000XM5', 'sony-wh-1000xm5',
    'Los mejores auriculares con cancelación de ruido líder en la industria',
    'Los Sony WH-1000XM5 cuentan con la mejor cancelación de ruido del mercado, sonido de alta resolución, batería de 30 horas y carga rápida. Diseño ergonómico y controles táctiles intuitivos.',
    399.99, 499.99, 60, 250,
    'active', 1, @sony_id, '/images/products/sony-xm5.jpg',
    JSON_ARRAY('sony', 'auriculares', 'noise-cancelling', 'bluetooth'),
    4.8, NOW(), NOW()
);

-- ============================================
-- 2. PRODUCTOS DE ROPA Y MODA
-- ============================================

SET @fashion_id = (SELECT id FROM categories WHERE slug = 'ropa-moda' LIMIT 1);
SET @mens_id = (SELECT id FROM categories WHERE slug = 'hombre' LIMIT 1);
SET @womens_id = (SELECT id FROM categories WHERE slug = 'mujer' LIMIT 1);
SET @sportswear_id = (SELECT id FROM categories WHERE slug = 'deportivo-moda' LIMIT 1);

SET @nike_id = (SELECT id FROM brands WHERE slug = 'nike' LIMIT 1);
SET @adidas_id = (SELECT id FROM brands WHERE slug = 'adidas' LIMIT 1);
SET @zara_id = (SELECT id FROM brands WHERE slug = 'zara' LIMIT 1);

-- Producto 5: Nike Air Max
INSERT INTO `products` (
    `sku`, `name`, `slug`, `short_description`, `description`,
    `price`, `compare_at_price`, `stock`, `weight`,
    `status`, `featured`, `brand_id`, `main_image`, `tags`, `rating`,
    `created_at`, `updated_at`
) VALUES (
    'NKE-AIRMAX-90', 'Nike Air Max 90', 'nike-air-max-90',
    'Zapatillas icónicas con amortiguación Air Max',
    'Las Nike Air Max 90 combinan estilo retro con comodidad moderna. Amortiguación Air Max visible, parte superior de malla y cuero sintético. Perfectas para uso diario y deporte casual.',
    129.99, 159.99, 100, 400,
    'active', 1, @nike_id, '/images/products/airmax90.jpg',
    JSON_ARRAY('nike', 'zapatillas', 'airmax', 'deporte'),
    4.7, NOW(), NOW()
);

-- Producto 6: Camisa Zara Hombre
INSERT INTO `products` (
    `sku`, `name`, `slug`, `short_description`, `description`,
    `price`, `stock`, `weight`,
    `status`, `brand_id`, `main_image`, `tags`, `rating`,
    `created_at`, `updated_at`
) VALUES (
    'ZRA-CAM-BLANCA', 'Camisa Blanca Slim Fit', 'camisa-blanca-slim-fit',
    'Camisa clásica de vestir slim fit 100% algodón',
    'Camisa de vestir slim fit confeccionada en algodón egipcio de alta calidad. Cuello clásico, botones de nácar y puños ajustables. Ideal para ocasiones formales o uso diario elegante.',
    39.99, 200, 250,
    'active', @zara_id, '/images/products/camisa-blanca.jpg',
    JSON_ARRAY('zara', 'camisa', 'vestir', 'hombre'),
    4.5, NOW(), NOW()
);

-- ============================================
-- 3. PRODUCTOS DE HOGAR
-- ============================================

SET @home_id = (SELECT id FROM categories WHERE slug = 'hogar-jardin' LIMIT 1);
SET @furniture_id = (SELECT id FROM categories WHERE slug = 'muebles' LIMIT 1);
SET @kitchen_id = (SELECT id FROM categories WHERE slug = 'cocina' LIMIT 1);

SET @ikea_id = (SELECT id FROM brands WHERE slug = 'ikea' LIMIT 1);
SET @bosch_id = (SELECT id FROM brands WHERE slug = 'bosch' LIMIT 1);

-- Producto 7: Lavadora Bosch
INSERT INTO `products` (
    `sku`, `name`, `slug`, `short_description`, `description`,
    `price`, `compare_at_price`, `stock`, `weight`,
    `status`, `featured`, `brand_id`, `main_image`, `tags`, `rating`,
    `created_at`, `updated_at`
) VALUES (
    'BOS-WAX32GHC', 'Lavadora Bosch Serie 8', 'lavadora-bosch-serie8',
    'Lavadora eficiente con tecnología EcoSilence Drive',
    'Lavadora Bosch Serie 8 con capacidad de 9kg, velocidad de centrifugado 1400rpm, motor EcoSilence Drive silencioso y eficiente. Incluye programa de limpieza de vapor y conectividad Home Connect.',
    799.99, 999.99, 30, 70000,
    'active', 1, @bosch_id, '/images/products/lavadora-bosch.jpg',
    JSON_ARRAY('bosch', 'lavadora', 'electrodomestico', 'casa'),
    4.8, NOW(), NOW()
);

-- Producto 8: Sillón IKEA
INSERT INTO `products` (
    `sku`, `name`, `slug`, `short_description`, `description`,
    `price`, `stock`, `weight`,
    `status`, `brand_id`, `main_image`, `tags`, `rating`,
    `created_at`, `updated_at`
) VALUES (
    'IKE-STRANDMON', 'Sillón Strandmon', 'sillon-strandmon',
    'Sillón de orejas con diseño escandinavo y máximo confort',
    'El sillón Strandmon de IKEA es un clásico del diseño escandinavo. Cuenta con respaldo alto, reposabrazos acolchados y asiento profundo. Tapizado en tela de alta calidad y patas de madera maciza.',
    249.99, 15, 25000,
    'active', @ikea_id, '/images/products/sillon-strandmon.jpg',
    JSON_ARRAY('ikea', 'sillon', 'mueble', 'decoracion'),
    4.6, NOW(), NOW()
);

-- ============================================
-- 4. PRODUCTOS DE DEPORTES
-- ============================================

SET @sports_id = (SELECT id FROM categories WHERE slug = 'deportes' LIMIT 1);
SET @fitness_id = (SELECT id FROM categories WHERE slug = 'gimnasio' LIMIT 1);
SET @running_id = (SELECT id FROM categories WHERE slug = 'running' LIMIT 1);

SET @puma_id = (SELECT id FROM brands WHERE slug = 'puma' LIMIT 1);
SET @decathlon_id = (SELECT id FROM brands WHERE slug = 'decathlon' LIMIT 1);

-- Producto 9: Zapatillas Running
INSERT INTO `products` (
    `sku`, `name`, `slug`, `short_description`, `description`,
    `price`, `compare_at_price`, `stock`, `weight`,
    `status`, `featured`, `brand_id`, `main_image`, `tags`, `rating`,
    `created_at`, `updated_at`
) VALUES (
    'PUM-VELOCITY', 'Puma Velocity Nitro 2', 'puma-velocity-nitro',
    'Zapatillas running con máxima amortiguación',
    'Las Puma Velocity Nitro 2 cuentan con tecnología NITRO para una amortiguación superior, parte superior de malla transpirable y suela duradera. Ideales para corredores de medio y largo recorrido.',
    119.99, 149.99, 80, 300,
    'active', 1, @puma_id, '/images/products/puma-velocity.jpg',
    JSON_ARRAY('puma', 'running', 'zapatillas', 'deporte'),
    4.5, NOW(), NOW()
);

-- ============================================
-- 5. PRODUCTOS DE LIBROS
-- ============================================

SET @books_id = (SELECT id FROM categories WHERE slug = 'libros' LIMIT 1);
SET @novels_id = (SELECT id FROM categories WHERE slug = 'novelas' LIMIT 1);

SET @planeta_id = (SELECT id FROM brands WHERE slug = 'planeta' LIMIT 1);

-- Producto 10: Libro Best Seller
INSERT INTO `products` (
    `sku`, `name`, `slug`, `short_description`, `description`,
    `price`, `stock`, `weight`,
    `status`, `brand_id`, `main_image`, `tags`, `rating`,
    `created_at`, `updated_at`
) VALUES (
    'PLN-LIBRO-BS', 'La Sombra del Viento', 'la-sombra-del-viento',
    'Bestseller internacional de Carlos Ruiz Zafón',
    'Un amanecer de 1945, un muchacho es llevado por su padre al Cementerio de los Libros Olvidados. Este lugar alberga una colección de libros perdidos. El joven deberá elegir un libro para adoptar, y elige "La Sombra del Viento". Una novela que cambiará su vida para siempre.',
    22.90, 500, 400,
    'active', @planeta_id, '/images/products/sombra-viento.jpg',
    JSON_ARRAY('libro', 'novela', 'bestseller', 'zafon'),
    4.9, NOW(), NOW()
);

-- ============================================
-- 6. VARIANTES DE PRODUCTOS
-- ============================================

-- Variantes para iPhone 15 Pro
SET @iphone_id = (SELECT id FROM products WHERE sku = 'APP-IP15P-128' LIMIT 1);

INSERT INTO `product_variants` (
    `product_id`, `sku`, `name`, `attributes`, `price`, `stock`, `position`
) VALUES
(@iphone_id, 'APP-IP15P-128-BLK', 'iPhone 15 Pro 128GB Negro', JSON_OBJECT('color', 'Negro', 'storage', '128GB'), 1099.99, 20, 1),
(@iphone_id, 'APP-IP15P-128-BLU', 'iPhone 15 Pro 128GB Azul', JSON_OBJECT('color', 'Azul', 'storage', '128GB'), 1099.99, 15, 2),
(@iphone_id, 'APP-IP15P-256-BLK', 'iPhone 15 Pro 256GB Negro', JSON_OBJECT('color', 'Negro', 'storage', '256GB'), 1249.99, 10, 3),
(@iphone_id, 'APP-IP15P-256-BLU', 'iPhone 15 Pro 256GB Azul', JSON_OBJECT('color', 'Azul', 'storage', '256GB'), 1249.99, 5, 4);

-- Variantes para Camisa Zara
SET @camisa_id = (SELECT id FROM products WHERE sku = 'ZRA-CAM-BLANCA' LIMIT 1);

INSERT INTO `product_variants` (
    `product_id`, `sku`, `name`, `attributes`, `price`, `stock`, `position`
) VALUES
(@camisa_id, 'ZRA-CAM-BLANCA-S', 'Camisa Blanca Talla S', JSON_OBJECT('size', 'S', 'color', 'Blanco'), 39.99, 50, 1),
(@camisa_id, 'ZRA-CAM-BLANCA-M', 'Camisa Blanca Talla M', JSON_OBJECT('size', 'M', 'color', 'Blanco'), 39.99, 50, 2),
(@camisa_id, 'ZRA-CAM-BLANCA-L', 'Camisa Blanca Talla L', JSON_OBJECT('size', 'L', 'color', 'Blanco'), 39.99, 50, 3),
(@camisa_id, 'ZRA-CAM-BLANCA-XL', 'Camisa Blanca Talla XL', JSON_OBJECT('size', 'XL', 'color', 'Blanco'), 39.99, 50, 4);

-- ============================================
-- 7. RELACIONES PRODUCTO-CATEGORÍA
-- ============================================

-- Asociar productos con categorías
INSERT INTO `category_product` (`category_id`, `product_id`, `is_primary`, `position`) VALUES
-- Electrónica
(@electronics_id, (SELECT id FROM products WHERE sku = 'APP-IP15P-128'), 1, 1),
(@phones_id, (SELECT id FROM products WHERE sku = 'APP-IP15P-128'), 1, 1),
(@electronics_id, (SELECT id FROM products WHERE sku = 'SAM-S24U-256'), 1, 2),
(@phones_id, (SELECT id FROM products WHERE sku = 'SAM-S24U-256'), 1, 2),
(@electronics_id, (SELECT id FROM products WHERE sku = 'APP-MBP-M3-14'), 1, 3),
(@laptops_id, (SELECT id FROM products WHERE sku = 'APP-MBP-M3-14'), 1, 1),
(@electronics_id, (SELECT id FROM products WHERE sku = 'SNY-WH1000XM5'), 1, 4),
(@audio_id, (SELECT id FROM products WHERE sku = 'SNY-WH1000XM5'), 1, 1),

-- Moda
(@fashion_id, (SELECT id FROM products WHERE sku = 'NKE-AIRMAX-90'), 1, 1),
(@sportswear_id, (SELECT id FROM products WHERE sku = 'NKE-AIRMAX-90'), 1, 1),
(@fashion_id, (SELECT id FROM products WHERE sku = 'ZRA-CAM-BLANCA'), 1, 2),
(@mens_id, (SELECT id FROM products WHERE sku = 'ZRA-CAM-BLANCA'), 1, 1),

-- Hogar
(@home_id, (SELECT id FROM products WHERE sku = 'BOS-WAX32GHC'), 1, 1),
(@home_id, (SELECT id FROM products WHERE sku = 'IKE-STRANDMON'), 1, 2),
(@furniture_id, (SELECT id FROM products WHERE sku = 'IKE-STRANDMON'), 1, 1),

-- Deportes
(@sports_id, (SELECT id FROM products WHERE sku = 'PUM-VELOCITY'), 1, 1),
(@running_id, (SELECT id FROM products WHERE sku = 'PUM-VELOCITY'), 1, 1),

-- Libros
(@books_id, (SELECT id FROM products WHERE sku = 'PLN-LIBRO-BS'), 1, 1),
(@novels_id, (SELECT id FROM products WHERE sku = 'PLN-LIBRO-BS'), 1, 1);

-- ============================================
-- 8. IMÁGENES DE PRODUCTOS
-- ============================================

-- Imágenes adicionales para iPhone
SET @iphone_product_id = (SELECT id FROM products WHERE sku = 'APP-IP15P-128' LIMIT 1);

INSERT INTO `product_images` (`product_id`, `image_url`, `thumbnail_url`, `alt_text`, `position`, `is_main`) VALUES
(@iphone_product_id, '/images/products/iphone15pro-2.jpg', '/images/products/iphone15pro-2-thumb.jpg', 'iPhone 15 Pro - Vista trasera', 2, 0),
(@iphone_product_id, '/images/products/iphone15pro-3.jpg', '/images/products/iphone15pro-3-thumb.jpg', 'iPhone 15 Pro - Pantalla', 3, 0),
(@iphone_product_id, '/images/products/iphone15pro-4.jpg', '/images/products/iphone15pro-4-thumb.jpg', 'iPhone 15 Pro - Cámaras', 4, 0);

-- Imágenes adicionales para MacBook
SET @macbook_id = (SELECT id FROM products WHERE sku = 'APP-MBP-M3-14' LIMIT 1);

INSERT INTO `product_images` (`product_id`, `image_url`, `thumbnail_url`, `alt_text`, `position`, `is_main`) VALUES
(@macbook_id, '/images/products/macbook-m3-2.jpg', '/images/products/macbook-m3-2-thumb.jpg', 'MacBook Pro M3 - Teclado', 2, 0),
(@macbook_id, '/images/products/macbook-m3-3.jpg', '/images/products/macbook-m3-3-thumb.jpg', 'MacBook Pro M3 - Laterales', 3, 0);

-- ============================================
-- 9. RESEÑAS DE PRODUCTOS
-- ============================================

-- Obtener IDs de usuarios
SET @admin_user_id = (SELECT id FROM users WHERE email = 'admin@empresa.com' LIMIT 1);
SET @test_user_id = (SELECT id FROM users WHERE email = 'usuario@example.com' LIMIT 1);

-- Reseñas para iPhone
INSERT INTO `product_reviews` (`product_id`, `user_id`, `rating`, `title`, `comment`, `verified_purchase`, `status`, `created_at`) VALUES
(@iphone_product_id, @admin_user_id, 5, 'Excelente teléfono', 'La mejor cámara que he probado. El rendimiento es increíble y la batería dura todo el día.', 1, 'approved', NOW()),
(@iphone_product_id, @test_user_id, 4, 'Muy bueno pero caro', 'Excelente calidad, pero el precio es elevado. La cámara es espectacular.', 1, 'approved', NOW());

-- Reseñas para Nike Air Max
SET @nike_product_id = (SELECT id FROM products WHERE sku = 'NKE-AIRMAX-90' LIMIT 1);

INSERT INTO `product_reviews` (`product_id`, `user_id`, `rating`, `title`, `comment`, `verified_purchase`, `status`, `created_at`) VALUES
(@nike_product_id, @test_user_id, 5, 'Súper cómodas', 'Las zapatillas más cómodas que he tenido. Diseño clásico y calidad excelente.', 1, 'approved', NOW());

-- ============================================
-- 10. RELACIONES ENTRE PRODUCTOS
-- ============================================

-- Productos relacionados (upsell y cross-sell)
INSERT INTO `product_relations` (`product_id`, `related_product_id`, `relation_type`, `position`) VALUES
(@iphone_product_id, @macbook_id, 'upsell', 1),
(@iphone_product_id, (SELECT id FROM products WHERE sku = 'SNY-WH1000XM5'), 'cross_sell', 2),
(@macbook_id, @iphone_product_id, 'cross_sell', 1);

-- ============================================
-- 11. DESCUENTOS ESPECIALES
-- ============================================

-- Descuento por lanzamiento de iPhone
INSERT INTO `product_discounts` (
    `product_id`, `discount_type`, `discount_value`, 
    `start_date`, `end_date`, `min_quantity`
) VALUES (
    @iphone_product_id, 'percentage', 10.00,
    NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1
);

-- Descuento por temporada para Nike
INSERT INTO `product_discounts` (
    `product_id`, `discount_type`, `discount_value`, 
    `start_date`, `end_date`, `min_quantity`
) VALUES (
    @nike_product_id, 'fixed', 20.00,
    NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY), 2
);

-- ============================================
-- 12. STOCK Y MOVIMIENTOS DE INVENTARIO
-- ============================================

-- Registrar movimientos iniciales de inventario
INSERT INTO `inventory_movements` (
    `product_id`, `movement_type`, `quantity`, `previous_stock`, `new_stock`, 
    `reason`, `performed_by`, `created_at
) VALUES
(@iphone_product_id, 'purchase', 50, 0, 50, 'Stock inicial', @admin_user_id, NOW()),
((SELECT id FROM products WHERE sku = 'SAM-S24U-256'), 'purchase', 35, 0, 35, 'Stock inicial', @admin_user_id, NOW()),
(@macbook_id, 'purchase', 25, 0, 25, 'Stock inicial', @admin_user_id, NOW()),
(@nike_product_id, 'purchase', 100, 0, 100, 'Stock inicial', @admin_user_id, NOW());

-- ============================================
-- 13. VERIFICACIÓN DE DATOS
-- ============================================

SELECT '=== PRODUCTOS CREADOS ===' as '';
SELECT 
    id,
    name,
    sku,
    price,
    stock,
    status,
    featured,
    created_at
FROM products 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY created_at DESC;

SELECT '=== VARIANTES CREADAS ===' as '';
SELECT 
    p.name as product_name,
    pv.sku,
    pv.name as variant_name,
    pv.attributes,
    pv.price,
    pv.stock
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR);

SELECT '=== RESEÑAS CREADAS ===' as '';
SELECT 
    p.name,
    pr.rating,
    pr.title,
    pr.comment,
    u.name as reviewer
FROM product_reviews pr
JOIN products p ON p.id = pr.product_id
JOIN users u ON u.id = pr.user_id
ORDER BY pr.created_at DESC;

-- ============================================
-- 14. MENSAJES FINALES
-- ============================================

SELECT '============================================' as '';
SELECT '✅ SEEDING DE PRODUCTOS COMPLETADO' as '';
SELECT '============================================' as '';
SELECT '📦 Productos creados: 10' as '';
SELECT '🎨 Variantes creadas: 8' as '';
SELECT '🖼️ Imágenes añadidas: 5' as '';
SELECT '⭐ Reseñas añadidas: 3' as '';
SELECT '🔄 Relaciones creadas: 3' as '';
SELECT '💰 Descuentos aplicados: 2' as '';
SELECT '📊 Movimientos de stock: 5' as '';
SELECT '============================================' as '';

-- ============================================
-- FIN DEL SCRIPT DE SEEDING
-- ============================================