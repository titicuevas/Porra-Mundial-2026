#!/usr/bin/env node
/**
 * Prueba de generación PDF (octavos + cuartos + semifinales).
 * Uso:
 *   cp scripts/test-pdf-export.mjs /tmp/porra-pdf-test/ && cd /tmp/porra-pdf-test
 *   npm init -y && npm install playwright && npx playwright install chromium
 *   PORRA_ROOT=/ruta/al/proyecto node test-pdf-export.mjs http://localhost:8765
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.PORRA_ROOT || path.join(__dirname, '..');
const OUT = path.join(ROOT, 'scripts', 'test-output');
const BASE = process.argv[2] || 'http://localhost:8765';
const USER = 'Manolín';

const CUARTOS_DATE = '2026-07-08T10:00:00+02:00';
const SEMIS_DATE = '2026-07-14T10:00:00+02:00';
const OCTAVOS_DATE = '2026-07-04T12:00:00+02:00';

function isPdf(buf) {
  return buf.length > 4 && buf.slice(0, 4).toString() === '%PDF';
}

async function saveDownload(download, dest) {
  const buf = await download.createReadStream().then(chunks => {
    const parts = [];
    return new Promise((resolve, reject) => {
      chunks.on('data', d => parts.push(d));
      chunks.on('end', () => resolve(Buffer.concat(parts)));
      chunks.on('error', reject);
    });
  });
  if (!isPdf(buf)) throw new Error('No es PDF válido: ' + dest);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return { dest, bytes: buf.length };
}

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

async function seedKnockoutPicks(page, round) {
  return page.evaluate(({ user, round }) => {
    const store = JSON.parse(localStorage.getItem('porra2026_knockout') || '{}');
    if (!store.users) store.users = {};
    if (!store.users[user]) {
      store.users[user] = { picks: {}, extras: { semis: ['', '', '', ''], finalists: ['', ''], champion: '' } };
    }
    const picks = store.users[user].picks;
    if (round === 'octavos') {
      for (let i = 1; i <= 8; i++) picks['KO16-' + i] = 'home';
    }
    if (round === 'cuartos') {
      for (let i = 1; i <= 8; i++) picks['KO16-' + i] = i % 2 ? 'home' : 'away';
      for (let i = 1; i <= 4; i++) picks['KO8-' + i] = 'home';
    }
    if (round === 'semis') {
      for (let i = 1; i <= 8; i++) picks['KO16-' + i] = i % 2 ? 'home' : 'away';
      for (let i = 1; i <= 4; i++) picks['KO8-' + i] = i % 2 ? 'home' : 'away';
      for (let i = 1; i <= 2; i++) picks['KO4-' + i] = 'home';
    }
    store.activeUser = user;
    localStorage.setItem('porra2026_knockout', JSON.stringify(store));
    localStorage.setItem('porra2026_ko_preview', '1');
    if (typeof setActiveKoUser === 'function') setActiveKoUser(user);
    if (typeof syncKnockoutBracketFromResults === 'function') syncKnockoutBracketFromResults();
    if (typeof refreshKnockoutUI === 'function') refreshKnockoutUI();
    return {
      picks: Object.keys(picks).filter(k => k.startsWith('KO')).length,
      user: typeof getActiveKoUser === 'function' ? getActiveKoUser() : ''
    };
  }, { user: USER, round });
}

async function testKoPdf(page, { label, dateIso, round, filename }) {
  await page.addInitScript(mockDateScript(dateIso));
  await page.addInitScript(({ user, round }) => {
    const store = JSON.parse(localStorage.getItem('porra2026_knockout') || '{}');
    if (!store.users) store.users = {};
    if (!store.users[user]) {
      store.users[user] = { picks: {}, extras: { semis: ['', '', '', ''], finalists: ['', ''], champion: '' } };
    }
    const picks = store.users[user].picks;
    if (round === 'octavos') {
      for (let i = 1; i <= 8; i++) picks['KO16-' + i] = 'home';
    }
    if (round === 'cuartos') {
      for (let i = 1; i <= 8; i++) picks['KO16-' + i] = i % 2 ? 'home' : 'away';
      for (let i = 1; i <= 4; i++) picks['KO8-' + i] = 'home';
    }
    if (round === 'semis') {
      for (let i = 1; i <= 8; i++) picks['KO16-' + i] = i % 2 ? 'home' : 'away';
      for (let i = 1; i <= 4; i++) picks['KO8-' + i] = i % 2 ? 'home' : 'away';
      for (let i = 1; i <= 2; i++) picks['KO4-' + i] = 'home';
    }
    store.activeUser = user;
    localStorage.setItem('porra2026_knockout', JSON.stringify(store));
    localStorage.setItem('porra2026_ko_preview', '1');
  }, { user: USER, round });

  await page.goto(`${BASE}/?ko_round=${round === 'semis' ? 'semis' : round === 'cuartos' ? 'cuartos' : 'octavos'}`, {
    waitUntil: 'load',
    timeout: 60000
  });
  await page.waitForFunction(() => typeof getKnockoutExportBlockers === 'function', null, { timeout: 30000 });
  await page.waitForTimeout(1500);

  const seeded = await seedKnockoutPicks(page, round);

  const state = await page.evaluate(() => ({
    user: typeof getActiveKoUser === 'function' ? getActiveKoUser() : '',
    kind: typeof getKoPdfKind === 'function' ? getKoPdfKind() : '',
    cuartos: typeof isKoCuartosPhase === 'function' && isKoCuartosPhase(),
    semis: typeof isKoSemisPhase === 'function' && isKoSemisPhase(),
    octavos: typeof isKoOctavosPhase === 'function' && isKoOctavosPhase(),
    blockers: typeof getKnockoutExportBlockers === 'function' ? getKnockoutExportBlockers() : ['?'],
    complete: typeof isKnockoutComplete === 'function' && isKnockoutComplete(),
    seeded: null
  }));
  state.seeded = seeded.picks;
  state.user = seeded.user;

  if (!state.complete) {
    throw new Error(`${label}: export bloqueado — ${state.blockers.join('; ')} (kind=${state.kind})`);
  }

  const dest = path.join(OUT, filename);
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 120000 }),
    page.evaluate(async () => { await exportKnockoutPDF(); })
  ]);
  const saved = await saveDownload(download, dest);
  console.log(`✓ ${label}: ${saved.dest} (${saved.bytes} bytes, kind=${state.kind}, picks=${state.seeded})`);
  return saved;
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  try {
    for (const cfg of [
      { label: 'PDF octavos', dateIso: OCTAVOS_DATE, round: 'octavos', filename: 'test-octavos.pdf' },
      { label: 'PDF cuartos', dateIso: CUARTOS_DATE, round: 'cuartos', filename: 'test-cuartos.pdf' },
      { label: 'PDF semifinales', dateIso: SEMIS_DATE, round: 'semis', filename: 'test-semis.pdf' }
    ]) {
      const p = await browser.newPage();
      p.on('pageerror', e => console.error('PAGE ERR:', e.message));
      await testKoPdf(p, cfg);
      await p.close();
    }
    console.log('\nTodo OK — revisa scripts/test-output/');
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('✗', err.message);
  process.exit(1);
});
