-- ====================================
-- AYUDA TICA - DATABASE SCHEMA
-- PostgreSQL 15
-- ====================================

-- Habilitar extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar extensión para geolocalización
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ====================================
-- TIPOS ENUM
-- ====================================

-- Roles de usuario
CREATE TYPE user_role AS ENUM ('usuario', 'moderador', 'autoridad', 'administrador');

-- Estados de casos de ayuda
CREATE TYPE caso_status AS ENUM ('pendiente', 'en_revision', 'aprobado', 'rechazado', 'completado', 'cerrado');

-- Estados de reportes
CREATE TYPE reporte_status AS ENUM ('abierto', 'en_revision', 'en_proceso', 'resuelto', 'cerrado');

-- Categorías de reportes Ley 7600
CREATE TYPE categoria_ley7600 AS ENUM (
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
);

-- Estados de donación
CREATE TYPE donacion_status AS ENUM ('pendiente', 'verificada', 'rechazada');

-- ====================================
-- TABLA: users
-- ====================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255),
  telefono VARCHAR(20),
  rol user_role DEFAULT 'usuario',
  avatar_url TEXT,
  cedula VARCHAR(20), -- Cédula para verificación (opcional)
  sinpe_movil VARCHAR(20), -- Número Sinpe Móvil para recibir donaciones
  email_verificado BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  ultima_conexion TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rol ON users(rol);
CREATE INDEX idx_users_activo ON users(activo);

-- ====================================
-- TABLA: casos_ayuda
-- ====================================
CREATE TABLE casos_ayuda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  monto_solicitado DECIMAL(10, 2) NOT NULL,
  monto_recaudado DECIMAL(10, 2) DEFAULT 0,
  categoria VARCHAR(100), -- e.g., 'Salud', 'Educación', 'Vivienda', 'Alimentación'
  urgencia VARCHAR(20) DEFAULT 'media', -- 'baja', 'media', 'alta', 'critica'
  ubicacion_lat DECIMAL(10, 8),
  ubicacion_lng DECIMAL(11, 8),
  ubicacion_desc TEXT, -- Descripción textual (e.g., "San José, Costa Rica")
  status caso_status DEFAULT 'pendiente',
  fotos TEXT[], -- Array de URLs/paths de fotos
  documentos TEXT[], -- Array de URLs/paths de documentos de respaldo
  fecha_limite DATE, -- Fecha hasta cuándo se necesita la ayuda
  visualizaciones INTEGER DEFAULT 0,
  aprobado_por UUID REFERENCES users(id), -- Moderador que aprobó
  fecha_aprobacion TIMESTAMP,
  razon_rechazo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para casos_ayuda
CREATE INDEX idx_casos_user_id ON casos_ayuda(user_id);
CREATE INDEX idx_casos_status ON casos_ayuda(status);
CREATE INDEX idx_casos_categoria ON casos_ayuda(categoria);
CREATE INDEX idx_casos_urgencia ON casos_ayuda(urgencia);
CREATE INDEX idx_casos_fecha_limite ON casos_ayuda(fecha_limite);

-- ====================================
-- TABLA: reportes
-- ====================================
CREATE TABLE reportes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  categoria categoria_ley7600 NOT NULL,
  ubicacion_lat DECIMAL(10, 8) NOT NULL,
  ubicacion_lng DECIMAL(11, 8) NOT NULL,
  ubicacion_desc TEXT NOT NULL,
  direccion TEXT, -- Dirección exacta
  nombre_establecimiento VARCHAR(255), -- Nombre del lugar reportado
  status reporte_status DEFAULT 'abierto',
  evidencias TEXT[], -- Array de URLs/paths de fotos
  prioridad VARCHAR(20) DEFAULT 'media', -- 'baja', 'media', 'alta'
  visible_publico BOOLEAN DEFAULT TRUE,
  visualizaciones INTEGER DEFAULT 0,
  aprobado_por UUID REFERENCES users(id),
  fecha_aprobacion TIMESTAMP,
  asignado_a UUID REFERENCES users(id), -- Autoridad asignada
  fecha_asignacion TIMESTAMP,
  notas_autoridad TEXT,
  fecha_resolucion TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para reportes
CREATE INDEX idx_reportes_user_id ON reportes(user_id);
CREATE INDEX idx_reportes_status ON reportes(status);
CREATE INDEX idx_reportes_categoria ON reportes(categoria);
CREATE INDEX idx_reportes_ubicacion ON reportes(ubicacion_lat, ubicacion_lng);
CREATE INDEX idx_reportes_asignado_a ON reportes(asignado_a);

-- ====================================
-- TABLA: donaciones
-- ====================================
CREATE TABLE donaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caso_id UUID NOT NULL REFERENCES casos_ayuda(id) ON DELETE CASCADE,
  donante_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL si es anónimo
  monto DECIMAL(10, 2) NOT NULL,
  nombre_donante VARCHAR(255), -- Para donantes anónimos
  email_donante VARCHAR(255), -- Para enviar recibo
  mensaje TEXT, -- Mensaje opcional del donante
  metodo_pago VARCHAR(50) DEFAULT 'sinpe_movil', -- 'sinpe_movil', 'transferencia', 'otro'
  comprobante_url TEXT, -- URL del comprobante de pago subido
  status donacion_status DEFAULT 'pendiente',
  verificado_por UUID REFERENCES users(id), -- Admin/moderador que verificó
  fecha_verificacion TIMESTAMP,
  anonimo BOOLEAN DEFAULT FALSE,
  recibo_enviado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para donaciones
CREATE INDEX idx_donaciones_caso_id ON donaciones(caso_id);
CREATE INDEX idx_donaciones_donante_id ON donaciones(donante_id);
CREATE INDEX idx_donaciones_status ON donaciones(status);

-- ====================================
-- TABLA: comentarios
-- ====================================
CREATE TABLE comentarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  caso_id UUID REFERENCES casos_ayuda(id) ON DELETE CASCADE,
  reporte_id UUID REFERENCES reportes(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  parent_id UUID REFERENCES comentarios(id) ON DELETE CASCADE, -- Para respuestas
  visible BOOLEAN DEFAULT TRUE,
  moderado BOOLEAN DEFAULT FALSE,
  moderado_por UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_parent_type CHECK (
    (caso_id IS NOT NULL AND reporte_id IS NULL) OR
    (caso_id IS NULL AND reporte_id IS NOT NULL)
  )
);

-- Índices para comentarios
CREATE INDEX idx_comentarios_user_id ON comentarios(user_id);
CREATE INDEX idx_comentarios_caso_id ON comentarios(caso_id);
CREATE INDEX idx_comentarios_reporte_id ON comentarios(reporte_id);
CREATE INDEX idx_comentarios_parent_id ON comentarios(parent_id);

-- ====================================
-- TABLA: notificaciones
-- ====================================
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- 'donacion', 'comentario', 'aprobacion', 'rechazo', etc.
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  link TEXT, -- URL a la que debe ir el usuario
  leida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para notificaciones
CREATE INDEX idx_notificaciones_user_id ON notificaciones(user_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_notificaciones_created_at ON notificaciones(created_at DESC);

-- ====================================
-- TABLA: actividad_log
-- ====================================
CREATE TABLE actividad_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  accion VARCHAR(100) NOT NULL, -- 'login', 'crear_caso', 'crear_reporte', 'donar', etc.
  entidad_tipo VARCHAR(50), -- 'caso', 'reporte', 'donacion', etc.
  entidad_id UUID,
  ip_address INET,
  user_agent TEXT,
  detalles JSONB, -- Información adicional en formato JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para actividad_log
CREATE INDEX idx_actividad_user_id ON actividad_log(user_id);
CREATE INDEX idx_actividad_accion ON actividad_log(accion);
CREATE INDEX idx_actividad_created_at ON actividad_log(created_at DESC);

-- ====================================
-- TABLA: configuracion
-- ====================================
CREATE TABLE configuracion (
  clave VARCHAR(100) PRIMARY KEY,
  valor TEXT NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES users(id)
);

-- Configuraciones iniciales
INSERT INTO configuracion (clave, valor, descripcion, tipo) VALUES
('sitio.nombre', 'Ayuda Tica', 'Nombre de la plataforma', 'string'),
('sitio.descripcion', 'Plataforma solidaria para Costa Rica', 'Descripción del sitio', 'string'),
('sitio.email', 'admin@ayudatica.srwangcr.tech', 'Email de contacto', 'string'),
('moderacion.auto_aprobar', 'false', 'Aprobar automáticamente casos sin revisión', 'boolean'),
('donacion.monto_minimo', '1000', 'Monto mínimo de donación en colones', 'number'),
('reportes.requiere_foto', 'true', 'Los reportes requieren al menos una foto', 'boolean'),
('usuarios.verificacion_email', 'true', 'Requiere verificación de email al registrarse', 'boolean');

-- ====================================
-- FUNCIONES Y TRIGGERS
-- ====================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_casos_updated_at BEFORE UPDATE ON casos_ayuda
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reportes_updated_at BEFORE UPDATE ON reportes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comentarios_updated_at BEFORE UPDATE ON comentarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar monto_recaudado en casos_ayuda
CREATE OR REPLACE FUNCTION actualizar_monto_recaudado()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'verificada' THEN
    UPDATE casos_ayuda
    SET monto_recaudado = monto_recaudado + NEW.monto
    WHERE id = NEW.caso_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_monto_recaudado
AFTER INSERT OR UPDATE ON donaciones
FOR EACH ROW EXECUTE FUNCTION actualizar_monto_recaudado();

-- ====================================
-- DATOS INICIALES DE PRUEBA
-- ====================================

-- Usuario administrador por defecto (password: Admin123!)
-- CAMBIAR EN PRODUCCIÓN
INSERT INTO users (email, password_hash, nombre, apellido, rol, email_verificado, activo)
VALUES (
  'admin@ayudatica.srwangcr.tech',
  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- Admin123!
  'Administrador',
  'Sistema',
  'administrador',
  TRUE,
  TRUE
);

-- Usuario moderador de ejemplo
INSERT INTO users (email, password_hash, nombre, apellido, rol, email_verificado, activo)
VALUES (
  'moderador@ayudatica.srwangcr.tech',
  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- Admin123!
  'Moderador',
  'Ejemplo',
  'moderador',
  TRUE,
  TRUE
);

-- ====================================
-- VISTAS ÚTILES
-- ====================================

-- Vista de casos con información del usuario
CREATE VIEW v_casos_completos AS
SELECT 
  c.*,
  u.nombre || ' ' || COALESCE(u.apellido, '') as nombre_usuario,
  u.email as email_usuario,
  u.sinpe_movil,
  u.avatar_url as avatar_usuario,
  COUNT(DISTINCT d.id) as total_donaciones,
  COUNT(DISTINCT co.id) as total_comentarios
FROM casos_ayuda c
JOIN users u ON c.user_id = u.id
LEFT JOIN donaciones d ON c.id = d.caso_id AND d.status = 'verificada'
LEFT JOIN comentarios co ON c.id = co.caso_id AND co.visible = TRUE
GROUP BY c.id, u.id, u.nombre, u.apellido, u.email, u.sinpe_movil, u.avatar_url;

-- Vista de reportes con información del usuario
CREATE VIEW v_reportes_completos AS
SELECT 
  r.*,
  u.nombre || ' ' || COALESCE(u.apellido, '') as nombre_usuario,
  u.email as email_usuario,
  a.nombre || ' ' || COALESCE(a.apellido, '') as nombre_autoridad
FROM reportes r
JOIN users u ON r.user_id = u.id
LEFT JOIN users a ON r.asignado_a = a.id;

-- ====================================
-- PERMISOS (si usas usuarios específicos)
-- ====================================

-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ayudatica_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ayudatica_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO ayudatica_user;

-- ====================================
-- FIN DEL SCHEMA
-- ====================================

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Base de datos Ayuda Tica inicializada correctamente';
  RAISE NOTICE 'Usuario admin: admin@ayudatica.srwangcr.tech';
  RAISE NOTICE 'Password: Admin123! (CAMBIAR EN PRODUCCIÓN)';
END
$$;
