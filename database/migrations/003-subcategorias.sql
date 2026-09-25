-- CoreX — Subcategorías opcionales (ej. Xbox → Juegos, Controles)

CREATE TABLE IF NOT EXISTS subcategories (
    id SERIAL PRIMARY KEY,
    categoria_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (categoria_id, nombre)
);

CREATE INDEX IF NOT EXISTS idx_subcategories_categoria ON subcategories(categoria_id);

ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategoria_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_subcategoria ON products(subcategoria_id);
