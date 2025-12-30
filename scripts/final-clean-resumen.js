const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/pages/resumen/resumen.component.html');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  {
    pattern: /<th\s+style="background:\s*#e6e6e6;padding:\s*7px\s+0px;border:\s*solid\s+1px\s+black;border-spacing:\s*0px;border-left:\s*none;border-right:\s*none;">/g,
    replacement: '<th class="table-header">'
  },
  {
    pattern: /<td\s+style="text-align:\s*center;border:\s*solid\s+1px\s+black;">/g,
    replacement: '<td class="table-cell table-cell-center">'
  },
  {
    pattern: /<th\s+style="background:\s*#e6e6e6;padding:\s*7px\s+0px;border:\s*solid\s+1px\s+black;border-spacing:\s*0px;">/g,
    replacement: '<th class="table-header">'
  }
];

replacements.forEach(({ pattern, replacement }) => {
  content = content.replace(pattern, replacement);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Limpieza final completada');

