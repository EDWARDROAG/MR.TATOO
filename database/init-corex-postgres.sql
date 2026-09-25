-- CoreX - Esquema PostgreSQL alineado con los modelos del backend Node.js

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'cajero', 'super_admin')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(50) NOT NULL,
    descripcion TEXT DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subcategories (
    id SERIAL PRIMARY KEY,
    categoria_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (categoria_id, nombre)
);

CREATE INDEX IF NOT EXISTS idx_subcategories_categoria ON subcategories(categoria_id);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(12, 2) NOT NULL,
    precio_compra DECIMAL(12, 2),
    precio_promocion DECIMAL(12, 2),
    en_promocion BOOLEAN DEFAULT FALSE,
    porcentaje_descuento INTEGER DEFAULT 0,
    condicion VARCHAR(20) CHECK (condicion IN ('nuevo', 'segunda')),
    categoria_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    subcategoria_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL,
    imagen_url VARCHAR(500),
    imagenes JSONB DEFAULT '[]'::jsonb,
    video_url VARCHAR(500),
    codigo_barras VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    stock INTEGER DEFAULT 1,
    vendido_en TIMESTAMP,
    fecha_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_codigo_barras ON products(codigo_barras)
WHERE codigo_barras IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_activo ON products(activo);

CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    vendedor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    cliente_nombre VARCHAR(255),
    cliente_telefono VARCHAR(50),
    metodo_pago VARCHAR(50),
    comprobante_url VARCHAR(500),
    total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    fecha_venta TIMESTAMP NOT NULL DEFAULT NOW(),
    estado VARCHAR(20) NOT NULL DEFAULT 'completada',
    motivo_cancelacion TEXT,
    fecha_cancelacion TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    accion VARCHAR(100) NOT NULL,
    detalle TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
    key VARCHAR(64) PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_categoria ON products(categoria_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategoria ON products(subcategoria_id);
CREATE INDEX IF NOT EXISTS idx_products_destacado ON products(destacado);
CREATE INDEX IF NOT EXISTS idx_sales_vendedor ON sales(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_sales_fecha ON sales(fecha_venta);
CREATE INDEX IF NOT EXISTS idx_logs_usuario ON logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_created ON logs(created_at);
