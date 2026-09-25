-- CoreX — Productos v2: multi-imagen, video, barcode, promociones, pausar
-- Ejecutar en BD existente: ver scripts/migrate-products.ps1

ALTER TABLE products ADD COLUMN IF NOT EXISTS precio_compra DECIMAL(12, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS precio_promocion DECIMAL(12, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS en_promocion BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS porcentaje_descuento INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS imagenes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url VARCHAR(500);
ALTER TABLE products ADD COLUMN IF NOT EXISTS codigo_barras VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS vendido_en TIMESTAMP;

UPDATE products
SET imagenes = jsonb_build_array(imagen_url)
WHERE imagen_url IS NOT NULL
  AND (imagenes IS NULL OR imagenes = '[]'::jsonb);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_codigo_barras ON products(codigo_barras)
WHERE codigo_barras IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_activo ON products(activo);
