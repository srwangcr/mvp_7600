# Database Documentation - Ayuda Tica

Documentación técnica de la base de datos PostgreSQL para Ayuda Tica.

## Información General

- **DBMS**: PostgreSQL 15+
- **Extensions**: uuid-ossp, postgis
- **Character Set**: UTF-8
- **Timezone**: UTC (convertido a America/Costa_Rica en aplicación)

---

## Diagrama Entidad-Relación (Texto)

```
┌─────────────┐
│   users     │
└──────┬──────┘
       │
       │ 1:N
       │
       ├──────────────────────────┬──────────────────┬────────────────┬──────────────────┐
       │                          │                  │                │                  │
       ▼                          ▼                  ▼                ▼                  ▼
┌───────────────┐       ┌────────────────┐   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  casos_ayuda  │       │   reportes     │   │ donaciones   │  │comentarios   │  │notificaciones│
└───────┬───────┘       └────────┬───────┘   └──────┬───────┘  └──────┬───────┘  └──────────────┘
        │                        │                  │                 │
        │ 1:N                    │ 1:N              │                 │ autorref
        │                        │                  │                 │
        ▼                        ▼                  │                 ▼
┌───────────────┐       ┌────────────────┐         │          (respuestas)
│  donaciones   │       │  comentarios   │         │
└───────────────┘       └────────────────┘         │
                                                    ▼
                                            ┌──────────────────┐
                                            │ actividad_log    │
                                            └──────────────────┘
```

---

## Tablas

### 1. users

Almacena información de usuarios del sistema.

**Estructura:**

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único |
| nombre | VARCHAR(255) | NOT NULL | Nombre completo |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email (usado para login) |
| password | VARCHAR(255) | NOT NULL | Hash bcrypt de contraseña |
| telefono | VARCHAR(20) | | Teléfono de contacto |
| provincia | VARCHAR(100) | | Provincia de Costa Rica |
| canton | VARCHAR(100) | | Cantón |
| distrito | VARCHAR(100) | | Distrito |
| rol | user_role | DEFAULT 'usuario' | Rol del usuario |
| email_verificado | BOOLEAN | DEFAULT false | Estado de verificación |
| activo | BOOLEAN | DEFAULT true | Usuario activo/inactivo |
| ultima_conexion | TIMESTAMPTZ | | Última vez que se conectó |
| reset_password_token | VARCHAR(255) | | Token para reset de password |
| reset_password_expires | TIMESTAMPTZ | | Expiración del token |
| createdAt | TIMESTAMPTZ | DEFAULT NOW() | Fecha de creación |
| updatedAt | TIMESTAMPTZ | DEFAULT NOW() | Última actualización |

**Índices:**
- `idx_users_email` en `email`
- `idx_users_rol` en `rol`

**ENUM user_role:**
- `usuario` - Usuario regular
- `moderador` - Puede aprobar casos y verificar donaciones
- `autoridad` - Puede gestionar reportes Ley 7600
- `administrador` - Acceso completo

**Datos iniciales:**
- Admin: admin@ayudatica.srwangcr.tech (password: Admin123!)
- Moderador: moderador@ayudatica.srwangcr.tech (password: Mod123!)

---

### 2. casos_ayuda

Almacena casos de personas que necesitan ayuda.

**Estructura:**

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único |
| usuario_id | UUID | FK → users, NOT NULL | Creador del caso |
| titulo | VARCHAR(255) | NOT NULL | Título del caso |
| descripcion | TEXT | NOT NULL | Descripción detallada |
| tipo_ayuda | tipo_ayuda_enum | NOT NULL | Tipo de ayuda necesitada |
| monto_necesario | DECIMAL(10,2) | NOT NULL | Monto en colones |
| monto_recaudado | DECIMAL(10,2) | DEFAULT 0 | Monto donado |
| estado | caso_status | DEFAULT 'pendiente' | Estado del caso |
| provincia | VARCHAR(100) | NOT NULL | Ubicación |
| canton | VARCHAR(100) | NOT NULL | Cantón |
| distrito | VARCHAR(100) | | Distrito |
| direccion_exacta | TEXT | | Dirección específica |
| latitud | DECIMAL(10,8) | | Coordenada GPS |
| longitud | DECIMAL(11,8) | | Coordenada GPS |
| fotos | TEXT[] | | Array de URLs de fotos |
| aprobado_por | UUID | FK → users | Moderador que aprobó |
| fecha_aprobacion | TIMESTAMPTZ | | Cuándo fue aprobado |
| comentario_moderacion | TEXT | | Comentarios del moderador |
| createdAt | TIMESTAMPTZ | DEFAULT NOW() | Fecha de creación |
| updatedAt | TIMESTAMPTZ | DEFAULT NOW() | Última actualización |

**Índices:**
- `idx_casos_usuario` en `usuario_id`
- `idx_casos_estado` en `estado`
- `idx_casos_tipo_ayuda` en `tipo_ayuda`
- `idx_casos_provincia` en `provincia`

**ENUM tipo_ayuda_enum:**
- `economica`
- `alimentaria`
- `medica`
- `vivienda`
- `educacion`
- `otro`

**ENUM caso_status:**
- `pendiente` - Esperando aprobación
- `aprobado` - Visible públicamente
- `rechazado` - Rechazado por moderador
- `cerrado` - Completado o ya no necesita ayuda

**Relaciones:**
- `usuario_id` → users.id (ON DELETE CASCADE)
- `aprobado_por` → users.id (ON DELETE SET NULL)

---

### 3. reportes

Reportes de violaciones a la Ley 7600 de accesibilidad.

**Estructura:**

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único |
| usuario_id | UUID | FK → users, NOT NULL | Quien reporta |
| titulo | VARCHAR(255) | NOT NULL | Título del reporte |
| descripcion | TEXT | NOT NULL | Descripción detallada |
| categoria | categoria_ley7600 | NOT NULL | Tipo de violación |
| estado | reporte_status | DEFAULT 'pendiente' | Estado actual |
| prioridad | VARCHAR(20) | DEFAULT 'media' | Prioridad del caso |
| provincia | VARCHAR(100) | NOT NULL | Ubicación |
| canton | VARCHAR(100) | NOT NULL | Cantón |
| distrito | VARCHAR(100) | | Distrito |
| direccion_exacta | TEXT | | Dirección específica |
| latitud | DECIMAL(10,8) | | Coordenada GPS |
| longitud | DECIMAL(11,8) | | Coordenada GPS |
| fotos | TEXT[] | | Array de URLs de fotos |
| institucion_responsable | VARCHAR(255) | | Entidad responsable |
| autoridad_asignada_id | UUID | FK → users | Autoridad asignada |
| fecha_asignacion | TIMESTAMPTZ | | Cuándo se asignó |
| fecha_resolucion | TIMESTAMPTZ | | Cuándo se resolvió |
| createdAt | TIMESTAMPTZ | DEFAULT NOW() | Fecha de creación |
| updatedAt | TIMESTAMPTZ | DEFAULT NOW() | Última actualización |

**Índices:**
- `idx_reportes_usuario` en `usuario_id`
- `idx_reportes_estado` en `estado`
- `idx_reportes_categoria` en `categoria`
- `idx_reportes_autoridad` en `autoridad_asignada_id`

**ENUM categoria_ley7600:**
- `acceso_fisico` - Rampas, puertas, ascensores
- `transporte` - Buses, paradas, señalización
- `educacion` - Instituciones educativas
- `empleo` - Discriminación laboral
- `salud` - Servicios médicos
- `recreacion` - Parques, playas, instalaciones
- `comunicacion` - Señalización, información
- `tecnologia` - Sitios web, apps
- `otro`

**ENUM reporte_status:**
- `pendiente` - Sin revisar
- `en_revision` - Siendo evaluado
- `en_proceso` - En resolución
- `resuelto` - Completado
- `rechazado` - No procede

**Relaciones:**
- `usuario_id` → users.id (ON DELETE CASCADE)
- `autoridad_asignada_id` → users.id (ON DELETE SET NULL)

---

### 4. donaciones

Registro de donaciones a casos de ayuda.

**Estructura:**

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único |
| caso_id | UUID | FK → casos_ayuda, NOT NULL | Caso donado |
| usuario_id | UUID | FK → users | Donante (NULL si anónimo) |
| monto | DECIMAL(10,2) | NOT NULL | Monto en colones |
| metodo_pago | VARCHAR(50) | NOT NULL | sinpe_movil, etc |
| numero_sinpe | VARCHAR(20) | | Número usado en Sinpe |
| comprobante_url | TEXT | | URL del comprobante |
| estado | donacion_status | DEFAULT 'pendiente' | Estado de verificación |
| mensaje | TEXT | | Mensaje al beneficiario |
| nombre_donante | VARCHAR(255) | | Nombre (si no anónimo) |
| verificado_por | UUID | FK → users | Moderador verificador |
| fecha_verificacion | TIMESTAMPTZ | | Cuándo se verificó |
| rechazo_motivo | TEXT | | Razón de rechazo |
| createdAt | TIMESTAMPTZ | DEFAULT NOW() | Fecha de donación |

**Índices:**
- `idx_donaciones_caso` en `caso_id`
- `idx_donaciones_usuario` en `usuario_id`
- `idx_donaciones_estado` en `estado`

**ENUM donacion_status:**
- `pendiente` - Esperando verificación
- `verificada` - Confirmada por moderador
- `rechazada` - Comprobante inválido

**Relaciones:**
- `caso_id` → casos_ayuda.id (ON DELETE CASCADE)
- `usuario_id` → users.id (ON DELETE SET NULL)
- `verificado_por` → users.id (ON DELETE SET NULL)

**Trigger:** `actualizar_monto_recaudado`
- Se ejecuta AFTER INSERT/UPDATE en donaciones
- Actualiza automáticamente `casos_ayuda.monto_recaudado`
- Solo cuenta donaciones con estado 'verificada'

---

### 5. comentarios

Comentarios en casos y reportes.

**Estructura:**

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único |
| usuario_id | UUID | FK → users, NOT NULL | Autor del comentario |
| caso_id | UUID | FK → casos_ayuda | NULL si es de reporte |
| reporte_id | UUID | FK → reportes | NULL si es de caso |
| contenido | TEXT | NOT NULL | Texto del comentario |
| parent_id | UUID | FK → comentarios | Para respuestas |
| createdAt | TIMESTAMPTZ | DEFAULT NOW() | Fecha de creación |
| updatedAt | TIMESTAMPTZ | DEFAULT NOW() | Última actualización |

**Índices:**
- `idx_comentarios_caso` en `caso_id`
- `idx_comentarios_reporte` en `reporte_id`
- `idx_comentarios_usuario` en `usuario_id`
- `idx_comentarios_parent` en `parent_id`

**Constraint:** CHECK para asegurar que `caso_id` o `reporte_id` (pero no ambos) no sea NULL.

**Relaciones:**
- `usuario_id` → users.id (ON DELETE CASCADE)
- `caso_id` → casos_ayuda.id (ON DELETE CASCADE)
- `reporte_id` → reportes.id (ON DELETE CASCADE)
- `parent_id` → comentarios.id (ON DELETE CASCADE) - Autoreferencial

---

### 6. notificaciones

Sistema de notificaciones para usuarios.

**Estructura:**

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único |
| usuario_id | UUID | FK → users, NOT NULL | Destinatario |
| titulo | VARCHAR(255) | NOT NULL | Título de notificación |
| mensaje | TEXT | NOT NULL | Contenido |
| tipo | VARCHAR(50) | NOT NULL | Tipo de notificación |
| url | TEXT | | Link relacionado |
| leida | BOOLEAN | DEFAULT false | Estado de lectura |
| createdAt | TIMESTAMPTZ | DEFAULT NOW() | Fecha de creación |

**Índices:**
- `idx_notificaciones_usuario` en `usuario_id`
- `idx_notificaciones_leida` en `leida`
- `idx_notificaciones_tipo` en `tipo`

**Tipos de notificación:**
- `bienvenida` - Nuevo registro
- `caso_aprobado` - Caso fue aprobado
- `caso_rechazado` - Caso fue rechazado
- `nueva_donacion` - Recibiste una donación
- `comentario_caso` - Nuevo comentario en tu caso
- `reporte_asignado` - Reporte asignado a ti
- `reporte_actualizado` - Cambio en un reporte
- `sistema` - Mensajes del sistema

**Relaciones:**
- `usuario_id` → users.id (ON DELETE CASCADE)

---

### 7. actividad_log

Log de actividades importantes del sistema.

**Estructura:**

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único |
| usuario_id | UUID | FK → users | Usuario que realizó acción |
| tipo_accion | VARCHAR(100) | NOT NULL | Tipo de acción |
| detalles | JSONB | | Información adicional |
| ip | VARCHAR(50) | | Dirección IP |
| user_agent | TEXT | | Navegador/dispositivo |
| createdAt | TIMESTAMPTZ | DEFAULT NOW() | Cuándo ocurrió |

**Índices:**
- `idx_log_usuario` en `usuario_id`
- `idx_log_tipo` en `tipo_accion`
- `idx_log_created` en `createdAt`
- `idx_log_detalles` en `detalles` (GIN index para JSONB)

**Tipos de acción:**
- `login` / `logout`
- `registro`
- `crear_caso` / `actualizar_caso` / `eliminar_caso`
- `crear_reporte` / `actualizar_reporte`
- `donar`
- `aprobar_caso` / `rechazar_caso`
- `verificar_donacion` / `rechazar_donacion`
- `cambiar_rol`

**Relaciones:**
- `usuario_id` → users.id (ON DELETE SET NULL)

---

### 8. configuracion

Configuraciones del sistema (key-value store).

**Estructura:**

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único |
| clave | VARCHAR(100) | UNIQUE, NOT NULL | Nombre de configuración |
| valor | TEXT | NOT NULL | Valor (puede ser JSON) |
| descripcion | TEXT | | Descripción de uso |
| updatedAt | TIMESTAMPTZ | DEFAULT NOW() | Última modificación |

**Configuraciones iniciales:**
- `sitio_nombre`: "Ayuda Tica"
- `sitio_descripcion`: "Plataforma solidaria..."
- `monto_minimo_donacion`: "1000"
- `donaciones_habilitadas`: "true"
- `reportes_habilitados`: "true"
- `modo_mantenimiento`: "false"
- `email_admin`: "admin@ayudatica.srwangcr.tech"

---

## Vistas

### v_casos_completos

Vista con información completa de casos (joins pre-calculados).

```sql
SELECT 
  c.*,
  u.nombre as creador_nombre,
  u.email as creador_email,
  u.telefono as creador_telefono,
  COUNT(DISTINCT d.id) as total_donaciones,
  COUNT(DISTINCT co.id) as total_comentarios,
  m.nombre as moderador_nombre
FROM casos_ayuda c
LEFT JOIN users u ON c.usuario_id = u.id
LEFT JOIN donaciones d ON c.id = d.caso_id AND d.estado = 'verificada'
LEFT JOIN comentarios co ON c.id = co.caso_id
LEFT JOIN users m ON c.aprobado_por = m.id
GROUP BY c.id, u.id, m.id
```

---

### v_reportes_completos

Vista con información completa de reportes.

```sql
SELECT 
  r.*,
  u.nombre as reportante_nombre,
  u.email as reportante_email,
  a.nombre as autoridad_nombre,
  COUNT(DISTINCT co.id) as total_comentarios
FROM reportes r
LEFT JOIN users u ON r.usuario_id = u.id
LEFT JOIN users a ON r.autoridad_asignada_id = a.id
LEFT JOIN comentarios co ON r.id = co.reporte_id
GROUP BY r.id, u.id, a.id
```

---

## Triggers

### update_updated_at

Se ejecuta en BEFORE UPDATE en tablas: users, casos_ayuda, reportes, comentarios, configuracion.

Actualiza automáticamente el campo `updatedAt` al timestamp actual.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updatedAt = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';
```

---

### actualizar_monto_recaudado

Se ejecuta AFTER INSERT o UPDATE en `donaciones`.

Recalcula automáticamente `casos_ayuda.monto_recaudado` cuando:
- Se crea una nueva donación
- Una donación cambia de estado

Solo cuenta donaciones con `estado = 'verificada'`.

```sql
CREATE OR REPLACE FUNCTION actualizar_monto_recaudado()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE casos_ayuda
  SET monto_recaudado = (
    SELECT COALESCE(SUM(monto), 0)
    FROM donaciones
    WHERE caso_id = NEW.caso_id
    AND estado = 'verificada'
  )
  WHERE id = NEW.caso_id;
  RETURN NEW;
END;
$$ language 'plpgsql';
```

---

## Migraciones

### Estrategia de Migraciones

Para futuros cambios en schema:

1. **Usar Sequelize Migrations:**
   ```bash
   npx sequelize-cli migration:generate --name add-campo-nuevo
   ```

2. **Nunca modificar init.sql directamente** después del deployment inicial

3. **Backup antes de migrar:**
   ```bash
   docker exec ayudatica_postgres pg_dump -U ayudatica_user ayudatica_db > pre_migration_backup.sql
   ```

### Agregar columna (ejemplo):

```sql
-- up
ALTER TABLE casos_ayuda ADD COLUMN whatsapp VARCHAR(20);

-- down
ALTER TABLE casos_ayuda DROP COLUMN whatsapp;
```

### Crear índice:

```sql
-- up
CREATE INDEX idx_casos_whatsapp ON casos_ayuda(whatsapp);

-- down
DROP INDEX idx_casos_whatsapp;
```

---

## Backup y Restauración

### Backup Manual

```bash
# Backup completo
docker exec ayudatica_postgres pg_dump -U ayudatica_user ayudatica_db > backup.sql

# Backup comprimido
docker exec ayudatica_postgres pg_dump -U ayudatica_user ayudatica_db | gzip > backup.sql.gz

# Backup de solo esquema
docker exec ayudatica_postgres pg_dump -U ayudatica_user ayudatica_db --schema-only > schema.sql

# Backup de solo datos
docker exec ayudatica_postgres pg_dump -U ayudatica_user ayudatica_db --data-only > data.sql

# Backup de una tabla específica
docker exec ayudatica_postgres pg_dump -U ayudatica_user ayudatica_db -t casos_ayuda > casos_backup.sql
```

### Restauración

```bash
# Restaurar desde backup
docker exec -i ayudatica_postgres psql -U ayudatica_user ayudatica_db < backup.sql

# Restaurar desde backup comprimido
gunzip -c backup.sql.gz | docker exec -i ayudatica_postgres psql -U ayudatica_user ayudatica_db

# Restaurar solo una tabla (requiere DROP TABLE primero)
docker exec -i ayudatica_postgres psql -U ayudatica_user ayudatica_db < casos_backup.sql
```

### Backup Automático con Cron

Ver [DEPLOYMENT.md](DEPLOYMENT.md) sección 9.4 para configurar backups automáticos diarios.

---

## Optimización de Performance

### Índices Recomendados

Ya incluidos en `init.sql`:
- Índices en Foreign Keys
- Índices en columnas usadas en WHERE frecuentemente
- Índices en columnas de ordenamiento

### Consultas Frecuentes Optimizadas

**Listar casos aprobados con paginación:**
```sql
-- Usa idx_casos_estado
SELECT * FROM v_casos_completos 
WHERE estado = 'aprobado' 
ORDER BY createdAt DESC 
LIMIT 10 OFFSET 0;
```

**Buscar casos por ubicación:**
```sql
-- Usa idx_casos_provincia
SELECT * FROM casos_ayuda 
WHERE provincia = 'San José' 
AND estado = 'aprobado';
```

**Estadísticas de usuario:**
```sql
-- Usa índices de FK
SELECT 
  COUNT(DISTINCT c.id) as casos_creados,
  COUNT(DISTINCT r.id) as reportes_creados,
  COUNT(DISTINCT d.id) as donaciones_realizadas,
  COALESCE(SUM(d.monto), 0) as monto_total_donado
FROM users u
LEFT JOIN casos_ayuda c ON u.id = c.usuario_id
LEFT JOIN reportes r ON u.id = r.usuario_id
LEFT JOIN donaciones d ON u.id = d.usuario_id AND d.estado = 'verificada'
WHERE u.id = 'UUID_USUARIO';
```

### Monitoreo de Queries Lentas

```sql
-- Habilitar log de queries lentas (> 1s)
ALTER DATABASE ayudatica_db SET log_min_duration_statement = 1000;

-- Ver estadísticas de queries
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
```

### VACUUM y ANALYZE

```bash
# Manual
docker exec ayudatica_postgres psql -U ayudatica_user ayudatica_db -c "VACUUM ANALYZE;"

# Ver última vez que se ejecutó
docker exec ayudatica_postgres psql -U ayudatica_user ayudatica_db -c "SELECT relname, last_vacuum, last_autovacuum FROM pg_stat_user_tables;"
```

---

## Consultas Útiles para Administración

### Ver tamaño de tablas

```sql
SELECT 
  relname AS tabla,
  pg_size_pretty(pg_total_relation_size(relid)) AS tamaño
FROM pg_catalog.pg_statio_user_tables 
ORDER BY pg_total_relation_size(relid) DESC;
```

### Ver conexiones activas

```sql
SELECT 
  pid, 
  usename, 
  application_name, 
  client_addr, 
  state,
  query_start
FROM pg_stat_activity 
WHERE datname = 'ayudatica_db';
```

### Terminar conexión específica

```sql
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'ayudatica_db' 
AND pid <> pg_backend_pid();
```

### Ver índices no usados

```sql
SELECT 
  schemaname, 
  tablename, 
  indexname, 
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) AS tamaño
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE '%_pkey';
```

### Limpiar datos antiguos

```sql
-- Eliminar logs de más de 90 días
DELETE FROM actividad_log WHERE createdAt < NOW() - INTERVAL '90 days';

-- Eliminar notificaciones leídas de más de 30 días
DELETE FROM notificaciones WHERE leida = true AND createdAt < NOW() - INTERVAL '30 days';
```

---

## Seguridad

### Buenas Prácticas Implementadas

1. **Passwords hasheados**: Bcrypt con 10 rounds
2. **UUIDs en lugar de integers**: Previene enumeration attacks
3. **ON DELETE CASCADE**: Mantiene integridad referencial
4. **Constraints CHECK**: Validación a nivel de DB
5. **No se exponen passwords en queries**: Siempre excluidos en SELECT

### Permisos de Base de Datos

El usuario `ayudatica_user` tiene permisos limitados:

```sql
GRANT CONNECT ON DATABASE ayudatica_db TO ayudatica_user;
GRANT USAGE ON SCHEMA public TO ayudatica_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ayudatica_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ayudatica_user;
```

### Auditoría

La tabla `actividad_log` registra:
- Logins/logouts
- Cambios de rol
- Creación/modificación de contenido sensible
- Acciones administrativas

---

## Convenciones de Nombres

- **Tablas**: Plural, snake_case (`casos_ayuda`, `donaciones`)
- **Columnas**: snake_case (`monto_recaudado`, `fecha_aprobacion`)
- **ENUMs**: snake_case con sufijo tipo (`user_role`, `caso_status`)
- **Índices**: Prefijo `idx_` + tabla + columna (`idx_casos_estado`)
- **Foreign Keys**: nombre_tabla_singular + `_id` (`usuario_id`, `caso_id`)
- **Timestamps**: `createdAt`, `updatedAt` (camelCase por Sequelize)

---

## Extensiones Futuras

### PostGIS para Búsqueda Geográfica Avanzada

```sql
-- Buscar casos en radio de 5km
SELECT *, 
  ST_Distance(
    ST_MakePoint(longitud, latitud)::geography,
    ST_MakePoint(-84.083333, 9.933333)::geography
  ) AS distancia_metros
FROM casos_ayuda
WHERE ST_DWithin(
  ST_MakePoint(longitud, latitud)::geography,
  ST_MakePoint(-84.083333, 9.933333)::geography,
  5000
)
ORDER BY distancia_metros;
```

### Full-Text Search

```sql
-- Agregar columna tsvector
ALTER TABLE casos_ayuda ADD COLUMN search_vector tsvector;

-- Crear índice GIN
CREATE INDEX idx_casos_search ON casos_ayuda USING GIN(search_vector);

-- Trigger para actualizar automáticamente
CREATE TRIGGER casos_search_update 
BEFORE INSERT OR UPDATE ON casos_ayuda
FOR EACH ROW EXECUTE FUNCTION
  tsvector_update_trigger(search_vector, 'pg_catalog.spanish', titulo, descripcion);

-- Buscar
SELECT * FROM casos_ayuda 
WHERE search_vector @@ to_tsquery('spanish', 'cirugía');
```

---

**Última actualización**: 2024-03-08  
**Versión del Schema**: 1.0
