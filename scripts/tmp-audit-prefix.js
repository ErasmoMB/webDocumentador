const fs = require('fs');
const path = require('path');

const root = 'c:/Users/montu/Desktop/Documentador/webDocumentador/src/app/shared/components';

function extractDynamicBasesForm(txt){
  const bases = new Set();
  const regs = [
    /createAutoSyncField\(\s*`([^`$]*)\$\{[^`]*?(?:prefijo|Prefijo)[^`]*\}([^`]*)`/g,
    /setField\([^\n]*?,[^\n]*?,[^\n]*?,\s*`([^`$]*)\$\{[^`]*?(?:prefijo|Prefijo)[^`]*\}([^`]*)`/g,
    /setField\([^\n]*?,[^\n]*?,[^\n]*?,\s*`([^`$]*)\$\{[^`]*?(?:obtenerPrefijoGrupo)\([^`]*\)[^`]*\}([^`]*)`/g
  ];
  for (const re of regs){
    let m;
    while((m = re.exec(txt))){
      bases.add((m[1] || '') + (m[2] || ''));
    }
  }
  return [...bases];
}

function extractDynamicBasesView(txt){
  const dyn = new Set();
  const plain = new Set();
  const varMap = {};
  let m;

  const varRe = /const\s+(\w+)\s*=\s*`([^`$]*)\$\{[^`]*?(?:prefijo|Prefijo)[^`]*\}([^`]*)`/g;
  while((m = varRe.exec(txt))){
    varMap[m[1]] = (m[2] || '') + (m[3] || '');
    dyn.add(varMap[m[1]]);
  }

  const selectDyn = /selectField\([^\n]*?,[^\n]*?,[^\n]*?,\s*`([^`$]*)\$\{[^`]*?(?:prefijo|Prefijo)[^`]*\}([^`]*)`\s*\)/g;
  while((m = selectDyn.exec(txt))){ dyn.add((m[1] || '') + (m[2] || '')); }

  const idxDyn = /\[\s*`([^`$]*)\$\{[^`]*?(?:prefijo|Prefijo)[^`]*\}([^`]*)`\s*\]/g;
  while((m = idxDyn.exec(txt))){ dyn.add((m[1] || '') + (m[2] || '')); }

  const selectVar = /selectField\([^\n]*?,[^\n]*?,[^\n]*?,\s*(\w+)\s*\)/g;
  while((m = selectVar.exec(txt))){ if (varMap[m[1]]) dyn.add(varMap[m[1]]); }

  const idxVar = /\[\s*(\w+)\s*\]/g;
  while((m = idxVar.exec(txt))){ if (varMap[m[1]]) dyn.add(varMap[m[1]]); }

  const plainSel = /selectField\([^\n]*?,[^\n]*?,[^\n]*?,\s*'([^']+)'\s*\)/g;
  while((m = plainSel.exec(txt))){ plain.add(m[1]); }

  const plainIdx = /\[\s*'([^']+)'\s*\]/g;
  while((m = plainIdx.exec(txt))){ plain.add(m[1]); }

  return { dyn: [...dyn], plain: [...plain] };
}

for (let s = 5; s <= 30; s++){
  const dir = path.join(root, 'seccion' + s);
  const form = path.join(dir, `seccion${s}-form.component.ts`);
  const view = path.join(dir, `seccion${s}-view.component.ts`);

  if (!fs.existsSync(form) || !fs.existsSync(view)){
    console.log(`SECCION ${s} MISSING`);
    continue;
  }

  const formTxt = fs.readFileSync(form, 'utf8');
  const viewTxt = fs.readFileSync(view, 'utf8');
  const w = extractDynamicBasesForm(formTxt);
  const r = extractDynamicBasesView(viewTxt);

  const issues = [];
  for (const b of w){
    const hasDyn = r.dyn.includes(b);
    const hasPlain = r.plain.includes(b);
    if (!hasDyn && hasPlain) issues.push(`PREF_ONLY_PLAIN_READ:${b}`);
    else if (!hasDyn && !hasPlain) issues.push(`NO_READ_MATCH:${b}`);
  }

  console.log(`SECCION ${s}`);
  console.log(`FORM_DYN=${w.sort().join('|')}`);
  console.log(`VIEW_DYN=${r.dyn.sort().join('|')}`);
  console.log(`ISSUES=${issues.join('|')}`);
}
