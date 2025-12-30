const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/pages/resumen/resumen.component.html');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  {
    pattern: /<td\s+style="background:\s*#e6e6e6;border:\s*solid\s+1px\s+black;text-align:\s*center;padding:\s*5px;">/g,
    replacement: '<td class="table-header table-cell-center">'
  },
  {
    pattern: /<td\s+style="border:\s*solid\s+1px\s+black;text-align:\s*center;padding:\s*5px;">/g,
    replacement: '<td class="table-cell table-cell-center">'
  },
  {
    pattern: /<td\s+style="border:\s*solid\s+1px\s+black;padding:\s*7px;">/g,
    replacement: '<td class="table-cell">'
  },
  {
    pattern: /<th\s+style="background:\s*#e6e6e6;padding:\s*7px\s+0px;border:\s*solid\s+1px\s+black;border-spacing:\s*0px">/g,
    replacement: '<th class="table-header">'
  },
  {
    pattern: /<th\s+style="background:\s*#e6e6e6;padding:\s*7px\s+0px;border:\s*solid\s+1px\s+black;border-spacing:\s*0px;">/g,
    replacement: '<th class="table-header">'
  },
  {
    pattern: /<th\s+style="background:\s*#e6e6e6;padding:\s*7px\s+0px;border:\s*solid\s+1px\s+black;border-spacing:\s*0px">/g,
    replacement: '<th class="table-header">'
  },
  {
    pattern: /<div\s+style="text-align:\s*center;">/g,
    replacement: '<div class="text-center">'
  }
];

replacements.forEach(({ pattern, replacement }) => {
  content = content.replace(pattern, replacement);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Tablas y estilos actualizados exitosamente');

