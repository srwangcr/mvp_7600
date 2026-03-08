const { Reporte, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

exports.getReportes = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, categoria } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (categoria) where.categoria = categoria;
    if (!req.user || !['moderador', 'administrador', 'autoridad'].includes(req.user.rol)) {
      where.visible_publico = true;
    }

    const { count, rows } = await Reporte.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'usuario', attributes: ['id', 'nombre', 'apellido'] }]
    });

    res.json({ success: true, data: { reportes: rows, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) }}});
  } catch (error) {
    logger.error('Error en getReportes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener reportes' });
  }
};

exports.getReporte = async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id, {
      include: [
        { model: User, as: 'usuario', attributes: ['id', 'nombre', 'apellido'] },
        { model: User, as: 'autoridad', attributes: ['id', 'nombre', 'apellido'], required: false }
      ]
    });
    if (!reporte) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    
    reporte.visualizaciones += 1;
    await reporte.save();
    res.json({ success: true, data: reporte });
  } catch (error) {
    logger.error('Error en getReporte:', error);
    res.status(500).json({ success: false, message: 'Error al obtener reporte' });
  }
};

exports.createReporte = async (req, res) => {
  try {
    const { titulo, descripcion, categoria, ubicacion_lat, ubicacion_lng, ubicacion_desc, direccion, nombre_establecimiento } = req.body;
    const evidencias = req.files ? req.files.map(f => `/uploads/reportes/${f.filename}`) : [];

    const reporte = await Reporte.create({
      user_id: req.user.id,
      titulo,
      descripcion,
      categoria,
      ubicacion_lat,
      ubicacion_lng,
      ubicacion_desc,
      direccion,
      nombre_establecimiento,
      evidencias,
      status: 'abierto'
    });

    logger.info(`Nuevo reporte creado: ${reporte.id}`);
    res.status(201).json({ success: true, message: 'Reporte creado exitosamente', data: reporte });
  } catch (error) {
    logger.error('Error en createReporte:', error);
    res.status(500).json({ success: false, message: 'Error al crear reporte' });
  }
};

exports.updateReporte = async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id);
    if (!reporte) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    
    const { titulo, descripcion, direccion, nombre_establecimiento } = req.body;
    if (titulo) reporte.titulo = titulo;
    if (descripcion) reporte.descripcion = descripcion;
    if (direccion) reporte.direccion = direccion;
    if (nombre_establecimiento) reporte.nombre_establecimiento = nombre_establecimiento;
    
    await reporte.save();
    res.json({ success: true, message: 'Reporte actualizado', data: reporte });
  } catch (error) {
    logger.error('Error en updateReporte:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar reporte' });
  }
};

exports.deleteReporte = async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id);
    if (!reporte) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    
    await reporte.destroy();
    res.json({ success: true, message: 'Reporte eliminado' });
  } catch (error) {
    logger.error('Error en deleteReporte:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar reporte' });
  }
};

exports.getMisReportes = async (req, res) => {
  try {
    const reportes = await Reporte.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: reportes });
  } catch (error) {
    logger.error('Error en getMisReportes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener reportes' });
  }
};

exports.aprobarReporte = async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id);
    if (!reporte) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    
    reporte.status = 'en_revision';
    reporte.aprobado_por = req.user.id;
    reporte.fecha_aprobacion = new Date();
    await reporte.save();
    res.json({ success: true, message: 'Reporte aprobado', data: reporte });
  } catch (error) {
    logger.error('Error en aprobarReporte:', error);
    res.status(500).json({ success: false, message: 'Error al aprobar reporte' });
  }
};

exports.asignarReporte = async (req, res) => {
  try {
    const { autoridad_id } = req.body;
    const reporte = await Reporte.findByPk(req.params.id);
    if (!reporte) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    
    reporte.asignado_a = autoridad_id;
    reporte.fecha_asignacion = new Date();
    reporte.status = 'en_proceso';
    await reporte.save();
    res.json({ success: true, message: 'Reporte asignado', data: reporte });
  } catch (error) {
    logger.error('Error en asignarReporte:', error);
    res.status(500).json({ success: false, message: 'Error al asignar reporte' });
  }
};

exports.resolverReporte = async (req, res) => {
  try {
    const reporte = await Reporte.findByPk(req.params.id);
    if (!reporte) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    
    reporte.status = 'resuelto';
    reporte.fecha_resolucion = new Date();
    await reporte.save();
    res.json({ success: true, message: 'Reporte marcado como resuelto', data: reporte });
  } catch (error) {
    logger.error('Error en resolverReporte:', error);
    res.status(500).json({ success: false, message: 'Error al resolver reporte' });
  }
};

exports.agregarNotas = async (req, res) => {
  try {
    const { notas } = req.body;
    const reporte = await Reporte.findByPk(req.params.id);
    if (!reporte) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    
    reporte.notas_autoridad = notas;
    await reporte.save();
    res.json({ success: true, message: 'Notas agregadas', data: reporte });
  } catch (error) {
    logger.error('Error en agregarNotas:', error);
    res.status(500).json({ success: false, message: 'Error al agregar notas' });
  }
};

exports.getReportesByCategoria = async (req, res) => {
  try {
    const reportes = await Reporte.findAll({
      where: { categoria: req.params.categoria, visible_publico: true },
      include: [{ model: User, as: 'usuario', attributes: ['id', 'nombre'] }]
    });
    res.json({ success: true, data: reportes });
  } catch (error) {
    logger.error('Error en getReportesByCategoria:', error);
    res.status(500).json({ success: false, message: 'Error al obtener reportes' });
  }
};

exports.getReportesParaMapa = async (req, res) => {
  try {
    const reportes = await Reporte.findAll({
      where: {
        visible_publico: true,
        ubicacion_lat: { [Op.ne]: null },
        ubicacion_lng: { [Op.ne]: null }
      },
      attributes: ['id', 'titulo', 'ubicacion_lat', 'ubicacion_lng', 'categoria', 'status']
    });
    res.json({ success: true, data: reportes });
  } catch (error) {
    logger.error('Error en getReportesParaMapa:', error);
    res.status(500).json({ success: false, message: 'Error al obtener reportes' });
  }
};
