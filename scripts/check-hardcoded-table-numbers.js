#!/usr/bin/env node

/**
 * SCRIPT: check-hardcoded-table-numbers.js
 * 
 * Detección de números de cuadros hardcodeados en templates
 * 
 * ❌ PROHIBIDO:
 *   - Cuadro N° 3.1
 *   - Cuadro Nº 5
 *   - Cuadro 3.10
 *   - "Cuadro": [0-9]+ (seguido de número)
 * 
 * ✅ PERMITIDO:
 *   - Cuadro {{ tableNumber }}
 *   - Cuadro N° {{ obtenerNumeroCuadro() }}
 *   - app-table-wrapper (automático)
 * 
 * Ejecución: npm run check:hardcoded-captions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patrones a detectar
const HARDCODED_PATTERNS = [
  {
    regex: /(?<!label=")[>\s]Cuadro\s+N°?\s+3\.\d+(?!["\w])/gi,
    name: 'Cuadro N° [número específico]',
    description: 'Cuadro con número global hardcodeado (ej: Cuadro N° 3.15)'
  },
  {
    regex: />Cuadro\s+Nº?\s+3\.\d+</gi,
    name: 'Cuadro Nº [número específico]',
    description: 'Cuadro con número global hardcodeado usando Nº'
  },
  {
    regex: /<p[^>]*>Cuadro\s+\d{1,2}[\s.:</]/gi,
    name: 'Cuadro [número local]',
    description: 'Cuadro con número local hardcodeado (ej: <p>Cuadro 1</p>)'
  },
  {
    regex: /<strong>Cuadro\s+N°\s+3\.\d+<\/strong>/gi,
    name: 'Cuadro entre strong tags',
    description: 'Cuadro hardcodeado en strong (ej: <strong>Cuadro N° 3.5</strong>)'
  }
];

// Excepciones: rutas y contenido que se permite
const ALLOWED_PATTERNS = [
  /Cuadro\s+\{\{/g,                      // Cuadro {{ ... }}
  /Cuadro.*N°.*\$\{/g,                   // Cuadro N° ${ ... }
  /obtenerNumeroCuadro/g,                // Función dinámica
  /getGlobalTableNumber/g,               // Servicio
  /tableNumber/g,                        // Signal/variable
  /\[sectionId\]/g,                      // Variable de referencia
  /docstring/g,                          // Comentario de documentación
  /Análisis Cuadro/g,                    // Análisis (sin número específico) - es solo etiqueta
  /comment-with-number/g,                // Marcador de CSV de auditoría
  /label=/g,                             // Atributo de label en templates (metadatos, no display)
  /placeholder=/g,                       // Placeholder text
];

// Archivos a excluir
const EXCLUDED_PATHS = [
  'node_modules',
  'dist',
  'coverage',
  'out-tsc',
  '.git',
  'angular.json',
  'package.json',
  'tsconfig.json',
  'docs/audits/table-numbering-audit.csv',    // CSV de auditoría histórica
  'docs/MODO_IDEAL_PERFECTO_ARQUITECTURA_100.md',  // Documentación antigua
  'README.md'
];

function isExcluded(filePath) {
  return EXCLUDED_PATHS.some(excluded => filePath.includes(excluded));
}

function isAllowed(matchedText) {
  return ALLOWED_PATTERNS.some(pattern => pattern.test(matchedText));
}

function getTemplateFiles() {
  try {
    const output = execSync('git ls-files "*.html" "*.ts"', { encoding: 'utf8' });
    return output.split('\n').filter(f => f.trim() && f.endsWith('.html'));
  } catch (error) {
    // Fallback: buscar manualmente
    return findHTMLFiles(path.join(__dirname, '..', 'src'));
  }
}

function findHTMLFiles(dir) {
  let files = [];
  try {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      if (isExcluded(fullPath)) return;
      
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        files = files.concat(findHTMLFiles(fullPath));
      } else if (item.endsWith('.html')) {
        files.push(fullPath);
      }
    });
  } catch (error) {
    // Ignorar errores de permisos
  }
  return files;
}

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const violations = [];

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];

      for (const pattern of HARDCODED_PATTERNS) {
        let match;
        while ((match = pattern.regex.exec(line)) !== null) {
          const matchedText = match[0];

          // Verificar si está permitido
          if (isAllowed(matchedText)) {
            continue;
          }

          violations.push({
            file: filePath,
            line: lineNum + 1,
            column: match.index + 1,
            message: `${pattern.name}: ${pattern.description}`,
            text: matchedText,
            lineContent: line.trim()
          });
        }
      }
    }

    return violations;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return [];
  }
}

function formatViolations(violations) {
  if (violations.length === 0) {
    return '\n✅ SIN HARDCODEADOS DETECTADOS\n';
  }

  let output = `\n❌ SE DETECTARON ${violations.length} VIOLACIÓN(ES):\n\n`;

  const grouped = violations.reduce((acc, v) => {
    const key = v.file;
    if (!acc[key]) acc[key] = [];
    acc[key].push(v);
    return acc;
  }, {});

  for (const [file, violsInFile] of Object.entries(grouped)) {
    output += `📄 ${file}\n`;
    violsInFile.forEach(v => {
      output += `   Línea ${v.line}:${v.column}\n`;
      output += `   ⚠️  ${v.message}\n`;
      output += `   ❌ Encontrado: "${v.text}"\n`;
      output += `   📝 Contexto: ${v.lineContent}\n\n`;
    });
  }

  output += '\n🔧 SOLUCIÓN:\n';
  output += '   - Reemplazar números hardcodeados con {{ tableNumber }} o getGlobalTableNumber(sectionId, index)\n';
  output += '   - Envolver las tablas en <app-table-wrapper [sectionId]="..."></app-table-wrapper>\n';
  output += '   - Usar funciones como obtenerNumeroCuadro() que llamen al servicio\n\n';

  return output;
}

function main() {
  console.log('🔍 Buscando números de cuadros hardcodeados...\n');

  const templateFiles = getTemplateFiles();
  let allViolations = [];

  console.log(`📂 Analizando ${templateFiles.length} archivos HTML...\n`);

  for (const file of templateFiles) {
    if (isExcluded(file)) continue;
    const violations = checkFile(file);
    allViolations = allViolations.concat(violations);
  }

  const output = formatViolations(allViolations);
  console.log(output);

  if (allViolations.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main();
