require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// Importar configuraciones
const { sequelize } = require('./src/config/database');
const logger = require('./src/config/logger');
const corsOptions = require('./src/config/cors');
const rateLimiters = require('./src/middleware/rateLimiter');

// Importar rutas
const authRoutes = require('./src/routes/auth.routes');
const casosRoutes = require('./src/routes/casos.routes');
const reportesRoutes = require('./src/routes/reportes.routes');
const donacionesRoutes = require('./src/routes/donaciones.routes');
const notificacionesRoutes = require('./src/routes/notificaciones.routes');
const usuariosRoutes = require('./src/routes/usuarios.routes');
const adminRoutes = require('./src/routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ====================================
// MIDDLEWARES
// ====================================

// Seguridad
app.use(helmet());

// CORS
app.use(cors(corsOptions));

// Compresión
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', { stream: logger.stream }));
} else {
  app.use(morgan('dev'));
}

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting global
app.use(rateLimiters.globalLimiter);

// ====================================
// RUTAS
// ====================================

// Health check (para Docker healthcheck)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/casos', casosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/donaciones', donacionesRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/admin', adminRoutes);

// Ruta raíz
app.get('/api', (req, res) => {
  res.json({
    message: 'Bienvenido a Ayuda Tica API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      casos: '/api/casos',
      reportes: '/api/reportes',
      donaciones: '/api/donaciones',
      notificaciones: '/api/notificaciones',
      usuarios: '/api/usuarios',
      admin: '/api/admin'
    }
  });
});

// ====================================
// MANEJO DE ERRORES
// ====================================

// 404 - Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Error handler global
app.use((err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ====================================
// INICIALIZACIÓN DEL SERVIDOR
// ====================================

const startServer = async () => {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    logger.info('Conexión a PostgreSQL establecida correctamente');

    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      logger.info('Modelos sincronizados con la base de datos');
    }

    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Servidor corriendo en puerto ${PORT}`);
      logger.info(`Entorno: ${process.env.NODE_ENV}`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
    });

  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

// Iniciar servidor
startServer();

module.exports = app;
