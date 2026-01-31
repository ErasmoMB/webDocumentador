/*
 * Fase 3 guardrail: evita reintroducir escrituras legacy directas a FormularioService
 * desde el código de aplicación (fuera de coordinadores permitidos).
 *
 * Regla:
 * - Prohibido: (this.)formularioService.actualizarDato(...) / actualizarDatos(...)
 * - Permitido solo en:
 *   - src/app/shared/utils/section-persistence-coordinator.ts
 *   - src/app/shared/utils/section-reactive-sync-coordinator.ts
 *   - src/app/core/services/state/form-change.service.ts
 *   - src/app/core/services/formulario.service.ts
 */

const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const appRoot = path.join(workspaceRoot, 'src', 'app');

const allowlist = new Set([
  path.normalize(path.join(appRoot, 'shared', 'utils', 'section-persistence-coordinator.ts')),
  path.normalize(path.join(appRoot, 'shared', 'utils', 'section-reactive-sync-coordinator.ts')),
  path.normalize(path.join(appRoot, 'core', 'services', 'state', 'form-change.service.ts')),
  path.normalize(path.join(appRoot, 'core', 'services', 'formulario.service.ts')),
  // ✅ ReactiveStateAdapter es un puente autorizado para sincronizar con localStorage
  path.normalize(path.join(appRoot, 'core', 'services', 'state-adapters', 'reactive-state-adapter.service.ts')),
]);

const forbiddenMatchers = [
  { label: 'formularioService.actualizarDato', regex: /\bformularioService\s*\.\s*actualizarDato\s*\(/g },
  { label: 'formularioService.actualizarDatos', regex: /\bformularioService\s*\.\s*actualizarDatos\s*\(/g },
];

function walkDir(dirPath, acc) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      // excluir outputs comunes
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'coverage') continue;
      walkDir(fullPath, acc);
      continue;
    }

    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.ts')) continue;
    if (entry.name.endsWith('.spec.ts')) continue;

    acc.push(fullPath);
  }
  return acc;
}

function indexToLineCol(text, index) {
  const slice = text.slice(0, index);
  const lines = slice.split(/\r\n|\n|\r/);
  const line = lines.length;
  const col = lines[lines.length - 1].length + 1;
  return { line, col };
}

function main() {
  if (!fs.existsSync(appRoot)) {
    console.error(`[check-no-legacy-writes] No existe: ${appRoot}`);
    process.exit(1);
  }

  const files = walkDir(appRoot, []);
  const violations = [];

  for (const filePath of files) {
    const normalized = path.normalize(filePath);
    if (allowlist.has(normalized)) continue;

    const content = fs.readFileSync(filePath, 'utf8');

    for (const matcher of forbiddenMatchers) {
      matcher.regex.lastIndex = 0;
      let match;
      while ((match = matcher.regex.exec(content)) !== null) {
        const loc = indexToLineCol(content, match.index);
        violations.push({ filePath, label: matcher.label, line: loc.line, col: loc.col });
      }
    }
  }

  if (violations.length > 0) {
    console.error('\n[check-no-legacy-writes] Se detectaron escrituras legacy prohibidas:\n');
    for (const v of violations) {
      const rel = path.relative(workspaceRoot, v.filePath).split(path.sep).join('/');
      console.error(`- ${rel}:${v.line}:${v.col}  (${v.label})`);
    }
    console.error(
      `\nPermitidos solo en coordinadores/servicios base. ` +
        `Usa onFieldChange(...) / FormChangeService.persistFields(...) en vez de FormularioService directo.\n`
    );
    process.exit(2);
  }

  console.log('[check-no-legacy-writes] OK: no se encontraron escrituras legacy directas.');
}

main();
