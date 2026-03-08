const { User, CasoAyuda, Donacion } = require('../models');
const logger = require('../config/logger');

exports.getUsuario = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash', 'cedula', 'sinpe_movil'] }
    });
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, data: user });
  } catch (error) {
    logger.error('Error en getUsuario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener usuario' });
  }
};

exports.getCasosUsuario = async (req, res) => {
  try {
    const casos = await CasoAyuda.findAll({
      where: { user_id: req.params.id, status: 'aprobado' },
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: casos });
  } catch (error) {
    logger.error('Error en getCasosUsuario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener casos' });
  }
};

exports.getEstadisticasUsuario = async (req, res) => {
  try {
    const totalCasos = await CasoAyuda.count({ where: { user_id: req.params.id } });
    const casosAprobados = await CasoAyuda.count({ where: { user_id: req.params.id, status: 'aprobado' } });
    const totalDonaciones = await Donacion.count({ where: { donante_id: req.params.id, status: 'verificada' } });

    res.json({
      success: true,
      data: {
        totalCasos,
        casosAprobados,
        totalDonaciones
      }
    });
  } catch (error) {
    logger.error('Error en getEstadisticasUsuario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    
    // En producción, aquí subirías la imagen
    const { avatar_url } = req.body;
    user.avatar_url = avatar_url;
    await user.save();

    res.json({ success: true, message: 'Avatar actualizado', data: user.toSafeObject() });
  } catch (error) {
    logger.error('Error en updateAvatar:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar avatar' });
  }
};

exports.getMiPerfilCompleto = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    
    const misCasos = await CasoAyuda.count({ where: { user_id: req.user.id } });
    const misDonaciones = await Donacion.count({ where: { donante_id: req.user.id, status: 'verificada' } });

    res.json({
      success: true,
      data: {
        ...user.toJSON(),
        estadisticas: {
          misCasos,
          misDonaciones
        }
      }
    });
  } catch (error) {
    logger.error('Error en getMiPerfilCompleto:', error);
    res.status(500).json({ success: false, message: 'Error al obtener perfil' });
  }
};
