const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reporte = sequelize.define('Reporte', {
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
  categoria: {
    type: DataTypes.ENUM(
      'accesibilidad_fisica',
      'transporte_publico',
      'banos_accesibles',
      'rampas_faltantes',
      'estacionamiento',
      'senalizacion',
      'discriminacion',
      'empleo',
      'educacion',
      'salud',
      'otro'
    ),
    allowNull: false
  },
  ubicacion_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  ubicacion_lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  ubicacion_desc: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  nombre_establecimiento: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('abierto', 'en_revision', 'en_proceso', 'resuelto', 'cerrado'),
    defaultValue: 'abierto'
  },
  evidencias: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  prioridad: {
    type: DataTypes.STRING(20),
    defaultValue: 'media'
  },
  visible_publico: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  asignado_a: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  fecha_asignacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notas_autoridad: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha_resolucion: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'reportes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['categoria'] },
    { fields: ['ubicacion_lat', 'ubicacion_lng'] },
    { fields: ['asignado_a'] }
  ]
});

module.exports = Reporte;
