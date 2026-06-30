/**
 * GET /api/results — results.json + dieciseisavos FINISHED desde football-data.org
 * Env en Vercel: FOOTBALL_DATA_TOKEN
 */
const path = require('path');
const {
  fetchKoUpdatesFromFootballData,
  mergeIntoResults,
  readLocalResults
} = require('../scripts/lib/football-data-sync.cjs');

const ROOT = path.join(__dirname, '..');

/** En Vercel el fs del serverless no ve results.json; require o fetch estático. */
async function loadBaseResults(req) {
  try {
    const bundled = require('../results.json');
    if (bundled && Object.keys(bundled).length) return bundled;
  } catch (e) { /* no empaquetado */ }

  const local = readLocalResults(ROOT);
  if (local && Object.keys(local).length) return local;

  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const res = await fetch(`${proto}://${host}/results.json`, {
      headers: { 'User-Agent': 'Porra-Mundial-2026/api-results' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object' && Object.keys(data).length) return data;
    }
  } catch (e) { /* siguiente intento */ }

  return {};
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end('Method not allowed');
    return;
  }

  let base = await loadBaseResults(req);
  let meta = { source: 'results.json', synced: [], footballData: false };

  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (token) {
    try {
      const { updates, details } = await fetchKoUpdatesFromFootballData(token);
      base = mergeIntoResults(base, updates);
      meta.footballData = true;
      meta.synced = details.map(d => ({
        id: d.matchId,
        home: d.homeCode,
        away: d.awayCode,
        score: `${d.result.home}-${d.result.away}`,
        winner: d.result.winner || null
      }));
    } catch (e) {
      meta.footballDataError = e.message;
    }
  } else {
    meta.footballDataHint = 'Define FOOTBALL_DATA_TOKEN en Vercel para auto-sync';
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  if (meta.footballData) {
    res.setHeader('X-Porra-Football-Data', 'synced');
  }
  res.statusCode = 200;
  res.end(JSON.stringify(base));
};
