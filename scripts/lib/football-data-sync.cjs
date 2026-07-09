/**
 * Sincroniza eliminatorias desde football-data.org → IDs de la porra (KO32/16/8).
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

const KO_R16_FEEDERS = [
  [3, 7], [1, 13], [2, 15], [0, 8], [10, 6], [4, 11], [12, 14], [5, 9]
];

const KO_R8_FEEDERS = [
  [0, 1], [4, 5], [2, 3], [6, 7]
];

const KO_R4_FEEDERS = [
  [0, 1], [2, 3]
];

const KO_R16_SLOT_IDS = Array.from({ length: 8 }, (_, i) => 'KO16-' + (i + 1));
const KO_R8_SLOT_IDS = Array.from({ length: 4 }, (_, i) => 'KO8-' + (i + 1));
const KO_R4_SLOT_IDS = Array.from({ length: 2 }, (_, i) => 'KO4-' + (i + 1));

const FD_STAGES = {
  r32: 'LAST_32',
  r16: 'LAST_16',
  r8: 'QUARTER_FINALS',
  r4: 'SEMI_FINALS'
};

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

function winnerFromStoredResult(results, matchId, homeCode, awayCode) {
  const r = results[matchId];
  if (!r || r.home == null || r.away == null || r.home === '' || r.away === '') return null;
  const h = parseInt(r.home, 10);
  const a = parseInt(r.away, 10);
  if (isNaN(h) || isNaN(a)) return null;
  if (r.winner && r.winner !== 'tbd') return r.winner;
  if (h > a) return homeCode;
  if (a > h) return awayCode;
  return null;
}

function buildBracketSlots(results) {
  const fixtures = (results && results._fixtures) || {};
  const r16 = KO_R16_FEEDERS.map((feeders, i) => {
    const id = 'KO16-' + (i + 1);
    const fx = fixtures[id];
    if (fx && fx.home && fx.away) {
      return { id, home: fx.home, away: fx.away };
    }
    const hIdx = feeders[0];
    const aIdx = feeders[1];
    const hPair = KO_R32_PAIRS[hIdx];
    const aPair = KO_R32_PAIRS[aIdx];
    return {
      id,
      home: winnerFromStoredResult(results, hPair[0], hPair[1], hPair[2]),
      away: winnerFromStoredResult(results, aPair[0], aPair[1], aPair[2])
    };
  });

  const r8 = KO_R8_FEEDERS.map((feeders, i) => {
    const id = 'KO8-' + (i + 1);
    const fx = fixtures[id];
    if (fx && fx.home && fx.away) {
      return { id, home: fx.home, away: fx.away };
    }
    const hSlot = r16[feeders[0]];
    const aSlot = r16[feeders[1]];
    return {
      id,
      home: hSlot && hSlot.home && hSlot.away
        ? winnerFromStoredResult(results, hSlot.id, hSlot.home, hSlot.away)
        : null,
      away: aSlot && aSlot.home && aSlot.away
        ? winnerFromStoredResult(results, aSlot.id, aSlot.home, aSlot.away)
        : null
    };
  });

  const r4 = KO_R4_FEEDERS.map((feeders, i) => {
    const id = 'KO4-' + (i + 1);
    const fx = fixtures[id];
    if (fx && fx.home && fx.away) {
      return { id, home: fx.home, away: fx.away };
    }
    const hSlot = r8[feeders[0]];
    const aSlot = r8[feeders[1]];
    return {
      id,
      home: hSlot && hSlot.home && hSlot.away
        ? winnerFromStoredResult(results, hSlot.id, hSlot.home, hSlot.away)
        : null,
      away: aSlot && aSlot.home && aSlot.away
        ? winnerFromStoredResult(results, aSlot.id, aSlot.home, aSlot.away)
        : null
    };
  });

  return { r16, r8, r4 };
}

function mapFdMatchToFixture(fdMatch, slots) {
  const homeCode = fdTeamToCode(fdMatch.homeTeam);
  const awayCode = fdTeamToCode(fdMatch.awayTeam);
  if (!homeCode || !awayCode) return null;
  const key = pairKey(homeCode, awayCode);
  const slot = slots.find(s => s.home && s.away && s.home !== 'tbd' && s.away !== 'tbd'
    && pairKey(s.home, s.away) === key);
  if (slot) return { matchId: slot.id, home: homeCode, away: awayCode };
  const loose = slots.find(s => pairKey(s.home || homeCode, s.away || awayCode) === key);
  if (loose) return { matchId: loose.id, home: homeCode, away: awayCode };
  return null;
}

function mapFdMatchesByScheduleOrder(fdMatches, slotIds) {
  const ordered = (fdMatches || [])
    .filter(m => fdTeamToCode(m.homeTeam) && fdTeamToCode(m.awayTeam))
    .sort((a, b) => String(a.utcDate || '').localeCompare(String(b.utcDate || '')));
  const fixtures = {};
  ordered.forEach((m, i) => {
    if (i >= slotIds.length) return;
    fixtures[slotIds[i]] = {
      home: fdTeamToCode(m.homeTeam),
      away: fdTeamToCode(m.awayTeam)
    };
  });
  return fixtures;
}

function enrichSlotsWithFixtures(slots, fixtures) {
  return slots.map(s => {
    const fx = fixtures && fixtures[s.id];
    if (fx && fx.home && fx.away) {
      return { id: s.id, home: fx.home, away: fx.away };
    }
    return s;
  });
}

function mergeFixtureMaps(...maps) {
  return Object.assign({}, ...maps);
}

async function fetchStageFixtures(token, stageKey, slots, slotIds) {
  const fdStage = FD_STAGES[stageKey];
  if (!fdStage || !slotIds.length) return {};
  const data = await fetchFootballDataMatches(token, { stage: fdStage });
  const matches = data.matches || [];
  const byPair = {};
  matches.forEach(m => {
    const mapped = mapFdMatchToFixture(m, slots);
    if (mapped) byPair[mapped.matchId] = { home: mapped.home, away: mapped.away };
  });
  const remainingIds = slotIds.filter(id => !byPair[id]);
  const remainingMatches = matches.filter(m => {
    const mapped = mapFdMatchToFixture(m, slots);
    return !mapped || !byPair[mapped.matchId];
  });
  const byDate = mapFdMatchesByScheduleOrder(remainingMatches, remainingIds);
  return mergeFixtureMaps(byDate, byPair);
}

function mapFdMatchToPorraSlot(fdMatch, slots) {
  const status = fdMatch.status;
  if (status !== 'FINISHED') return null;
  const homeCode = fdTeamToCode(fdMatch.homeTeam);
  const awayCode = fdTeamToCode(fdMatch.awayTeam);
  if (!homeCode || !awayCode) return null;
  const key = pairKey(homeCode, awayCode);
  let slot = slots.find(s => s.home && s.away && s.home !== 'tbd' && s.away !== 'tbd'
    && pairKey(s.home, s.away) === key);
  if (!slot) {
    slot = slots.find(s => pairKey(s.home || homeCode, s.away || awayCode) === key);
  }
  if (!slot) return null;
  const ft = fdMatch.score.fullTime;
  if (!ft || ft.home == null || ft.away == null) return null;
  const result = { home: ft.home, away: ft.away };
  const w = winnerCode(homeCode, awayCode, fdMatch.score);
  if (w) result.winner = w;
  return {
    matchId: slot.id,
    homeCode,
    awayCode,
    result,
    fdId: fdMatch.id,
    utcDate: fdMatch.utcDate
  };
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
  const params = new URLSearchParams({ season: '2026', stage: opts.stage || 'LAST_32' });
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

async function fetchStageUpdates(token, stageKey, slots, fixtures) {
  const fdStage = FD_STAGES[stageKey];
  if (!fdStage) return { updates: {}, details: [], rawCount: 0, stage: stageKey };
  const data = await fetchFootballDataMatches(token, { stage: fdStage });
  const mapSlots = enrichSlotsWithFixtures(slots, fixtures);
  const slotIds = stageKey === 'r16' ? KO_R16_SLOT_IDS
    : stageKey === 'r8' ? KO_R8_SLOT_IDS
      : stageKey === 'r4' ? KO_R4_SLOT_IDS
        : [];
  const updates = {};
  const details = [];
  for (const m of data.matches || []) {
    const mapped = stageKey === 'r32'
      ? mapFdMatchToPorra(m)
      : mapFdMatchToPorraSlot(m, mapSlots);
    if (!mapped) continue;
    updates[mapped.matchId] = mapped.result;
    details.push(mapped);
  }
  if (stageKey !== 'r32' && slotIds.length) {
    const usedFdIds = new Set(details.map(d => d.fdId));
    const finished = (data.matches || [])
      .filter(m => m.status === 'FINISHED' && !usedFdIds.has(m.id)
        && fdTeamToCode(m.homeTeam) && fdTeamToCode(m.awayTeam))
      .sort((a, b) => String(a.utcDate || '').localeCompare(String(b.utcDate || '')));
    const remainingIds = slotIds.filter(id => !updates[id]);
    finished.forEach((m, i) => {
      if (i >= remainingIds.length) return;
      const id = remainingIds[i];
      const homeCode = fdTeamToCode(m.homeTeam);
      const awayCode = fdTeamToCode(m.awayTeam);
      const ft = m.score && m.score.fullTime;
      if (!ft || ft.home == null || ft.away == null) return;
      const result = { home: ft.home, away: ft.away };
      const w = winnerCode(homeCode, awayCode, m.score);
      if (w) result.winner = w;
      updates[id] = result;
      details.push({
        matchId: id,
        homeCode,
        awayCode,
        result,
        fdId: m.id,
        utcDate: m.utcDate,
        bySchedule: true
      });
      if (fixtures && !fixtures[id]) {
        fixtures[id] = { home: homeCode, away: awayCode };
      }
    });
  }
  return { updates, details, rawCount: (data.matches || []).length, stage: stageKey };
}

async function fetchKoUpdatesFromFootballData(token, baseResults) {
  const results = baseResults || {};
  const r32 = await fetchStageUpdates(token, 'r32', [], {});
  const mergedAfterR32 = mergeIntoResults(results, r32.updates);
  const bracket = buildBracketSlots(mergedAfterR32);

  const r16Fixtures = await fetchStageFixtures(token, 'r16', bracket.r16, KO_R16_SLOT_IDS);
  const r16 = await fetchStageUpdates(token, 'r16', bracket.r16, r16Fixtures);
  const mergedAfterR16 = mergeIntoResults(mergedAfterR32, r16.updates);
  const bracket2 = buildBracketSlots(mergedAfterR16);

  const r8Fixtures = await fetchStageFixtures(token, 'r8', bracket2.r8, KO_R8_SLOT_IDS);
  const r8 = await fetchStageUpdates(token, 'r8', bracket2.r8, r8Fixtures);
  const mergedAfterR8 = mergeIntoResults(mergedAfterR16, r8.updates);
  const bracket3 = buildBracketSlots(mergedAfterR8);

  const r4Fixtures = await fetchStageFixtures(token, 'r4', bracket3.r4, KO_R4_SLOT_IDS);
  const r4 = await fetchStageUpdates(token, 'r4', bracket3.r4, r4Fixtures);

  const updates = Object.assign({}, r32.updates, r16.updates, r8.updates, r4.updates);
  const details = [].concat(r32.details, r16.details, r8.details, r4.details);
  const fixtures = mergeFixtureMaps(r16Fixtures, r8Fixtures, r4Fixtures);
  const stages = [
    { stage: 'r32', rawCount: r32.rawCount, mapped: r32.details.length },
    { stage: 'r16', rawCount: r16.rawCount, mapped: r16.details.length, fixtures: Object.keys(r16Fixtures).length },
    { stage: 'r8', rawCount: r8.rawCount, mapped: r8.details.length, fixtures: Object.keys(r8Fixtures).length },
    { stage: 'r4', rawCount: r4.rawCount, mapped: r4.details.length, fixtures: Object.keys(r4Fixtures).length }
  ];
  return { updates, details, stages, fixtures };
}

function findScheduledMatch(token, homeCode, awayCode, opts = {}) {
  const stage = opts.stage || 'LAST_32';
  return fetchFootballDataMatches(token, { stage }).then(data => {
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
          mapped: stage === 'LAST_32' ? mapFdMatchToPorra(m) : null
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
  KO_R16_FEEDERS,
  KO_R8_FEEDERS,
  KO_R4_FEEDERS,
  KO_R16_SLOT_IDS,
  KO_R8_SLOT_IDS,
  KO_R4_SLOT_IDS,
  MATCH_ID_TO_PAIR,
  FD_STAGES,
  fdTeamToCode,
  mapFdMatchToPorra,
  mapFdMatchToFixture,
  buildBracketSlots,
  fetchKoUpdatesFromFootballData,
  fetchStageUpdates,
  fetchStageFixtures,
  findScheduledMatch,
  mergeIntoResults,
  readLocalResults,
  writeLocalResults
};
