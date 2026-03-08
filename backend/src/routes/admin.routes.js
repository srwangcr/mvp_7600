const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin, requireModerator } = require('../middleware/roles');

// ====================================
// RUTAS ADMINISTRATIVAS (requieren rol admin o moderador)
// ====================================

/**
 * GET /api/admin/dashboard
 * Obtener estadísticas del dashboard
 */
router.get('/dashboard', authenticateToken, requireModerator, adminController.getDashboard);

/**
 * GET /api/admin/usuarios
 * Obtener lista de todos los usuarios
 */
router.get('/usuarios', authenticateToken, requireModerator, adminController.getUsuarios);

/**
 * PUT /api/admin/usuarios/:id/rol
 * Cambiar rol de un usuario (solo admin)
 */
router.put('/usuarios/:id/rol', authenticateToken, requireAdmin, adminController.cambiarRolUsuario);

/**
 * PUT /api/admin/usuarios/:id/toggle-activo
 * Activar/desactivar usuario (solo admin)
 */
router.put('/usuarios/:id/toggle-activo', authenticateToken, requireAdmin, adminController.toggleUsuarioActivo);

/**
 * GET /api/admin/casos-pendientes
 * Obtener casos pendientes de aprobación (moderador)
 */
router.get('/casos-pendientes', authenticateToken, requireModerator, adminController.getCasosPendientes);

/**
 * GET /api/admin/reportes-pendientes
 * Obtener reportes pendientes de aprobación (moderador)
 */
router.get('/reportes-pendientes', authenticateToken, requireModerator, adminController.getReportesPendientes);

/**
 * GET /api/admin/donaciones-pendientes
 * Obtener donaciones pendientes de verificación (moderador)
 */
router.get('/donaciones-pendientes', authenticateToken, requireModerator, adminController.getDonacionesPendientes);

/**
 * GET /api/admin/estadisticas
 * Obtener estadísticas generales de la plataforma
 */
router.get('/estadisticas', authenticateToken, requireModerator, adminController.getEstadisticas);

/**
 * GET /api/admin/actividad-reciente
 * Obtener actividad reciente en la plataforma
 */
router.get('/actividad-reciente', authenticateToken, requireModerator, adminController.getActividadReciente);

module.exports = router;
