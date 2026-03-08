const rateLimit = require('express-rate-limit');

// Rate limiter global (para todas las rutas)
const globalLimiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000, // minutos a milisegundos
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter estricto para autenticación (prevenir brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  skipSuccessfulRequests: true, // No contar requests exitosos
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Por favor intenta en 15 minutos.'
  }
});

// Rate limiter para registro de usuarios
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 registros por hora
  message: {
    success: false,
    message: 'Demasiados registros desde esta IP. Por favor intenta más tarde.'
  }
});

// Rate limiter para creación de casos
const createCasoLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 5, // 5 casos por día
  message: {
    success: false,
    message: 'Has alcanzado el límite de casos por día. Intenta mañana.'
  }
});

// Rate limiter para creación de reportes
const createReporteLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 10, // 10 reportes por día
  message: {
    success: false,
    message: 'Has alcanzado el límite de reportes por día. Intenta mañana.'
  }
});

// Rate limiter para upload de archivos
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 uploads cada 15 minutos
  message: {
    success: false,
    message: 'Demasiados uploads. Por favor espera un momento.'
  }
});

// Rate limiter para emails
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // 5 emails por hora
  message: {
    success: false,
    message: 'Demasiados correos enviados. Por favor intenta más tarde.'
  }
});

module.exports = {
  globalLimiter,
  authLimiter,
  registerLimiter,
  createCasoLimiter,
  createReporteLimiter,
  uploadLimiter,
  emailLimiter
};
