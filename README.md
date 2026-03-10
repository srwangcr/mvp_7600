# Ayuda Tica - MVP

Plataforma web para conectar personas que necesitan ayuda con donantes, y reportar violaciones a la Ley 7600 de accesibilidad en Costa Rica.

## 🚀 Características del MVP

### Prioridad Alta
- ✅ Sistema de donaciones con Sinpe Móvil
- ✅ Panel de administración multi-rol
- ✅ Casos de ayuda (solicitudes de donación)

### Prioridad Media
- ✅ Mapa interactivo de casos y reportes
- ✅ Reportes de Ley 7600

## 🏗️ Arquitectura

**Monolítica Cliente-Servidor** - Todo en un proyecto para facilitar deployment y mantenimiento.

```
[Usuario] <--> [Internet/Cloudflare Tunnel] <--> [Nginx (Reverse Proxy + SSL)]
                                                      |
                                                      v
                    [Frontend: React + Material-UI] <--> [Backend: Node.js/Express API]
                                                      |
                                                      v
                    [Database: PostgreSQL] <--> [Storage: Local Files para fotos]
```

## 🛠️ Stack Tecnológico

### Frontend
- **React.js** - Interfaz de usuario
- **Material-UI (MUI)** - Componentes de UI
- **Axios** - Cliente HTTP
- **React Router** - Navegación
- **React Leaflet** - Mapas (alternativa gratuita a Google Maps)
- **JWT** - Autenticación

### Backend
- **Node.js + Express** - API REST
- **PostgreSQL** - Base de datos
- **Sequelize** - ORM
- **JWT** - Tokens de autenticación
- **Bcrypt** - Hash de contraseñas
- **Multer** - Upload de archivos
- **Nodemailer** - Envío de emails

### DevOps
- **Docker + Docker Compose** - Contenedores
- **Nginx** - Reverse proxy y archivos estáticos
- **Ubuntu Server** - Sistema operativo
- **PM2** - Process manager para Node.js

## 📋 Roles de Usuario

1. **Usuario** - Puede crear casos de ayuda, reportes y donar
2. **Moderador** - Aprueba/rechaza casos y reportes
3. **Autoridad** - Recibe notificaciones de reportes Ley 7600
4. **Administrador** - Control total del sistema

## 🚀 Instalación y Deployment

### Requisitos Previos
- Docker y Docker Compose instalados
- Ubuntu Server 22.04 LTS
- Dominio configurado: `ayudatica.srwangcr.tech`
- Cloudflare Tunnel configurado
- Cuenta Gmail para SMTP

### Variables de Entorno

Copia `.env.example` y renombra a `.env`, luego configura:

```bash
cp .env.example .env
nano .env
```

### Instalación con Docker

```bash
# 1. Clonar o copiar el proyecto al servidor
cd /home/srwangcr/Música/mvp_7600

# 2. Construir las imágenes
docker-compose build

# 3. Iniciar los servicios
docker-compose up -d

# 4. Ver los logs
docker-compose logs -f
```

El sistema estará disponible en:
- **Frontend**: http://localhost (puerto 80)
- **Backend API**: http://localhost/api
- **Base de datos**: localhost:5432

### Configuración de Cloudflare Tunnel

```bash
# Instalar cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared

# Autenticar
cloudflared tunnel login

# Crear tunnel
cloudflared tunnel create ayudatica

# Configurar tunnel (ver docs/cloudflare-tunnel.md)
```

## 📁 Estructura del Proyecto

```
ayuda-tica/
├── docker-compose.yml          # Orquestación de contenedores
├── .env.example                # Variables de entorno ejemplo
├── README.md                   # Este archivo
├── docs/                       # Documentación adicional
│   ├── API.md                  # Documentación de APIs
│   ├── DEPLOYMENT.md           # Guía de deployment
│   └── DATABASE.md             # Esquema de base de datos
├── frontend/                   # Aplicación React
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── components/         # Componentes reutilizables
│       ├── pages/              # Páginas principales
│       ├── services/           # Servicios API
│       ├── context/            # Context API (estado global)
│       ├── utils/              # Utilidades
│       └── App.js
├── backend/                    # API Node.js
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── config/             # Configuración (DB, JWT, etc)
│       ├── controllers/        # Controladores de rutas
│       ├── models/             # Modelos de Sequelize
│       ├── routes/             # Definición de rutas
│       ├── middleware/         # Middleware (auth, validación)
│       ├── services/           # Lógica de negocio
│       └── utils/              # Utilidades
├── database/
│   └── init.sql                # Script de inicialización de DB
└── nginx/
    ├── Dockerfile
    └── nginx.conf              # Configuración de Nginx
```

## 🔐 Seguridad

- ✅ Passwords hasheados con bcrypt
- ✅ JWT para autenticación stateless
- ✅ CORS configurado
- ✅ Helmet para headers de seguridad
- ✅ Rate limiting contra abusos
- ✅ Validación de inputs
- ✅ HTTPS con Let's Encrypt (vía Cloudflare)

## 📊 Base de Datos

### Tablas Principales
- `users` - Usuarios del sistema
- `casos_ayuda` - Solicitudes de ayuda/donación
- `reportes` - Reportes de Ley 7600
- `donaciones` - Registro de donaciones
- `notificaciones` - Sistema de notificaciones

Ver `docs/DATABASE.md` para esquema completo.

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📧 Configuración de Email (Gmail SMTP)

1. Crear una cuenta Gmail o usar una existente
2. Habilitar "App Passwords" en configuración de Google
3. Agregar credenciales en `.env`:
   ```
    GMAIL_USER=tu-email@gmail.com
    GMAIL_APP_PASSWORD=tu-app-password
   ```

Notas:
- También se mantienen `SMTP_USER` y `SMTP_PASS` por compatibilidad.
- Si no defines `GMAIL_FROM_EMAIL`, se usará el mismo `GMAIL_USER`.

## 🗺️ Mapas

Usando **Leaflet + OpenStreetMap** (gratis, sin límites):
- No requiere API key
- Alternativa open-source a Google Maps
- Soporta marcadores y geolocalización

Si prefieres Google Maps, agrega tu API key en `.env`:
```
REACT_APP_GOOGLE_MAPS_API_KEY=tu-api-key
```

## 📱 Sinpe Móvil

El sistema muestra el número de teléfono Sinpe de la persona que solicita ayuda. Los donantes realizan la transferencia directamente y pueden reportarla en la plataforma (opcional para verificación).

## 🚧 Roadmap Post-MVP

### Versión 1.1
- [ ] Chat en vivo entre donante y beneficiario
- [ ] Notificaciones push (PWA)
- [ ] Integración directa con bancos de CR
- [ ] App móvil nativa (React Native)

### Versión 2.0
- [ ] Migración a microservicios
- [ ] Sistema de reputación/ratings
- [ ] Analytics y reportes automáticos
- [ ] OCR para escanear documentos

## 📜 Legal y Ética

⚠️ **Disclaimer incluido en la app**: 
> "Los reportes en esta plataforma no sustituyen denuncias formales ante la Defensoría de los Habitantes o el CONAPDIS. Para casos legales, consulte con las autoridades competentes."

✅ Cumple con:
- Ley de Protección de Datos (CR)
- Ley 7600 de Igualdad de Oportunidades
- Consentimiento informado para datos personales

## 🐛 Troubleshooting

### El contenedor de PostgreSQL no inicia
```bash
docker-compose down -v
docker-compose up -d postgres
docker-compose logs postgres
```

### Frontend no conecta con Backend
Verificar CORS en `backend/src/config/cors.js` y la variable `REACT_APP_API_URL`

### Archivos no se suben
Verificar permisos en carpeta `backend/uploads`:
```bash
chmod 755 backend/uploads
```

## 📞 Soporte

Para reportar bugs o sugerencias, contactar al administrador del sistema.

## 📄 Licencia

Proyecto privado - Todos los derechos reservados © 2026 Ayuda Tica

---

**Desarrollado con ❤️ para Costa Rica 🇨🇷**
