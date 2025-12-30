const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/pages/resumen/resumen.component.html');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  {
    pattern: /<h3\s+style="display:\s*flex;margin-bottom:\s*10px;margin-top:\s*10px;text-align:justify;"><span\s+style="margin-right:\s*20px;">A\.1\.(\d+)<\/span>([^<]+)<\/h3>/g,
    replacement: '<h5>A.1.$1 $2</h5>'
  },
  {
    pattern: /<h3\s+style="display:\s*flex;margin-bottom:\s*10px;margin-top:\s*10px;text-align:justify;"><span\s+style="margin-right:\s*20px;">B\.1\.(\d+)<\/span>([^<]+)<\/h3>/g,
    replacement: '<h5>B.1.$1 $2</h5>'
  },
  {
    pattern: /<p\s+style="text-align:justify;margin-bottom:\s*5px;">/g,
    replacement: '<p class="text-justify">'
  },
  {
    pattern: /<ul\s+style="padding-left:\s*20px;">/g,
    replacement: '<ul>'
  },
  {
    pattern: /<li\s+style="list-style:\s*disc;text-align:justify;margin-bottom:\s*5px;">/g,
    replacement: '<li class="list-item">'
  },
  {
    pattern: /<table\s+style="width:\s*100%;[^"]*">/g,
    replacement: '<table class="table-container">'
  },
  {
    pattern: /<p\s+class="titulo-centrado"\s+style="text-align:\s*center;font-weight:\s*700;">/g,
    replacement: '<p class="table-title">'
  }
];

replacements.forEach(({ pattern, replacement }) => {
  content = content.replace(pattern, replacement);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('HTML actualizado exitosamente');

