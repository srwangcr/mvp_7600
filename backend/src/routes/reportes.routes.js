const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const reportesController = require('../controllers/reportes.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireModerator, requireAuthority } = require('../middleware/roles');
const { upload, handleMulterError } = require('../config/upload');
const { createReporteLimiter } = require('../middleware/rateLimiter');

// Validaciones
const createReporteValidation = [
  body('titulo').notEmpty().withMessage('El título es requerido'),
  body('descripcion').notEmpty().withMessage('La descripción es requerida'),
  body('categoria').notEmpty().withMessage('La categoría es requerida'),
  body('ubicacion_lat').isFloat().withMessage('Latitud inválida'),
  body('ubicacion_lng').isFloat().withMessage('Longitud inválida'),
  body('ubicacion_desc').notEmpty().withMessage('La descripción de ubicación es requerida')
];

// ====================================
// RUTAS PÚBLICAS (con auth opcional)
// ====================================

/**
 * GET /api/reportes
 * Obtener lista de reportes
 */
router.get('/', optionalAuth, reportesController.getReportes);

/**
 * GET /api/reportes/:id
 * Obtener detalle de un reporte
 */
router.get('/:id', optionalAuth, reportesController.getReporte);

/**
 * GET /api/reportes/categoria/:categoria
 * Obtener reportes por categoría
 */
router.get('/categoria/:categoria', optionalAuth, reportesController.getReportesByCategoria);

/**
 * GET /api/reportes/mapa/todos
 * Obtener reportes para mostrar en mapa
 */
router.get('/mapa/todos', reportesController.getReportesParaMapa);

// ====================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ====================================

/**
 * POST /api/reportes
 * Crear nuevo reporte
 */
router.post(
  '/',
  authenticateToken,
  createReporteLimiter,
  upload.array('evidencias', 5),
  handleMulterError,
  createReporteValidation,
  reportesController.createReporte
);

/**
 * PUT /api/reportes/:id
 * Actualizar reporte (solo propietario o autoridad asignada)
 */
router.put(
  '/:id',
  authenticateToken,
  upload.array('evidencias', 5),
  handleMulterError,
  reportesController.updateReporte
);

/**
 * DELETE /api/reportes/:id
 * Eliminar reporte (solo propietario o moderador)
 */
router.delete('/:id', authenticateToken, reportesController.deleteReporte);

/**
 * GET /api/reportes/mis-reportes/list
 * Obtener reportes del usuario actual
 */
router.get('/mis-reportes/list', authenticateToken, reportesController.getMisReportes);

/**
 * POST /api/reportes/:id/aprobar
 * Aprobar reporte (solo moderador)
 */
router.post('/:id/aprobar', authenticateToken, requireModerator, reportesController.aprobarReporte);

/**
 * POST /api/reportes/:id/asignar
 * Asignar reporte a autoridad (solo moderador)
 */
router.post('/:id/asignar', authenticateToken, requireModerator, reportesController.asignarReporte);

/**
 * POST /api/reportes/:id/resolver
 * Marcar reporte como resuelto (solo autoridad asignada)
 */
router.post('/:id/resolver', authenticateToken, requireAuthority, reportesController.resolverReporte);

/**
 * POST /api/reportes/:id/notas
 * Agregar notas de autoridad
 */
router.post('/:id/notas', authenticateToken, requireAuthority, reportesController.agregarNotas);

module.exports = router;
