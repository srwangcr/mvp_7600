const express = require('express');
const router = express.Router();
const notificacionesController = require('../controllers/notificaciones.controller');
const { authenticateToken } = require('../middleware/auth');

// ====================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ====================================

/**
 * GET /api/notificaciones
 * Obtener notificaciones del usuario actual
 */
router.get('/', authenticateToken, notificacionesController.getNotificaciones);

/**
 * GET /api/notificaciones/no-leidas/count
 * Obtener cantidad de notificaciones no leídas
 */
router.get('/no-leidas/count', authenticateToken, notificacionesController.getNoLeidasCount);

/**
 * PUT /api/notificaciones/:id/leer
 * Marcar notificación como leída
 */
router.put('/:id/leer', authenticateToken, notificacionesController.marcarComoLeida);

/**
 * PUT /api/notificaciones/leer-todas/action
 * Marcar todas las notificaciones como leídas
 */
router.put('/leer-todas/action', authenticateToken, notificacionesController.marcarTodasComoLeidas);

/**
 * DELETE /api/notificaciones/:id
 * Eliminar notificación
 */
router.delete('/:id', authenticateToken, notificacionesController.deleteNotificacion);

/**
 * DELETE /api/notificaciones/todas/action
 * Eliminar todas las notificaciones
 */
router.delete('/todas/action', authenticateToken, notificacionesController.deleteTodasNotificaciones);

module.exports = router;
