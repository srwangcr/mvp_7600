# Guía de Deployment - Ayuda Tica

Esta guía detalla el proceso completo de deployment de Ayuda Tica en tu servidor DL360 G7 con Ubuntu Server.

## Requisitos Previos

### Hardware
- **Servidor**: HP DL360 G7
- **RAM**: Mínimo 8GB (recomendado 16GB)
- **Almacenamiento**: Mínimo 50GB libres
- **Red**: Conexión a internet estable

### Software
- **OS**: Ubuntu Server 22.04 LTS
- **Docker**: v24.0+
- **Docker Compose**: v2.20+
- **Cloudflared**: Para Cloudflare Tunnel

## 1. Preparar el Servidor

### 1.1 Actualizar el sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Instalar Docker

```bash
# Instalar dependencias
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y

# Agregar GPG key de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Agregar repositorio de Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y

# Verificar instalación
docker --version
docker compose version
```

### 1.3 Configurar permisos de Docker

```bash
sudo usermod -aG docker $USER
newgrp docker
```

## 2. Clonar o Transferir el Proyecto

```bash
# Si usas Git
cd /home/srwangcr/Música
git clone <tu-repositorio> mvp_7600

# O si transfieres archivos directamente
# Ya están en /home/srwangcr/Música/mvp_7600
```

## 3. Configurar Variables de Entorno

```bash
cd /home/srwangcr/Música/mvp_7600
cp .env.example .env
nano .env
```

### Variables críticas a configurar:

```bash
# Base de datos - CAMBIAR PASSWORD
DB_PASSWORD=TU_PASSWORD_SEGURO_AQUI

# JWT - Generar un secret aleatorio
# Ejecuta: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=TU_SECRET_JWT_AQUI

# Email (Gmail SMTP)
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu-app-password-de-16-caracteres

# Frontend
REACT_APP_API_URL=https://ayudatica.srwangcr.tech/api
REACT_APP_DOMAIN=ayudatica.srwangcr.tech

# Cloudflare
CLOUDFLARE_TUNNEL_URL=https://ayudatica.srwangcr.tech

# Admin email
ADMIN_EMAIL=admin@ayudatica.srwangcr.tech
```

### Generar JWT Secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 4. Configurar Gmail SMTP

1. Ve a [Google Account Security](https://myaccount.google.com/security)
2. Habilita "Verificación en 2 pasos"
3. Ve a "App Passwords" y crea una nueva:
   - Selecciona "Mail" como app
   - Selecciona "Other" como dispositivo
   - Nombra: "Ayuda Tica Server"
4. Copia el password de 16 caracteres generado
5. Pégalo en `.env` como `GMAIL_APP_PASSWORD`

## 5. Configurar Cloudflare Tunnel

### 5.1 Instalar cloudflared

```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared
```

### 5.2 Autenticar con Cloudflare

```bash
cloudflared tunnel login
```

Esto abrirá una URL en el navegador para autorizar. Sigue las instrucciones.

### 5.3 Crear el tunnel

```bash
cloudflared tunnel create ayudatica
```

Esto generará un archivo de credenciales en `~/.cloudflared/`

### 5.4 Configurar el tunnel

```bash
nano ~/.cloudflared/config.yml
```

Contenido:

```yaml
tunnel: ayudatica
credentials-file: /home/srwangcr/.cloudflared/<TUNNEL-ID>.json

ingress:
  - hostname: ayudatica.srwangcr.tech
    service: http://localhost:80
  - service: http_status:404
```

### 5.5 Crear DNS record

```bash
cloudflared tunnel route dns ayudatica ayudatica.srwangcr.tech
```

### 5.6 Ejecutar tunnel como servicio

```bash
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
sudo systemctl status cloudflared
```

## 6. Build y Deployment con Docker

### 6.1 Build de imágenes

```bash
cd /home/srwangcr/Música/mvp_7600
docker compose build
```

Este proceso puede tomar 10-15 minutos.

### 6.2 Iniciar servicios

```bash
docker compose up -d
```

### 6.3 Verificar que los contenedores estén corriendo

```bash
docker compose ps
```

Deberías ver:
- `ayudatica_postgres` - running
- `ayudatica_backend` - running
- `ayudatica_frontend` - running
- `ayudatica_nginx` - running

### 6.4 Ver logs

```bash
# Todos los servicios
docker compose logs -f

# Solo un servicio específico
docker compose logs -f backend
docker compose logs -f postgres
```

## 7. Verificación del Deployment

### 7.1 Health checks

```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:80

# Vía Cloudflare Tunnel
curl https://ayudatica.srwangcr.tech/api/health
```

### 7.2 Verificar base de datos

```bash
# Entrar al contenedor de postgres
docker exec -it ayudatica_postgres psql -U ayudatica_user -d ayudatica_db

# Verificar tablas
\dt

# Ver usuario admin
SELECT email, rol FROM users WHERE rol = 'administrador';

# Salir
\q
```

## 8. Acceso Inicial

### 8.1 Acceder a la aplicación

Abre en el navegador: `https://ayudatica.srwangcr.tech`

### 8.2 Login como administrador

- **Email**: `admin@ayudatica.srwangcr.tech`
- **Password**: `Admin123!`

**⚠️ IMPORTANTE**: Cambia esta contraseña inmediatamente después del primer login.

## 9. Mantenimiento y Monitoreo

### 9.1 Actualizar la aplicación

```bash
# Detener servicios
docker compose down

# Pull últimos cambios (si usas Git)
git pull

# Rebuild si hay cambios en código
docker compose build

# Reiniciar
docker compose up -d
```

### 9.2 Backup de base de datos

```bash
# Crear backup
docker exec ayudatica_postgres pg_dump -U ayudatica_user ayudatica_db > backup_$(date +%Y%m%d).sql

# Comprimir
gzip backup_$(date +%Y%m%d).sql
```

### 9.3 Restaurar backup

```bash
# Descomprimir
gunzip backup_20260308.sql.gz

# Restaurar
docker exec -i ayudatica_postgres psql -U ayudatica_user ayudatica_db < backup_20260308.sql
```

### 9.4 Configurar backups automáticos

```bash
# Crear script de backup
nano ~/backup_ayudatica.sh
```

Contenido:

```bash
#!/bin/bash
BACKUP_DIR="/home/srwangcr/backups/ayudatica"
mkdir -p $BACKUP_DIR
docker exec ayudatica_postgres pg_dump -U ayudatica_user ayudatica_db | gzip > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Eliminar backups más antiguos de 30 días
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

```bash
# Hacer ejecutable
chmod +x ~/backup_ayudatica.sh

# Agregar a crontab (backup diario a las 3 AM)
crontab -e
```

Agregar línea:

```
0 3 * * * /home/srwangcr/backup_ayudatica.sh
```

### 9.5 Monitorear recursos

```bash
# Ver uso de recursos por contenedor
docker stats

# Espacio en disco
df -h

# Logs de sistema
journalctl -xe
```

## 10. Troubleshooting

### Problema: Contenedor no inicia

```bash
# Ver logs detallados
docker compose logs <servicio>

# Reiniciar servicio específico
docker compose restart <servicio>

# Rebuild si es necesario
docker compose up -d --build <servicio>
```

### Problema: Base de datos no conecta

```bash
# Verificar que postgres esté corriendo
docker exec ayudatica_postgres pg_isready

# Verificar credenciales en .env
cat .env | grep DB_

# Reiniciar postgres
docker compose restart postgres
```

### Problema: CORS errors en frontend

Verificar en `.env`:
- `REACT_APP_API_URL` debe apuntar a la URL correcta
- Backend debe tener el dominio en `cors.js`

### Problema: SSL/Cloudflare no funciona

```bash
# Ver estado de cloudflared
sudo systemctl status cloudflared

# Ver logs
sudo journalctl -u cloudflared -f

# Reiniciar tunnel
sudo systemctl restart cloudflared
```

### Problema: Out of memory

```bash
# Limpiar imágenes no usadas
docker system prune -a

# Ver uso de memoria
free -h

# Reiniciar contenedores
docker compose restart
```

## 11. Seguridad Post-Deployment

### 11.1 Cambiar contraseñas por defecto

1. Login como admin
2. Ir a perfil
3. Cambiar contraseña

### 11.2 Configurar firewall

```bash
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP (para Nginx/Cloudflare)
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable
```

### 11.3 Limitar acceso SSH

```bash
sudo nano /etc/ssh/sshd_config
```

Cambiar:

```
PermitRootLogin no
PasswordAuthentication no  # Si usas SSH keys
```

```bash
sudo systemctl restart sshd
```

## 12. Escalabilidad Futura

Cuando necesites escalar:

1. **Migrar DB a servidor dedicado**: Cambiar `DB_HOST` en `.env`
2. **Agregar Redis para caché**: Agregar servicio en `docker-compose.yml`
3. **Load balancer**: Nginx puede actuar como LB para múltiples backends
4. **Cloud hosting**: Migrar a AWS/GCP/Azure

---

## Comandos Útiles de Referencia

```bash
# Ver todos los contenedores
docker compose ps

# Detener todo
docker compose down

# Reiniciar todo
docker compose restart

# Ver logs
docker compose logs -f

# Ejecutar comando en contenedor
docker exec -it <contenedor> <comando>

# Limpiar todo
docker compose down -v
docker system prune -a
```

---

**¡Deployment completado!** 🎉

Tu aplicación Ayuda Tica debería estar corriendo en: `https://ayudatica.srwangcr.tech`
