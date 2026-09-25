-- 01_categories.sql
-- CoreX Database

-- ============================================
-- SCRIPT: database/seeds/01_categories.sql
-- DESCRIPCIÓN: Seeding de categorías y datos relacionados
-- FECHA: 2026-05-21
-- AUTOR: Sistema de Base de Datos
-- ============================================

-- ============================================
-- LIMPIAR DATOS EXISTENTES (OPCIONAL)
-- ============================================
-- NOTA: Descomentar solo si se desea limpiar antes de insertar
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE category_product;
-- TRUNCATE TABLE category_attributes;
-- TRUNCATE TABLE product_attribute_values;
-- TRUNCATE TABLE brand_category;
-- TRUNCATE TABLE categories;
-- TRUNCATE TABLE brands;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. CATEGORÍAS PRINCIPALES (NIVEL 1)
-- ============================================

INSERT INTO `categories` (`name`, `slug`, `description`, `short_description`, `level`, `order`, `status`, `is_visible`, `show_in_menu`, `is_featured`, `seo_title`, `seo_description`) VALUES
-- Electrónica
('Electrónica', 'electronica', 'Productos electrónicos, dispositivos y gadgets de última generación. Encuentra smartphones, ordenadores, tablets y más.', 'Tecnología y dispositivos electrónicos', 0, 1, 'active', TRUE, TRUE, TRUE, 'Electrónica - Tecnología y Gadgets', 'Descubre los mejores productos electrónicos: smartphones, ordenadores, tablets, audio y video. Las mejores marcas al mejor precio.'),
-- Ropa y Moda
('Ropa y Moda', 'ropa-moda', 'Prendas de vestir, calzado y accesorios de moda para hombre, mujer y niños. Tendencias actuales y clásicos atemporales.', 'Moda y tendencias para toda la familia', 0, 2, 'active', TRUE, TRUE, TRUE, 'Ropa y Moda - Tendencias Actuales', 'Encuentra las últimas tendencias en moda para hombre, mujer y niños. Ropa de calidad, calzado y accesorios. Envío gratis.'),
-- Hogar y Jardín
('Hogar y Jardín', 'hogar-jardin', 'Muebles, decoración, electrodomésticos y artículos para el hogar y jardín. Todo lo que necesitas para tu casa.', 'Decora y equipa tu hogar', 0, 3, 'active', TRUE, TRUE, TRUE, 'Hogar y Jardín - Decoración y Mobiliario', 'Todo para tu hogar: muebles, decoración, electrodomésticos, jardín y más. Calidad garantizada.'),
-- Deportes
('Deportes', 'deportes', 'Equipamiento deportivo, ropa deportiva, accesorios y nutrición para todas las disciplinas deportivas.', 'Equípate para tu deporte favorito', 0, 4, 'active', TRUE, TRUE, TRUE, 'Deportes - Equipamiento y Ropa Deportiva', 'Encuentra todo el equipamiento deportivo que necesitas: ropa, calzado, accesorios y nutrición. Marcas líderes.'),
-- Libros
('Libros', 'libros', 'Libros, ebooks, audiolibros y material educativo en todos los géneros y para todas las edades.', 'Lectura para todos los gustos', 0, 5, 'active', TRUE, TRUE, TRUE, 'Libros - Literatura y Educación', 'Descubre nuestra selección de libros, ebooks y audiolibros. Novedades, bestsellers y clásicos.'),
-- Juguetes
('Juguetes', 'juguetes', 'Juguetes y juegos para todas las edades. Educativos, tradicionales, electrónicos y más.', 'Diversión y aprendizaje', 0, 6, 'active', TRUE, TRUE, TRUE, 'Juguetes - Juegos y Diversión', 'Los mejores juguetes para niños de todas las edades. Educativos, tradicionales y electrónicos.'),
-- Salud y Belleza
('Salud y Belleza', 'salud-belleza', 'Productos de cuidado personal, cosméticos, perfumes, suplementos y bienestar.', 'Cuida tu salud y belleza', 0, 7, 'active', TRUE, TRUE, TRUE, 'Salud y Belleza - Cuidado Personal', 'Productos de salud, cosmética natural, perfumes y suplementos. Todo para tu bienestar.'),
-- Alimentación
('Alimentación', 'alimentacion', 'Alimentos, bebidas, productos gourmet, vinos y delicatessen. Lo mejor de la gastronomía.', 'Productos gourmet y delicatessen', 0, 8, 'active', TRUE, TRUE, TRUE, 'Alimentación - Gourmet y Delicatessen', 'Los mejores productos gourmet, vinos, bebidas y delicatessen. Calidad y sabor garantizados.');

-- ============================================
-- 2. SUBCATEGORÍAS DE ELECTRÓNICA (NIVEL 2)
-- ============================================

-- Obtener ID de categoría Electrónica (asumiendo que es la primera)
SET @electronics_id = (SELECT id FROM categories WHERE slug = 'electronica' LIMIT 1);

INSERT INTO `categories` (`parent_id`, `name`, `slug`, `description`, `level`, `order`, `status`, `is_visible`, `seo_title`) VALUES
(@electronics_id, 'Teléfonos Móviles', 'telefonos-moviles', 'Smartphones de última generación, teléfonos plegables, accesorios y fundas. Las mejores marcas: Apple, Samsung, Xiaomi, Google.', 1, 1, 'active', TRUE, 'Teléfonos Móviles - Smartphones'),
(@electronics_id, 'Ordenadores', 'ordenadores', 'Portátiles, ordenadores de sobremesa, monitores, componentes y periféricos. Gaming y profesionales.', 1, 2, 'active', TRUE, 'Ordenadores - Portátiles y Sobremesa'),
(@electronics_id, 'Tablets', 'tablets', 'Tablets iPad, Samsung Galaxy Tab, Amazon Fire y accesorios. Ideales para estudio y entretenimiento.', 1, 3, 'active', TRUE, 'Tablets - iPad y Android'),
(@electronics_id, 'Audio', 'audio', 'Auriculares, cascos, altavoces, soundbars y equipos de sonido. Calidad de audio profesional.', 1, 4, 'active', TRUE, 'Audio - Auriculares y Altavoces'),
(@electronics_id, 'Televisores', 'televisores', 'TVs 4K, OLED, QLED, smart TVs de todas las pulgadas. Home cinema y proyectores.', 1, 5, 'active', TRUE, 'Televisores - TV 4K y OLED'),
(@electronics_id, 'Cámaras', 'camaras-fotograficas', 'Cámaras réflex, mirrorless, action cams, drones y accesorios de fotografía y video.', 1, 6, 'active', TRUE, 'Cámaras - Fotografía y Video'),
(@electronics_id, 'Videojuegos', 'videojuegos', 'Consolas PlayStation, Xbox, Nintendo Switch. Videojuegos y accesorios gaming.', 1, 7, 'active', TRUE, 'Videojuegos - Consolas y Juegos'),
(@electronics_id, 'Smart Home', 'smart-home', 'Dispositivos domótica: enchufes inteligentes, bombillas, asistentes de voz, seguridad.', 1, 8, 'active', TRUE, 'Smart Home - Domótica'),
(@electronics_id, 'Accesorios', 'accesorios-electronica', 'Cargadores, cables, fundas, protectores de pantalla, hubs y adaptadores.', 1, 9, 'active', TRUE, 'Accesorios Electrónicos');

-- ============================================
-- 3. SUBCATEGORÍAS DE ROPA Y MODA (NIVEL 2)
-- ============================================

SET @fashion_id = (SELECT id FROM categories WHERE slug = 'ropa-moda' LIMIT 1);

INSERT INTO `categories` (`parent_id`, `name`, `slug`, `description`, `level`, `order`, `status`, `is_visible`, `seo_title`) VALUES
(@fashion_id, 'Hombre', 'hombre', 'Ropa, calzado y accesorios para hombre. Camisas, pantalones, chaquetas, zapatos.', 1, 1, 'active', TRUE, 'Moda Hombre - Ropa y Calzado'),
(@fashion_id, 'Mujer', 'mujer', 'Ropa, calzado y accesorios para mujer. Vestidos, blusas, pantalones, zapatos.', 1, 2, 'active', TRUE, 'Moda Mujer - Tendencias'),
(@fashion_id, 'Niños', 'ninos', 'Ropa y calzado para niños y bebés. Moda infantil de calidad.', 1, 3, 'active', TRUE, 'Moda Infantil - Niños y Bebés'),
(@fashion_id, 'Calzado', 'calzado', 'Zapatos, zapatillas, botas y sandalias para toda la familia.', 1, 4, 'active', TRUE, 'Calzado - Zapatos y Zapatillas'),
(@fashion_id, 'Accesorios', 'accesorios-moda', 'Bolsos, mochilas, joyas, relojes, cinturones y complementos.', 1, 5, 'active', TRUE, 'Accesorios de Moda'),
(@fashion_id, 'Deportivo', 'deportivo-moda', 'Ropa deportiva, athleisure, calzado deportivo. Comodidad y estilo.', 1, 6, 'active', TRUE, 'Ropa Deportiva - Athleisure'),
(@fashion_id, 'Ropa Interior', 'ropa-interior', 'Ropa interior, lencería, pijamas y ropa de dormir.', 1, 7, 'active', TRUE, 'Ropa Interior y Lencería');

-- ============================================
-- 4. SUBCATEGORÍAS DE HOGAR Y JARDÍN (NIVEL 2)
-- ============================================

SET @home_id = (SELECT id FROM categories WHERE slug = 'hogar-jardin' LIMIT 1);

INSERT INTO `categories` (`parent_id`, `name`, `slug`, `description`, `level`, `order`, `status`, `is_visible`, `seo_title`) VALUES
(@home_id, 'Muebles', 'muebles', 'Muebles para salón, dormitorio, cocina y oficina. Diseño y funcionalidad.', 1, 1, 'active', TRUE, 'Muebles - Diseño y Funcionalidad'),
(@home_id, 'Decoración', 'decoracion', 'Cuadros, espejos, cojines, alfombras, lámparas y objetos decorativos.', 1, 2, 'active', TRUE, 'Decoración del Hogar'),
(@home_id, 'Electrodomésticos', 'electrodomesticos', 'Lavadoras, frigoríficos, hornos, microondas, aspiradoras y pequeños electrodomésticos.', 1, 3, 'active', TRUE, 'Electrodomésticos'),
(@home_id, 'Cocina', 'cocina', 'Utensilios de cocina, baterías, menaje, cristalería y pequeños electrodomésticos.', 1, 4, 'active', TRUE, 'Utensilios de Cocina'),
(@home_id, 'Jardín', 'jardin', 'Muebles de jardín, herramientas, plantas, flores, riego y decoración exterior.', 1, 5, 'active', TRUE, 'Jardín y Terraza'),
(@home_id, 'Textil', 'textil-hogar', 'Ropa de cama, toallas, mantas, cortinas y mantelería.', 1, 6, 'active', TRUE, 'Textil para el Hogar'),
(@home_id, 'Organización', 'organizacion', 'Estanterías, cajas organizadoras, armarios, zapateros y soluciones de almacenaje.', 1, 7, 'active', TRUE, 'Organización y Almacenaje'),
(@home_id, 'Iluminación', 'iluminacion', 'Lámparas de techo, apliques, lámparas de pie, flexos y bombillas LED.', 1, 8, 'active', TRUE, 'Iluminación - Lámparas');

-- ============================================
-- 5. SUBCATEGORÍAS DE DEPORTES (NIVEL 2)
-- ============================================

SET @sports_id = (SELECT id FROM categories WHERE slug = 'deportes' LIMIT 1);

INSERT INTO `categories` (`parent_id`, `name`, `slug`, `description`, `level`, `order`, `status`, `is_visible`, `seo_title`) VALUES
(@sports_id, 'Fútbol', 'futbol', 'Balones, botas, equipaciones, espinilleras y accesorios de fútbol.', 1, 1, 'active', TRUE, 'Fútbol - Equipamiento'),
(@sports_id, 'Running', 'running', 'Zapatillas running, ropa técnica, pulsómetros, GPS y accesorios.', 1, 2, 'active', TRUE, 'Running - Zapatillas y Ropa'),
(@sports_id, 'Gimnasio', 'gimnasio', 'Pesas, barras, máquinas, colchonetas, ropa fitness y suplementos.', 1, 3, 'active', TRUE, 'Gimnasio - Fitness'),
(@sports_id, 'Baloncesto', 'baloncesto', 'Balones, canastas, zapatillas, ropa y accesorios de baloncesto.', 1, 4, 'active', TRUE, 'Baloncesto - Equipo'),
(@sports_id, 'Ciclismo', 'ciclismo', 'Bicicletas de montaña, carretera, eléctricas, cascos, ropa y accesorios.', 1, 5, 'active', TRUE, 'Ciclismo - Bicicletas'),
(@sports_id, 'Piscina', 'piscina', 'Bañadores, gafas, gorros, flotadores y accesorios de natación.', 1, 6, 'active', TRUE, 'Natación - Piscina'),
(@sports_id, 'Tenis', 'tenis', 'Raquetas, pelotas, zapatillas, ropa y accesorios de tenis y pádel.', 1, 7, 'active', TRUE, 'Tenis y Pádel'),
(@sports_id, 'Senderismo', 'senderismo', 'Mochilas, botas de montaña, bastones, tiendas de campaña y material de acampada.', 1, 8, 'active', TRUE, 'Senderismo y Montaña');

-- ============================================
-- 6. SUBCATEGORÍAS DE LIBROS (NIVEL 2)
-- ============================================

SET @books_id = (SELECT id FROM categories WHERE slug = 'libros' LIMIT 1);

INSERT INTO `categories` (`parent_id`, `name`, `slug`, `description`, `level`, `order`, `status`, `is_visible`, `seo_title`) VALUES
(@books_id, 'Novelas', 'novelas', 'Novelas de ficción, drama, románticas, históricas y contemporáneas.', 1, 1, 'active', TRUE, 'Novelas - Ficción Literaria'),
(@books_id, 'No Ficción', 'no-ficcion', 'Biografías, historia, ciencia, tecnología, filosofía y ensayos.', 1, 2, 'active', TRUE, 'No Ficción - Ensayos'),
(@books_id, 'Infantil', 'infantil', 'Libros para niños de 0 a 12 años. Cuentos, ilustrados, aprendizaje.', 1, 3, 'active', TRUE, 'Libros Infantiles'),
(@books_id, 'Juvenil', 'juvenil', 'Novelas para adolescentes y jóvenes adultos. Fantasía, aventuras, romance.', 1, 4, 'active', TRUE, 'Literatura Juvenil'),
(@books_id, 'Ciencia Ficción', 'ciencia-ficcion', 'Futuro, viajes espaciales, tecnología avanzada y universos alternativos.', 1, 5, 'active', TRUE, 'Ciencia Ficción'),
(@books_id, 'Fantasía', 'fantasia', 'Mundos mágicos, dragones, elfos y aventuras épicas.', 1, 6, 'active', TRUE, 'Fantasía Épica'),
(@books_id, 'Autoayuda', 'autoayuda', 'Desarrollo personal, motivación, psicología y crecimiento espiritual.', 1, 7, 'active', TRUE, 'Autoayuda'),
(@books_id, 'Cocina', 'cocina-libros', 'Recetarios, gastronomía, técnicas culinarias y vinos.', 1, 8, 'active', TRUE, 'Libros de Cocina');

-- ============================================
-- 7. MARCAS
-- ============================================

INSERT INTO `brands` (`name`, `slug`, `description`, `website`, `status`, `is_featured`, `order`, `seo_title`) VALUES
-- Electrónica
('Apple', 'apple', 'Innovación en tecnología. iPhone, Mac, iPad, Apple Watch, AirPods.', 'https://www.apple.com', 'active', TRUE, 1, 'Apple - Tecnología e Innovación'),
('Samsung', 'samsung', 'Electrónica de consumo. Smartphones, TVs, electrodomésticos.', 'https://www.samsung.com', 'active', TRUE, 2, 'Samsung - Electrónica'),
('Sony', 'sony', 'Entretenimiento y electrónica. PlayStation, TVs, audio.', 'https://www.sony.com', 'active', TRUE, 3, 'Sony - Entretenimiento'),
('Xiaomi', 'xiaomi', 'Tecnología accesible. Smartphones, smart home, accesorios.', 'https://www.mi.com', 'active', TRUE, 4, 'Xiaomi - Tecnología'),
('LG', 'lg', 'Electrodomésticos y electrónica. TVs, lavadoras, refrigeradores.', 'https://www.lg.com', 'active', FALSE, 5, 'LG - Electrónica'),
('HP', 'hp', 'Ordenadores, impresoras y periféricos.', 'https://www.hp.com', 'active', FALSE, 6, 'HP - Computación'),
('Dell', 'dell', 'Ordenadores, monitores y accesorios.', 'https://www.dell.com', 'active', FALSE, 7, 'Dell - Computadoras'),
('Lenovo', 'lenovo', 'Ordenadores, tablets y accesorios.', 'https://www.lenovo.com', 'active', FALSE, 8, 'Lenovo - Tecnología'),

-- Moda
('Nike', 'nike', 'Ropa y calzado deportivo de alto rendimiento.', 'https://www.nike.com', 'active', TRUE, 9, 'Nike - Deportes'),
('Adidas', 'adidas', 'Ropa deportiva, calzado y accesorios.', 'https://www.adidas.com', 'active', TRUE, 10, 'Adidas - Moda Deportiva'),
('Zara', 'zara', 'Moda rápida y tendencias actuales.', 'https://www.zara.com', 'active', TRUE, 11, 'Zara - Moda'),
('H&M', 'hm', 'Ropa y accesorios para toda la familia.', 'https://www.hm.com', 'active', FALSE, 12, 'H&M - Ropa'),
('Mango', 'mango', 'Moda femenina y masculina.', 'https://www.mango.com', 'active', FALSE, 13, 'Mango - Moda'),
('Puma', 'puma', 'Calzado y ropa deportiva.', 'https://www.puma.com', 'active', FALSE, 14, 'Puma - Deportes'),

-- Hogar
('IKEA', 'ikea', 'Muebles y decoración para el hogar.', 'https://www.ikea.com', 'active', TRUE, 15, 'IKEA - Hogar'),
('Bosch', 'bosch', 'Electrodomésticos y herramientas.', 'https://www.bosch.com', 'active', TRUE, 16, 'Bosch - Electrodomésticos'),
('Philips', 'philips', 'Electrodomésticos, iluminación y salud.', 'https://www.philips.com', 'active', FALSE, 17, 'Philips - Hogar'),
('Tefal', 'tefal', 'Utensilios de cocina y pequeños electrodomésticos.', 'https://www.tefal.com', 'active', FALSE, 18, 'Tefal - Cocina'),

-- Deportes
('Decathlon', 'decathlon', 'Equipamiento deportivo para todas las disciplinas.', 'https://www.decathlon.es', 'active', TRUE, 19, 'Decathlon - Deportes'),
('Under Armour', 'under-armour', 'Ropa y calzado deportivo.', 'https://www.underarmour.com', 'active', FALSE, 20, 'Under Armour - Deportes'),

-- Libros
('Planeta', 'planeta', 'Editorial de libros.', 'https://www.planetadelibros.com', 'active', TRUE, 21, 'Planeta - Libros'),
('Penguin Random House', 'penguin', 'Editorial internacional.', 'https://www.penguinrandomhouse.com', 'active', TRUE, 22, 'Penguin - Libros');

-- ============================================
-- 8. RELACIÓN MARCAS-CATEGORÍAS
-- ============================================

-- Asignar marcas a categorías
INSERT INTO `brand_category` (`brand_id`, `category_id`) VALUES
-- Electrónica
((SELECT id FROM brands WHERE slug = 'apple'), @electronics_id),
((SELECT id FROM brands WHERE slug = 'samsung'), @electronics_id),
((SELECT id FROM brands WHERE slug = 'sony'), @electronics_id),
((SELECT id FROM brands WHERE slug = 'xiaomi'), @electronics_id),
((SELECT id FROM brands WHERE slug = 'lg'), @electronics_id),
((SELECT id FROM brands WHERE slug = 'hp'), @electronics_id),
((SELECT id FROM brands WHERE slug = 'dell'), @electronics_id),
((SELECT id FROM brands WHERE slug = 'lenovo'), @electronics_id),

-- Moda
((SELECT id FROM brands WHERE slug = 'nike'), @fashion_id),
((SELECT id FROM brands WHERE slug = 'adidas'), @fashion_id),
((SELECT id FROM brands WHERE slug = 'zara'), @fashion_id),
((SELECT id FROM brands WHERE slug = 'hm'), @fashion_id),
((SELECT id FROM brands WHERE slug = 'mango'), @fashion_id),
((SELECT id FROM brands WHERE slug = 'puma'), @fashion_id),

-- Hogar
((SELECT id FROM brands WHERE slug = 'ikea'), @home_id),
((SELECT id FROM brands WHERE slug = 'bosch'), @home_id),
((SELECT id FROM brands WHERE slug = 'philips'), @home_id),
((SELECT id FROM brands WHERE slug = 'tefal'), @home_id),

-- Deportes
((SELECT id FROM brands WHERE slug = 'nike'), @sports_id),
((SELECT id FROM brands WHERE slug = 'adidas'), @sports_id),
((SELECT id FROM brands WHERE slug = 'decathlon'), @sports_id),
((SELECT id FROM brands WHERE slug = 'under-armour'), @sports_id),

-- Libros
((SELECT id FROM brands WHERE slug = 'planeta'), @books_id),
((SELECT id FROM brands WHERE slug = 'penguin'), @books_id);

-- ============================================
-- 9. ATRIBUTOS DE CATEGORÍAS
-- ============================================

-- Atributos para Electrónica
INSERT INTO `category_attributes` (`category_id`, `name`, `slug`, `type`, `is_filterable`, `is_visible`, `position`) VALUES
(@electronics_id, 'Marca', 'brand', 'select', TRUE, TRUE, 1),
(@electronics_id, 'Precio', 'price', 'number', TRUE, TRUE, 2),
(@electronics_id, 'Color', 'color', 'color', TRUE, TRUE, 3),
(@electronics_id, 'Almacenamiento', 'storage', 'select', TRUE, TRUE, 4),
(@electronics_id, 'RAM', 'ram', 'select', TRUE, TRUE, 5),
(@electronics_id, 'Pantalla', 'screen_size', 'text', TRUE, TRUE, 6);

-- Atributos para Ropa
INSERT INTO `category_attributes` (`category_id`, `name`, `slug`, `type`, `is_filterable`, `is_visible`, `position`) VALUES
(@fashion_id, 'Talla', 'size', 'size', TRUE, TRUE, 1),
(@fashion_id, 'Color', 'color', 'color', TRUE, TRUE, 2),
(@fashion_id, 'Material', 'material', 'select', TRUE, TRUE, 3),
(@fashion_id, 'Marca', 'brand', 'select', TRUE, TRUE, 4);

-- Atributos para Hogar
INSERT INTO `category_attributes` (`category_id`, `name`, `slug`, `type`, `is_filterable`, `is_visible`, `position`) VALUES
(@home_id, 'Material', 'material', 'select', TRUE, TRUE, 1),
(@home_id, 'Color', 'color', 'color', TRUE, TRUE, 2),
(@home_id, 'Marca', 'brand', 'select', TRUE, TRUE, 3);

-- ============================================
-- 10. OPCIONES PARA ATRIBUTOS
-- ============================================

-- Opciones para atributos de Electrónica
SET @storage_attr_id = (SELECT id FROM category_attributes WHERE category_id = @electronics_id AND slug = 'storage' LIMIT 1);
SET @ram_attr_id = (SELECT id FROM category_attributes WHERE category_id = @electronics_id AND slug = 'ram' LIMIT 1);

-- Nota: Las opciones se manejan en el campo JSON 'options' de category_attributes
UPDATE `category_attributes` SET `options` = JSON_ARRAY('64GB', '128GB', '256GB', '512GB', '1TB') WHERE id = @storage_attr_id;
UPDATE `category_attributes` SET `options` = JSON_ARRAY('4GB', '6GB', '8GB', '12GB', '16GB', '32GB') WHERE id = @ram_attr_id;

-- Opciones para atributos de Ropa
SET @size_attr_id = (SELECT id FROM category_attributes WHERE category_id = @fashion_id AND slug = 'size' LIMIT 1);
SET @material_attr_id = (SELECT id FROM category_attributes WHERE category_id = @fashion_id AND slug = 'material' LIMIT 1);

UPDATE `category_attributes` SET `options` = JSON_ARRAY('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL') WHERE id = @size_attr_id;
UPDATE `category_attributes` SET `options` = JSON_ARRAY('Algodón', 'Poliéster', 'Lana', 'Seda', 'Lino', 'Denim', 'Cuero') WHERE id = @material_attr_id;

-- ============================================
-- 11. PLANTILLAS DE CATEGORÍA
-- ============================================

INSERT INTO `category_templates` (`name`, `slug`, `description`, `layout`, `sections`, `is_default`) VALUES
('Estándar', 'standard', 'Plantilla estándar con productos en grid', 
 JSON_OBJECT('product_display', 'grid', 'products_per_row', 4),
 JSON_OBJECT('sections', JSON_ARRAY('header', 'products', 'pagination')),
 TRUE),
('Destacados', 'featured', 'Plantilla con sección de productos destacados',
 JSON_OBJECT('product_display', 'grid', 'products_per_row', 3),
 JSON_OBJECT('sections', JSON_ARRAY('header', 'featured', 'products', 'pagination')),
 FALSE),
('Catálogo', 'catalog', 'Plantilla estilo catálogo con lista',
 JSON_OBJECT('product_display', 'list', 'show_sidebar', TRUE),
 JSON_OBJECT('sections', JSON_ARRAY('sidebar', 'products', 'pagination')),
 FALSE);

-- ============================================
-- 12. ASIGNAR PLANTILLAS A CATEGORÍAS
-- ============================================

SET @standard_template_id = (SELECT id FROM category_templates WHERE slug = 'standard' LIMIT 1);
SET @featured_template_id = (SELECT id FROM category_templates WHERE slug = 'featured' LIMIT 1);

INSERT INTO `category_template_assignments` (`category_id`, `template_id`, `device_type`) VALUES
(@electronics_id, @featured_template_id, 'all'),
(@fashion_id, @standard_template_id, 'all'),
(@home_id, @standard_template_id, 'all'),
(@sports_id, @standard_template_id, 'all');

-- ============================================
-- 13. VERIFICACIÓN DE DATOS INSERTADOS
-- ============================================

-- Mostrar resumen de categorías insertadas
SELECT '=== CATEGORÍAS INSERTADAS ===' as '';
SELECT 
    level,
    COUNT(*) as total_categories,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
FROM categories 
WHERE deleted_at IS NULL
GROUP BY level
ORDER BY level;

-- Mostrar marcas insertadas
SELECT '=== MARCAS INSERTADAS ===' as '';
SELECT 
    status,
    COUNT(*) as total_brands,
    SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) as featured_count
FROM brands 
WHERE deleted_at IS NULL
GROUP BY status;

-- Mostrar jerarquía de categorías
SELECT '=== JERARQUÍA DE CATEGORÍAS ===' as '';
SELECT 
    CONCAT(REPEAT('  ', level), name) as category_tree,
    level,
    status,
    product_count
FROM categories 
WHERE deleted_at IS NULL
ORDER BY path, `order`;

-- ============================================
-- 14. ACTUALIZAR PATH Y LEVEL (REQUERIDO)
-- ============================================

-- Actualizar la jerarquía de categorías
-- Esto debe ejecutarse después de todas las inserciones
CALL update_category_hierarchy();

-- ============================================
-- FIN DEL SCRIPT DE SEEDING
-- ============================================

SELECT '=== SEEDING COMPLETADO CORRECTAMENTE ===' as '';
SELECT 'Categorías insertadas: ' || COUNT(*) as '' FROM categories WHERE deleted_at IS NULL;
SELECT 'Marcas insertadas: ' || COUNT(*) as '' FROM brands WHERE deleted_at IS NULL;
SELECT 'Atributos insertados: ' || COUNT(*) as '' FROM category_attributes;
SELECT 'Relaciones marca-categoría: ' || COUNT(*) as '' FROM brand_category;