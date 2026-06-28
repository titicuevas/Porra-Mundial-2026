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

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

// 1. HTML sincronizados
const index = read('index.html');
const porra = read('porra-mundial-2026.html');
if (index === porra) {
  pass('index.html y porra-mundial-2026.html están sincronizados');
} else {
  fail('index.html y porra-mundial-2026.html NO coinciden — ejecuta sync-html.bat');
}

// 2. Sin CSS/JS embebido en el HTML (estructura modular)
if (porra.includes('<style>')) fail('porra-mundial-2026.html aún tiene <style> embebido');
else pass('CSS externo (sin <style> en HTML)');
if (/<script>\s*(\/\/|const|let|function)/.test(porra)) {
  fail('porra-mundial-2026.html tiene bloques <script> con lógica embebida');
} else pass('JS principal en ficheros externos');

// 3. Assets estáticos
const assets = [
  'css/app.css',
  'js/groups-data.js',
  'js/groups-app.js',
  'js/annex-c-data.js',
  'js/team-fifa-meta.js',
  'js/fifa-ko-schedule.js',
  'js/knockout.js'
];
assets.forEach((file) => {
  if (exists(file)) pass(`Existe ${file}`);
  else fail(`Falta ${file}`);
});

// 4. Misma versión ?v= en HTML y APP_BUILD
const vMatches = [...porra.matchAll(/\?v=(\d+)/g)].map(m => m[1]);
const uniqueV = [...new Set(vMatches)];
if (uniqueV.length === 1) pass(`Versión de assets unificada (?v=${uniqueV[0]})`);
else fail(`Versiones ?v= distintas en HTML: ${uniqueV.join(', ')}`);

const appBuild = read('js/groups-app.js').match(/const APP_BUILD = '(\d+)'/);
if (appBuild && appBuild[1] === uniqueV[0]) {
  pass(`APP_BUILD coincide con ?v=${uniqueV[0]}`);
} else {
  fail(`APP_BUILD (${appBuild?.[1] || '?'}) no coincide con ?v=${uniqueV[0] || '?'}`);
}

// 5. knockout.js — funciones críticas
const ko = read('js/knockout.js');
const requiredFns = [
  'koPdfFinalistsForDisplay',
  'exportKnockoutPDF',
  'getKnockoutExportBlockers',
  'clearKnockoutMatches'
];
requiredFns.forEach((fn) => {
  if (ko.includes(`function ${fn}`) || ko.includes(`${fn} =`)) {
    pass(`js/knockout.js incluye ${fn}`);
  } else {
    fail(`js/knockout.js falta ${fn}`);
  }
});

// 6. JSON válidos
['results.json', 'leaderboard.json', 'manifest.json'].forEach((file) => {
  try {
    JSON.parse(read(file));
    pass(`${file} es JSON válido`);
  } catch (e) {
    fail(`${file} no es JSON válido: ${e.message}`);
  }
});

// 7. Assets referenciados
['assets/wc2026-logo.png', 'assets/wc-trophy.svg'].forEach((file) => {
  if (exists(file)) pass(`Existe ${file}`);
  else fail(`Falta ${file}`);
});

if (!ok) {
  console.error('\nVerificación fallida. Corrige los puntos anteriores antes de desplegar.');
  process.exit(1);
}
console.log('\nTodo listo para desplegar.');
