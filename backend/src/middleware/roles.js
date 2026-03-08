/**
 * Middleware para verificar roles de usuario
 * @param  {...string} allowedRoles - Roles permitidos
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
        requiredRole: allowedRoles,
        currentRole: req.user.rol
      });
    }

    next();
  };
};

/**
 * Middleware para verificar si el usuario es administrador
 */
const requireAdmin = requireRole('administrador');

/**
 * Middleware para verificar si el usuario es moderador o superior
 */
const requireModerator = requireRole('moderador', 'administrador');

/**
 * Middleware para verificar si el usuario es autoridad o superior
 */
const requireAuthority = requireRole('autoridad', 'moderador', 'administrador');

/**
 * Verifica si el usuario es el propietario del recurso o tiene permisos superiores
 * @param {Function} getResourceOwnerId - Función que retorna el ID del propietario del recurso
 */
const requireOwnerOrModerator = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado'
        });
      }

      // Moderadores y administradores tienen acceso automático
      if (['moderador', 'administrador'].includes(req.user.rol)) {
        return next();
      }

      // Obtener el ID del propietario del recurso
      const ownerId = await getResourceOwnerId(req);

      // Verificar si el usuario es el propietario
      if (req.user.id !== ownerId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este recurso'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
        error: error.message
      });
    }
  };
};

module.exports = {
  requireRole,
  requireAdmin,
  requireModerator,
  requireAuthority,
  requireOwnerOrModerator
};
