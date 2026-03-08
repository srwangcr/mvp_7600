const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  rol: {
    type: DataTypes.ENUM('usuario', 'moderador', 'autoridad', 'administrador'),
    defaultValue: 'usuario'
  },
  avatar_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cedula: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  sinpe_movil: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email_verificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  ultima_conexion: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Métodos de instancia
User.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

// Método para obtener el usuario sin datos sensibles
User.prototype.toSafeObject = function() {
  const { password_hash, ...safeUser } = this.toJSON();
  return safeUser;
};

// Hook antes de crear para hashear password
User.beforeCreate(async (user) => {
  if (user.password_hash) {
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

// Hook antes de actualizar para hashear password si cambió
User.beforeUpdate(async (user) => {
  if (user.changed('password_hash')) {
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

module.exports = User;
