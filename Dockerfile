# Usar imagen Node.js oficial
FROM node:22-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Generar el archivo env.js con las variables de producción
RUN node scripts/generate-env.js

# Construir la aplicación Angular para producción
RUN npm run build:prod

# Imagen final ligera para servir la app
FROM node:22-alpine

WORKDIR /app

# Instalar serve para servir archivos estáticos
RUN npm install -g serve

# Copiar los archivos compilados desde el builder
COPY --from=builder /app/dist/lbs ./dist/lbs

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar
CMD ["serve", "dist/lbs", "-s", "-l", "3000"]
