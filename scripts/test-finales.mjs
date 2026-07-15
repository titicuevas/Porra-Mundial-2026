#!/usr/bin/env node
/**
 * Comprueba finales (P103 3.er puesto + P104 final) y UI del campeón especial.
 * Uso: node scripts/test-finales.mjs [http://localhost:8765]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.PORRA_ROOT || path.join(__dirname, '..');
const BASE = process.argv[2] || 'http://127.0.0.1:8765';
const USER = 'Manolín';

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
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

function koLoser(results, matchId, teams) {
  const w = koWinner(results, matchId, teams);
  if (!w) return null;
  return w === teams.home ? teams.away : teams.home;
}

function runStaticChecks() {
  let ok = true;
  const fail = (msg) => { console.error('✗', msg); ok = false; };
  const pass = (msg) => console.log('✓', msg);

  const results = JSON.parse(read('results.json'));
  const fx = results._fixtures || {};

  const ko4 = [1, 2].map(i => {
    const id = 'KO4-' + i;
    const teams = fx[id] || {};
    return { id, teams, winner: koWinner(results, id, teams), loser: koLoser(results, id, teams) };
  });

  if (ko4[0].winner === 'es') {
    pass('KO4-1: España finalista (API)');
  } else if (ko4[0].winner) {
    pass(`KO4-1: ganador ${ko4[0].winner}`);
  } else {
    pass('KO4-1: pendiente (cruce parcial OK en preview)');
  }

  if (ko4[0].loser === 'fr') {
    pass('KO4-1: Francia perdedora → 3.er puesto (parcial)');
  }

  const sched = read('js/schedule.js');
  if (sched.includes('THIRD_META') && sched.includes('fifaNo: 103')) {
    pass('schedule.js incluye P103 (3.er puesto)');
  } else fail('Falta THIRD_META P103 en schedule.js');

  if (sched.includes('R2_FINAL_FEEDERS') && sched.includes('R3P_FEEDERS')) {
    pass('Feeders final y 3.er puesto definidos');
  } else fail('Faltan R2_FINAL_FEEDERS / R3P_FEEDERS');

  const knockout = read('js/knockout.js');
  if (knockout.includes('koFinalChampionHeroHTML') && knockout.includes('KOB-1')) {
    pass('knockout.js: hero campeón + KOB-1');
  } else fail('Falta UI de campeón o KOB-1 en knockout.js');

  return ok;
}

async function runPlaywrightChecks() {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.log('⚠ Playwright no instalado — solo comprobaciones estáticas.');
    console.log('  (Opcional: npm i -D playwright && npx playwright install chromium)');
    return true;
  }
  let ok = true;
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: 'móvil', width: 390, height: 844 },
    { name: 'tablet', width: 768, height: 1024 }
  ];

  try {
    for (const vp of viewports) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      page.on('pageerror', e => console.error(`PAGE ERR [${vp.name}]:`, e.message));

      await page.addInitScript(() => {
        const fixed = new Date('2026-07-15T10:00:00+02:00').getTime();
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
        sessionStorage.setItem('porra2026_ko_final_preview', '1');
        const store = JSON.parse(localStorage.getItem('porra2026_knockout') || '{}');
        if (!store.users) store.users = {};
        store.users[user] = {
          picks: { 'KO4-1': 'away' },
          extras: {
            semis: ['fr', 'es', 'gb-eng', 'ar'],
            finalists: ['es', 'gb-eng'],
            champion: 'es'
          }
        };
        store.activeUser = user;
        localStorage.setItem('porra2026_knockout', JSON.stringify(store));
      }, { user: USER });

      await page.goto(`${BASE}/?ko_round=final`, { waitUntil: 'load', timeout: 60000 });
      await page.waitForSelector('#ko-finals-champion-hero', { timeout: 30000 });
      await page.evaluate((user) => {
        if (typeof setActiveKoUser === 'function') setActiveKoUser(user);
        if (typeof syncKnockoutBracketFromResults === 'function') syncKnockoutBracketFromResults();
        if (typeof refreshKnockoutUI === 'function') refreshKnockoutUI();
      }, USER);
      await page.waitForTimeout(900);

      const state = await page.evaluate(() => ({
        finalPhase: typeof isKoFinalPhase === 'function' && isKoFinalPhase(),
        previewOnly: typeof isKoFinalPreviewOnly === 'function' && isKoFinalPreviewOnly(),
        hero: !!document.getElementById('ko-finals-champion-hero'),
        heroName: document.querySelector('.ko-finals-champion-hero__name')?.textContent?.trim() || '',
        kob: !!document.querySelector('#ko-mr-KOB-1'),
        kof: !!document.querySelector('#ko-mr-KOF-1'),
        worldFinal: !!document.querySelector('.ko-list-match--world-final'),
        crown: document.querySelectorAll('.ko-champion-crown').length,
        stackMobile: (() => {
          const pair = document.querySelector('.ko-list-pair--world-final');
          if (!pair) return false;
          return getComputedStyle(pair).gridTemplateColumns.split(' ').filter(Boolean).length === 1;
        })()
      }));

      if (!state.finalPhase) {
        console.error(`✗ [${vp.name}] isKoFinalPhase() debería ser true`);
        ok = false;
      }
      if (!state.hero) {
        console.error(`✗ [${vp.name}] Falta #ko-finals-champion-hero`);
        ok = false;
      }
      if (!state.heroName.toLowerCase().includes('espa')) {
        console.error(`✗ [${vp.name}] Hero debería mostrar campeón España, obtuvo: ${state.heroName}`);
        ok = false;
      }
      if (!state.kob || !state.kof) {
        console.error(`✗ [${vp.name}] Faltan partidos KOB-1 o KOF-1`);
        ok = false;
      }
      if (!state.worldFinal) {
        console.error(`✗ [${vp.name}] Falta layout especial de gran final`);
        ok = false;
      }
      if (state.crown < 1) {
        console.error(`✗ [${vp.name}] Falta corona 👑 en finalista campeón`);
        ok = false;
      }
      if (vp.width < 500 && !state.stackMobile) {
        console.error(`✗ [${vp.name}] En móvil la final debería apilar botones (1 columna)`);
        ok = false;
      }

      if (ok) {
        console.log(`✓ [${vp.name}] Preview finales — hero campeón, P103/P104, corona, layout OK`);
      }

      await page.close();
    }

    // Interacción: marcar final con campeón especial
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.addInitScript(() => {
      const fixed = new Date('2026-07-15T10:00:00+02:00').getTime();
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
      sessionStorage.setItem('porra2026_ko_final_preview', '1');
      const store = JSON.parse(localStorage.getItem('porra2026_knockout') || '{}');
      store.users = store.users || {};
      store.users[user] = {
        picks: {},
        extras: {
          semis: ['fr', 'es', 'gb-eng', 'ar'],
          finalists: ['es', 'gb-eng'],
          champion: 'es'
        }
      };
      store.activeUser = user;
      localStorage.setItem('porra2026_knockout', JSON.stringify(store));
    }, { user: USER });
    await page.goto(`${BASE}/?ko_round=final`, { waitUntil: 'load', timeout: 60000 });
    await page.evaluate((user) => {
      if (typeof setActiveKoUser === 'function') setActiveKoUser(user);
      if (typeof syncKnockoutBracketFromResults === 'function') syncKnockoutBracketFromResults();
      if (typeof refreshKnockoutUI === 'function') refreshKnockoutUI();
    }, USER);
    await page.waitForSelector('#ko-mr-KOF-1', { timeout: 30000 });

    const esBtn = page.locator('#ko-mr-KOF-1 .ko-team-pick--your-champion').first();
    if (await esBtn.count()) {
      await esBtn.click();
      await page.waitForTimeout(400);
      const aligned = await page.evaluate(() =>
        document.getElementById('ko-finals-champion-hero')?.classList.contains('ko-finals-champion-hero--aligned')
      );
      if (aligned) {
        console.log('✓ [móvil] Marcar final con campeón especial → hero en modo alineado');
      } else {
        console.error('✗ Tras marcar campeón en KOF-1, hero debería tener clase --aligned');
        ok = false;
      }
    } else {
      console.log('⚠ KOF-1 aún sin cruce completo — salto interacción campeón (normal con 1 semi jugada)');
    }
    await page.close();
  } finally {
    await browser.close();
  }
  return ok;
}

async function main() {
  console.log(`Comprobando finales en ${BASE} (PORRA_ROOT=${ROOT})\n`);
  const staticOk = runStaticChecks();
  console.log('');
  let pwOk = true;
  try {
    pwOk = await runPlaywrightChecks();
  } catch (e) {
    console.error('✗ Playwright:', e.message);
    pwOk = false;
  }
  if (!staticOk || !pwOk) {
    console.error('\nVerificación de finales FALLIDA.');
    process.exit(1);
  }
  console.log('\nFinales OK — cruces, hero campeón y preview verificados.');
  console.log('\nPrueba manual:');
  console.log(`  ${BASE}/?ko_round=final`);
  console.log('  → Elige participante (ej. Manolín) → pestaña Eliminatorias → Ctrl+F5 si hace falta');
}

main().catch(err => {
  console.error('✗', err.message);
  process.exit(1);
});
