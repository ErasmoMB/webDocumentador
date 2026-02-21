export const DEBUG_ALLOW = true;

// ✅ LOG SIMPLIFICADO PARA SECCION 6 - Solo muestra lo importante
export function debugLog(...args: any[]): void {
  // Filtrar: solo mostrar mensajes importantes
  const firstArg = args[0] || '';
  const isImportant = 
    firstArg.includes('[SECCION6]') || 
    firstArg.includes('[PERSISTENCE]') ||
    firstArg.includes('actualizarFila') ||
    firstArg.includes('GUARDANDO') ||
    firstArg.includes('CARGANDO DESDE BACKEND');
  
  if (!DEBUG_ALLOW || !isImportant) return;
  console.log(...args);
}

export function debugWarn(...args: any[]): void {
  if (!DEBUG_ALLOW) return;
  // eslint-disable-next-line no-console
  console.warn(...args);
}

export function debugError(...args: any[]): void {
  if (!DEBUG_ALLOW) return;
  // eslint-disable-next-line no-console
  console.error(...args);
}
