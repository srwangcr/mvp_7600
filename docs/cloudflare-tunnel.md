# Guía de Configuración de Cloudflare Tunnel

Esta guía te ayuda a configurar un Cloudflare Tunnel para exponer Ayuda Tica sin necesidad de abrir puertos en tu firewall o configurar certificados SSL manualmente.

## ¿Qué es Cloudflare Tunnel?

Cloudflare Tunnel (antes Argo Tunnel) crea una conexión segura desde tu servidor a Cloudflare sin necesidad de:
- Abrir puertos en firewall
- IP pública estática
- Configurar certificados SSL (Cloudflare lo maneja)
- Configurar reverse proxy externo

## Requisitos Previos

1. **Cuenta de Cloudflare** (plan gratuito funciona)
2. **Dominio registrado** en Cloudflare
   - En este caso: `srwangcr.tech`
   - Subdomain: `ayudatica.srwangcr.tech`
3. **Acceso SSH** a tu servidor DL360 G7
4. **Docker corriendo** en el servidor

---

## Paso 1: Preparar el Dominio

### 1.1 Agregar dominio a Cloudflare

1. Ve a [dash.cloudflare.com](https://dash.cloudflare.com/)
2. Click en "Add a Site"
3. Ingresa `srwangcr.tech`
4. Selecciona el plan **Free**
5. **Importante**: Cambia los nameservers en tu registrador de dominio a los que te dé Cloudflare (algo como `dana.ns.cloudflare.com`)

### 1.2 Esperar propagación DNS

```bash
# Verificar que el dominio apunta a Cloudflare
dig NS srwangcr.tech
```

Deberías ver nameservers de Cloudflare.

---

## Paso 2: Instalar cloudflared

En tu servidor Ubuntu:

```bash
# Descargar binario
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64

# Mover a /usr/local/bin
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared

# Hacer ejecutable
sudo chmod +x /usr/local/bin/cloudflared

# Verificar instalación
cloudflared --version
```

---

## Paso 3: Autenticar con Cloudflare

```bash
cloudflared tunnel login
```

Esto abrirá una URL en el navegador como:

```
https://dash.cloudflare.com/argotunnel?callback=http://localhost:XXXXX
```

**Pasos:**
1. Copia esa URL y ábrela en un navegador
2. Selecciona el dominio `srwangcr.tech`
3. Click en "Authorize"

Verás un mensaje de éxito. El certificado se guarda en:
```
~/.cloudflared/cert.pem
```

---

## Paso 4: Crear el Tunnel

```bash
cloudflared tunnel create ayudatica
```

**Output esperado:**
```
Tunnel credentials written to /home/srwangcr/.cloudflared/<TUNNEL-ID>.json
```

Guarda el `<TUNNEL-ID>` que te da, lo necesitarás.

### Verificar el tunnel

```bash
cloudflared tunnel list
```

Deberías ver algo como:

```
ID                                   NAME       CREATED              CONNECTIONS
abcd1234-5678-90ef-ghij-klmn12345678 ayudatica  2024-01-15T10:00:00Z 0
```

---

## Paso 5: Configurar el Tunnel

### 5.1 Crear archivo de configuración

```bash
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

**Contenido del archivo:**

```yaml
tunnel: <TU-TUNNEL-ID>
credentials-file: /home/srwangcr/.cloudflared/<TU-TUNNEL-ID>.json

# Opciones de logging
loglevel: info

ingress:
  # Regla principal: todo el tráfico a ayudatica.srwangcr.tech va al nginx local
  - hostname: ayudatica.srwangcr.tech
    service: http://localhost:80
    
  # Regla catch-all (requerida)
  - service: http_status:404
```

**Reemplaza:**
- `<TU-TUNNEL-ID>` con el ID real del paso anterior (en ambos lugares)
- `/home/srwangcr/` con tu home directory si es diferente

### 5.2 Ejemplo completo

```yaml
tunnel: abcd1234-5678-90ef-ghij-klmn12345678
credentials-file: /home/srwangcr/.cloudflared/abcd1234-5678-90ef-ghij-klmn12345678.json

loglevel: info

ingress:
  - hostname: ayudatica.srwangcr.tech
    service: http://localhost:80
  - service: http_status:404
```

---

## Paso 6: Configurar DNS

### Opción A: Usando CLI (Recomendado)

```bash
cloudflared tunnel route dns ayudatica ayudatica.srwangcr.tech
```

### Opción B: Manual desde Dashboard

1. Ve a [dash.cloudflare.com](https://dash.cloudflare.com/)
2. Selecciona `srwangcr.tech`
3. Ve a **DNS > Records**
4. Click en **Add record**
5. Configurar:
   - **Type**: `CNAME`
   - **Name**: `ayudatica`
   - **Target**: `<TUNNEL-ID>.cfargotunnel.com`
   - **Proxy status**: ✅ Proxied (nube naranja)
   - **TTL**: Auto
6. Click en **Save**

---

## Paso 7: Probar el Tunnel (Modo Debugging)

Antes de configurar como servicio, prueba que funciona:

```bash
# Asegúrate de que Docker esté corriendo
cd /home/srwangcr/Música/mvp_7600
docker compose ps  # Debe mostrar todos los servicios running

# Iniciar tunnel en modo debug
cloudflared tunnel run ayudatica
```

**Output esperado:**
```
2024-01-15T10:00:00Z INFO  Starting tunnel ayudatica
2024-01-15T10:00:00Z INFO  Connection registered connIndex=0
2024-01-15T10:00:00Z INFO  Connection registered connIndex=1
```

### Probar desde otro dispositivo

Abre en un navegador (desde cualquier dispositivo con internet):

```
https://ayudatica.srwangcr.tech
```

Deberías ver tu aplicación Ayuda Tica.

Si funciona, presiona `Ctrl+C` para detener el tunnel y continúa al siguiente paso.

---

## Paso 8: Configurar como Servicio Systemd

Para que el tunnel se ejecute automáticamente al iniciar el servidor:

### 8.1 Instalar el servicio

```bash
sudo cloudflared service install
```

### 8.2 Iniciar el servicio

```bash
sudo systemctl start cloudflared
```

### 8.3 Habilitar inicio automático

```bash
sudo systemctl enable cloudflared
```

### 8.4 Verificar estado

```bash
sudo systemctl status cloudflared
```

**Output esperado:**
```
● cloudflared.service - cloudflared
     Loaded: loaded (/etc/systemd/system/cloudflared.service; enabled)
     Active: active (running) since Mon 2024-01-15 10:00:00 CST; 5min ago
```

---

## Paso 9: Verificación Final

### 9.1 Verificar conectividad

```bash
# Ver logs del tunnel
sudo journalctl -u cloudflared -f
```

### 9.2 Verificar DNS

```bash
# Debe resolver al CNAME del tunnel
dig ayudatica.srwangcr.tech
```

### 9.3 Probar desde navegador

Abre en diferentes dispositivos/redes:
- https://ayudatica.srwangcr.tech
- https://ayudatica.srwangcr.tech/api/health

Deberías ver:
- ✅ Certificado SSL válido (automático por Cloudflare)
- ✅ Aplicación funcionando
- ✅ Sin warnings de seguridad

---

## Configuración Adicional en Cloudflare Dashboard

### SSL/TLS Settings

1. Ve a **SSL/TLS** en tu dominio
2. Configura:
   - **SSL/TLS encryption mode**: `Full` (no `Flexible`, no `Full (strict)`)
   - Esto porque nginx usa HTTP localmente, no HTTPS

### Firewall Rules (Opcional)

Para proteger tu aplicación:

1. Ve a **Security > WAF**
2. Habilita **Managed Rules** (Free plan incluye básico)
3. Considera reglas como:
   - Bloquear países específicos (si solo quieres CR)
   - Rate limiting adicional

### Caching Rules

1. Ve a **Caching > Configuration**
2. Configurar:
   ```
   Bypass Cache when URL contains: /api/
   ```
   - Esto previene que Cloudflare cachee respuestas de tu API

---

## Troubleshooting

### Error: "Unable to connect to the origin"

**Causa**: Cloudflare no puede conectar a tu servidor local.

**Solución:**
```bash
# Verificar que Docker esté corriendo
docker compose ps

# Verificar que nginx esté en puerto 80
sudo netstat -tlnp | grep :80

# Ver logs del tunnel
sudo journalctl -u cloudflared -f

# Reiniciar tunnel
sudo systemctl restart cloudflared
```

---

### Error: "DNS resolution error"

**Causa**: DNS no propagado o mal configurado.

**Solución:**
```bash
# Verificar CNAME
dig ayudatica.srwangcr.tech

# Debería mostrar algo como:
# ayudatica.srwangcr.tech. 300 IN CNAME <TUNNEL-ID>.cfargotunnel.com.

# Si no, recrear el record DNS:
cloudflared tunnel route dns ayudatica ayudatica.srwangcr.tech
```

---

### Error: Certificado SSL inválido

**Causa**: SSL mode mal configurado en Cloudflare.

**Solución:**
1. Ve a **SSL/TLS** en Cloudflare Dashboard
2. Cambia a **Full** (NO Full strict, ya que nginx usa HTTP)
3. Espera 2-3 minutos y recarga

---

### Tunnel se detiene después de reiniciar servidor

**Causa**: Servicio no habilitado en startup.

**Solución:**
```bash
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

---

### Ver estadísticas del tunnel

```bash
# Conexiones activas
cloudflared tunnel info ayudatica

# Ver todo el tráfico
sudo journalctl -u cloudflared -f
```

---

## Mantenimiento

### Actualizar cloudflared

```bash
# Detener servicio
sudo systemctl stop cloudflared

# Descargar nueva versión
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared

# Reiniciar servicio
sudo systemctl start cloudflared
```

### Rotar credentials

```bash
# Crear nuevo tunnel
cloudflared tunnel create ayudatica-v2

# Actualizar config.yml con nuevo ID
nano ~/.cloudflared/config.yml

# Actualizar DNS
cloudflared tunnel route dns ayudatica-v2 ayudatica.srwangcr.tech

# Reiniciar servicio
sudo systemctl restart cloudflared

# Eliminar tunnel antiguo (después de verificar que funciona)
cloudflared tunnel delete ayudatica
```

### Ver métricas en dashboard

1. Ve a [dash.cloudflare.com](https://dash.cloudflare.com/)
2. Selecciona tu dominio
3. Ve a **Analytics > Traffic**
4. Filtra por hostname: `ayudatica.srwangcr.tech`

---

## Agregar Más Subdominios (Escalabilidad Futura)

Si necesitas agregar más servicios:

```yaml
tunnel: <TUNNEL-ID>
credentials-file: /home/srwangcr/.cloudflared/<TUNNEL-ID>.json

ingress:
  # Aplicación principal
  - hostname: ayudatica.srwangcr.tech
    service: http://localhost:80
  
  # API dedicada (ejemplo futuro si separas backend)
  - hostname: api.ayudatica.srwangcr.tech
    service: http://localhost:5000
  
  # Panel de administración separado
  - hostname: admin.ayudatica.srwangcr.tech
    service: http://localhost:3001
  
  # Catch-all
  - service: http_status:404
```

Para cada hostname adicional:

```bash
cloudflared tunnel route dns <TUNNEL-NAME> <SUBDOMAIN>.srwangcr.tech
```

---

## Beneficios de Usar Cloudflare Tunnel

✅ **Seguridad**:
- No necesitas exponer puertos al internet
- SSL/TLS automático
- Protección DDoS incluida (Cloudflare absorbe ataques)

✅ **Simplicidad**:
- No configurar NAT/port forwarding
- No necesitas IP estática
- Certificados SSL automáticos

✅ **Performance**:
- CDN global de Cloudflare
- Caching automático de assets estáticos
- Compresión automática (Brotli/Gzip)

✅ **Monitoreo**:
- Analytics integrados en dashboard
- Ver tráfico en tiempo real
- Logs de acceso

---

## Comandos Útiles de Referencia

```bash
# Ver tunnels
cloudflared tunnel list

# Info de un tunnel
cloudflared tunnel info ayudatica

# Correr tunnel manualmente (debug)
cloudflared tunnel run ayudatica

# Ver logs del servicio
sudo journalctl -u cloudflared -f

# Estado del servicio
sudo systemctl status cloudflared

# Reiniciar servicio
sudo systemctl restart cloudflared

# Ver DNS routes
cloudflared tunnel route dns list

# Eliminar tunnel
cloudflared tunnel delete <TUNNEL-NAME>
```

---

## Próximos Pasos

Una vez configurado el tunnel:

1. ✅ Accede a https://ayudatica.srwangcr.tech
2. Configura Google Search Console para SEO
3. Habilita Analytics adicionales
4. Considera configurar firewall rules en Cloudflare

---

**¡Tunnel configurado correctamente!** 🎉

Tu aplicación ahora es accesible globalmente con SSL automático y protección DDoS.
