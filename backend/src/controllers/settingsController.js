/**
 * ============================================================
 * ARCHIVO: settingsController.js
 * UBICACIÓN: backend/src/controllers/
 * ROL: controller
 * VERSIÓN: 2.1 — cabecera unificada
 * ÚLTIMA ACTUALIZACIÓN: 2026-07-30 18:15
 * ============================================================
 * PROPÓSITO:
 *   Controlador HTTP — endpoints de settings.
 *
 * FUNCIONES / API (contrato exporta):
 *   getModules, updateModules, getSite, updateSite, uploadSocialLogo
 *
 * DEPENDENCIAS CLAVE:
 *   Setting
 *
 * CONSUMIDORES / RELACIONES:
 *   Importado por: Revisar imports en el resto del proyecto
 *
 * NOTAS:
 *   Backend · mantener contrato y consumidores al cambiar la API
 *
 * ============================================================
 * HISTORIAL DE CAMBIOS:
 * -----------------------------------------------------------
 * [2.1] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [2.0] - 2026-07-30 18:15
 *    ✅ Cabecera unificada (contrato + trazabilidad Lamakinet/CoreX)
 * [1.0] - (previo)
 *    ✅ Implementación existente antes de unificar cabecera
 * ============================================================
 */

const Setting = require('../models/Setting');

exports.getModules = async (req, res, next) => {
  try {
    const modules = await Setting.getModules();
    res.json({ success: true, data: modules });
  } catch (err) {
    next(err);
  }
};

exports.updateModules = async (req, res, next) => {
  try {
    const { modules } = req.body;
    if (!modules || typeof modules !== 'object') {
      return res.status(400).json({ success: false, message: 'Se requiere el objeto modules' });
    }
    const updated = await Setting.updateModules(modules);
    res.json({ success: true, message: 'Módulos actualizados', data: updated });
  } catch (err) {
    next(err);
  }
};

/** Público: contacto, horarios y redes para el sitio */
exports.getSite = async (req, res, next) => {
  try {
    const site = await Setting.getSite();
    res.json({ success: true, data: site });
  } catch (err) {
    next(err);
  }
};

/** Admin: actualiza general / whatsapp / schedule / social / carrito */
exports.updateSite = async (req, res, next) => {
  try {
    const { general, whatsapp, schedule, social, carrito } = req.body || {};
    if (
      !general &&
      !whatsapp &&
      !schedule &&
      social === undefined &&
      !carrito
    ) {
      return res.status(400).json({
        success: false,
        message: 'Envía general, whatsapp, schedule, carrito y/o social',
      });
    }
    const updated = await Setting.updateSite({
      general,
      whatsapp,
      schedule,
      social,
      carrito,
    });
    res.json({ success: true, message: 'Configuración del sitio actualizada', data: updated });
  } catch (err) {
    next(err);
  }
};

/** Admin: sube logo de una red social → /uploads/branding/... */
exports.uploadSocialLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se subió ninguna imagen' });
    }
    const socialId = String(req.body?.social_id || '').trim().toLowerCase();
    if (!socialId) {
      return res.status(400).json({ success: false, message: 'social_id es requerido' });
    }

    const logoUrl = `/uploads/branding/${req.file.filename}`;
    const site = await Setting.getSite();
    const social = Array.isArray(site.social) ? [...site.social] : [];
    const idx = social.findIndex((s) => s.id === socialId);
    if (idx >= 0) {
      social[idx] = { ...social[idx], logo: logoUrl };
    } else {
      social.push({
        id: socialId,
        name: socialId,
        url: '',
        logo: logoUrl,
      });
    }

    const updated = await Setting.updateSite({ social });
    res.json({
      success: true,
      message: 'Logo de red actualizado',
      data: {
        logo: logoUrl,
        social: updated.social,
        site: updated,
      },
    });
  } catch (err) {
    next(err);
  }
};
