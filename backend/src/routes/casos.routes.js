const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const casosController = require('../controllers/casos.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireModerator, requireOwnerOrModerator } = require('../middleware/roles');
const { upload, handleMulterError } = require('../config/upload');
const { createCasoLimiter } = require('../middleware/rateLimiter');

// Validaciones
const createCasoValidation = [
  body('titulo').notEmpty().withMessage('El título es requerido'),
  body('descripcion').notEmpty().withMessage('La descripción es requerida'),
  body('monto_solicitado').isFloat({ min: 1 }).withMessage('El monto debe ser mayor a 0'),
  body('categoria').optional(),
  body('urgencia').optional()
];

// ====================================
// RUTAS PÚBLICAS (con auth opcional)
// ====================================

/**
 * GET /api/casos
 * Obtener lista de casos (solo aprobados para público)
 */
router.get('/', optionalAuth, casosController.getCasos);

/**
 * GET /api/casos/:id
 * Obtener detalle de un caso
 */
router.get('/:id', optionalAuth, casosController.getCaso);

/**
 * GET /api/casos/categoria/:categoria
 * Obtener casos por categoría
 */
router.get('/categoria/:categoria', optionalAuth, casosController.getCasosByCategoria);

/**
 * GET /api/casos/mapa/todos
 * Obtener casos para mostrar en mapa
 */
router.get('/mapa/todos', casosController.getCasosParaMapa);

// ====================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ====================================

/**
 * POST /api/casos
 * Crear nuevo caso de ayuda
 */
router.post(
  '/',
  authenticateToken,
  createCasoLimiter,
  upload.array('fotos', 5),
  handleMulterError,
  createCasoValidation,
  casosController.createCaso
);

/**
 * PUT /api/casos/:id
 * Actualizar caso (solo propietario o moderador)
 */
router.put(
  '/:id',
  authenticateToken,
  requireOwnerOrModerator(async (req) => {
    const { CasoAyuda } = require('../models');
    const caso = await CasoAyuda.findByPk(req.params.id);
    return caso ? caso.user_id : null;
  }),
  upload.array('fotos', 5),
  handleMulterError,
  casosController.updateCaso
);

/**
 * DELETE /api/casos/:id
 * Eliminar caso (solo propietario o moderador)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireOwnerOrModerator(async (req) => {
    const { CasoAyuda } = require('../models');
    const caso = await CasoAyuda.findByPk(req.params.id);
    return caso ? caso.user_id : null;
  }),
  casosController.deleteCaso
);

/**
 * GET /api/casos/mis-casos/list
 * Obtener casos del usuario actual
 */
router.get('/mis-casos/list', authenticateToken, casosController.getMisCasos);

/**
 * POST /api/casos/:id/aprobar
 * Aprobar caso (solo moderador)
 */
router.post('/:id/aprobar', authenticateToken, requireModerator, casosController.aprobarCaso);

/**
 * POST /api/casos/:id/rechazar
 * Rechazar caso (solo moderador)
 */
router.post('/:id/rechazar', authenticateToken, requireModerator, casosController.rechazarCaso);

/**
 * POST /api/casos/:id/completar
 * Marcar caso como completado (solo propietario)
 */
router.post('/:id/completar', authenticateToken, casosController.completarCaso);

module.exports = router;
