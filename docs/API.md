# API Documentation - Ayuda Tica

Base URL: `https://ayudatica.srwangcr.tech/api`

## Tabla de Contenidos

- [Autenticación](#autenticación)
- [Usuarios](#usuarios)
- [Casos de Ayuda](#casos-de-ayuda)
- [Reportes Ley 7600](#reportes-ley-7600)
- [Donaciones](#donaciones)
- [Notificaciones](#notificaciones)
- [Administración](#administración)
- [Códigos de Error](#códigos-de-error)
- [Rate Limiting](#rate-limiting)

---

## Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación. Headers requeridos:

```
Authorization: Bearer <token>
```

### POST /auth/register

Registrar un nuevo usuario.

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "telefono": "88887777",
  "provincia": "San José",
  "canton": "Central"
}
```

**Response (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "uuid",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "usuario",
    "email_verificado": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Rate Limit:** 5 requests / 15 minutos

---

### POST /auth/login

Iniciar sesión.

**Body:**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": "uuid",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "usuario",
    "email_verificado": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**
- `401`: Credenciales incorrectas
- `403`: Usuario inactivo

**Rate Limit:** 5 attempts / 15 minutos

---

### POST /auth/verify-email/:token

Verificar email del usuario.

**Response (200):**
```json
{
  "message": "Email verificado exitosamente"
}
```

---

### POST /auth/forgot-password

Solicitar reset de contraseña.

**Body:**
```json
{
  "email": "juan@example.com"
}
```

**Response (200):**
```json
{
  "message": "Se ha enviado un correo con instrucciones para resetear tu contraseña"
}
```

---

### POST /auth/reset-password/:token

Resetear contraseña con token.

**Body:**
```json
{
  "password": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

---

### POST /auth/change-password

Cambiar contraseña (requiere autenticación).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456"
}
```

**Response (200):**
```json
{
  "message": "Contraseña cambiada exitosamente"
}
```

---

### GET /auth/me

Obtener datos del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "rol": "usuario",
  "telefono": "88887777",
  "email_verificado": true,
  "activo": true,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-20T15:30:00Z"
}
```

---

## Usuarios

### GET /usuarios/:id/perfil

Ver perfil público de un usuario.

**Response (200):**
```json
{
  "id": "uuid",
  "nombre": "Juan Pérez",
  "provincia": "San José",
  "canton": "Central",
  "casos_creados": 5,
  "reportes_creados": 2,
  "donaciones_realizadas": 10
}
```

---

### PUT /usuarios/perfil

Actualizar perfil propio (requiere autenticación).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "nombre": "Juan Carlos Pérez",
  "telefono": "88889999",
  "provincia": "Alajuela",
  "canton": "Alajuela"
}
```

**Response (200):**
```json
{
  "message": "Perfil actualizado exitosamente",
  "user": {
    "id": "uuid",
    "nombre": "Juan Carlos Pérez",
    "email": "juan@example.com",
    "telefono": "88889999"
  }
}
```

---

## Casos de Ayuda

### GET /casos

Listar casos de ayuda (público).

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10, max: 50)
- `estado` (aprobado, pendiente, rechazado, cerrado)
- `provincia`
- `canton`
- `tipo_ayuda` (economica, alimentaria, medica, vivienda, educacion, otro)

**Example:** `GET /casos?page=1&limit=20&estado=aprobado&provincia=San José`

**Response (200):**
```json
{
  "casos": [
    {
      "id": "uuid",
      "titulo": "Ayuda para cirugía urgente",
      "descripcion": "Necesito ayuda para pagar una cirugía...",
      "tipo_ayuda": "medica",
      "monto_necesario": 5000000,
      "monto_recaudado": 1500000,
      "estado": "aprobado",
      "provincia": "San José",
      "canton": "Escazú",
      "fotos": ["url1.jpg", "url2.jpg"],
      "usuario": {
        "nombre": "Juan Pérez"
      },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCasos": 48,
    "limit": 10
  }
}
```

---

### GET /casos/:id

Ver detalles de un caso específico.

**Response (200):**
```json
{
  "id": "uuid",
  "titulo": "Ayuda para cirugía urgente",
  "descripcion": "Necesito ayuda para pagar una cirugía de emergencia...",
  "tipo_ayuda": "medica",
  "monto_necesario": 5000000,
  "monto_recaudado": 1500000,
  "estado": "aprobado",
  "provincia": "San José",
  "canton": "Escazú",
  "distrito": "San Rafael",
  "direccion_exacta": "100m sur de la iglesia",
  "latitud": 9.928069,
  "longitud": -84.137352,
  "fotos": ["https://ayudatica.srwangcr.tech/uploads/casos/foto1.jpg"],
  "usuario": {
    "id": "uuid",
    "nombre": "Juan Pérez"
  },
  "donaciones": [
    {
      "id": "uuid",
      "monto": 50000,
      "mensaje": "¡Mucha fuerza!",
      "createdAt": "2024-01-16T12:00:00Z"
    }
  ],
  "comentarios": [
    {
      "id": "uuid",
      "contenido": "¿Cómo puedo donar?",
      "usuario": {
        "nombre": "María López"
      },
      "createdAt": "2024-01-16T14:00:00Z"
    }
  ],
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-16T12:00:00Z"
}
```

---

### POST /casos

Crear un nuevo caso de ayuda (requiere autenticación).

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body (form-data):**
```
titulo: "Ayuda para cirugía urgente"
descripcion: "Necesito ayuda..."
tipo_ayuda: "medica"
monto_necesario: 5000000
provincia: "San José"
canton: "Escazú"
distrito: "San Rafael"
direccion_exacta: "100m sur de la iglesia"
latitud: 9.928069
longitud: -84.137352
fotos: [File, File]  // Max 5 archivos, 10MB cada uno
```

**Response (201):**
```json
{
  "message": "Caso creado exitosamente. Será revisado por un moderador.",
  "caso": {
    "id": "uuid",
    "titulo": "Ayuda para cirugía urgente",
    "estado": "pendiente"
  }
}
```

**Rate Limit:** 3 casos / hora

---

### PUT /casos/:id

Actualizar un caso propio (requiere autenticación + ser dueño o moderador).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "titulo": "Título actualizado",
  "descripcion": "Nueva descripción"
}
```

**Response (200):**
```json
{
  "message": "Caso actualizado exitosamente",
  "caso": { ... }
}
```

---

### DELETE /casos/:id

Eliminar un caso (requiere ser dueño o moderador).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Caso eliminado exitosamente"
}
```

---

### POST /casos/:id/aprobar

Aprobar un caso pendiente (requiere rol moderador o superior).

**Headers:** `Authorization: Bearer <token>`

**Body (opcional):**
```json
{
  "comentario_moderacion": "Caso aprobado, toda la información está correcta"
}
```

**Response (200):**
```json
{
  "message": "Caso aprobado exitosamente"
}
```

---

### POST /casos/:id/rechazar

Rechazar un caso pendiente (requiere rol moderador o superior).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "comentario_moderacion": "Falta información sobre el monto necesario"
}
```

**Response (200):**
```json
{
  "message": "Caso rechazado"
}
```

---

### POST /casos/:id/cerrar

Cerrar un caso (requiere ser dueño o moderador).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Caso cerrado exitosamente"
}
```

---

### GET /casos/mis-casos

Ver casos propios (requiere autenticación).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "casos": [ ... ],
  "total": 5
}
```

---

### GET /casos/mapa

Obtener casos para mostrar en mapa (solo aprobados con coordenadas).

**Response (200):**
```json
{
  "casos": [
    {
      "id": "uuid",
      "titulo": "Ayuda urgente",
      "latitud": 9.928069,
      "longitud": -84.137352,
      "tipo_ayuda": "medica",
      "monto_necesario": 5000000,
      "monto_recaudado": 1500000
    }
  ]
}
```

---

## Reportes Ley 7600

### GET /reportes

Listar reportes de accesibilidad.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `estado` (pendiente, en_revision, en_proceso, resuelto, rechazado)
- `categoria` (acceso_fisico, transporte, educacion, empleo, salud, recreacion, comunicacion, tecnologia, otro)
- `provincia`

**Example:** `GET /reportes?estado=pendiente&categoria=acceso_fisico`

**Response (200):**
```json
{
  "reportes": [
    {
      "id": "uuid",
      "titulo": "Rampa inaccessible en edificio público",
      "descripcion": "La rampa no cumple con el ángulo requerido",
      "categoria": "acceso_fisico",
      "estado": "pendiente",
      "provincia": "San José",
      "canton": "Central",
      "latitud": 9.933333,
      "longitud": -84.083333,
      "fotos": ["url.jpg"],
      "usuario": {
        "nombre": "María López"
      },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /reportes/:id

Ver detalles de un reporte específico.

**Response (200):**
```json
{
  "id": "uuid",
  "titulo": "Rampa inaccessible",
  "descripcion": "La rampa no cumple...",
  "categoria": "acceso_fisico",
  "estado": "en_revision",
  "prioridad": "alta",
  "provincia": "San José",
  "canton": "Central",
  "distrito": "Carmen",
  "direccion_exacta": "Edificio Municipal",
  "latitud": 9.933333,
  "longitud": -84.083333,
  "fotos": ["url.jpg"],
  "institucion_responsable": "Municipalidad de San José",
  "usuario": {
    "id": "uuid",
    "nombre": "María López"
  },
  "autoridad_asignada": {
    "nombre": "Jorge Autoridad"
  },
  "comentarios": [ ... ],
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

### POST /reportes

Crear un nuevo reporte (requiere autenticación).

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body (form-data):**
```
titulo: "Rampa inaccesible"
descripcion: "Descripción detallada..."
categoria: "acceso_fisico"
prioridad: "alta"
provincia: "San José"
canton: "Central"
distrito: "Carmen"
direccion_exacta: "Edificio Municipal"
latitud: 9.933333
longitud: -84.083333
institucion_responsable: "Municipalidad de San José"
fotos: [File, File]  // Max 5 archivos
```

**Response (201):**
```json
{
  "message": "Reporte creado exitosamente",
  "reporte": {
    "id": "uuid",
    "titulo": "Rampa inaccesible",
    "estado": "pendiente"
  }
}
```

**Rate Limit:** 5 reportes / hora

---

### PUT /reportes/:id

Actualizar un reporte (requiere ser dueño o autoridad).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "titulo": "Título actualizado",
  "descripcion": "Nueva descripción"
}
```

---

### DELETE /reportes/:id

Eliminar un reporte (requiere ser dueño o administrador).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Reporte eliminado exitosamente"
}
```

---

### POST /reportes/:id/asignar

Asignar un reporte a una autoridad (requiere rol moderador o superior).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "autoridad_id": "uuid"
}
```

**Response (200):**
```json
{
  "message": "Reporte asignado a autoridad exitosamente"
}
```

---

### PUT /reportes/:id/estado

Actualizar estado de un reporte (requiere ser la autoridad asignada o administrador).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "estado": "en_proceso",
  "comentario": "Iniciamos trabajo de reparación"
}
```

**Response (200):**
```json
{
  "message": "Estado del reporte actualizado"
}
```

---

### GET /reportes/mis-reportes

Ver reportes propios (requiere autenticación).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "reportes": [ ... ],
  "total": 8
}
```

---

### GET /reportes/asignados

Ver reportes asignados a mí (requiere rol autoridad o superior).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "reportes": [ ... ],
  "total": 12
}
```

---

## Donaciones

### POST /donaciones

Crear una nueva donación (requiere autenticación).

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body (form-data):**
```
caso_id: "uuid"
monto: 50000
metodo_pago: "sinpe_movil"
numero_sinpe: "88887777"
mensaje: "¡Mucha fuerza!"
nombre_donante: "Anónimo"  // Opcional
comprobante: File  // Captura del comprobante Sinpe
```

**Response (201):**
```json
{
  "message": "Donación registrada exitosamente. Será verificada por un moderador.",
  "donacion": {
    "id": "uuid",
    "monto": 50000,
    "estado": "pendiente"
  }
}
```

**Rate Limit:** 10 donaciones / hora

---

### GET /donaciones/mis-donaciones

Ver donaciones propias (requiere autenticación).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "donaciones": [
    {
      "id": "uuid",
      "caso": {
        "titulo": "Ayuda para cirugía"
      },
      "monto": 50000,
      "metodo_pago": "sinpe_movil",
      "estado": "verificada",
      "mensaje": "¡Mucha fuerza!",
      "createdAt": "2024-01-16T10:00:00Z"
    }
  ],
  "total": 5,
  "monto_total_donado": 250000
}
```

---

### POST /donaciones/:id/verificar

Verificar una donación (requiere rol moderador o superior).

**Headers:** `Authorization: Bearer <token>`

**Body (opcional):**
```json
{
  "comentario": "Comprobante verificado correctamente"
}
```

**Response (200):**
```json
{
  "message": "Donación verificada exitosamente"
}
```

---

### POST /donaciones/:id/rechazar

Rechazar una donación (requiere rol moderador o superior).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "motivo": "Comprobante no legible"
}
```

**Response (200):**
```json
{
  "message": "Donación rechazada"
}
```

---

### GET /donaciones/caso/:casoId

Ver donaciones de un caso específico.

**Response (200):**
```json
{
  "donaciones": [
    {
      "monto": 50000,
      "mensaje": "¡Fuerza!",
      "nombre_donante": "Anónimo",
      "createdAt": "2024-01-16T10:00:00Z"
    }
  ],
  "total_donaciones": 15,
  "monto_total": 750000
}
```

---

## Notificaciones

### GET /notificaciones

Obtener notificaciones del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `leida` (true/false)

**Response (200):**
```json
{
  "notificaciones": [
    {
      "id": "uuid",
      "titulo": "Nueva donación recibida",
      "mensaje": "Has recibido una donación de ₡50,000",
      "tipo": "donacion",
      "url": "/casos/uuid",
      "leida": false,
      "createdAt": "2024-01-16T10:00:00Z"
    }
  ],
  "no_leidas": 5,
  "total": 25
}
```

---

### PUT /notificaciones/:id/leer

Marcar notificación como leída.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Notificación marcada como leída"
}
```

---

### PUT /notificaciones/leer-todas

Marcar todas las notificaciones como leídas.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Todas las notificaciones han sido marcadas como leídas",
  "updated": 5
}
```

---

### DELETE /notificaciones/:id

Eliminar una notificación.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Notificación eliminada"
}
```

---

## Administración

**Todos los endpoints requieren rol `administrador`.**

### GET /admin/stats

Obtener estadísticas generales.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "usuarios": {
    "total": 1523,
    "activos": 1420,
    "nuevos_ultima_semana": 45
  },
  "casos": {
    "total": 342,
    "aprobados": 298,
    "pendientes": 32,
    "rechazados": 12
  },
  "reportes": {
    "total": 187,
    "pendientes": 23,
    "en_proceso": 45,
    "resueltos": 119
  },
  "donaciones": {
    "total": 1876,
    "monto_total": 125000000,
    "pendientes_verificacion": 12
  }
}
```

---

### GET /admin/usuarios

Listar todos los usuarios.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`, `limit`
- `rol` (usuario, moderador, autoridad, administrador)
- `activo` (true/false)

**Response (200):**
```json
{
  "usuarios": [ ... ],
  "pagination": { ... }
}
```

---

### PUT /admin/usuarios/:id/rol

Cambiar rol de un usuario.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "rol": "moderador"
}
```

**Response (200):**
```json
{
  "message": "Rol actualizado exitosamente"
}
```

---

### PUT /admin/usuarios/:id/activar

Activar/desactivar un usuario.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "activo": false
}
```

**Response (200):**
```json
{
  "message": "Usuario desactivado exitosamente"
}
```

---

### GET /admin/casos/pendientes

Ver casos pendientes de moderación.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "casos": [ ... ],
  "total": 32
}
```

---

### GET /admin/donaciones/pendientes

Ver donaciones pendientes de verificación.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "donaciones": [ ... ],
  "total": 12
}
```

---

### GET /admin/logs

Ver logs de actividad del sistema.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`, `limit`
- `tipo_accion` (login, registro, crear_caso, donar, etc.)
- `usuario_id`

**Response (200):**
```json
{
  "logs": [
    {
      "id": "uuid",
      "usuario": {
        "nombre": "Juan Pérez"
      },
      "tipo_accion": "login",
      "detalles": "Login exitoso desde IP 192.168.1.1",
      "ip": "192.168.1.1",
      "createdAt": "2024-01-16T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

## Códigos de Error

| Código | Significado |
|--------|-------------|
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o expirado |
| 403 | Forbidden - No tienes permisos |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Email ya registrado |
| 413 | Payload Too Large - Archivo muy grande |
| 422 | Unprocessable Entity - Validación fallida |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Error del servidor |

### Formato de respuesta de error

```json
{
  "error": "Mensaje descriptivo del error",
  "code": "ERROR_CODE",
  "details": { ... }  // Opcional
}
```

---

## Rate Limiting

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| Global | 100 requests | 15 min |
| POST /auth/register | 5 requests | 15 min |
| POST /auth/login | 5 requests | 15 min |
| POST /casos | 3 requests | 1 hora |
| POST /reportes | 5 requests | 1 hora |
| POST /donaciones | 10 requests | 1 hora |

Cuando se excede el límite:

```json
{
  "error": "Demasiadas solicitudes. Por favor intenta más tarde.",
  "retry_after": 900
}
```

Headers de respuesta:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1705419600
```

---

## Ejemplos de uso con cURL

### Registrarse

```bash
curl -X POST https://ayudatica.srwangcr.tech/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "telefono": "88887777",
    "provincia": "San José"
  }'
```

### Login

```bash
curl -X POST https://ayudatica.srwangcr.tech/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

### Listar casos

```bash
curl https://ayudatica.srwangcr.tech/api/casos?page=1&limit=10
```

### Crear un caso (con fotos)

```bash
curl -X POST https://ayudatica.srwangcr.tech/api/casos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "titulo=Ayuda urgente" \
  -F "descripcion=Necesito ayuda..." \
  -F "tipo_ayuda=medica" \
  -F "monto_necesario=5000000" \
  -F "provincia=San José" \
  -F "canton=Escazú" \
  -F "fotos=@/path/to/photo1.jpg" \
  -F "fotos=@/path/to/photo2.jpg"
```

### Donar (con comprobante)

```bash
curl -X POST https://ayudatica.srwangcr.tech/api/donaciones \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "caso_id=CASO_UUID" \
  -F "monto=50000" \
  -F "metodo_pago=sinpe_movil" \
  -F "numero_sinpe=88887777" \
  -F "mensaje=Mucha fuerza" \
  -F "comprobante=@/path/to/comprobante.jpg"
```

---

**Documentación generada para Ayuda Tica MVP v1.0**
