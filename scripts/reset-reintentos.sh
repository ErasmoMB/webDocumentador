#!/bin/bash
# Script para resetear reintentos del auto-loader cuando sea necesario
# Usar esto si el backend vuelve a estar disponible

# Cargar en console del navegador:
# 
# const loader = ng.probe(document.querySelector('[ng-app]')).injector.get('AutoBackendDataLoaderService');
# loader.resetAllRetries();
# console.log('✅ Todos los reintentos fueron reseteados');

# O para un endpoint específico:
# const loader = ng.probe(document.querySelector('[ng-app]')).injector.get('AutoBackendDataLoaderService');
# loader.resetRetriesForEndpoint('/aisi/informacion-referencial');
# console.log('✅ Reintentos reseteados para /aisi/informacion-referencial');
