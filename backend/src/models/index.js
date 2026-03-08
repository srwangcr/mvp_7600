const { sequelize } = require('../config/database');

// Importar modelos
const User = require('./User');
const CasoAyuda = require('./CasoAyuda');
const Reporte = require('./Reporte');
const Donacion = require('./Donacion');
const Comentario = require('./Comentario');
const Notificacion = require('./Notificacion');

// ====================================
// DEFINIR RELACIONES
// ====================================

// User -> CasosAyuda (1:N)
User.hasMany(CasoAyuda, { 
  foreignKey: 'user_id', 
  as: 'casos' 
});
CasoAyuda.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'usuario' 
});

// User -> Reportes (1:N)
User.hasMany(Reporte, { 
  foreignKey: 'user_id', 
  as: 'reportes' 
});
Reporte.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'usuario' 
});

// Moderador aprueba casos
User.hasMany(CasoAyuda, { 
  foreignKey: 'aprobado_por', 
  as: 'casos_aprobados' 
});
CasoAyuda.belongsTo(User, { 
  foreignKey: 'aprobado_por', 
  as: 'moderador' 
});

// Moderador aprueba reportes
User.hasMany(Reporte, { 
  foreignKey: 'aprobado_por', 
  as: 'reportes_aprobados' 
});
Reporte.belongsTo(User, { 
  foreignKey: 'aprobado_por', 
  as: 'moderador' 
});

// Autoridad asignada a reportes
User.hasMany(Reporte, { 
  foreignKey: 'asignado_a', 
  as: 'reportes_asignados' 
});
Reporte.belongsTo(User, { 
  foreignKey: 'asignado_a', 
  as: 'autoridad' 
});

// CasoAyuda -> Donaciones (1:N)
CasoAyuda.hasMany(Donacion, { 
  foreignKey: 'caso_id', 
  as: 'donaciones' 
});
Donacion.belongsTo(CasoAyuda, { 
  foreignKey: 'caso_id', 
  as: 'caso' 
});

// User -> Donaciones (1:N)
User.hasMany(Donacion, { 
  foreignKey: 'donante_id', 
  as: 'donaciones_realizadas' 
});
Donacion.belongsTo(User, { 
  foreignKey: 'donante_id', 
  as: 'donante' 
});

// Moderador verifica donaciones
User.hasMany(Donacion, { 
  foreignKey: 'verificado_por', 
  as: 'donaciones_verificadas' 
});
Donacion.belongsTo(User, { 
  foreignKey: 'verificado_por', 
  as: 'verificador' 
});

// User -> Comentarios (1:N)
User.hasMany(Comentario, { 
  foreignKey: 'user_id', 
  as: 'comentarios' 
});
Comentario.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'usuario' 
});

// CasoAyuda -> Comentarios (1:N)
CasoAyuda.hasMany(Comentario, { 
  foreignKey: 'caso_id', 
  as: 'comentarios' 
});
Comentario.belongsTo(CasoAyuda, { 
  foreignKey: 'caso_id', 
  as: 'caso' 
});

// Reporte -> Comentarios (1:N)
Reporte.hasMany(Comentario, { 
  foreignKey: 'reporte_id', 
  as: 'comentarios' 
});
Comentario.belongsTo(Reporte, { 
  foreignKey: 'reporte_id', 
  as: 'reporte' 
});

// Comentario -> Comentarios (auto-referencia para respuestas)
Comentario.hasMany(Comentario, { 
  foreignKey: 'parent_id', 
  as: 'respuestas' 
});
Comentario.belongsTo(Comentario, { 
  foreignKey: 'parent_id', 
  as: 'padre' 
});

// Moderador modera comentarios
User.hasMany(Comentario, { 
  foreignKey: 'moderado_por', 
  as: 'comentarios_moderados' 
});
Comentario.belongsTo(User, { 
  foreignKey: 'moderado_por', 
  as: 'moderador' 
});

// User -> Notificaciones (1:N)
User.hasMany(Notificacion, { 
  foreignKey: 'user_id', 
  as: 'notificaciones' 
});
Notificacion.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'usuario' 
});

// ====================================
// EXPORTAR MODELOS Y SEQUELIZE
// ====================================

module.exports = {
  sequelize,
  User,
  CasoAyuda,
  Reporte,
  Donacion,
  Comentario,
  Notificacion
};
