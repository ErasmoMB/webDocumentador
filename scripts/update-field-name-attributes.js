const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../src/app/shared/components');

function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.component.html')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function extractFieldName(bindingText) {
  if (!bindingText) return null;
  
  const patterns = [
    /datos\.(\w+)/,
    /item\.(\w+)/,
  ];
  
  for (const pattern of patterns) {
    const match = bindingText.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

function extractFieldNameFromPipe(pipeExpression) {
  const match = pipeExpression.match(/'([^']+)'\s*\|\s*dataSource/);
  return match ? match[1] : null;
}

function updateTemplate(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const lines = content.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    if (line.includes('[appDataSource]') && !line.includes('[fieldName]')) {
      const appDataSourceMatch = line.match(/\[appDataSource\]="([^"]+)"/);
      
      if (appDataSourceMatch) {
        const appDataSourceValue = appDataSourceMatch[1];
        let fieldName = null;
        
        if (appDataSourceValue.includes('| dataSource')) {
          fieldName = extractFieldNameFromPipe(appDataSourceValue);
        }
        
        if (!fieldName) {
          const sameLineField = extractFieldName(line);
          if (sameLineField) {
            fieldName = sameLineField;
          } else {
            const maxSearchLines = 2;
            for (let j = 1; j <= maxSearchLines && i + j < lines.length; j++) {
              const nextLine = lines[i + j];
              const extracted = extractFieldName(nextLine);
              if (extracted) {
                fieldName = extracted;
                break;
              }
            }
          }
        }
        
        if (fieldName) {
          line = line.replace(
            /(\[appDataSource\]="[^"]+")/,
            `$1 [fieldName]="'${fieldName}'"`
          );
          modified = true;
        }
      }
    }
    
    newLines.push(line);
  }
  
  if (modified) {
    const newContent = newLines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ Updated: ${path.relative(componentsDir, filePath)}`);
    return true;
  }
  
  return false;
}

function processAllTemplates() {
  try {
    const htmlFiles = getAllHtmlFiles(componentsDir);
    
    console.log(`Found ${htmlFiles.length} template files\n`);
    
    let updatedCount = 0;
    
    for (const filePath of htmlFiles) {
      if (updateTemplate(filePath)) {
        updatedCount++;
      }
    }
    
    console.log(`\n✓ Updated ${updatedCount} out of ${htmlFiles.length} files`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  processAllTemplates();
}

module.exports = { updateTemplate, processAllTemplates };
