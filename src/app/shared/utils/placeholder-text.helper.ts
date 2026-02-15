export function replaceLocationPlaceholders(
  text: string | null | undefined,
  centroPoblado?: string | null,
  distrito?: string | null
): string {
  if (!text) {
    return '';
  }

  let output = text;

  if (centroPoblado && centroPoblado !== '____') {
    output = output
      .replace(/CP\s*_{2,}/gi, `CP ${centroPoblado}`)
      .replace(/\{\{\s*centroPoblado\s*\}\}/gi, centroPoblado);
  }

  if (distrito && distrito !== '____') {
    output = output
      .replace(/Distrito\s*_{2,}/gi, `Distrito ${distrito}`)
      .replace(/\{\{\s*distrito\s*\}\}/gi, distrito);
  }

  return output;
}

export function hasUnderscorePlaceholder(text?: string | null): boolean {
  return !!text && /_{4,}/.test(text);
}

export function normalizeTitleWithPlaceholders(
  titulo: string | null | undefined,
  fallbackTitle: string,
  centroPoblado?: string | null,
  distrito?: string | null
): string {
  const fallback = replaceLocationPlaceholders(fallbackTitle, centroPoblado, distrito);

  if (!titulo || titulo.trim().length === 0) {
    return fallback;
  }

  const candidate = replaceLocationPlaceholders(titulo.trim(), centroPoblado, distrito);
  return hasUnderscorePlaceholder(candidate) ? fallback : candidate;
}
