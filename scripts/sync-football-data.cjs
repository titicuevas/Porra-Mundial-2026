#!/usr/bin/env node
/**
 * Actualiza results.json desde football-data.org (dieciseisavos, octavos, cuartos).
 *
 * Uso:
 *   FOOTBALL_DATA_TOKEN=xxx node scripts/sync-football-data.cjs
 *   FOOTBALL_DATA_TOKEN=xxx node scripts/sync-football-data.cjs --probe nl ma
 *   FOOTBALL_DATA_TOKEN=xxx node scripts/sync-football-data.cjs --dry-run
 */
const path = require('path');
const {
  fetchKoUpdatesFromFootballData,
  findScheduledMatch,
  mergeIntoResults,
  readLocalResults,
  writeLocalResults,
  MATCH_ID_TO_PAIR
} = require('./lib/football-data-sync.cjs');

const ROOT = path.join(__dirname, '..');
const token = process.env.FOOTBALL_DATA_TOKEN;

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const probeIdx = args.indexOf('--probe');

  if (!token) {
    console.error('✗ Falta FOOTBALL_DATA_TOKEN.');
    console.error('  Regístrate gratis: https://www.football-data.org/client/register');
    console.error('  Luego: FOOTBALL_DATA_TOKEN=tu_token node scripts/sync-football-data.cjs');
    process.exit(1);
  }

  if (probeIdx >= 0) {
    const home = args[probeIdx + 1];
    const away = args[probeIdx + 2];
    if (!home || !away) {
      console.error('Uso: --probe nl ma');
      process.exit(1);
    }
    const info = await findScheduledMatch(token, home, away);
    const pair = [...MATCH_ID_TO_PAIR.entries()].find(([, p]) =>
      (p.home === home && p.away === away) || (p.home === away && p.away === home)
    );
    console.log('Cruce en la porra:', pair ? pair[0] : '?', pair ? pair[1] : '');
    console.log(JSON.stringify(info, null, 2));
    if (info && info.mapped) {
      console.log('\n✓ Partido FINISHED — se aplicaría:', info.mapped.matchId, info.mapped.result);
    } else if (info) {
      console.log('\n○ Partido aún no finalizado (status:', info.status + ')');
    } else {
      console.log('\n✗ No encontrado en football-data LAST_32');
    }
    return;
  }

  const base = readLocalResults(ROOT);
  const { updates, details, stages, fixtures } = await fetchKoUpdatesFromFootballData(token, base);

  stages.forEach(s => {
    const label = s.stage === 'r32' ? 'KO32' : s.stage === 'r16' ? 'KO16' : 'KO8';
    const fx = s.fixtures != null ? `, ${s.fixtures} cruces` : '';
    console.log(`football-data.org ${s.stage}: ${s.rawCount} partidos, ${s.mapped} mapeados a ${label}${fx}`);
  });

  if (Object.keys(fixtures || {}).length) {
    console.log('\nCruces desde API:');
    Object.keys(fixtures).sort().forEach(id => {
      const f = fixtures[id];
      console.log(`  ${id}: ${f.home} vs ${f.away}`);
    });
  }

  if (!details.length && !(fixtures && Object.keys(fixtures).length)) {
    console.log('Nada nuevo que aplicar (ningún FINISHED que coincida con el cuadro).');
    return;
  }

  details.forEach(d => {
    const w = d.result.winner ? ` → ganador ${d.result.winner}` : '';
    console.log(`  ${d.matchId}: ${d.homeCode} ${d.result.home}-${d.result.away} ${d.awayCode}${w}`);
  });

  const merged = mergeIntoResults(base, updates);
  delete merged._meta;
  if (fixtures && Object.keys(fixtures).length) {
    merged._fixtures = fixtures;
  }

  if (dryRun) {
    console.log('\n--dry-run: no se escribe results.json');
    return;
  }

  writeLocalResults(ROOT, merged);
  console.log('\n✓ results.json actualizado');
}

main().catch(err => {
  console.error('✗', err.message);
  process.exit(1);
});
