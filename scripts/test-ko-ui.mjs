#!/usr/bin/env node
/**
 * Prueba UI responsive de cuartos y semifinales (lados del cuadro).
 * Uso (mismo entorno Playwright que test-pdf-export):
 *   PORRA_ROOT=/ruta/al/proyecto node scripts/test-ko-ui.mjs http://localhost:8765
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.PORRA_ROOT || path.join(__dirname, '..');
const BASE = process.argv[2] || 'http://localhost:8765';
const USER = 'Manolín';

const VIEWPORTS = [
  { name: 'móvil', width: 390, height: 844, mobileCols: 1 },
  { name: 'tablet', width: 768, height: 1024, mobileCols: 2 },
  { name: 'escritorio', width: 1280, height: 800, mobileCols: 2 }
];

function mockDateScript(iso) {
  return `(() => {
    const fixed = new Date('${iso}').getTime();
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
  })();`;
}

function seedScript({ round, semisPreview }) {
  return `(() => {
    const round = '${round}';
    localStorage.setItem('porra2026_ko_preview', '1');
    ${semisPreview ? "sessionStorage.setItem('porra2026_ko_semis_preview', '1');" : ''}
    const store = JSON.parse(localStorage.getItem('porra2026_knockout') || '{}');
    if (!store.users) store.users = {};
    if (!store.users['${USER}']) {
      store.users['${USER}'] = { picks: {}, extras: { semis: ['', '', '', ''], finalists: ['', ''], champion: '' } };
    }
    const picks = store.users['${USER}'].picks;
    for (let i = 1; i <= 8; i++) picks['KO16-' + i] = i % 2 ? 'home' : 'away';
    if (round === 'cuartos' || round === 'semis') {
      for (let i = 1; i <= 4; i++) picks['KO8-' + i] = i % 2 ? 'home' : 'away';
    }
    if (round === 'semis') {
      for (let i = 1; i <= 2; i++) picks['KO4-' + i] = 'home';
    }
    store.activeUser = '${USER}';
    localStorage.setItem('porra2026_knockout', JSON.stringify(store));
  })();`;
}

async function assertKoUI(page, { round, viewport }) {
  const gridSel = round === 'semis'
    ? '.ko-round-matches-grid--semis'
    : '.ko-round-matches-grid';
  const matchIds = round === 'semis'
    ? ['KO4-1', 'KO4-2']
    : ['KO8-1', 'KO8-2', 'KO8-3', 'KO8-4'];
  const sideLabels = round === 'semis'
    ? ['Semifinal Dallas', 'Semifinal Atlanta']
    : ['Lado Dallas', 'Lado Atlanta'];

  await page.waitForSelector('#koBracket', { timeout: 30000 });
  await page.waitForFunction(() => {
    const el = document.getElementById('koBracket');
    return el && el.textContent.trim().length > 40;
  }, null, { timeout: 30000 });

  for (const id of matchIds) {
    const found = await page.locator(`#ko-mr-${id}`).count();
    if (!found) throw new Error(`[${viewport.name}/${round}] Falta partido #ko-mr-${id}`);
  }

  for (const label of sideLabels) {
    const found = await page.locator('.ko-round-col-label--side', { hasText: label }).count();
    if (!found) throw new Error(`[${viewport.name}/${round}] Falta etiqueta de lado: ${label}`);
  }

  const gridCols = await page.evaluate((sel) => {
    const grid = document.querySelector(sel);
    if (!grid) return -1;
    return getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
  }, gridSel);

  if (gridCols !== viewport.mobileCols) {
    throw new Error(`[${viewport.name}/${round}] Grid esperaba ${viewport.mobileCols} col(s), tiene ${gridCols}`);
  }

  const bracket = await page.evaluate(() => ({
    semis: typeof isKoSemisPhase === 'function' && isKoSemisPhase(),
    cuartos: typeof isKoCuartosPhase === 'function' && isKoCuartosPhase(),
    htmlLen: document.getElementById('koBracket')?.innerHTML.length || 0
  }));

  if (round === 'semis' && !bracket.semis) {
    throw new Error(`[${viewport.name}] isKoSemisPhase() debería ser true`);
  }
  if (round === 'cuartos' && !bracket.cuartos) {
    throw new Error(`[${viewport.name}] isKoCuartosPhase() debería ser true`);
  }
  if (bracket.htmlLen < 200) {
    throw new Error(`[${viewport.name}/${round}] Panel koBracket casi vacío (${bracket.htmlLen} chars)`);
  }

  console.log(`  ✓ ${viewport.name} (${viewport.width}px) — ${matchIds.length} partidos, ${gridCols} col, etiquetas OK`);
}

async function runRound(browser, cfg) {
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    page.on('pageerror', e => console.error('PAGE ERR:', e.message));
    await page.addInitScript(mockDateScript(cfg.dateIso));
    await page.addInitScript(seedScript({ round: cfg.round, semisPreview: cfg.semisPreview }));
    await page.goto(`${BASE}/?ko_round=${cfg.urlRound}`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(1200);
    await assertKoUI(page, { round: cfg.round, viewport: vp });
    await page.close();
  }
  console.log(`✓ ${cfg.label} — responsive OK en ${VIEWPORTS.length} viewports`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    console.log(`Probando UI KO en ${BASE} (PORRA_ROOT=${ROOT})\n`);
    await runRound(browser, {
      label: 'Cuartos (lados Dallas/Atlanta)',
      round: 'cuartos',
      urlRound: 'cuartos',
      dateIso: '2026-07-08T10:00:00+02:00',
      semisPreview: false
    });
    await runRound(browser, {
      label: 'Semifinales (preview)',
      round: 'semis',
      urlRound: 'semis',
      dateIso: '2026-07-14T10:00:00+02:00',
      semisPreview: true
    });
    console.log('\nTodo OK — cuadro responsive y lados del bracket verificados.');
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('✗', err.message);
  process.exit(1);
});
