const { Notificacion } = require('../models');
const logger = require('../config/logger');

exports.getNotificaciones = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const notificaciones = await Notificacion.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });
    res.json({ success: true, data: notificaciones });
  } catch (error) {
    logger.error('Error en getNotificaciones:', error);
    res.status(500).json({ success: false, message: 'Error al obtener notificaciones' });
  }
};

exports.getNoLeidasCount = async (req, res) => {
  try {
    const count = await Notificacion.count({
      where: { user_id: req.user.id, leida: false }
    });
    res.json({ success: true, data: { count } });
  } catch (error) {
    logger.error('Error en getNoLeidasCount:', error);
    res.status(500).json({ success: false, message: 'Error al contar notificaciones' });
  }
};

exports.marcarComoLeida = async (req, res) => {
  try {
    const notificacion = await Notificacion.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });
    if (!notificacion) return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
    
    notificacion.leida = true;
    await notificacion.save();
    res.json({ success: true, message: 'Notificación marcada como leída' });
  } catch (error) {
    logger.error('Error en marcarComoLeida:', error);
    res.status(500).json({ success: false, message: 'Error al marcar notificación' });
  }
};

exports.marcarTodasComoLeidas = async (req, res) => {
  try {
    await Notificacion.update(
      { leida: true },
      { where: { user_id: req.user.id, leida: false } }
    );
    res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    logger.error('Error en marcarTodasComoLeidas:', error);
    res.status(500).json({ success: false, message: 'Error al marcar notificaciones' });
  }
};

exports.deleteNotificacion = async (req, res) => {
  try {
    const notificacion = await Notificacion.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });
    if (!notificacion) return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
    
    await notificacion.destroy();
    res.json({ success: true, message: 'Notificación eliminada' });
  } catch (error) {
    logger.error('Error en deleteNotificacion:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar notificación' });
  }
};

exports.deleteTodasNotificaciones = async (req, res) => {
  try {
    await Notificacion.destroy({
      where: { user_id: req.user.id }
    });
    res.json({ success: true, message: 'Todas las notificaciones eliminadas' });
  } catch (error) {
    logger.error('Error en deleteTodasNotificaciones:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar notificaciones' });
  }
};
