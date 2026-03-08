const { CasoAyuda, User, Donacion } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');
const { validationResult } = require('express-validator');

// Obtener lista de casos
exports.getCasos = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'aprobado', categoria, urgencia} = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    // Solo mostrar aprobados al público, a menos que sea moderador
    if (!req.user || !['moderador', 'administrador'].includes(req.user.rol)) {
      where.status = 'aprobado';
    } else if (status) {
      where.status = status;
    }

    if (categoria) where.categoria = categoria;
    if (urgencia) where.urgencia = urgencia;

    const { count, rows: casos } = await CasoAyuda.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [{
        model: User,
        as: 'usuario',
        attributes: ['id', 'nombre', 'apellido', 'avatar_url']
      }]
    });

    res.json({
      success: true,
      data: {
        casos,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error en getCasos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener casos' });
  }
};

// Obtener un caso por ID
exports.getCaso = async (req, res) => {
  try {
    const caso = await CasoAyuda.findByPk(req.params.id, {
      include: [
        { model: User, as: 'usuario', attributes: ['id', 'nombre', 'apellido', 'avatar_url', 'sinpe_movil'] },
        { model: Donacion, as: 'donaciones', where: { status: 'verificada' }, required: false }
      ]
    });

    if (!caso) {
      return res.status(404).json({ success: false, message: 'Caso no encontrado' });
    }

    // Incrementar visualizaciones
    caso.visualizaciones += 1;
    await caso.save();

    res.json({ success: true, data: caso });
  } catch (error) {
    logger.error('Error en getCaso:', error);
    res.status(500).json({ success: false, message: 'Error al obtener caso' });
  }
};

// Crear nuevo caso
exports.createCaso = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { titulo, descripcion, monto_solicitado, categoria, urgencia, ubicacion_lat, ubicacion_lng, ubicacion_desc, fecha_limite } = req.body;

    const fotos = req.files ? req.files.map(f => `/uploads/casos/${f.filename}`) : [];

    const caso = await CasoAyuda.create({
      user_id: req.user.id,
      titulo,
      descripcion,
      monto_solicitado,
      categoria,
      urgencia: urgencia || 'media',
      ubicacion_lat,
      ubicacion_lng,
      ubicacion_desc,
      fecha_limite,
      fotos,
      status: 'pendiente'
    });

    logger.info(`Nuevo caso creado: ${caso.id} por usuario ${req.user.id}`);
    res.status(201).json({ success: true, message: 'Caso creado exitosamente', data: caso });
  } catch (error) {
    logger.error('Error en createCaso:', error);
    res.status(500).json({ success: false, message: 'Error al crear caso' });
  }
};

// Actualizar caso
exports.updateCaso = async (req, res) => {
  try {
    const caso = await CasoAyuda.findByPk(req.params.id);
    if (!caso) {
      return res.status(404).json({ success: false, message: 'Caso no encontrado' });
    }

    const { titulo, descripcion, monto_solicitado, categoria, urgencia, ubicacion_desc, fecha_limite } = req.body;

    if (titulo) caso.titulo = titulo;
    if (descripcion) caso.descripcion = descripcion;
    if (monto_solicitado) caso.monto_solicitado = monto_solicitado;
    if (categoria) caso.categoria = categoria;
    if (urgencia) caso.urgencia = urgencia;
    if (ubicacion_desc) caso.ubicacion_desc = ubicacion_desc;
    if (fecha_limite) caso.fecha_limite = fecha_limite;

    if (req.files && req.files.length > 0) {
      const newFotos = req.files.map(f => `/uploads/casos/${f.filename}`);
      caso.fotos = [...caso.fotos, ...newFotos];
    }

    await caso.save();
    res.json({ success: true, message: 'Caso actualizado exitosamente', data: caso });
  } catch (error) {
    logger.error('Error en updateCaso:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar caso' });
  }
};

// Eliminar caso
exports.deleteCaso = async (req, res) => {
  try {
    const caso = await CasoAyuda.findByPk(req.params.id);
    if (!caso) {
      return res.status(404).json({ success: false, message: 'Caso no encontrado' });
    }

    await caso.destroy();
    res.json({ success: true, message: 'Caso eliminado exitosamente' });
  } catch (error) {
    logger.error('Error en deleteCaso:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar caso' });
  }
};

// Obtener mis casos
exports.getMisCasos = async (req, res) => {
  try {
    const casos = await CasoAyuda.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: casos });
  } catch (error) {
    logger.error('Error en getMisCasos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener tus casos' });
  }
};

// Aprobar caso (moderador)
exports.aprobarCaso = async (req, res) => {
  try {
    const caso = await CasoAyuda.findByPk(req.params.id);
    if (!caso) {
      return res.status(404).json({ success: false, message: 'Caso no encontrado' });
    }

    caso.status = 'aprobado';
    caso.aprobado_por = req.user.id;
    caso.fecha_aprobacion = new Date();
    await caso.save();

    res.json({ success: true, message: 'Caso aprobado exitosamente', data: caso });
  } catch (error) {
    logger.error('Error en aprobarCaso:', error);
    res.status(500).json({ success: false, message: 'Error al aprobar caso' });
  }
};

// Rechazar caso (moderador)
exports.rechazarCaso = async (req, res) => {
  try {
    const { razon } = req.body;
    const caso = await CasoAyuda.findByPk(req.params.id);
    if (!caso) {
      return res.status(404).json({ success: false, message: 'Caso no encontrado' });
    }

    caso.status = 'rechazado';
    caso.razon_rechazo = razon;
    caso.aprobado_por = req.user.id;
    await caso.save();

    res.json({ success: true, message: 'Caso rechazado', data: caso });
  } catch (error) {
    logger.error('Error en rechazarCaso:', error);
    res.status(500).json({ success: false, message: 'Error al rechazar caso' });
  }
};

// Completar caso
exports.completarCaso = async (req, res) => {
  try {
    const caso = await CasoAyuda.findByPk(req.params.id);
    if (!caso || caso.user_id !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Caso no encontrado' });
    }

    caso.status = 'completado';
    await caso.save();

    res.json({ success: true, message: 'Caso marcado como completado', data: caso });
  } catch (error) {
    logger.error('Error en completarCaso:', error);
    res.status(500).json({ success: false, message: 'Error al completar caso' });
  }
};

// Obtener casos por categoría
exports.getCasosByCategoria = async (req, res) => {
  try {
    const casos = await CasoAyuda.findAll({
      where: { categoria: req.params.categoria, status: 'aprobado' },
      include: [{ model: User, as: 'usuario', attributes: ['id', 'nombre', 'apellido'] }]
    });

    res.json({ success: true, data: casos });
  } catch (error) {
    logger.error('Error en getCasosByCategoria:', error);
    res.status(500).json({ success: false, message: 'Error al obtener casos' });
  }
};

// Obtener casos para mapa
exports.getCasosParaMapa = async (req, res) => {
  try {
    const casos = await CasoAyuda.findAll({
      where: {
        status: 'aprobado',
        ubicacion_lat: { [Op.ne]: null },
        ubicacion_lng: { [Op.ne]: null }
      },
      attributes: ['id', 'titulo', 'ubicacion_lat', 'ubicacion_lng', 'categoria', 'urgencia']
    });

    res.json({ success: true, data: casos });
  } catch (error) {
    logger.error('Error en getCasosParaMapa:', error);
    res.status(500).json({ success: false, message: 'Error al obtener casos para mapa' });
  }
};
