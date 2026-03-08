const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const { authenticateToken } = require('../middleware/auth');

// ====================================
// RUTAS PÚBLICAS
// ====================================

/**
 * GET /api/usuarios/:id
 * Obtener perfil público de un usuario
 */
router.get('/:id', usuariosController.getUsuario);

/**
 * GET /api/usuarios/:id/casos
 * Obtener casos de un usuario
 */
router.get('/:id/casos', usuariosController.getCasosUsuario);

/**
 * GET /api/usuarios/:id/estadisticas
 * Obtener estadísticas de un usuario
 */
router.get('/:id/estadisticas', usuariosController.getEstadisticasUsuario);

// ====================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ====================================

/**
 * PUT /api/usuarios/perfil/avatar
 * Actualizar avatar del usuario
 */
router.put('/perfil/avatar', authenticateToken, usuariosController.updateAvatar);

/**
 * GET /api/usuarios/me/completo
 * Obtener perfil completo del usuario actual
 */
router.get('/me/completo', authenticateToken, usuariosController.getMiPerfilCompleto);

module.exports = router;
