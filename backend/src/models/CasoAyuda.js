const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CasoAyuda = sequelize.define('CasoAyuda', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  monto_solicitado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  monto_recaudado: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  urgencia: {
    type: DataTypes.STRING(20),
    defaultValue: 'media'
  },
  ubicacion_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  ubicacion_lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  ubicacion_desc: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'en_revision', 'aprobado', 'rechazado', 'completado', 'cerrado'),
    defaultValue: 'pendiente'
  },
  fotos: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  documentos: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  fecha_limite: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  visualizaciones: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  aprobado_por: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  fecha_aprobacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  razon_rechazo: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'casos_ayuda',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['categoria'] },
    { fields: ['urgencia'] },
    { fields: ['fecha_limite'] }
  ]
});

module.exports = CasoAyuda;
