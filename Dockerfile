# Usar imagen Node.js oficial
FROM node:22-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar TODO el código fuente primero (para que estén disponibles los scripts)
COPY . .

# Instalar dependencias (el preinstall script necesita los archivos)
RUN npm ci

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

# Comando para iniciar (servir archivos estáticos)
CMD sh -c "serve dist/lbs -s -l $PORT"
