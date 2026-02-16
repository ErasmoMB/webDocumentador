/*
 * Fase 0 guardrail (SSOT): evita introducir NUEVOS usos de ProjectStateFacade.obtenerDatos().
 *
 * Motivación: obtenerDatos() aplana el estado a un objeto legacy y alimenta "datos" mutables.
 * La Fase 0 congela este patrón: no se debe reintroducir en nuevas secciones/cambios.
 *
 * En vez de fallar por todos los usos existentes (migración gradual), este script compara
 * las ocurrencias actuales contra un baseline versionado.
 *
 * Uso:
 *   - Verificar: node scripts/check-no-new-obtenerDatos.js
 *   - Regenerar baseline (cuando se acepte conscientemente): node scripts/check-no-new-obtenerDatos.js --write-baseline
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const workspaceRoot = path.resolve(__dirname, '..');
const baselinePath = path.join(workspaceRoot, 'scripts', 'baselines', 'project-facade-obtenerDatos.json');

const excludedDirs = new Set(['node_modules', 'dist', 'coverage', 'out-tsc', '.git']);

function indexToLineCol(text, index) {
  const slice = text.slice(0, index);
  const lines = slice.split(/\r\n|\n|\r/);
  const line = lines.length;
  const col = lines[lines.length - 1].length + 1;
  return { line, col };
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function walkDir(dirPath, acc) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (excludedDirs.has(entry.name)) continue;
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

function getTrackedTsFiles() {
  try {
    const output = execSync('git ls-files "*.ts"', { cwd: workspaceRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const files = output
      .split(/\r?\n/)
      .map((f) => f.trim())
      .filter(Boolean)
      .filter((f) => !f.endsWith('.spec.ts'))
      .filter((f) => !f.split('/').some((part) => excludedDirs.has(part)));
    return files.map((f) => path.join(workspaceRoot, f.split('/').join(path.sep)));
  } catch {
    // Fallback si git no está disponible
    return walkDir(path.join(workspaceRoot, 'src'), []);
  }
}

function findOccurrences() {
  const files = getTrackedTsFiles();
  const occurrences = [];

  // Captura usos típicos: this.projectFacade.obtenerDatos(), projectFacade.obtenerDatos(), projectStateFacade.obtenerDatos()
  const regex = /\b(projectFacade|projectStateFacade)\s*\.\s*obtenerDatos\s*\(/g;

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const loc = indexToLineCol(content, match.index);
      const rel = path.relative(workspaceRoot, filePath).split(path.sep).join('/');
      occurrences.push({ key: `${rel}:${loc.line}:${loc.col}`, rel, line: loc.line, col: loc.col });
    }
  }

  // Orden estable
  occurrences.sort((a, b) => a.key.localeCompare(b.key));
  return occurrences;
}

function loadBaseline() {
  if (!fs.existsSync(baselinePath)) return null;
  const raw = fs.readFileSync(baselinePath, 'utf8');
  const arr = JSON.parse(raw);
  if (!Array.isArray(arr)) throw new Error('Baseline inválido: se esperaba un array JSON');
  return new Set(arr);
}

function writeBaseline(keys) {
  ensureDir(path.dirname(baselinePath));
  fs.writeFileSync(baselinePath, JSON.stringify(keys, null, 2) + '\n', 'utf8');
}

function main() {
  const write = process.argv.includes('--write-baseline');
  const occurrences = findOccurrences();
  const keys = occurrences.map((o) => o.key);

  if (write) {
    writeBaseline(keys);
    console.log(`[check-no-new-obtenerDatos] Baseline escrito: ${path.relative(workspaceRoot, baselinePath).split(path.sep).join('/')}`);
    console.log(`[check-no-new-obtenerDatos] Total ocurrencias registradas: ${keys.length}`);
    process.exit(0);
  }

  const baseline = loadBaseline();
  if (!baseline) {
    console.error('[check-no-new-obtenerDatos] No existe baseline.');
    console.error('Crea uno (una vez) con: node scripts/check-no-new-obtenerDatos.js --write-baseline');
    process.exit(1);
  }

  const nuevos = occurrences.filter((o) => !baseline.has(o.key));
  if (nuevos.length > 0) {
    console.error('\n[check-no-new-obtenerDatos] Se detectaron NUEVOS usos prohibidos de projectFacade.obtenerDatos():\n');
    for (const o of nuevos) {
      console.error(`- ${o.rel}:${o.line}:${o.col}`);
    }
    console.error(
      '\nRegla Fase 0 (SSOT): no uses obtenerDatos() para UI. ' +
        'Lee via selectors/signals del store y escribe via Commands/dispatch.\n'
    );
    process.exit(2);
  }

  console.log(`[check-no-new-obtenerDatos] OK: 0 nuevos usos (baseline: ${baseline.size}, encontrados: ${keys.length}).`);
}

main();
