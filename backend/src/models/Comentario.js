const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comentario = sequelize.define('Comentario', {
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
  caso_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'casos_ayuda',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  reporte_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'reportes',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  parent_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'comentarios',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  visible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  moderado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  moderado_por: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'comentarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['caso_id'] },
    { fields: ['reporte_id'] },
    { fields: ['parent_id'] }
  ],
  validate: {
    // Validar que tenga caso_id O reporte_id, pero no ambos
    eitherCasoOrReporte() {
      if ((this.caso_id && this.reporte_id) || (!this.caso_id && !this.reporte_id)) {
        throw new Error('Un comentario debe estar asociado a un caso O un reporte, no ambos');
      }
    }
  }
});

module.exports = Comentario;
