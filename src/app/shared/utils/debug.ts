export const DEBUG_ALLOW = false;

export function debugLog(...args: any[]): void {
  if (!DEBUG_ALLOW) return;
  // eslint-disable-next-line no-console
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
