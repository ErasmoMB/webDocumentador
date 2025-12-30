const fs = require('fs');
const path = require('path');

const featuresPath = path.join(__dirname, '../src/app/features');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const patterns = [
    {
      from: /<div style="display: flex; gap: 20px;">\s*<button class="atras"/g,
      to: '<div class="navigation-buttons">\n            <button class="btn btn--tertiary"'
    },
    {
      from: /<div style="display: flex; gap: 20px;">\s*<button class="siguiente"/g,
      to: '<div class="navigation-buttons">\n            <button class="btn btn--primary"'
    },
    {
      from: /<button class="atras"([^>]*)>([^<]*)<\/button>\s*<button class="siguiente"/g,
      to: '<button class="btn btn--tertiary$1>$2</button>\n            <button class="btn btn--primary"'
    },
    {
      from: /<button class="siguiente"([^>]*)>([^<]*)<\/button>\s*<\/div>/g,
      to: '<button class="btn btn--primary"$1>$2</button>\n        </div>'
    },
    {
      from: /<button class="resumen"([^>]*)>([^<]*)<\/button>/g,
      to: '<button class="btn btn--secondary"$1>$2</button>'
    }
  ];

  patterns.forEach(pattern => {
    if (pattern.from.test(content)) {
      content = content.replace(pattern.from, pattern.to);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
    return true;
  }
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let updated = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      updated += walkDir(filePath);
    } else if (file.endsWith('.component.html')) {
      if (updateFile(filePath)) {
        updated++;
      }
    }
  });

  return updated;
}

console.log('Updating button classes...');
const updated = walkDir(featuresPath);
console.log(`Updated ${updated} files.`);

