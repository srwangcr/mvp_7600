const { verifyToken } = require('../config/jwt');
const { User } = require('../models');
const logger = require('../config/logger');

/**
 * Middleware para proteger rutas que requieren autenticación
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación no proporcionado'
      });
    }

    // Verificar token
    const decoded = verifyToken(token);

    // Buscar usuario en la base de datos
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user || !user.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o inactivo'
      });
    }

    // Agregar usuario al request
    req.user = {
      id: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre
    };

    next();
  } catch (error) {
    logger.error('Error en autenticación:', error);
    return res.status(403).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 * Útil para rutas que pueden ser públicas o privadas
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password_hash'] }
      });

      if (user && user.activo) {
        req.user = {
          id: user.id,
          email: user.email,
          rol: user.rol,
          nombre: user.nombre
        };
      }
    }

    next();
  } catch (error) {
    // Si hay error, simplemente continuar sin usuario
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
