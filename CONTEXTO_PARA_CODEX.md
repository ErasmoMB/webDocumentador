# CONTEXTO PARA CODEX - SESSION DATA MODULE

## 1. ESTRUCTURA EXISTENTE (Backend)

### Package.json - dependencias clave
- @nestjs/common ^9.0.0
- @nestjs/core ^9.0.0
- @nestjs/platform-express ^9.0.0
- @prisma/client ^4.0.0
- ioredis ^5.9.2

### Redis Cache Service (INCLUYELO COMPLETO)
[copiar todo el redis-cache.service.ts]

### Estructura de módulos actual
- src/modules/items/ (referencia)
- src/modules/centros-poblados/ (referencia)
- src/modules/demograficos/ (referencia)

## 2. INTERFACES/TIPOS NECESARIOS
[Poner exactamente qué tipos necesitas]

## 3. EXACTAMENTE QUÉ GENERAR

### Pedido 1: Backend Module (ESPECÍFICO)
Generar SOLO estos 4 archivos (en orden):
1. dto/save-session-data.dto.ts
2. session-data.service.ts
3. session-data.controller.ts
4. session-data.module.ts

Requisitos:
- Usar RedisCacheService inyectado
- TTL default 3600 segundos
- Sesiones por header 'x-session-id'
- No usar decoradores complejos
- [Añade reqs específicos]

### Pedido 2: Frontend Service (ESPECÍFICO)
Archivo: session-data.service.ts (Angular)

Requisitos:
- Extender StorageFacade existente
- Try/catch para backend
- Fallback automático a localStorage
- Métodos: saveData, loadData, uploadImage, clearAll

### Pedido 3: Integration (ESPECÍFICO)
- FormularioService integration con SessionDataService
- Hook en botón "Limpiar"