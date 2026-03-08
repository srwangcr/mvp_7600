const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authLimiter, registerLimiter, emailLimiter } = require('../middleware/rateLimiter');
const { authenticateToken } = require('../middleware/auth');

// Validaciones
const registerValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('apellido').optional(),
  body('telefono').optional(),
  body('sinpe_movil').optional()
];

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];

// ====================================
// RUTAS PÚBLICAS
// ====================================

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */
router.post('/register', registerLimiter, registerValidation, authController.register);

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post('/login', authLimiter, loginValidation, authController.login);

/**
 * POST /api/auth/forgot-password
 * Solicitar restablecimiento de contraseña
 */
router.post('/forgot-password', emailLimiter, authController.forgotPassword);

/**
 * POST /api/auth/reset-password
 * Restablecer contraseña con token
 */
router.post('/reset-password', authController.resetPassword);

/**
 * GET /api/auth/verify-email/:token
 * Verificar email
 */
router.get('/verify-email/:token', authController.verifyEmail);

// ====================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ====================================

/**
 * GET /api/auth/me
 * Obtener información del usuario actual
 */
router.get('/me', authenticateToken, authController.getMe);

/**
 * PUT /api/auth/me
 * Actualizar información del usuario actual
 */
router.put('/me', authenticateToken, authController.updateMe);

/**
 * PUT /api/auth/change-password
 * Cambiar contraseña
 */
router.put('/change-password', authenticateToken, authController.changePassword);

/**
 * POST /api/auth/logout
 * Cerrar sesión (opcional para limpiar en el backend)
 */
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
