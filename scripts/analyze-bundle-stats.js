/* eslint-disable no-console */

const fs = require('node:fs');
const path = require('node:path');

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return String(bytes);
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

function readInitialAssets(distDir) {
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) return new Set();
  const html = fs.readFileSync(indexPath, 'utf8');
  const assets = new Set();

  const regex = /(src|href)="([^"]+)"/g;
  let match;
  while ((match = regex.exec(html))) {
    const url = match[2];
    if (!url) continue;
    const normalized = url.replace(/^\//, '');
    if (
      normalized.endsWith('.js') ||
      normalized.endsWith('.css') ||
      normalized.endsWith('.woff2') ||
      normalized.endsWith('.woff')
    ) {
      assets.add(path.basename(normalized));
    }
  }

  return assets;
}

function summarizeOutputs(stats, distDir) {
  const outputs = stats.outputs && typeof stats.outputs === 'object' ? stats.outputs : {};
  const initialAssets = readInitialAssets(distDir);

  const list = Object.entries(outputs)
    .filter(([, o]) => o && Number.isFinite(o.bytes))
    .map(([fileName, o]) => ({
      fileName,
      bytes: o.bytes,
      entryPoint: o.entryPoint || null,
      isInitial: initialAssets.has(path.basename(fileName)),
      inputs: o.inputs || {},
    }));

  list.sort((a, b) => b.bytes - a.bytes);
  const sum = (arr) => arr.reduce((acc, v) => acc + (v.bytes || 0), 0);

  const initial = list.filter((o) => o.isInitial);
  const lazy = list.filter((o) => !o.isInitial);

  console.log('=== Bundle summary (Angular application builder stats.json) ===');
  console.log(`dist:  ${distDir}`);
  console.log(`initial outputs: ${initial.length} -> ${formatBytes(sum(initial))}`);
  console.log(`lazy outputs:    ${lazy.length} -> ${formatBytes(sum(lazy))}`);

  const topN = 12;
  console.log(`\nTop ${topN} outputs by size:`);
  for (const o of list.slice(0, topN)) {
    const label = o.isInitial ? 'initial' : 'lazy';
    const ep = o.entryPoint ? ` | entry: ${o.entryPoint}` : '';
    console.log(`- ${o.fileName} (${label}): ${formatBytes(o.bytes)}${ep}`);
  }

  // For the biggest lazy outputs, show top contributing inputs
  const biggestLazy = lazy.slice(0, 5);
  if (biggestLazy.length) {
    console.log('\nTop inputs for biggest lazy outputs:');
    for (const o of biggestLazy) {
      const inputs = Object.entries(o.inputs)
        .map(([p, v]) => ({ path: p, bytesInOutput: v && v.bytesInOutput ? v.bytesInOutput : 0 }))
        .sort((a, b) => b.bytesInOutput - a.bytesInOutput)
        .slice(0, 8);

      console.log(`\n- ${o.fileName}: ${formatBytes(o.bytes)}${o.entryPoint ? ` (entry: ${o.entryPoint})` : ''}`);
      for (const i of inputs) {
        console.log(`  - ${i.path}: ${formatBytes(i.bytesInOutput)}`);
      }
    }
  }
}

function main() {
  const statsPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.resolve(__dirname, '../dist/lbs/stats.json');
  const distDir = path.dirname(statsPath);

  if (!fs.existsSync(statsPath)) {
    console.error(`[bundle] No existe stats.json en: ${statsPath}`);
    console.error('Generalo con: npm run build:prod -- --stats-json');
    process.exit(1);
  }

  const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
  summarizeOutputs(stats, distDir);
}

main();
