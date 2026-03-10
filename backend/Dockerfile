# Backend Dockerfile para Ayuda Tica
FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    wget

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
# Usa npm ci cuando existe package-lock.json; de lo contrario usa npm install.
RUN if [ -f package-lock.json ]; then \
            npm ci --omit=dev; \
        else \
            npm install --omit=dev; \
        fi

# Copiar código fuente
COPY . .

# Crear directorios necesarios
RUN mkdir -p uploads logs && \
    chmod 755 uploads logs

# Exponer puerto
EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/api/health || exit 1

# Usuario no root por seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Comando de inicio
CMD ["node", "server.js"]
