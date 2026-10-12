# Imagen pequeña que ya incluye Node.js 24.
FROM node:24-alpine

# Carpeta interna donde vivirá la aplicación.
WORKDIR /app

# Copia primero los manifiestos para aprovechar la caché de Docker.
COPY package*.json ./

# Instala únicamente dependencias necesarias para ejecutar.
RUN npm install --omit=dev

# Copia el código del microservicio.
COPY src ./src

# Documenta el puerto utilizado por Express.
EXPOSE 8080

# Comando que inicia el proceso principal del contenedor.
CMD ["npm", "start"]
