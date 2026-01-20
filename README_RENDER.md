# Despliegue en Render

## Configuración

Este frontend está configurado para desplegarse en Render usando variables de entorno.

## Variables de Entorno Requeridas

En el panel de Render, configura las siguientes variables de entorno:

- `API_URL`: URL del backend (ej: `https://tu-backend.onrender.com` o `https://api.proyectopaka.com`)
- `USE_MOCK_DATA`: `false` para producción
- `NODE_ENV`: `production`

## Pasos para Desplegar

1. Conecta tu repositorio de GitHub a Render
2. Selecciona el servicio "frontend-lbs" desde el `render.yaml`
3. Configura las variables de entorno en el panel de Render
4. Render ejecutará automáticamente:
   - `npm install`
   - `npm run build:prod` (que genera env.js y construye la app)
   - `npx serve dist/lbs -s -l $PORT`

## Notas

- El script `generate-env.js` se ejecuta automáticamente durante el build
- Las variables de entorno se inyectan en `src/assets/env.js` antes del build
- El archivo `env.js` se carga en `index.html` antes de que Angular inicie
