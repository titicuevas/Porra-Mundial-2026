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

const index = read('index.html');

// 1. Sin duplicado HTML
if (exists('porra-mundial-2026.html')) {
  fail('Elimina porra-mundial-2026.html — solo debe existir index.html');
} else {
  pass('Un solo HTML de entrada (index.html)');
}

// 2. Sin CSS/JS embebido en el HTML
if (index.includes('<style>')) fail('index.html tiene <style> embebido');
else pass('CSS externo (sin <style> en HTML)');
if (/<script>\s*(\/\/|const|let|function)/.test(index)) {
  fail('index.html tiene bloques <script> con lógica embebida');
} else pass('JS principal en ficheros externos');

// 3. Assets estáticos
const assets = [
  'css/app.css',
  'js/version.js',
  'js/schedule.js',
  'js/groups-data.js',
  'js/groups-app.js',
  'js/annex-c-data.js',
  'js/team-fifa-meta.js',
  'js/knockout.js'
];
assets.forEach((file) => {
  if (exists(file)) pass(`Existe ${file}`);
  else fail(`Falta ${file}`);
});

if (exists('js/fifa-ko-schedule.js')) {
  fail('js/fifa-ko-schedule.js obsoleto — usa js/schedule.js');
}

// 4. Versión unificada (version.js → ?v= en HTML)
const vMatches = [...index.matchAll(/\?v=(\d+)/g)].map(m => m[1]);
const uniqueV = [...new Set(vMatches)];
const build = read('js/version.js').match(/PORRA_BUILD\s*=\s*['"](\d+)['"]/);
if (uniqueV.length === 1) pass(`Versión de assets unificada (?v=${uniqueV[0]})`);
else fail(`Versiones ?v= distintas en HTML: ${uniqueV.join(', ')}`);

if (build && build[1] === uniqueV[0]) {
  pass(`PORRA_BUILD coincide con ?v=${uniqueV[0]}`);
} else {
  fail(`PORRA_BUILD (${build?.[1] || '?'}) no coincide con ?v=${uniqueV[0] || '?'} — ejecuta node scripts/sync-version.js`);
}

try {
  const manifest = JSON.parse(read('manifest.json'));
  if (manifest.start_url === `/?v=${uniqueV[0]}`) {
    pass('manifest.json start_url sincronizado');
  } else {
    fail(`manifest start_url (${manifest.start_url}) no coincide — ejecuta node scripts/sync-version.js`);
  }
} catch (e) {
  fail(`manifest.json: ${e.message}`);
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

// 5b. Cuadro eliminatorias alineado con FIFA (P73–P96)
(function verifyFifaBracket() {
  const sched = read('js/schedule.js');
  const r32Block = sched.match(/const R32_META = \[([\s\S]*?)\];/);
  const feedersBlock = sched.match(/const R16_FEEDERS = (\[[\s\S]*?\]);/);
  const tplBlock = ko.match(/const KO_R32_SLOT_TEMPLATES = (\[[\s\S]*?\]);/);
  if (!r32Block || !feedersBlock || !tplBlock) {
    fail('No se pudo leer cuadro FIFA (R32_META / R16_FEEDERS / KO_R32_SLOT_TEMPLATES)');
    return;
  }
  const fifaNos = [...r32Block[1].matchAll(/fifaNo: (\d+)/g)].map(m => Number(m[1]));
  const feeders = eval(feedersBlock[1]);
  const templates = eval(tplBlock[1]);
  const fifaR16 = {
    89: [74, 77], 90: [73, 75], 91: [76, 78], 92: [79, 80],
    93: [83, 84], 94: [81, 82], 95: [86, 88], 96: [85, 87]
  };
  const fifaR32 = {
    73: '2A-2B', 74: '1E-3P', 75: '1F-2C', 76: '1C-2F', 77: '1I-3P', 78: '2E-2I',
    79: '1A-3P', 80: '1L-3P', 81: '1D-3P', 82: '1G-3P', 83: '2K-2L', 84: '1H-2J',
    85: '1B-3P', 86: '1J-2H', 87: '1K-3P', 88: '2D-2G'
  };
  let bracketOk = true;
  feeders.forEach((pair, i) => {
    const m = 89 + i;
    const a = fifaNos[pair[0]];
    const b = fifaNos[pair[1]];
    const exp = fifaR16[m];
    if (!exp || a !== exp[0] || b !== exp[1]) bracketOk = false;
  });
  fifaNos.forEach((no, idx) => {
    const t = templates[idx];
    const slot = t.home + (t.away === '3P' ? '-3P' : '-' + t.away);
    if (fifaR32[no] !== slot) bracketOk = false;
  });
  if (bracketOk) pass('Cuadro KO (dieciseisavos + octavos) coincide con FIFA P73–P96');
  else fail('Cuadro KO desalineado respecto a FIFA — revisa js/schedule.js y knockout.js');

  const r8Block = sched.match(/const R8_FEEDERS = (\[[\s\S]*?\]);/);
  const r4Block = sched.match(/const R4_FEEDERS = (\[[\s\S]*?\]);/);
  if (r8Block && r4Block) {
    const r8Feeders = eval(r8Block[1]);
    const r4Feeders = eval(r4Block[1]);
    const fifaR8 = { 97: [0, 1], 98: [4, 5], 99: [2, 3], 100: [6, 7] };
    const fifaR4 = { 101: [0, 1], 102: [2, 3] };
    let r8Ok = true;
    let r4Ok = true;
    r8Feeders.forEach((pair, i) => {
      const m = 97 + i;
      const exp = fifaR8[m];
      if (!exp || pair[0] !== exp[0] || pair[1] !== exp[1]) r8Ok = false;
    });
    r4Feeders.forEach((pair, i) => {
      const m = 101 + i;
      const exp = fifaR4[m];
      if (!exp || pair[0] !== exp[0] || pair[1] !== exp[1]) r4Ok = false;
    });
    if (r8Ok) pass('Cuartos KO8-1…4 alineados con FIFA P97–P100 (lados del cuadro)');
    else fail('Cuartos desalineados — R8_FEEDERS debe ser [[0,1],[4,5],[2,3],[6,7]]');
    if (r4Ok) pass('Semifinales KO4-1…2 alineadas con FIFA P101–P102');
    else fail('Semifinales desalineadas — R4_FEEDERS debe ser [[0,1],[2,3]]');
  }
})();

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
