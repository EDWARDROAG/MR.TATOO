-- CoreX — HU-044 recepción reparación + HU-045 venta de equipo (+ columnas unlock para HU-046)

CREATE TABLE IF NOT EXISTS equipment_receptions (
    id SERIAL PRIMARY KEY,
    folio VARCHAR(40) NOT NULL UNIQUE,
    tipo_equipo VARCHAR(50) NOT NULL,
    objeto_descripcion TEXT NOT NULL,
    numero_serie VARCHAR(120) DEFAULT '',
    descripcion_dano TEXT NOT NULL,
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_telefono VARCHAR(50) NOT NULL,
    cliente_documento VARCHAR(50) DEFAULT '',
    cliente_email VARCHAR(255) DEFAULT '',
    cliente_direccion TEXT DEFAULT '',
    estado VARCHAR(30) NOT NULL DEFAULT 'recibido',
    aviso_30_dias TEXT NOT NULL,
    usuario_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    unlock_tipo VARCHAR(20) NOT NULL DEFAULT 'ninguno',
    unlock_valor TEXT DEFAULT '',
    unlock_patron JSONB DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_receptions_created ON equipment_receptions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_equipment_receptions_telefono ON equipment_receptions(cliente_telefono);

CREATE TABLE IF NOT EXISTS equipment_sales (
    id SERIAL PRIMARY KEY,
    folio VARCHAR(40) NOT NULL UNIQUE,
    tipo_equipo VARCHAR(50) NOT NULL,
    objeto_descripcion TEXT NOT NULL,
    numero_serie VARCHAR(120) DEFAULT '',
    precio DECIMAL(12, 2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    observaciones TEXT DEFAULT '',
    garantia_texto TEXT DEFAULT '',
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_telefono VARCHAR(50) NOT NULL,
    cliente_documento VARCHAR(50) DEFAULT '',
    cliente_email VARCHAR(255) DEFAULT '',
    usuario_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_sales_created ON equipment_sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_equipment_sales_telefono ON equipment_sales(cliente_telefono);

COMMENT ON COLUMN equipment_receptions.unlock_tipo IS 'ninguno | patron | pin | password';
