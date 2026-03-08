const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const donacionesController = require('../controllers/donaciones.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireModerator } = require('../middleware/roles');
const { upload, handleMulterError } = require('../config/upload');

// Validaciones
const createDonacionValidation = [
  body('caso_id').notEmpty().withMessage('El ID del caso es requerido'),
  body('monto').isFloat({ min: 1 }).withMessage('El monto debe ser mayor a 0'),
  body('nombre_donante').optional(),
  body('email_donante').optional().isEmail().withMessage('Email inválido'),
  body('mensaje').optional(),
  body('anonimo').optional().isBoolean()
];

// ====================================
// RUTAS PÚBLICAS
// ====================================

/**
 * GET /api/donaciones/caso/:casoId
 * Obtener donaciones de un caso (solo verificadas)
 */
router.get('/caso/:casoId', donacionesController.getDonacionesByCaso);

// ====================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ====================================

/**
 * POST /api/donaciones
 * Registrar intención de donación
 */
router.post(
  '/',
  optionalAuth,
  upload.single('comprobante'),
  handleMulterError,
  createDonacionValidation,
  donacionesController.createDonacion
);

/**
 * GET /api/donaciones/mis-donaciones/list
 * Obtener donaciones del usuario actual
 */
router.get('/mis-donaciones/list', authenticateToken, donacionesController.getMisDonaciones);

/**
 * GET /api/donaciones/recibidas/list
 * Obtener donaciones recibidas en mis casos
 */
router.get('/recibidas/list', authenticateToken, donacionesController.getDonacionesRecibidas);

/**
 * POST /api/donaciones/:id/verificar
 * Verificar donación (solo moderador)
 */
router.post('/:id/verificar', authenticateToken, requireModerator, donacionesController.verificarDonacion);

/**
 * POST /api/donaciones/:id/rechazar
 * Rechazar donación (solo moderador)
 */
router.post('/:id/rechazar', authenticateToken, requireModerator, donacionesController.rechazarDonacion);

/**
 * GET /api/donaciones/pendientes/list
 * Obtener donaciones pendientes de verificación (solo moderador)
 */
router.get('/pendientes/list', authenticateToken, requireModerator, donacionesController.getDonacionesPendientes);

/**
 * GET /api/donaciones/:id
 * Obtener detalle de una donación
 */
router.get('/:id', authenticateToken, donacionesController.getDonacion);

module.exports = router;
