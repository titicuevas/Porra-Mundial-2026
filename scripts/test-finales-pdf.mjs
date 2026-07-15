#!/usr/bin/env node
/**
 * Genera un PDF de prueba de la quiniela finales (P103 + P104, plazo único).
 * Guarda: scripts/test-output/test-finales.pdf (+ preview PNG si hay pdftoppm).
 *
 * Uso:
 *   node scripts/test-finales-pdf.mjs [http://127.0.0.1:8765]
 *
 * Requiere: servidor local + playwright (npm i -D playwright && npx playwright install chromium)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.PORRA_ROOT || path.join(__dirname, '..');
const OUT = path.join(ROOT, 'scripts', 'test-output');
const BASE = process.argv[2] || 'http://127.0.0.1:8765';
const USER = 'Manolín';
const FINALS_DATE = '2026-07-17T12:00:00+02:00';

const PDF_OUT = path.join(OUT, 'test-finales.pdf');
const PNG_OUT = path.join(OUT, 'test-finales-preview.png');

function isPdf(buf) {
  return buf.length > 4 && buf.slice(0, 4).toString() === '%PDF';
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

function loadResultsWithKo42() {
  const base = JSON.parse(fs.readFileSync(path.join(ROOT, 'results.json'), 'utf8'));
  base['KO4-2'] = { home: 1, away: 2, winner: 'ar' };
  return base;
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
  return { dest, bytes: buf.length, buf };
}

function tryPdfPreview(pdfPath, pngPath) {
  try {
    execSync(`pdftoppm -png -singlefile -f 1 -l 1 "${pdfPath}" "${pngPath.replace(/\.png$/, '')}"`, {
      stdio: 'pipe'
    });
    const generated = pngPath.replace(/\.png$/, '') + '.png';
    if (fs.existsSync(generated) && generated !== pngPath) {
      fs.renameSync(generated, pngPath);
    }
    return fs.existsSync(pngPath);
  } catch {
    return false;
  }
}

function assertPdfContent(pdfPath, buf) {
  let text = '';
  try {
    text = execSync(`pdftotext "${pdfPath}" -`, { encoding: 'utf8' });
  } catch {
    text = buf.toString('latin1');
  }
  const checks = [
    ['FINALES', 'título finales'],
    ['3.er y 4', 'sección 3.er puesto'],
    ['Final del Mundial', 'sección final'],
    ['cierran 3.er puesto y final', 'plazo único en PDF']
  ];
  const missing = checks.filter(([needle]) => !text.includes(needle)).map(([, label]) => label);
  if (missing.length) {
    throw new Error('PDF generado pero faltan textos esperados: ' + missing.join(', '));
  }
}

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    console.error('Playwright no instalado. En una carpeta temporal:');
    console.error('  npm init -y && npm i -D playwright && npx playwright install chromium');
    console.error('  PORRA_ROOT=' + ROOT + ' node scripts/test-finales-pdf.mjs');
    process.exit(1);
  }
}

async function main() {
  const resultsPayload = loadResultsWithKo42();
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    page.on('pageerror', e => console.error('PAGE ERR:', e.message));

    await page.route('**/results.json**', route => {
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(resultsPayload) });
    });
    await page.route('**/api/results**', route => {
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(resultsPayload) });
    });

    await page.addInitScript(mockDateScript(FINALS_DATE));
    await page.addInitScript(({ user }) => {
      localStorage.setItem('porra2026_ko_preview', '1');
      sessionStorage.setItem('porra2026_ko_final_preview', '1');
      const store = JSON.parse(localStorage.getItem('porra2026_knockout') || '{}');
      store.users = store.users || {};
      store.users[user] = {
        picks: {
          'KOB-1': 'home',
          'KOF-1': 'home'
        },
        extras: {
          semis: ['fr', 'es', 'gb-eng', 'ar'],
          finalists: ['es', 'ar'],
          champion: 'es'
        }
      };
      store.activeUser = user;
      localStorage.setItem('porra2026_knockout', JSON.stringify(store));
    }, { user: USER });

    await page.goto(`${BASE}/?ko_round=final`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForFunction(() => typeof exportKnockoutPDF === 'function', null, { timeout: 30000 });
    await page.waitForTimeout(1200);

    await page.evaluate((user) => {
      if (typeof setActiveKoUser === 'function') setActiveKoUser(user);
      if (typeof syncKnockoutBracketFromResults === 'function') syncKnockoutBracketFromResults();
      const store = JSON.parse(localStorage.getItem('porra2026_knockout') || '{}');
      if (store.users && store.users[user]) {
        store.users[user].extras = store.users[user].extras || {};
        store.users[user].extras.champion = 'es';
        store.users[user].extras.finalists = ['es', 'ar'];
        localStorage.setItem('porra2026_knockout', JSON.stringify(store));
      }
      if (typeof pickKoResult === 'function') {
        pickKoResult('KOB-1', 'home');
        pickKoResult('KOF-1', 'home');
      }
      if (typeof refreshKnockoutUI === 'function') refreshKnockoutUI();
    }, USER);
    await page.waitForTimeout(800);

    const state = await page.evaluate(() => ({
      user: typeof getActiveKoUser === 'function' ? getActiveKoUser() : '',
      kind: typeof getKoPdfKind === 'function' ? getKoPdfKind() : '',
      finalPhase: typeof isKoFinalPhase === 'function' && isKoFinalPhase(),
      closeAt: typeof formatKoFinalesCloseShort === 'function' ? formatKoFinalesCloseShort() : '',
      blockers: typeof getKnockoutExportBlockers === 'function' ? getKnockoutExportBlockers() : ['?'],
      complete: typeof isKnockoutComplete === 'function' && isKnockoutComplete(),
      done: typeof koMatchesDone === 'function' ? koMatchesDone() : 0,
      req: typeof koMatchesRequired === 'function' ? koMatchesRequired() : 0,
      kob: document.querySelector('#ko-mr-KOB-1')?.textContent?.includes('Francia') || false,
      kof: document.querySelector('#ko-mr-KOF-1')?.textContent?.includes('España') || false
    }));

    console.log('Estado:', JSON.stringify(state, null, 2));

    if (!state.finalPhase) throw new Error('isKoFinalPhase() debería ser true');
    if (state.kind !== 'finales') throw new Error(`getKoPdfKind() esperado "finales", obtuvo "${state.kind}"`);
    if (!state.complete) {
      throw new Error(`Export bloqueado: ${state.blockers.join('; ')} (${state.done}/${state.req})`);
    }

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 120000 }),
      page.evaluate(async () => { await exportKnockoutPDF(); })
    ]);

    const saved = await saveDownload(download, PDF_OUT);
    assertPdfContent(PDF_OUT, saved.buf);

    console.log(`\n✓ PDF finales generado: ${saved.dest} (${saved.bytes} bytes)`);
    console.log(`  Participante: ${USER} · 3.er puesto: Francia · Final: España (campeón)`);
    console.log(`  Plazo PDF: ${state.closeAt} (pitido P103)`);

    if (tryPdfPreview(PDF_OUT, PNG_OUT)) {
      console.log(`✓ Vista previa PNG: ${PNG_OUT}`);
    } else {
      console.log('  (Instala poppler-utils para preview PNG: pdftoppm)');
    }

    console.log('\nAbre el PDF en:');
    console.log(`  file://${PDF_OUT}`);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('✗', err.message);
  process.exit(1);
});
