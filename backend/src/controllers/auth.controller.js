const { User, Notificacion } = require('../models');
const { generateToken } = require('../config/jwt');
const { sendEmail, emailTemplates } = require('../config/email');
const logger = require('../config/logger');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

/**
 * Registrar nuevo usuario
 */
exports.register = async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password, nombre, apellido, telefono, sinpe_movil } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear usuario
    const user = await User.create({
      email,
      password_hash: password, // El hook beforeCreate lo hasheará
      nombre,
      apellido,
      telefono,
      sinpe_movil,
      rol: 'usuario',
      email_verificado: false,
      activo: true
    });

    // Generar token
    const token = generateToken({ id: user.id, email: user.email, rol: user.rol });

    // Enviar email de bienvenida (sin bloquear la respuesta)
    sendEmail({
      to: user.email,
      ...emailTemplates.bienvenida(user.nombre)
    }).catch(err => logger.error('Error enviando email de bienvenida:', err));

    // Crear notificación de bienvenida
    await Notificacion.create({
      user_id: user.id,
      tipo: 'bienvenida',
      titulo: '¡Bienvenido a Ayuda Tica!',
      mensaje: 'Gracias por unirte a nuestra comunidad solidaria.',
      link: '/dashboard'
    });

    logger.info(`Nuevo usuario registrado: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: user.toSafeObject(),
        token
      }
    });

  } catch (error) {
    logger.error('Error en register:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

/**
 * Iniciar sesión
 */
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si está activo
    if (!user.activo) {
      return res.status(403).json({
        success: false,
        message: 'Tu cuenta ha sido desactivada. Contacta al administrador.'
      });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Actualizar última conexión
    user.ultima_conexion = new Date();
    await user.save();

    // Generar token
    const token = generateToken({ id: user.id, email: user.email, rol: user.rol });

    logger.info(`Usuario inició sesión: ${email}`);

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: user.toSafeObject(),
        token
      }
    });

  } catch (error) {
    logger.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

/**
 * Obtener información del usuario actual
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    logger.error('Error en getMe:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del usuario'
    });
  }
};

/**
 * Actualizar información del usuario actual
 */
exports.updateMe = async (req, res) => {
  try {
    const { nombre, apellido, telefono, sinpe_movil } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar campos permitidos
    if (nombre) user.nombre = nombre;
    if (apellido !== undefined) user.apellido = apellido;
    if (telefono !== undefined) user.telefono = telefono;
    if (sinpe_movil !== undefined) user.sinpe_movil = sinpe_movil;

    await user.save();

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: user.toSafeObject()
    });

  } catch (error) {
    logger.error('Error en updateMe:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil'
    });
  }
};

/**
 * Cambiar contraseña
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva son requeridas'
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Actualizar contraseña
    user.password_hash = newPassword; // El hook beforeUpdate lo hasheará
    await user.save();

    logger.info(`Usuario cambió contraseña: ${user.email}`);

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    logger.error('Error en changePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña'
    });
  }
};

/**
 * Solicitar restablecimiento de contraseña
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Por seguridad, no revelar si el email existe
      return res.json({
        success: true,
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
      });
    }

    // Generar token temporal
    const resetToken = crypto.randomBytes(32).toString('hex');
    // En producción, guardar este token en la DB con expiración
    // Por ahora, solo lo enviamos por email

    // Enviar email
    await sendEmail({
      to: user.email,
      ...emailTemplates.resetPassword(user.nombre, resetToken)
    });

    res.json({
      success: true,
      message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
    });

  } catch (error) {
    logger.error('Error en forgotPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar solicitud'
    });
  }
};

/**
 * Restablecer contraseña con token
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // TODO: Verificar token en la DB
    // Por ahora, respuesta básica

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });

  } catch (error) {
    logger.error('Error en resetPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error al restablecer contraseña'
    });
  }
};

/**
 * Verificar email
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // TODO: Verificar token en la DB
    // Por ahora, respuesta básica

    res.json({
      success: true,
      message: 'Email verificado exitosamente'
    });

  } catch (error) {
    logger.error('Error en verifyEmail:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar email'
    });
  }
};

/**
 * Cerrar sesión
 */
exports.logout = async (req, res) => {
  try {
    // En JWT stateless, el logout se maneja en el frontend eliminando el token
    // Aquí podríamos agregar el token a una blacklist si fuera necesario

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });

  } catch (error) {
    logger.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión'
    });
  }
};
