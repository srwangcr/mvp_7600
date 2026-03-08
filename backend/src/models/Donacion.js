const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Donacion = sequelize.define('Donacion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  caso_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'casos_ayuda',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  donante_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  nombre_donante: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  email_donante: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metodo_pago: {
    type: DataTypes.STRING(50),
    defaultValue: 'sinpe_movil'
  },
  comprobante_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'verificada', 'rechazada'),
    defaultValue: 'pendiente'
  },
  verificado_por: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  fecha_verificacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  anonimo: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recibo_enviado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'donaciones',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['caso_id'] },
    { fields: ['donante_id'] },
    { fields: ['status'] }
  ]
});

module.exports = Donacion;
