#!/usr/bin/env node
/**
 * Comprueba que el proyecto está listo para desplegar.
 * Uso: node scripts/verify.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
let ok = true;

function fail(msg) {
  console.error('✗', msg);
  ok = false;
}

function pass(msg) {
  console.log('✓', msg);
}

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

// 1. HTML sincronizados
const index = read('index.html');
const porra = read('porra-mundial-2026.html');
if (index === porra) {
  pass('index.html y porra-mundial-2026.html están sincronizados');
} else {
  fail('index.html y porra-mundial-2026.html NO coinciden — ejecuta sync-html.bat');
}

// 2. Misma versión de knockout.js en ambos HTML
const vIndex = index.match(/knockout\.js\?v=(\d+)/);
const vPorra = porra.match(/knockout\.js\?v=(\d+)/);
if (vIndex && vPorra && vIndex[1] === vPorra[1]) {
  pass(`knockout.js?v=${vIndex[1]} en ambos HTML`);
} else {
  fail('Versión de knockout.js distinta entre index.html y porra-mundial-2026.html');
}

// 3. knockout.js — funciones críticas
const ko = read('knockout.js');
const requiredFns = [
  'koPdfFinalistsForDisplay',
  'exportKnockoutPDF',
  'getKnockoutExportBlockers',
  'clearKnockoutMatches'
];
requiredFns.forEach((fn) => {
  if (ko.includes(`function ${fn}`) || ko.includes(`${fn} =`)) {
    pass(`knockout.js incluye ${fn}`);
  } else {
    fail(`knockout.js falta ${fn}`);
  }
});

// 4. JSON válidos
['results.json', 'leaderboard.json', 'manifest.json'].forEach((file) => {
  try {
    JSON.parse(read(file));
    pass(`${file} es JSON válido`);
  } catch (e) {
    fail(`${file} no es JSON válido: ${e.message}`);
  }
});

// 5. Assets referenciados
['assets/wc2026-logo.png', 'assets/wc-trophy.svg'].forEach((file) => {
  if (fs.existsSync(path.join(root, file))) {
    pass(`Existe ${file}`);
  } else {
    fail(`Falta ${file}`);
  }
});

if (!ok) {
  console.error('\nVerificación fallida. Corrige los puntos anteriores antes de desplegar.');
  process.exit(1);
}
console.log('\nTodo OK — listo para commit y push a Vercel.');
