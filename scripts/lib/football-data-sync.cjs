/**
 * Sincroniza resultados de dieciseisavos desde football-data.org → IDs de la porra (KO32-N).
 * Requiere FOOTBALL_DATA_TOKEN (gratis en https://www.football-data.org/client/register)
 */
const fs = require('fs');
const path = require('path');

const FD_BASE = 'https://api.football-data.org/v4';

/** TLA football-data.org → código bandera de la app */
const TLA_TO_CODE = {
  MEX: 'mx', RSA: 'za', KOR: 'kr', CZE: 'cz',
  CAN: 'ca', SUI: 'ch', QAT: 'qa', BIH: 'ba',
  BRA: 'br', MAR: 'ma', HAI: 'ht', SCO: 'gb-sct',
  USA: 'us', PAR: 'py', AUS: 'au', TUR: 'tr',
  GER: 'de', CUW: 'cw', CIV: 'ci', ECU: 'ec',
  NED: 'nl', JPN: 'jp', TUN: 'tn', SWE: 'se',
  BEL: 'be', EGY: 'eg', IRN: 'ir', NZL: 'nz',
  ESP: 'es', CPV: 'cv', KSA: 'sa', URU: 'uy',
  FRA: 'fr', SEN: 'sn', NOR: 'no', IRQ: 'iq',
  ARG: 'ar', ALG: 'dz', AUT: 'at', JOR: 'jo',
  POR: 'pt', COL: 'co', UZB: 'uz', COD: 'cd',
  ENG: 'gb-eng', CRO: 'hr', GHA: 'gh', PAN: 'pa',
  ZAF: 'za'
};

/** Debe coincidir con KO_R32_SEEDS en js/knockout.js */
const KO_R32_PAIRS = [
  ['KO32-1', 'mx', 'ec'], ['KO32-2', 'za', 'ca'], ['KO32-3', 'br', 'jp'], ['KO32-4', 'de', 'py'],
  ['KO32-5', 'us', 'ba'], ['KO32-6', 'ch', 'dz'], ['KO32-7', 'es', 'at'], ['KO32-8', 'fr', 'se'],
  ['KO32-9', 'gb-eng', 'cd'], ['KO32-10', 'co', 'gh'], ['KO32-11', 'pt', 'hr'], ['KO32-12', 'be', 'sn'],
  ['KO32-13', 'ar', 'cv'], ['KO32-14', 'nl', 'ma'], ['KO32-15', 'au', 'eg'], ['KO32-16', 'ci', 'no']
];

function pairKey(a, b) {
  return [a, b].sort().join('|');
}

const PAIR_TO_MATCH_ID = new Map(
  KO_R32_PAIRS.map(([id, home, away]) => [pairKey(home, away), id])
);

const MATCH_ID_TO_PAIR = new Map(
  KO_R32_PAIRS.map(([id, home, away]) => [id, { home, away }])
);

function fdTeamToCode(team) {
  if (!team) return null;
  const tla = (team.tla || '').toUpperCase();
  if (tla && TLA_TO_CODE[tla]) return TLA_TO_CODE[tla];
  const name = (team.shortName || team.name || '').toLowerCase();
  if (name.includes('netherlands') || name.includes('holland')) return 'nl';
  if (name.includes('morocco')) return 'ma';
  return null;
}

function winnerCode(homeCode, awayCode, score) {
  const ft = score.fullTime || score.regularTime || score;
  const h = ft.home;
  const a = ft.away;
  if (h == null || a == null) return null;
  if (h > a) return homeCode;
  if (a > h) return awayCode;
  const pens = score.penalties;
  if (pens && pens.home != null && pens.away != null) {
    if (pens.home > pens.away) return homeCode;
    if (pens.away > pens.home) return awayCode;
  }
  if (score.winner === 'HOME_TEAM') return homeCode;
  if (score.winner === 'AWAY_TEAM') return awayCode;
  return null;
}

function mapFdMatchToPorra(fdMatch) {
  const status = fdMatch.status;
  if (status !== 'FINISHED') return null;
  const homeCode = fdTeamToCode(fdMatch.homeTeam);
  const awayCode = fdTeamToCode(fdMatch.awayTeam);
  if (!homeCode || !awayCode) return null;
  const matchId = PAIR_TO_MATCH_ID.get(pairKey(homeCode, awayCode));
  if (!matchId) return null;
  const ft = fdMatch.score.fullTime;
  if (!ft || ft.home == null || ft.away == null) return null;
  const result = { home: ft.home, away: ft.away };
  const w = winnerCode(homeCode, awayCode, fdMatch.score);
  if (w) result.winner = w;
  return {
    matchId,
    homeCode,
    awayCode,
    result,
    fdId: fdMatch.id,
    utcDate: fdMatch.utcDate
  };
}

async function fetchFootballDataMatches(token, opts = {}) {
  const params = new URLSearchParams({ season: '2026', stage: 'LAST_32' });
  if (opts.status) params.set('status', opts.status);
  const url = `${FD_BASE}/competitions/WC/matches?${params}`;
  const res = await fetch(url, {
    headers: { 'X-Auth-Token': token, 'User-Agent': 'Porra-Mundial-2026/1.0' }
  });
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(`football-data.org HTTP ${res.status}: ${text.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  return JSON.parse(text);
}

async function fetchKoUpdatesFromFootballData(token) {
  const data = await fetchFootballDataMatches(token);
  const updates = {};
  const details = [];
  for (const m of data.matches || []) {
    const mapped = mapFdMatchToPorra(m);
    if (!mapped) continue;
    updates[mapped.matchId] = mapped.result;
    details.push(mapped);
  }
  return { updates, details, rawCount: (data.matches || []).length };
}

function findScheduledMatch(token, homeCode, awayCode) {
  return fetchFootballDataMatches(token).then(data => {
    const key = pairKey(homeCode, awayCode);
    for (const m of data.matches || []) {
      const h = fdTeamToCode(m.homeTeam);
      const a = fdTeamToCode(m.awayTeam);
      if (pairKey(h, a) === key) {
        return {
          status: m.status,
          utcDate: m.utcDate,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          score: m.score,
          mapped: mapFdMatchToPorra(m)
        };
      }
    }
    return null;
  });
}

function mergeIntoResults(base, updates) {
  const out = Object.assign({}, base);
  Object.keys(updates).forEach(id => {
    out[id] = updates[id];
  });
  return out;
}

function readLocalResults(root) {
  const p = path.join(root, 'results.json');
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return {};
  }
}

function writeLocalResults(root, data) {
  const p = path.join(root, 'results.json');
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}

module.exports = {
  TLA_TO_CODE,
  KO_R32_PAIRS,
  MATCH_ID_TO_PAIR,
  fdTeamToCode,
  mapFdMatchToPorra,
  fetchKoUpdatesFromFootballData,
  findScheduledMatch,
  mergeIntoResults,
  readLocalResults,
  writeLocalResults
};
