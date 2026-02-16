/*
 * Guardrail (SSOT / Fase 0): evita reintroducir escrituras legacy directas a FormularioService
 * desde el código de aplicación (fuera de coordinadores permitidos).
 *
 * Regla:
 * - Prohibido: invocar métodos mutantes de FormularioService desde componentes/servicios de UI.
 * - Permitido solo en coordinadores/puentes autorizados.
 */

const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const appRoot = path.join(workspaceRoot, 'src', 'app');

const allowlist = new Set([
  path.normalize(path.join(appRoot, 'shared', 'utils', 'section-persistence-coordinator.ts')),
  path.normalize(path.join(appRoot, 'shared', 'utils', 'section-reactive-sync-coordinator.ts')),
  path.normalize(path.join(appRoot, 'core', 'services', 'state', 'form-change.service.ts')),
  path.normalize(path.join(appRoot, 'core', 'services', 'formulario', 'formulario.service.ts')),
  // ✅ ReactiveStateAdapter es un puente autorizado para sincronizar con localStorage
  path.normalize(path.join(appRoot, 'core', 'services', 'state-adapters', 'reactive-state-adapter.service.ts')),
  // ✅ Componentes coordinadores de plantilla (nivel alto)
  path.normalize(path.join(appRoot, 'pages', 'plantilla', 'plantilla.component.ts')),
  path.normalize(path.join(appRoot, 'pages', 'plantilla', 'plantilla-view.component.ts')),
]);

const forbiddenMethods = [
  'actualizarDato',
  'actualizarDatos',
  'reemplazarDatos',
  'guardarJSON',
  'guardarFilasActivasTablaAISD2',
  'limpiarDatos',
  'guardarTablesTemporal',
  // Cargar mock también muta y persiste datos legacy
  'cargarMockCapitulo3',
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findFormularioServiceIdentifiers(content) {
  const ids = new Set();

  // Propiedades / params con modificador: private fs: FormularioService
  const withModifier = /\b(?:private|public|protected|readonly)\s+([A-Za-z_$][\w$]*)\s*:\s*FormularioService\b/g;
  let match;
  while ((match = withModifier.exec(content)) !== null) {
    ids.add(match[1]);
  }

  // Params sin modificador: constructor(fs: FormularioService)
  const simpleTyped = /\b([A-Za-z_$][\w$]*)\s*:\s*FormularioService\b/g;
  while ((match = simpleTyped.exec(content)) !== null) {
    const id = match[1];
    if (id !== 'FormularioService') ids.add(id);
  }

  // Asignación desde injector.get(FormularioService)
  const injectorGet = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*[^;\n]*\binjector\s*\.\s*get\s*\(\s*FormularioService\b/g;
  while ((match = injectorGet.exec(content)) !== null) {
    ids.add(match[1]);
  }

  return [...ids];
}

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
  const seen = new Set();

  for (const filePath of files) {
    const normalized = path.normalize(filePath);
    if (allowlist.has(normalized)) continue;

    const content = fs.readFileSync(filePath, 'utf8');

    const ids = findFormularioServiceIdentifiers(content);
    if (ids.length === 0) continue;

    for (const id of ids) {
      for (const method of forbiddenMethods) {
        const regex = new RegExp(`\\b${escapeRegExp(id)}\\s*\\.\\s*${method}\\s*\\(`, 'g');
        regex.lastIndex = 0;
        let match;
        while ((match = regex.exec(content)) !== null) {
          const loc = indexToLineCol(content, match.index);
          const key = `${filePath}:${loc.line}:${loc.col}:${id}.${method}`;
          if (seen.has(key)) continue;
          seen.add(key);
          violations.push({ filePath, label: `${id}.${method}`, line: loc.line, col: loc.col });
        }
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
