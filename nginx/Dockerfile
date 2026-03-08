FROM nginx:alpine

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puertos
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
