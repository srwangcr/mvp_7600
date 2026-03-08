# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Variables de entorno para build
ARG REACT_APP_API_URL
ARG REACT_APP_APP_NAME
ARG REACT_APP_DOMAIN
ARG REACT_APP_GOOGLE_MAPS_API_KEY

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_APP_NAME=$REACT_APP_APP_NAME
ENV REACT_APP_DOMAIN=$REACT_APP_DOMAIN
ENV REACT_APP_GOOGLE_MAPS_API_KEY=$REACT_APP_GOOGLE_MAPS_API_KEY

# Build de producción
RUN npm run build

# Production stage
FROM nginx:alpine

# Copiar build al servidor nginx
COPY --from=build /app/build /usr/share/nginx/html

# Configuración de nginx para React Router
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
