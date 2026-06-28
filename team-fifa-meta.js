/* FIFA WC26 — fair play (TCS) y ranking FIFA (jun 2026) para desempates entre terceros */
(function () {
  /** Team conduct score: mayor es mejor (amarilla −1, roja indirecta −3, directa −4, amarilla+directa −5). */
  const TEAM_CONDUCT = {
    cd: -5, se: -5, gh: -3, ec: -5, ba: -10, py: -12, sn: 0,
    ir: -6, kr: -4, dz: -3, 'gb-sct': -5, uy: -3
  };

  /** FIFA/Coca-Cola ranking (11 jun 2026); menor número = mejor posición. */
  const TEAM_FIFA_RANK = {
    mx: 14, za: 60, kr: 25, cz: 40,
    ca: 30, ch: 19, qa: 56, ba: 64,
    br: 6, ma: 7, ht: 83, 'gb-sct': 42,
    us: 17, py: 41, au: 27, tr: 22,
    de: 10, cw: 82, ci: 33, ec: 23,
    nl: 8, jp: 18, tn: 45, se: 38,
    be: 9, eg: 29, ir: 20, nz: 85,
    es: 2, cv: 67, sa: 61, uy: 16,
    fr: 3, sn: 15, no: 31, iq: 57,
    ar: 1, dz: 28, at: 24, jo: 63,
    pt: 5, co: 13, uz: 50, cd: 46,
    'gb-eng': 4, hr: 11, gh: 73, pa: 34
  };

  function getTeamConductScore(code) {
    return Object.prototype.hasOwnProperty.call(TEAM_CONDUCT, code) ? TEAM_CONDUCT[code] : 0;
  }

  function getTeamFifaRank(code) {
    return Object.prototype.hasOwnProperty.call(TEAM_FIFA_RANK, code) ? TEAM_FIFA_RANK[code] : 9999;
  }

  /** Criterios FIFA para los 8 mejores terceros: pts → DG → GF → fair play → ranking FIFA. */
  function compareThirdPlaceEntry(a, b) {
    return b.p - a.p
      || b.gd - a.gd
      || b.gf - a.gf
      || getTeamConductScore(b.code) - getTeamConductScore(a.code)
      || getTeamFifaRank(a.code) - getTeamFifaRank(b.code)
      || (a.name || '').localeCompare(b.name || '', 'es');
  }

  window.getTeamConductScore = getTeamConductScore;
  window.getTeamFifaRank = getTeamFifaRank;
  window.compareThirdPlaceEntry = compareThirdPlaceEntry;
})();
