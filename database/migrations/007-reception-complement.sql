-- CoreX HU-064 — campos complementarios recepción (escáner orden de servicio)

ALTER TABLE equipment_receptions
  ADD COLUMN IF NOT EXISTS fecha_notificacion DATE,
  ADD COLUMN IF NOT EXISTS fecha_entrega DATE,
  ADD COLUMN IF NOT EXISTS acc_bateria BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS acc_cargador BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS acc_disco_gb VARCHAR(32) DEFAULT '',
  ADD COLUMN IF NOT EXISTS acc_ram_gb VARCHAR(32) DEFAULT '',
  ADD COLUMN IF NOT EXISTS valor_estimado NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS acepta_condiciones BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN equipment_receptions.acepta_condiciones IS 'Cliente declara haber leído condiciones de servicio/venta';
