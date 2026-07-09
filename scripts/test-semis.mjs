#!/usr/bin/env node
/**
 * Comprueba cruces de semifinales (P101–P102) vs cuartos y resultados.
 * Uso: node scripts/test-semis.mjs
 * Con Playwright (preview + pronósticos): desde /tmp/porra-pdf-test con servidor local.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.PORRA_ROOT || path.join(__dirname, '..');
const USER = 'Manolín';

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function loadSched() {
  const src = read('js/schedule.js');
  const r8 = eval(src.match(/const R8_FEEDERS = (\[[\s\S]*?\]);/)[1]);
  const r4 = eval(src.match(/const R4_FEEDERS = (\[[\s\S]*?\]);/)[1]);
  const r8Meta = eval(src.match(/const R8_META = (\[[\s\S]*?\]);/)[1]);
  const r4Meta = eval(src.match(/const R4_META = (\[[\s\S]*?\]);/)[1]);
  return { r8, r4, r8Meta, r4Meta };
}

function koWinner(results, matchId, teams) {
  const r = results[matchId];
  if (!r || r.home === '' || r.home == null) return null;
  const h = parseInt(r.home, 10);
  const a = parseInt(r.away, 10);
  if (isNaN(h) || isNaN(a)) return r.winner && r.winner !== 'tbd' ? r.winner : null;
  if (r.winner && r.winner !== 'tbd') return r.winner;
  if (h > a) return teams.home;
  if (a > h) return teams.away;
  return null;
}

function buildExpectedSemis(results) {
  const fx = results._fixtures || {};
  const { r8, r4 } = loadSched();
  const ko8 = r8.map((_, i) => {
    const id = 'KO8-' + (i + 1);
    const teams = fx[id] || {};
    return { id, teams, winner: koWinner(results, id, teams) };
  });
  const ko4 = r4.map((feeders, i) => {
    const id = 'KO4-' + (i + 1);
    const fix = fx[id];
    const fromQ = {
      home: ko8[feeders[0]].winner,
      away: ko8[feeders[1]].winner
    };
    return {
      id,
      fifaNo: 101 + i,
      feeders: ['KO8-' + (feeders[0] + 1), 'KO8-' + (feeders[1] + 1)],
      expected: fromQ,
      fixture: fix || null,
      ko8: [ko8[feeders[0]], ko8[feeders[1]]]
    };
  });
  return { ko8, ko4 };
}

function runStaticChecks() {
  let ok = true;
  const fail = (msg) => { console.error('✗', msg); ok = false; };
  const pass = (msg) => console.log('✓', msg);

  const results = JSON.parse(read('results.json'));
  const { r8, r4, r8Meta, r4Meta } = loadSched();
  const { ko8, ko4 } = buildExpectedSemis(results);

  // Feeders FIFA
  const fifaR8 = { 97: [0, 1], 98: [4, 5], 99: [2, 3], 100: [6, 7] };
  const fifaR4 = { 101: [0, 1], 102: [2, 3] };
  r8.forEach((pair, i) => {
    const m = 97 + i;
    const exp = fifaR8[m];
    if (!exp || pair[0] !== exp[0] || pair[1] !== exp[1]) {
      fail(`R8_FEEDERS[${i}] no coincide con FIFA P${m}`);
    }
  });
  r4.forEach((pair, i) => {
    const m = 101 + i;
    const exp = fifaR4[m];
    if (!exp || pair[0] !== exp[0] || pair[1] !== exp[1]) {
      fail(`R4_FEEDERS[${i}] no coincide con FIFA P${m}`);
    }
  });
  if (ok) pass('R4_FEEDERS alineado con FIFA P101–P102');

  // Fixtures cuartos
  const expectedKo8 = [
    ['fr', 'ma'], ['es', 'be'], ['no', 'gb-eng'], ['ar', 'ch']
  ];
  expectedKo8.forEach((pair, i) => {
    const id = 'KO8-' + (i + 1);
    const fx = results._fixtures?.[id];
    if (!fx || fx.home !== pair[0] || fx.away !== pair[1]) {
      fail(`${id} fixture esperado ${pair.join(' vs ')}, tiene ${fx ? fx.home + ' vs ' + fx.away : 'nada'}`);
    }
  });
  if (ok) pass('Fixtures KO8-1…4 correctos en results.json');

  // Meta sedes
  if (r4Meta[0].venue.includes('Dallas') && r4Meta[1].venue.includes('Atlanta')) {
    pass('Sedes semifinales: Dallas (P101) y Atlanta (P102)');
  } else {
    fail('Sedes R4_META no coinciden con Dallas/Atlanta');
  }

  console.log('\n--- Estado actual ---');
  ko8.forEach((m) => {
    const t = m.teams;
    const w = m.winner ? ` → ganador: ${m.winner}` : ' (sin resultado aún)';
    console.log(`  ${m.id} [P${r8Meta[parseInt(m.id.split('-')[1], 10) - 1].fifaNo}]: ${t.home || '?'} vs ${t.away || '?'}${w}`);
  });
  ko4.forEach((m) => {
    const h = m.expected.home || 'tbd';
    const a = m.expected.away || 'tbd';
    console.log(`  ${m.id} [P${m.fifaNo}]: ${h} vs ${a}  ← ${m.feeders.join(' + ')}`);
  });

  const missingWinners = ko8.filter(m => !m.winner).length;
  if (missingWinners === 4) {
    console.log('\nℹ Sin resultados de cuartos aún — semifinales en tbd hasta que la API publique ganadores.');
  } else if (missingWinners > 0) {
    console.log(`\n⚠ Faltan ${missingWinners} resultado(s) de cuartos para completar semifinales oficiales.`);
  } else {
    pass('Todos los cuartos tienen ganador — semifinales oficiales calculables');
  }

  return ok;
}

async function runPlaywrightChecks() {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.log('\nℹ Playwright no disponible — solo comprobación estática.');
    return true;
  }

  const BASE = process.argv[2] || 'http://127.0.0.1:8765';
  const browser = await chromium.launch({ headless: true });
  let ok = true;

  try {
    const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
    await page.addInitScript(() => {
      const fixed = new Date('2026-07-14T10:00:00+02:00').getTime();
      const RealDate = Date;
      function MockDate(...args) {
        if (args.length === 0) return new RealDate(fixed);
        return new RealDate(...args);
      }
      MockDate.now = () => fixed;
      MockDate.parse = RealDate.parse;
      MockDate.UTC = RealDate.UTC;
      MockDate.prototype = RealDate.prototype;
      window.Date = MockDate;
    });
    await page.addInitScript(({ user }) => {
      localStorage.setItem('porra2026_ko_preview', '1');
      sessionStorage.setItem('porra2026_ko_semis_preview', '1');
      const store = JSON.parse(localStorage.getItem('porra2026_knockout') || '{}');
      if (!store.users) store.users = {};
      store.users[user] = {
        picks: {
          'KO16-1': 'home', 'KO16-2': 'away', 'KO16-3': 'home', 'KO16-4': 'away',
          'KO16-5': 'home', 'KO16-6': 'away', 'KO16-7': 'home', 'KO16-8': 'away',
          'KO8-1': 'home', 'KO8-2': 'away', 'KO8-3': 'home', 'KO8-4': 'away'
        },
        extras: { semis: ['', '', '', ''], finalists: ['', ''], champion: '' }
      };
      store.activeUser = user;
      localStorage.setItem('porra2026_knockout', JSON.stringify(store));
    }, { user: USER });

    await page.goto(`${BASE}/?ko_round=semis`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForSelector('#ko-mr-KO4-1', { timeout: 30000 });
    await page.evaluate((user) => {
      if (typeof setActiveKoUser === 'function') setActiveKoUser(user);
      if (typeof syncKnockoutBracketFromResults === 'function') syncKnockoutBracketFromResults();
      if (typeof refreshKnockoutUI === 'function') refreshKnockoutUI();
    }, USER);
    await page.waitForTimeout(800);

    const state = await page.evaluate(() => {
      const matches = (window.KO_ROUNDS && window.KO_ROUNDS.r4 && window.KO_ROUNDS.r4.matches) || [];
      return {
        semis: typeof isKoSemisPhase === 'function' && isKoSemisPhase(),
        picks: matches.map(m => ({ id: m.id, home: m.home, away: m.away })),
        labels: [...document.querySelectorAll('.ko-round-col-label--side')].map(e => e.textContent.trim()),
        ko4visible: !!document.querySelector('#ko-mr-KO4-2')
      };
    });

    if (!state.semis) {
      console.error('✗ isKoSemisPhase() es false en preview');
      ok = false;
    } else {
      console.log('✓ Preview semifinales activo en navegador');
    }

    // Con API parcial: solo aparecen ganadores oficiales de cuartos ya jugados
    if (state.picks) {
      const [m1, m2] = state.picks;
      const results = await page.evaluate(() => {
        const w = (id) => {
          const r = typeof results !== 'undefined' ? results[id] : null;
          if (!r || r.home == null) return null;
          const h = parseInt(r.home, 10);
          const a = parseInt(r.away, 10);
          if (isNaN(h)) return r.winner || null;
          if (r.winner) return r.winner;
          const fx = results._fixtures && results._fixtures[id];
          if (!fx) return null;
          if (h > a) return fx.home;
          if (a > h) return fx.away;
          return null;
        };
        return { ko8_1: w('KO8-1'), ko8_2: w('KO8-2'), ko8_3: w('KO8-3'), ko8_4: w('KO8-4') };
      });
      const exp1h = results.ko8_1 || 'tbd';
      const exp1a = results.ko8_2 || 'tbd';
      const exp2h = results.ko8_3 || 'tbd';
      const exp2a = results.ko8_4 || 'tbd';
      if (m1.home !== exp1h || m1.away !== exp1a) {
        console.error(`✗ KO4-1 esperado ${exp1h} vs ${exp1a}, obtuvo ${m1.home} vs ${m1.away}`);
        ok = false;
      } else {
        console.log(`✓ KO4-1 (P101): ${m1.home} vs ${m1.away} — según API cuartos`);
      }
      if (m2.home !== exp2h || m2.away !== exp2a) {
        console.error(`✗ KO4-2 esperado ${exp2h} vs ${exp2a}, obtuvo ${m2.home} vs ${m2.away}`);
        ok = false;
      } else {
        console.log(`✓ KO4-2 (P102): ${m2.home} vs ${m2.away} — según API cuartos`);
      }
    }

    if (!state.labels.some(l => l.includes('Dallas')) || !state.labels.some(l => l.includes('Atlanta'))) {
      console.error('✗ Faltan etiquetas de lado Dallas/Atlanta');
      ok = false;
    } else {
      console.log('✓ Etiquetas de lado Dallas / Atlanta visibles');
    }
  } finally {
    await browser.close();
  }
  return ok;
}

async function main() {
  console.log('Comprobando semifinales…\n');
  const staticOk = runStaticChecks();
  const pwOk = await runPlaywrightChecks();
  if (!staticOk || !pwOk) {
    console.error('\nVerificación de semifinales FALLIDA.');
    process.exit(1);
  }
  console.log('\nSemifinales OK — cruces, fixtures y preview verificados.');
}

main().catch(err => {
  console.error('✗', err.message);
  process.exit(1);
});
