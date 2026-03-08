const { User, CasoAyuda, Reporte, Donacion } = require('../models');
const logger = require('../config/logger');
const { Op } = require('sequelize');

exports.getDashboard = async (req, res) => {
  try {
    const totalUsuarios = await User.count();
    const totalCasos = await CasoAyuda.count();
    const casosPendientes = await CasoAyuda.count({ where: { status: 'pendiente' } });
    const reportesPendientes = await Reporte.count({ where: { status: 'abierto' } });
    const donacionesPendientes = await Donacion.count({ where: { status: 'pendiente' } });

    res.json({
      success: true,
      data: {
        totalUsuarios,
        totalCasos,
        casosPendientes,
        reportesPendientes,
        donacionesPendientes
      }
    });
  } catch (error) {
    logger.error('Error en getDashboard:', error);
    res.status(500).json({ success: false, message: 'Error al obtener dashboard' });
  }
};

exports.getUsuarios = async (req, res) => {
  try {
    const { page = 1, limit = 20, rol } = req.query;
    const where = {};
    if (rol) where.rol = rol;

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        usuarios: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error en getUsuarios:', error);
    res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
  }
};

exports.cambiarRolUsuario = async (req, res) => {
  try {
    const { rol } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    
    user.rol = rol;
    await user.save();

    logger.info(`Rol de usuario ${user.email} cambiado a ${rol} por ${req.user.email}`);
    res.json({ success: true, message: 'Rol actualizado', data: user.toSafeObject() });
  } catch (error) {
    logger.error('Error en cambiarRolUsuario:', error);
    res.status(500).json({ success: false, message: 'Error al cambiar rol' });
  }
};

exports.toggleUsuarioActivo = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    
    user.activo = !user.activo;
    await user.save();

    logger.info(`Usuario ${user.email} ${user.activo ? 'activado' : 'desactivado'} por ${req.user.email}`);
    res.json({ success: true, message: `Usuario ${user.activo ? 'activado' : 'desactivado'}`, data: user.toSafeObject() });
  } catch (error) {
    logger.error('Error en toggleUsuarioActivo:', error);
    res.status(500).json({ success: false, message: 'Error al cambiar estado' });
  }
};

exports.getCasosPendientes = async (req, res) => {
  try {
    const casos = await CasoAyuda.findAll({
      where: { status: 'pendiente' },
      include: [{ model: User, as: 'usuario', attributes: ['id', 'nombre', 'email'] }],
      order: [['created_at', 'ASC']]
    });
    res.json({ success: true, data: casos });
  } catch (error) {
    logger.error('Error en getCasosPendientes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener casos pendientes' });
  }
};

exports.getReportesPendientes = async (req, res) => {
  try {
    const reportes = await Reporte.findAll({
      where: { status: 'abierto' },
      include: [{ model: User, as: 'usuario', attributes: ['id', 'nombre', 'email'] }],
      order: [['created_at', 'ASC']]
    });
    res.json({ success: true, data: reportes });
  } catch (error) {
    logger.error('Error en getReportesPendientes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener reportes pendientes' });
  }
};

exports.getDonacionesPendientes = async (req, res) => {
  try {
    const donaciones = await Donacion.findAll({
      where: { status: 'pendiente' },
      include: [
        { model: CasoAyuda, as: 'caso', attributes: ['id', 'titulo'] },
        { model: User, as: 'donante', attributes: ['id', 'nombre'], required: false }
      ],
      order: [['created_at', 'ASC']]
    });
    res.json({ success: true, data: donaciones });
  } catch (error) {
    logger.error('Error en getDonacionesPendientes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener donaciones pendientes' });
  }
};

exports.getEstadisticas = async (req, res) => {
  try {
    const totalUsuarios = await User.count();
    const totalCasos = await CasoAyuda.count();
    const casosAprobados = await CasoAyuda.count({ where: { status: 'aprobado' } });
    const totalReportes = await Reporte.count();
    const reportesResueltos = await Reporte.count({ where: { status: 'resuelto' } });
    const totalDonaciones = await Donacion.count();
    const donacionesVerificadas = await Donacion.count({ where: { status: 'verificada' } });

    res.json({
      success: true,
      data: {
        usuarios: { total: totalUsuarios },
        casos: { total: totalCasos, aprobados: casosAprobados },
        reportes: { total: totalReportes, resueltos: reportesResueltos },
        donaciones: { total: totalDonaciones, verificadas: donacionesVerificadas }
      }
    });
  } catch (error) {
    logger.error('Error en getEstadisticas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
  }
};

exports.getActividadReciente = async (req, res) => {
  try {
    const limit = 20;
    
    const casosRecientes = await CasoAyuda.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'titulo', 'created_at'],
      include: [{ model: User, as: 'usuario', attributes: ['nombre'] }]
    });

    const reportesRecientes = await Reporte.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'titulo', 'created_at'],
      include: [{ model: User, as: 'usuario', attributes: ['nombre'] }]
    });

    res.json({
      success: true,
      data: {
        casos: casosRecientes,
        reportes: reportesRecientes
      }
    });
  } catch (error) {
    logger.error('Error en getActividadReciente:', error);
    res.status(500).json({ success: false, message: 'Error al obtener actividad' });
  }
};
