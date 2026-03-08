const { Donacion, CasoAyuda, User } = require('../models');
const logger = require('../config/logger');

exports.getDonacionesByCaso = async (req, res) => {
  try {
    const donaciones = await Donacion.findAll({
      where: { caso_id: req.params.casoId, status: 'verificada' },
      attributes: ['id', 'monto', 'nombre_donante', 'mensaje', 'anonimo', 'created_at'],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: donaciones });
  } catch (error) {
    logger.error('Error en getDonacionesByCaso:', error);
    res.status(500).json({ success: false, message: 'Error al obtener donaciones' });
  }
};

exports.createDonacion = async (req, res) => {
  try {
    const { caso_id, monto, nombre_donante, email_donante, mensaje, anonimo } = req.body;
    
    const caso = await CasoAyuda.findByPk(caso_id);
    if (!caso) return res.status(404).json({ success: false, message: 'Caso no encontrado' });
    
    const comprobante_url = req.file ? `/uploads/comprobantes/${req.file.filename}` : null;

    const donacion = await Donacion.create({
      caso_id,
      bonante_id: req.user ? req.user.id : null,
      monto,
      nombre_donante: anonimo ? 'Anónimo' : nombre_donante,
      email_donante,
      mensaje,
      comprobante_url,
      anonimo: anonimo || false,
      status: 'pendiente'
    });

    logger.info(`Nueva donación creada: ${donacion.id} para caso ${caso_id}`);
    res.status(201).json({ success: true, message: 'Donación registrada. Pendiente de verificación.', data: donacion });
  } catch (error) {
    logger.error('Error en createDonacion:', error);
    res.status(500).json({ success: false, message: 'Error al registrar donación' });
  }
};

exports.getDonacion = async (req, res) => {
  try {
    const donacion = await Donacion.findByPk(req.params.id, {
      include: [
        { model: CasoAyuda, as: 'caso', attributes: ['id', 'titulo'] },
        { model: User, as: 'donante', attributes: ['id', 'nombre', 'apellido'], required: false }
      ]
    });
    if (!donacion) return res.status(404).json({ success: false, message: 'Donación no encontrada' });
    res.json({ success: true, data: donacion });
  } catch (error) {
    logger.error('Error en getDonacion:', error);
    res.status(500).json({ success: false, message: 'Error al obtener donación' });
  }
};

exports.getMisDonaciones = async (req, res) => {
  try {
    const donaciones = await Donacion.findAll({
      where: { donante_id: req.user.id },
      include: [{ model: CasoAyuda, as: 'caso', attributes: ['id', 'titulo'] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: donaciones });
  } catch (error) {
    logger.error('Error en getMisDonaciones:', error);
    res.status(500).json({ success: false, message: 'Error al obtener donaciones' });
  }
};

exports.getDonacionesRecibidas = async (req, res) => {
  try {
    const casos = await CasoAyuda.findAll({
      where: { user_id: req.user.id },
      attributes: ['id']
    });
    const casoIds = casos.map(c => c.id);

    const donaciones = await Donacion.findAll({
      where: { caso_id: casoIds },
      include: [{ model: CasoAyuda, as: 'caso', attributes: ['id', 'titulo'] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: donaciones });
  } catch (error) {
    logger.error('Error en getDonacionesRecibidas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener donaciones' });
  }
};

exports.verificarDonacion = async (req, res) => {
  try {
    const donacion = await Donacion.findByPk(req.params.id);
    if (!donacion) return res.status(404).json({ success: false, message: 'Donación no encontrada' });
    
    donacion.status = 'verificada';
    donacion.verificado_por = req.user.id;
    donacion.fecha_verificacion = new Date();
    await donacion.save();

    res.json({ success: true, message: 'Donación verificada', data: donacion });
  } catch (error) {
    logger.error('Error en verificarDonacion:', error);
    res.status(500).json({ success: false, message: 'Error al verificar donación' });
  }
};

exports.rechazarDonacion = async (req, res) => {
  try {
    const donacion = await Donacion.findByPk(req.params.id);
    if (!donacion) return res.status(404).json({ success: false, message: 'Donación no encontrada' });
    
    donacion.status = 'rechazada';
    donacion.verificado_por = req.user.id;
    donacion.fecha_verificacion = new Date();
    await donacion.save();

    res.json({ success: true, message: 'Donación rechazada', data: donacion });
  } catch (error) {
    logger.error('Error en rechazarDonacion:', error);
    res.status(500).json({ success: false, message: 'Error al rechazar donación' });
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
