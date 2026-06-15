/* Eliminatorias — Porra Mundial 2026 */
(function () {
  const KO_PASSWORD = 'Españita';
  const KO_EXTRAS_TOTAL = 7;
  const KO_EXTRAS_LOCK_AT = '2026-06-28T12:00:00+02:00'; // cierre especiales = inicio 1er partido de dieciseisavos
  const KO_ROUND_ORDER = ['r32', 'r16', 'r8', 'r4', 'r2'];

  const PARTICIPANTS = [
    'Enrique Cuevas Garcia',
    'Felipe',
    'Manolin',
    'Jorge',
    'David',
    'Miguel',
    'Carlos',
    'Pablo'
  ];

  const KO_ROUND_OPENS = {
    r32: '2026-07-12T07:00:00+02:00',
    r16: '2026-07-04T07:00:00+02:00',
    r8: '2026-07-09T07:00:00+02:00',
    r4: '2026-07-14T07:00:00+02:00',
    r2: '2026-07-19T07:00:00+02:00'
  };

  const KO_R32_SEEDS = [
    ['mx', 'cz'], ['kr', 'qa'], ['br', 'ch'], ['de', 'cw'],
    ['us', 'au'], ['ca', 'ma'], ['es', 'uy'], ['fr', 'ar'],
    ['gb-eng', 'hr'], ['pt', 'co'], ['nl', 'jp'], ['be', 'eg'],
    ['at', 'jo'], ['dz', 'uz'], ['sn', 'no'], ['gh', 'pa']
  ];

  const R32_META = [
    { date: 'Sáb 28 Jun', hour: '12:00', venue: 'SoFi Stadium, Los Ángeles' },
    { date: 'Dom 29 Jun', hour: '16:30', venue: 'Gillette Stadium, Boston' },
    { date: 'Dom 29 Jun', hour: '19:00', venue: 'Estadio BBVA, Monterrey' },
    { date: 'Dom 29 Jun', hour: '12:00', venue: 'NRG Stadium, Houston' },
    { date: 'Lun 30 Jun', hour: '17:00', venue: 'MetLife Stadium, Nueva York' },
    { date: 'Lun 30 Jun', hour: '12:00', venue: 'AT&T Stadium, Dallas' },
    { date: 'Lun 30 Jun', hour: '19:00', venue: 'Azteca, Ciudad de México' },
    { date: 'Mar 1 Jul', hour: '12:00', venue: 'Mercedes-Benz, Atlanta' },
    { date: 'Mar 1 Jul', hour: '17:00', venue: "Levi's Stadium, San Francisco" },
    { date: 'Mar 1 Jul', hour: '13:00', venue: 'Lumen Field, Seattle' },
    { date: 'Mié 2 Jul', hour: '19:00', venue: 'BMO Field, Toronto' },
    { date: 'Mié 2 Jul', hour: '12:00', venue: 'SoFi Stadium, Los Ángeles' },
    { date: 'Mié 2 Jul', hour: '20:00', venue: 'BC Place, Vancouver' },
    { date: 'Jue 3 Jul', hour: '18:00', venue: 'Hard Rock Stadium, Miami' },
    { date: 'Jue 3 Jul', hour: '20:30', venue: 'Arrowhead Stadium, Kansas City' },
    { date: 'Jue 3 Jul', hour: '13:00', venue: 'AT&T Stadium, Dallas' }
  ];

  const R16_META = [
    { date: 'Sáb 4 Jul', hour: '17:00', venue: 'Lincoln Financial, Filadelfia' },
    { date: 'Sáb 4 Jul', hour: '12:00', venue: 'NRG Stadium, Houston' },
    { date: 'Dom 5 Jul', hour: '16:00', venue: 'MetLife Stadium, Nueva York' },
    { date: 'Dom 5 Jul', hour: '18:00', venue: 'Azteca, Ciudad de México' },
    { date: 'Lun 6 Jul', hour: '14:00', venue: 'AT&T Stadium, Dallas' },
    { date: 'Lun 6 Jul', hour: '17:00', venue: 'Lumen Field, Seattle' },
    { date: 'Mar 7 Jul', hour: '12:00', venue: 'Mercedes-Benz, Atlanta' },
    { date: 'Mar 7 Jul', hour: '13:00', venue: 'BC Place, Vancouver' }
  ];

  const R8_META = [
    { date: 'Jue 9 Jul', hour: '16:00', venue: 'Gillette Stadium, Boston' },
    { date: 'Vie 10 Jul', hour: '12:00', venue: 'SoFi Stadium, Los Ángeles' },
    { date: 'Sáb 11 Jul', hour: '17:00', venue: 'Hard Rock Stadium, Miami' },
    { date: 'Sáb 11 Jul', hour: '20:00', venue: 'Arrowhead Stadium, Kansas City' }
  ];

  const R4_META = [
    { date: 'Mar 14 Jul', hour: '14:00', venue: 'AT&T Stadium, Dallas' },
    { date: 'Mié 15 Jul', hour: '15:00', venue: 'Mercedes-Benz, Atlanta' }
  ];

  const FINAL_META = { date: 'Dom 19 Jul', hour: '15:00', venue: 'MetLife Stadium, Nueva York' };

  function mkKoMatch(id, home, away, meta) {
    return {
      id,
      home: home || 'tbd',
      away: away || 'tbd',
      date: meta.date,
      hour: meta.hour,
      venue: meta.venue
    };
  }

  const KO_R32_MATCHES = KO_R32_SEEDS.map((pair, i) =>
    mkKoMatch('KO32-' + (i + 1), pair[0], pair[1], R32_META[i])
  );

  const KO_R16_MATCHES = R16_META.map((meta, i) =>
    mkKoMatch('KO16-' + (i + 1), null, null, meta)
  );

  const KO_R8_MATCHES = R8_META.map((meta, i) =>
    mkKoMatch('KO8-' + (i + 1), null, null, meta)
  );

  const KO_R4_MATCHES = R4_META.map((meta, i) =>
    mkKoMatch('KO4-' + (i + 1), null, null, meta)
  );

  const KO_FINAL_MATCHES = [mkKoMatch('KOF-1', null, null, FINAL_META)];

  const KO_ROUNDS = {
    r32: { key: 'r32', label: 'Dieciseisavos', short: '16avos', matches: KO_R32_MATCHES },
    r16: { key: 'r16', label: 'Octavos', short: 'Octavos', matches: KO_R16_MATCHES },
    r8: { key: 'r8', label: 'Cuartos de final', short: 'Cuartos', matches: KO_R8_MATCHES },
    r4: { key: 'r4', label: 'Semifinales', short: 'Semis', matches: KO_R4_MATCHES },
    r2: { key: 'r2', label: 'Final', short: 'Final', matches: KO_FINAL_MATCHES }
  };

  const koMatchMap = new Map();
  KO_ROUND_ORDER.forEach(k => KO_ROUNDS[k].matches.forEach(m => koMatchMap.set(m.id, m)));

  const KO_R32_CODES = new Set();
  KO_R32_SEEDS.forEach(pair => { KO_R32_CODES.add(pair[0]); KO_R32_CODES.add(pair[1]); });

  let koStore = { activeUser: '', users: {} };
  let koMatchClickBound = false;
  let koExtrasClickBound = false;
  let koExtraWarn = '';
  let koActiveExtraSlot = null;

  function emptyUserData() {
    return { picks: {}, extras: normalizeKoExtras({}) };
  }

  function getActiveKoUser() {
    const u = koStore.activeUser;
    return u && PARTICIPANTS.includes(u) ? u : '';
  }

  function ensureUserData(name) {
    if (!name || !PARTICIPANTS.includes(name)) return;
    if (!koStore.users[name]) koStore.users[name] = emptyUserData();
    koStore.users[name].picks = migrateKoPicks(koStore.users[name].picks);
    koStore.users[name].extras = sanitizeKoExtras(koStore.users[name].extras);
  }

  function getActiveKoData() {
    const user = getActiveKoUser();
    if (!user) return emptyUserData();
    ensureUserData(user);
    return koStore.users[user];
  }

  function setActiveKoUser(name) {
    if (!name || !PARTICIPANTS.includes(name)) return;
    koStore.activeUser = name;
    ensureUserData(name);
    saveKnockoutStore();
    renderKnockout();
  }

  function isKnockoutPreviewUnlocked() {
    try {
      return sessionStorage.getItem('porra2026_ko_preview') === '1';
    } catch (e) {
      return false;
    }
  }

  function isKnockoutAccessible() {
    return (typeof isExtrasOpen === 'function' && isExtrasOpen()) || isKnockoutPreviewUnlocked();
  }

  function isKoRoundOpen(key) {
    if (!isKnockoutAccessible()) return false;
    if (key === 'r32' && isKnockoutPreviewUnlocked()) return true;
    return Date.now() >= new Date(KO_ROUND_OPENS[key]).getTime();
  }

  function formatKoOpensAtShort(key) {
    const d = new Date(KO_ROUND_OPENS[key]);
    const date = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' });
    const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });
    return date + ' · ' + time;
  }

  function tryUnlockKnockout(password) {
    if (password !== KO_PASSWORD) return false;
    try {
      sessionStorage.setItem('porra2026_ko_preview', '1');
    } catch (e) { /* */ }
    return true;
  }

  function showKoPasswordModal() {
    const modal = document.getElementById('koPasswordModal');
    if (modal) modal.classList.remove('hidden');
    const inp = document.getElementById('koPasswordInput');
    if (inp) { inp.value = ''; setTimeout(() => inp.focus(), 100); }
  }

  function hideKoPasswordModal() {
    const modal = document.getElementById('koPasswordModal');
    if (modal) modal.classList.add('hidden');
  }

  function submitKoPassword() {
    const inp = document.getElementById('koPasswordInput');
    const err = document.getElementById('koPasswordError');
    if (!inp) return;
    if (tryUnlockKnockout(inp.value.trim())) {
      hideKoPasswordModal();
      if (typeof updatePhaseTabs === 'function') updatePhaseTabs();
      renderKnockout();
      if (typeof switchPhaseTab === 'function') switchPhaseTab('extras');
    } else if (err) {
      err.textContent = 'Contraseña incorrecta. Pista: la selección favorita…';
    }
  }

  function isValidKoPick(pick) {
    return pick === 'home' || pick === 'away';
  }

  function isKoExtrasLocked() {
    return Date.now() >= new Date(KO_EXTRAS_LOCK_AT).getTime();
  }

  function formatKoExtrasLockShort() {
    const d = new Date(KO_EXTRAS_LOCK_AT);
    const date = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' });
    const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });
    return date + ' · ' + time;
  }

  function isKoExtrasEditable() {
    if (!shouldShowKoExtrasSection() || isKoExtrasLocked()) return false;
    return true;
  }

  function shouldShowKoExtrasSection() {
    return isKnockoutAccessible() && isKoRoundOpen('r32');
  }

  function showKoExtraBadges() {
    return isKoExtrasEditable();
  }

  function isMatchReady(m) {
    return !!(m && m.home && m.home !== 'tbd' && m.away && m.away !== 'tbd');
  }

  function getRoundKeyForMatch(matchId) {
    for (const key of KO_ROUND_ORDER) {
      if (KO_ROUNDS[key].matches.some(m => m.id === matchId)) return key;
    }
    return null;
  }

  function migrateKoPicks(picks) {
    if (!picks || typeof picks !== 'object') return {};
    const out = {};
    Object.keys(picks).forEach(id => {
      if (!/^KO(32|16|8|4|F)-/.test(id)) return;
      const p = picks[id];
      if (p === 'home' || p === 'away') out[id] = p;
      else if (p === '1') out[id] = 'home';
      else if (p === '2') out[id] = 'away';
      else if (isValidKoPick(p)) out[id] = p;
    });
    return out;
  }

  function normalizeKoExtras(ex) {
    const out = { semis: ['', '', '', ''], finalists: ['', ''], champion: '' };
    if (!ex || typeof ex !== 'object') return out;
    if (Array.isArray(ex.semis)) ex.semis.forEach((c, i) => { if (i < 4) out.semis[i] = c || ''; });
    if (Array.isArray(ex.finalists)) ex.finalists.forEach((c, i) => { if (i < 2) out.finalists[i] = c || ''; });
    if (ex.champion) out.champion = ex.champion;
    return out;
  }

  function loadKnockoutStore() {
    try {
      const raw = localStorage.getItem('porra2026_knockout');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.users && typeof parsed.users === 'object') {
          koStore = { activeUser: parsed.activeUser || '', users: parsed.users };
        } else if (parsed && (parsed.picks || parsed.extras)) {
          const legacyName = PARTICIPANTS[0];
          koStore = {
            activeUser: legacyName,
            users: {
              [legacyName]: {
                picks: migrateKoPicks(parsed.picks),
                extras: normalizeKoExtras(parsed.extras)
              }
            }
          };
        }
      }
    } catch (e) {
      koStore = { activeUser: '', users: {} };
    }
    if (!koStore.activeUser && PARTICIPANTS.length) koStore.activeUser = PARTICIPANTS[0];
    PARTICIPANTS.forEach(ensureUserData);
  }

  function saveKnockoutStore() {
    try {
      localStorage.setItem('porra2026_knockout', JSON.stringify(koStore));
    } catch (e) { /* */ }
  }

  function teamNameKo(code) {
    if (!code || code === 'tbd') return 'Por definir';
    const t = typeof teamByCode === 'function' ? teamByCode(code) : null;
    return t ? t.name : code.toUpperCase();
  }

  function teamNameKoShort(code, max) {
    max = max || 13;
    const n = teamNameKo(code);
    return n.length > max ? n.slice(0, max - 1) + '…' : n;
  }

  function getKoPick(matchId) {
    const p = getActiveKoData().picks[matchId] || null;
    return isValidKoPick(p) ? p : null;
  }

  function getPlayableMatches() {
    const out = [];
    KO_ROUND_ORDER.forEach(key => {
      if (!isKoRoundOpen(key)) return;
      KO_ROUNDS[key].matches.forEach(m => {
        if (isMatchReady(m)) out.push(m);
      });
    });
    return out;
  }

  function getOpenRounds() {
    return KO_ROUND_ORDER.filter(isKoRoundOpen).map(k => KO_ROUNDS[k]);
  }

  function koMatchesRequired() {
    return getPlayableMatches().length;
  }

  function koMatchesDone() {
    return getPlayableMatches().filter(m => getKoPick(m.id)).length;
  }

  function koExtrasDone() {
    const ex = getActiveKoData().extras;
    let n = ex.semis.filter(Boolean).length + ex.finalists.filter(Boolean).length;
    if (ex.champion) n++;
    return n;
  }

  function isKnockoutComplete() {
    if (!isKnockoutAccessible() || !getActiveKoUser()) return false;
    const req = koMatchesRequired();
    return req > 0 && koMatchesDone() >= req && koExtrasDone() >= KO_EXTRAS_TOTAL;
  }

  function getKoR32TeamsSorted() {
    const seen = new Set();
    const teams = [];
    KO_R32_SEEDS.forEach(pair => {
      pair.forEach(code => {
        if (seen.has(code)) return;
        seen.add(code);
        teams.push({ code, name: teamNameKo(code) });
      });
    });
    return teams.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }

  function isKoR32Team(code) {
    return !!code && KO_R32_CODES.has(code);
  }

  function sanitizeKoExtras(ex) {
    const out = normalizeKoExtras(ex);
    out.semis = out.semis.map(c => (c && isKoR32Team(c) ? c : ''));
    const semiSet = new Set(out.semis.filter(Boolean));
    out.finalists = out.finalists.map(c => (c && semiSet.has(c) ? c : ''));
    const finalSet = new Set(out.finalists.filter(Boolean));
    out.champion = out.champion && finalSet.has(out.champion) ? out.champion : '';
    return out;
  }

  function showKoExtraOnMatch(matchId) {
    return getRoundKeyForMatch(matchId) === 'r32';
  }

  const KO_ROLE_META = {
    semi: { label: 'SEMI', labelPdf: 'SEMI', title: 'Semifinalista', color: '#e9d5ff', bg: 'rgba(147,51,234,.35)', border: '#c084fc' },
    finalist: { label: 'FINAL', labelPdf: 'FINAL', title: 'Finalista', color: '#ffedd5', bg: 'rgba(249,115,22,.35)', border: '#fb923c' },
    champion: { label: 'CAMPEÓN', labelPdf: 'CAMPEON', title: 'Campeón', color: '#fef08a', bg: 'rgba(250,204,21,.35)', border: '#fde047' }
  };

  function koRoleLabel(role, compact) {
    const m = KO_ROLE_META[role];
    if (!m) return '';
    if (role === 'champion' && compact) return 'CAM';
    return m.label;
  }

  function koRoleBadgeHTML(role, size) {
    if (!role || !KO_ROLE_META[role]) return '';
    const m = KO_ROLE_META[role];
    const text = size === 'sm' && role === 'champion' ? 'CAM' : m.label;
    const sz = size || 'md';
    return `<span class="ko-role-badge ko-role-badge--${role} ko-role-badge--${sz}" title="${m.title}">${text}</span>`;
  }

  function koFieldToRole(field) {
    if (field === 'champion') return 'champion';
    if (field === 'finalists') return 'finalist';
    if (field === 'semis') return 'semi';
    return '';
  }

  function getKoExtraRole(code, ex) {
    if (!code || code === 'tbd') return '';
    if (ex.champion === code) return 'champion';
    if (ex.finalists.includes(code)) return 'finalist';
    if (ex.semis.includes(code)) return 'semi';
    return '';
  }

  function getKoExtraBadge(code) {
    if (!showKoExtraBadges() || !code || code === 'tbd') return { badge: '' };
    const ex = getActiveKoData().extras;
    const role = getKoExtraRole(code, ex);
    return { badge: koRoleBadgeHTML(role, 'sm') };
  }

  function getKoSpecialsAlive(picks) {
    const ex = getActiveKoData().extras;
    const alive = new Set();
    const out = new Set();
    getPlayableMatches().forEach(m => {
      if (!isMatchReady(m)) return;
      const pick = picks[m.id];
      if (!isValidKoPick(pick)) return;
      const winner = pick === 'home' ? m.home : m.away;
      const loser = pick === 'home' ? m.away : m.home;
      if (getKoExtraRole(winner, ex)) alive.add(winner);
      if (getKoExtraRole(loser, ex)) out.add(loser);
    });
    out.forEach(c => alive.delete(c));
    return alive;
  }

  function getKoExtraRoleInPicker(code, ex) {
    if (ex.champion === code) return 'champion';
    if (ex.finalists.includes(code)) return 'finalist';
    if (ex.semis.includes(code)) return 'semi';
    return '';
  }

  function koTeamPickBtnHTML(m, side) {
    const code = side === 'home' ? m.home : m.away;
    const pick = getKoPick(m.id);
    const ready = isMatchReady(m);
    if (!ready || !code || code === 'tbd') {
      return `<button type="button" class="ko-team-pick tbd" disabled>Por definir</button>`;
    }
    const data = getActiveKoData();
    const ex = data.extras;
    const showSpecial = showKoExtraOnMatch(m.id);
    const role = showSpecial ? getKoExtraRole(code, ex) : '';
    const cls = ['ko-team-pick'];
    if (pick === side) cls.push('winner');
    else if (pick) cls.push('eliminated');
    if (showSpecial && role === 'champion') cls.push('ko-team-pick--echamp');
    else if (showSpecial && role === 'finalist') cls.push('ko-team-pick--efinal');
    else if (showSpecial && role === 'semi') cls.push('ko-team-pick--esemi');
    const flag = typeof flagHTML === 'function' ? flagHTML(code, 20) : '';
    const extra = showSpecial ? getKoExtraBadge(code).badge : '';
    return `<button type="button" class="${cls.join(' ')}" data-ko-pick-match="${m.id}" data-ko-pick-side="${side}" aria-label="Gana ${teamNameKo(code)}">
      ${flag}<span class="ko-team-name">${teamNameKoShort(code, 15)}</span>${extra}
    </button>`;
  }

  function koChunkMatches(matches) {
    if (matches.length <= 3) return [matches];
    const half = Math.ceil(matches.length / 2);
    return [matches.slice(0, half), matches.slice(half)];
  }

  function koRoundMatchesHTML(matches) {
    const chunks = koChunkMatches(matches);
    if (chunks.length === 1) {
      return `<div class="ko-round-matches">${matches.map(koMatchRowHTML).join('')}</div>`;
    }
    const labels = ['A', 'B'];
    return `<div class="ko-round-matches-grid">${chunks.map((chunk, i) =>
      `<div class="ko-round-col">
        <p class="ko-round-col-label">${labels[i] || i + 1}</p>
        ${chunk.map(koMatchRowHTML).join('')}
      </div>`
    ).join('')}</div>`;
  }

  function koMatchRowHTML(m) {
    const pick = getKoPick(m.id);
    return `<div class="ko-list-match px-3 py-2.5" id="ko-mr-${m.id}">
      <div class="match-meta">
        <span class="text-xs text-gray-500">${m.date}</span>
        <span class="hora-badge">${m.hour}</span>
        <span class="sede-badge">${m.venue}</span>
      </div>
      <div class="ko-list-pair${pick ? ' has-pick' : ''}">
        ${koTeamPickBtnHTML(m, 'home')}
        <span class="ko-vs" aria-hidden="true">vs</span>
        ${koTeamPickBtnHTML(m, 'away')}
      </div>
    </div>`;
  }

  function koRoundCardHTML(round) {
    const playable = round.matches.filter(isMatchReady);
    const done = playable.filter(m => getKoPick(m.id)).length;
    const total = playable.length;
    const allDefined = round.matches.every(isMatchReady);
    const complete = total > 0 && done === total;
  const pendingTeams = !allDefined;
    return `<div class="group-card overflow-hidden ko-round-card${complete ? ' group-complete' : ''}" id="ko-round-${round.key}">
      <div class="group-header px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-2 flex-shrink-0">
          <span class="text-xs font-black text-yellow-300 tracking-widest">RONDA</span>
          <span class="text-2xl font-black text-white">${round.short}</span>
        </div>
        <span class="ko-round-status text-xs text-gray-500">${round.matches.length} partido${round.matches.length === 1 ? '' : 's'} · toca al ganador</span>
      </div>
      <div>${koRoundMatchesHTML(round.matches)}</div>
      <div class="px-4 py-2 bg-gray-900 bg-opacity-50 flex items-center justify-between gap-2 flex-wrap">
        <span class="text-xs text-gray-600">${pendingTeams ? 'Equipos pendientes de clasificación' : 'Quiniela ' + round.label.toLowerCase()}</span>
        <span id="koMatchCount-${round.key}" class="text-yellow-500 font-semibold text-xs">${total ? (complete ? '✓ Completo' : `${done}/${total}`) : '—'}</span>
      </div>
    </div>`;
  }

  function koRoundWaitingHTML(round) {
    return `<div class="ko-round-waiting" id="ko-round-${round.key}">
      <div>
        <p class="ko-round-waiting-title">⏳ ${round.label}</p>
        <p class="ko-round-waiting-hint">Equipos pendientes · ${round.matches.length} partido${round.matches.length === 1 ? '' : 's'}</p>
      </div>
      <span class="ko-round-waiting-badge">Próximamente</span>
    </div>`;
  }

  function koUpcomingRoundsHTML(rounds) {
    if (!rounds.length) return '';
    return `<div class="ko-upcoming-rounds" aria-label="Rondas próximas">
      <p class="ko-upcoming-title">Próximas rondas</p>
      ${rounds.map(r => `<div class="ko-upcoming-row"><span>🔒 ${r.label}</span><span class="ko-upcoming-date">${formatKoOpensAtShort(r.key)}</span></div>`).join('')}
    </div>`;
  }

  function bindKoMatchClicks() {
    if (koMatchClickBound) return;
    const root = document.getElementById('koBracket');
    if (!root) return;
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-ko-pick-match][data-ko-pick-side]');
      if (!btn || btn.disabled) return;
      e.preventDefault();
      pickKoResult(btn.getAttribute('data-ko-pick-match'), btn.getAttribute('data-ko-pick-side'));
      if (btn.blur) btn.blur();
    });
    koMatchClickBound = true;
  }

  function pickKoResult(matchId, side) {
    if (!isKnockoutAccessible() || !getActiveKoUser() || !isValidKoPick(side)) return;
    const m = koMatchMap.get(matchId);
    const rKey = getRoundKeyForMatch(matchId);
    if (!m || !rKey || !isKoRoundOpen(rKey) || !isMatchReady(m)) return;
    const data = getActiveKoData();
    data.picks[matchId] = side;
    saveKnockoutStore();
    renderKoMatchRow(matchId);
    updateKoRoundCounts();
    updateKnockoutStatus();
  }

  function renderKoMatchRow(matchId) {
    const m = koMatchMap.get(matchId);
    const el = document.getElementById('ko-mr-' + matchId);
    if (!m || !el) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = koMatchRowHTML(m);
    el.replaceWith(tmp.firstElementChild);
  }

  function updateKoRoundCounts() {
    getOpenRounds().forEach(round => {
      const el = document.getElementById('koMatchCount-' + round.key);
      const card = document.getElementById('ko-round-' + round.key);
      if (!el) return;
      const playable = round.matches.filter(isMatchReady);
      const done = playable.filter(m => getKoPick(m.id)).length;
      const complete = playable.length > 0 && done === playable.length;
      el.textContent = playable.length ? (complete ? '✓ Completo' : `${done}/${playable.length}`) : '—';
      el.className = complete ? 'text-green-400 font-semibold text-xs' : 'text-yellow-500 font-semibold text-xs';
      if (card) card.classList.toggle('group-complete', complete);
    });
  }

  function clearKnockoutMatches() {
    const user = getActiveKoUser();
    if (!user) {
      alert('Elige un participante antes de limpiar.');
      return;
    }
    if (!confirm(`¿Borrar todos los partidos marcados de ${user}?\n\nLos pronósticos especiales (SEMI, FINAL, CAMPEÓN) no se tocan.`)) {
      return;
    }
    koStore.users[user].picks = {};
    saveKnockoutStore();
    renderKnockoutMatches();
    updateKnockoutStatus();
  }

  function clearKnockoutAll() {
    const user = getActiveKoUser();
    if (!user) {
      alert('Elige un participante antes de limpiar.');
      return;
    }
    if (!confirm(`¿Borrar TODO de ${user}?\n\nSe quitan los partidos Y los especiales (semis, finalistas y campeón).`)) {
      return;
    }
    koActiveExtraSlot = null;
    koExtraWarn = '';
    koStore.users[user] = emptyUserData();
    saveKnockoutStore();
    renderKnockout();
  }

  function clearKnockoutPicks() {
    clearKnockoutAll();
  }

  function renderKnockoutUserBar() {
    const bar = document.getElementById('koPlayerBar');
    const sel = document.getElementById('koUserSelect');
    if (!bar) return;
    if (!isKnockoutAccessible()) {
      bar.classList.add('hidden');
      return;
    }
    bar.classList.remove('hidden');
    if (sel) {
      const active = getActiveKoUser();
      sel.innerHTML = '<option value="">— Elige participante —</option>' +
        PARTICIPANTS.map(n => `<option value="${n.replace(/"/g, '&quot;')}"${n === active ? ' selected' : ''}>${n}</option>`).join('');
    }
  }

  function renderKnockoutMatches() {
    const el = document.getElementById('koBracket');
    if (!el) return;
    bindKoMatchClicks();
    if (!isKnockoutAccessible()) {
      el.innerHTML = `<div class="extras-locked">
        <p class="text-gray-400 text-sm">🔒 Las eliminatorias se abren el <strong class="text-white">12 de julio a las 7:00</strong>.</p>
        <p class="text-xs text-gray-500 mt-2">Modo prueba: pulsa la pestaña e introduce la contraseña.</p>
      </div>`;
      return;
    }
    if (!getActiveKoUser()) {
      el.innerHTML = '<p class="text-yellow-500 text-sm">Elige tu <strong>participante</strong> arriba para marcar la quiniela de eliminatorias.</p>';
      return;
    }

    const parts = [];
    const lockedRounds = [];

    KO_ROUND_ORDER.forEach(key => {
      const round = KO_ROUNDS[key];
      if (!isKoRoundOpen(key)) {
        lockedRounds.push(round);
        return;
      }
      if (round.matches.some(isMatchReady)) {
        parts.push(koRoundCardHTML(round));
      } else {
        parts.push(koRoundWaitingHTML(round));
      }
    });

    if (lockedRounds.length) parts.push(koUpcomingRoundsHTML(lockedRounds));
    el.innerHTML = parts.join('') || '<p class="text-xs text-gray-500 text-center">Todas las rondas se abrirán según el calendario del Mundial.</p>';
    updateKoRoundCounts();
  }

  function isKoExtraDuplicate(ex, field, index, code) {
    if (!code) return false;
    if (field === 'semis') return ex.semis.some((c, i) => c === code && i !== index);
    if (field === 'finalists') return ex.finalists.some((c, i) => c === code && i !== index);
    return false;
  }

  function getUsedExtraCodes(ex, field, activeSlot) {
    const used = new Set();
    if (field === 'semis') ex.semis.filter(Boolean).forEach(c => used.add(c));
    else if (field === 'finalists') ex.finalists.filter(Boolean).forEach(c => used.add(c));
    if (activeSlot && activeSlot.field === field) {
      const cur = field === 'champion' ? ex.champion
        : field === 'finalists' ? ex.finalists[activeSlot.index]
        : ex.semis[activeSlot.index];
      if (cur) used.delete(cur);
    }
    return used;
  }

  function assignKoExtra(field, code) {
    const ex = getActiveKoData().extras;
    let index;
    if (koActiveExtraSlot && koActiveExtraSlot.field === field) {
      index = koActiveExtraSlot.index;
    } else if (field === 'champion') {
      index = 0;
    } else {
      index = ex[field].findIndex(s => !s);
      if (index < 0) {
        koExtraWarn = 'Casillas llenas: toca una casilla para cambiarla y luego el equipo.';
        renderKnockoutExtras();
        return;
      }
    }
    setKoExtra(field, index, code);
    koActiveExtraSlot = null;
  }

  function setKoExtra(field, index, code) {
    if (!isKoExtrasEditable()) return;
    const ex = getActiveKoData().extras;
    if (code) {
      if (field === 'semis' && !isKoR32Team(code)) {
        koExtraWarn = 'Los semifinalistas deben ser uno de los 32 equipos de dieciseisavos.';
        renderKnockoutExtras();
        return;
      }
      if (field === 'finalists') {
        const semis = ex.semis.filter(Boolean);
        if (semis.length < 4) {
          koExtraWarn = 'Primero completa los 4 semifinalistas.';
          renderKnockoutExtras();
          return;
        }
        if (!semis.includes(code)) {
          koExtraWarn = 'Los finalistas solo pueden ser de tus 4 semifinalistas.';
          renderKnockoutExtras();
          return;
        }
      }
      if (field === 'champion') {
        const finals = ex.finalists.filter(Boolean);
        if (finals.length < 2) {
          koExtraWarn = 'Primero completa los 2 finalistas.';
          renderKnockoutExtras();
          return;
        }
        if (!finals.includes(code)) {
          koExtraWarn = 'El campeón solo puede ser uno de tus 2 finalistas.';
          renderKnockoutExtras();
          return;
        }
      }
      if (isKoExtraDuplicate(ex, field, index, code)) {
        koExtraWarn = 'Ese equipo ya está en otra casilla. Elige uno distinto.';
        renderKnockoutExtras();
        return;
      }
    }
    koExtraWarn = '';
    if (field === 'champion') ex.champion = code;
    else if (field === 'semis') ex.semis[index] = code;
    else if (field === 'finalists') ex.finalists[index] = code;
    getActiveKoData().extras = sanitizeKoExtras(ex);
    saveKnockoutStore();
    renderKnockoutExtras();
    renderKnockoutMatches();
    updateKnockoutStatus();
  }

  function koExtrasReadOnlyChip(code, role) {
    const flag = typeof flagHTML === 'function' ? flagHTML(code, 28) : '';
    return `<div class="ko-extra-readonly-chip ko-extra-readonly-chip--${role}">
      ${koRoleBadgeHTML(role, 'md')}
      <span class="ko-extra-readonly-flag">${flag}</span>
      <span class="ko-extra-readonly-name">${teamNameKo(code)}</span>
    </div>`;
  }

  function koExtrasSummaryHTML(ex) {
    const complete = koExtrasDone() >= KO_EXTRAS_TOTAL;
    const msg = complete
      ? '🔒 Pronósticos especiales cerrados — ya empezaron los dieciseisavos.'
      : '🔒 Plazo cerrado — faltan pronósticos especiales y ya no se pueden marcar.';
    return `
      <p class="ko-extras-done-msg">${msg}</p>
      <div class="ko-extras-summary">
        <p class="ko-extras-summary-label">Semifinalistas</p>
        <div class="ko-extras-summary-row">${ex.semis.filter(Boolean).map(c => koExtrasReadOnlyChip(c, 'semi')).join('')}</div>
        <p class="ko-extras-summary-label">Finalistas</p>
        <div class="ko-extras-summary-row">${ex.finalists.filter(Boolean).map(c => koExtrasReadOnlyChip(c, 'finalist')).join('')}</div>
        <p class="ko-extras-summary-label">Campeón</p>
        <div class="ko-extras-summary-row">${ex.champion ? koExtrasReadOnlyChip(ex.champion, 'champion') : ''}</div>
      </div>`;
  }

  function koExtrasEditorHTML(ex) {
    const done = koExtrasDone();
    const pct = Math.round((done / KO_EXTRAS_TOTAL) * 100);
    const semisFull = ex.semis.filter(Boolean).length >= 4;
    const finalsFull = ex.finalists.filter(Boolean).length >= 2;
    return `
      ${koExtraWarn ? `<p class="ko-extra-warn" role="alert">${koExtraWarn}</p>` : ''}
      <p class="ko-extras-deadline-hint">Puedes cambiarlos hasta el <strong>${formatKoExtrasLockShort()}</strong> (inicio de dieciseisavos).</p>
      <div class="ko-extras-progress-wrap">
        <div class="ko-extras-progress"><div class="ko-extras-progress-fill" style="width:${pct}%"></div></div>
        <span class="ko-extras-progress-label">${done}/${KO_EXTRAS_TOTAL} completados</span>
      </div>
      <div class="ko-color-key" aria-label="Colores de pronósticos especiales">
        <div class="ko-color-key-item ko-color-key-item--semi">${koRoleBadgeHTML('semi', 'md')} Semifinalista</div>
        <div class="ko-color-key-item ko-color-key-item--final">${koRoleBadgeHTML('finalist', 'md')} Finalista</div>
        <div class="ko-color-key-item ko-color-key-item--champ">${koRoleBadgeHTML('champion', 'md')} Campeón</div>
      </div>
      <div class="ko-r32-picker-legend">
        <span class="ko-legend-item">${koRoleBadgeHTML('semi', 'md')} Semifinalista</span>
        <span class="ko-legend-item">${koRoleBadgeHTML('finalist', 'md')} Finalista</span>
        <span class="ko-legend-item">${koRoleBadgeHTML('champion', 'md')} Campeón</span>
      </div>
      <section class="ko-extras-step ko-extras-step--semi">
        <h4 class="ko-extras-step-title"><span class="ko-extras-step-badge ko-extras-step-badge--semi">1</span>4 semifinalistas</h4>
        <p class="ko-extras-step-hint">Elige 4 equipos distintos de dieciseisavos</p>
        <div class="ko-extras-row ko-extras-row--4">
          ${ex.semis.map((s, i) => koExtraSlotHTML('semis', i, s, 'SF ' + (i + 1))).join('')}
        </div>
        ${koSectionPickerHTML('semis')}
      </section>
      <section class="ko-extras-step ko-extras-step--final${semisFull ? '' : ' ko-extras-step--locked'}">
        <h4 class="ko-extras-step-title"><span class="ko-extras-step-badge ko-extras-step-badge--final">2</span>2 finalistas</h4>
        <p class="ko-extras-step-hint">Solo de tus 4 semifinalistas</p>
        <div class="ko-extras-row ko-extras-row--2">
          ${ex.finalists.map((s, i) => koExtraSlotHTML('finalists', i, s, 'Final ' + (i + 1))).join('')}
        </div>
        ${koSectionPickerHTML('finalists')}
      </section>
      <section class="ko-extras-step ko-extras-step--champion${finalsFull ? '' : ' ko-extras-step--locked'}">
        <h4 class="ko-extras-step-title"><span class="ko-extras-step-badge ko-extras-step-badge--gold">3</span>Campeón del mundo</h4>
        <p class="ko-extras-step-hint">Solo de tus 2 finalistas</p>
        <div class="ko-champion-stage">
          <div class="ko-final-podium">
            <img src="/assets/wc2026-logo.png" class="ko-final-trophy" alt="" onerror="this.src='/assets/wc-trophy.svg'"/>
            <p class="ko-champion-name" id="koChampionDisplay">${ex.champion ? teamNameKo(ex.champion) : '—'}</p>
            <div class="ko-champion-pick">${koExtraSlotHTML('champion', 0, ex.champion, 'Campeón')}</div>
          </div>
        </div>
        ${koSectionPickerHTML('champion')}
      </section>`;
  }

  function koExtraSlotHTML(field, index, selected, label) {
    const filled = !!selected;
    const isActive = koActiveExtraSlot && koActiveExtraSlot.field === field && koActiveExtraSlot.index === index;
    const flag = filled && typeof flagHTML === 'function'
      ? flagHTML(selected, 32)
      : '<span class="ko-extra-plus" aria-hidden="true">+</span>';
    const name = filled ? teamNameKo(selected) : 'Vacío';
    let roleBadge = '';
    if (filled) roleBadge = koRoleBadgeHTML(koFieldToRole(field), 'md');
    return `<div class="ko-extra-slot${filled ? ' ko-extra-slot--filled' : ''}${isActive ? ' ko-extra-slot--active' : ''} ko-extra-slot--${field}">
      <span class="ko-extra-slot-num">${label}</span>
      <button type="button" class="ko-extra-slot-card" data-ko-extra-slot data-ko-extra-field="${field}" data-ko-extra-index="${index}" aria-pressed="${isActive}">
        ${roleBadge ? `<span class="ko-extra-slot-badge">${roleBadge}</span>` : ''}
        <span class="ko-extra-slot-flag">${flag}</span>
        <span class="ko-extra-slot-name">${name}</span>
        ${filled ? `<span class="ko-extra-clear" data-ko-extra-clear data-ko-extra-field="${field}" data-ko-extra-index="${index}" role="button" aria-label="Quitar equipo">×</span>` : ''}
      </button>
    </div>`;
  }

  function koPickerTeamBtn(code, field, ex, used) {
    const role = getKoExtraRoleInPicker(code, ex);
    const taken = used.has(code);
    const cls = ['ko-r32-pick'];
    if (role === 'semi') cls.push('ko-r32-pick--semi');
    if (role === 'finalist') cls.push('ko-r32-pick--final');
    if (role === 'champion') cls.push('ko-r32-pick--champ');
    if (taken) cls.push('ko-r32-pick--taken');
    const badge = koRoleBadgeHTML(role, 'sm');
    const flag = typeof flagHTML === 'function' ? flagHTML(code, field === 'semis' ? 24 : 32) : '';
    return `<button type="button" class="${cls.join(' ')}" data-ko-pick-code="${code}" data-ko-picker-field="${field}"${taken ? ' disabled' : ''} aria-label="${teamNameKo(code)}">
      ${badge ? `<span class="ko-r32-pick-badge">${badge}</span>` : ''}
      ${flag}
      <span class="ko-r32-pick-name">${teamNameKoShort(code, field === 'semis' ? 11 : 14)}</span>
    </button>`;
  }

  function koSectionPickerHTML(field) {
    const ex = getActiveKoData().extras;
    const used = getUsedExtraCodes(ex, field, koActiveExtraSlot);
    let teams = [];
    let hint = '';
    if (field === 'semis') {
      teams = getKoR32TeamsSorted();
      const n = ex.semis.filter(Boolean).length;
      if (koActiveExtraSlot && koActiveExtraSlot.field === 'semis') {
        hint = `Elige equipo para <strong>SF ${koActiveExtraSlot.index + 1}</strong> (32 de dieciseisavos)`;
      } else if (n < 4) {
        hint = `Toca un equipo → se asigna a SF ${n + 1}. O toca una casilla para elegir cuál cambiar.`;
      } else {
        hint = 'Las 4 casillas están llenas. Toca una casilla para cambiarla.';
      }
    } else if (field === 'finalists') {
      const semis = ex.semis.filter(Boolean);
      if (semis.length < 4) {
        return `<p class="ko-section-locked">🔒 Completa los <strong>4 semifinalistas</strong> para desbloquear los finalistas.</p>`;
      }
      teams = semis.map(code => ({ code, name: teamNameKo(code) }));
      const n = ex.finalists.filter(Boolean).length;
      hint = koActiveExtraSlot && koActiveExtraSlot.field === 'finalists'
        ? `Elige uno de tus semifinalistas para <strong>Final ${koActiveExtraSlot.index + 1}</strong>`
        : (n < 2 ? `Solo tus 4 semifinalistas · toca uno para Final ${n + 1}` : 'Toca una casilla de finalista para cambiarla.');
    } else if (field === 'champion') {
      const finals = ex.finalists.filter(Boolean);
      if (finals.length < 2) {
        return `<p class="ko-section-locked">🔒 Completa los <strong>2 finalistas</strong> para elegir campeón.</p>`;
      }
      teams = finals.map(code => ({ code, name: teamNameKo(code) }));
      hint = koActiveExtraSlot && koActiveExtraSlot.field === 'champion'
        ? 'Elige campeón entre tus 2 finalistas'
        : 'Toca uno de tus finalistas para ser <strong>campeón</strong>';
    }
    return `<div class="ko-section-picker" data-ko-picker-field="${field}">
      <p class="ko-section-picker-hint">${hint}</p>
      <div class="ko-section-picker-grid ko-section-picker-grid--${field}" role="listbox">
        ${teams.map(t => koPickerTeamBtn(t.code, field, ex, used)).join('')}
      </div>
    </div>`;
  }

  function bindKoExtrasClicks() {
    if (koExtrasClickBound) return;
    const root = document.getElementById('koExtrasGrid');
    if (!root) return;
    root.addEventListener('click', (e) => {
      const clearEl = e.target.closest('[data-ko-extra-clear]');
      if (clearEl) {
        e.preventDefault();
        e.stopPropagation();
        setKoExtra(clearEl.getAttribute('data-ko-extra-field'), parseInt(clearEl.getAttribute('data-ko-extra-index'), 10), '');
        koActiveExtraSlot = null;
        return;
      }
      const slotBtn = e.target.closest('[data-ko-extra-slot]');
      if (slotBtn) {
        e.preventDefault();
        const field = slotBtn.getAttribute('data-ko-extra-field');
        const index = parseInt(slotBtn.getAttribute('data-ko-extra-index'), 10);
        if (field === 'finalists' && getActiveKoData().extras.semis.filter(Boolean).length < 4) return;
        if (field === 'champion' && getActiveKoData().extras.finalists.filter(Boolean).length < 2) return;
        koActiveExtraSlot = { field, index };
        koExtraWarn = '';
        renderKnockoutExtras();
        return;
      }
      const pickBtn = e.target.closest('[data-ko-pick-code][data-ko-picker-field]');
      if (!pickBtn || pickBtn.disabled) return;
      e.preventDefault();
      assignKoExtra(pickBtn.getAttribute('data-ko-picker-field'), pickBtn.getAttribute('data-ko-pick-code'));
    });
    koExtrasClickBound = true;
  }

  function renderKnockoutExtras() {
    const section = document.getElementById('koExtrasSection');
    const grid = document.getElementById('koExtrasGrid');
    if (!grid) return;
    if (!shouldShowKoExtrasSection()) {
      if (section) section.classList.add('hidden');
      koActiveExtraSlot = null;
      koExtraWarn = '';
      grid.innerHTML = '';
      return;
    }
    if (section) section.classList.remove('hidden');
    const ex = getActiveKoData().extras;
    if (isKoExtrasEditable()) {
      bindKoExtrasClicks();
      grid.innerHTML = koExtrasEditorHTML(ex);
    } else {
      koActiveExtraSlot = null;
      koExtraWarn = '';
      grid.innerHTML = koExtrasSummaryHTML(ex);
    }
  }

  function updateKnockoutStatus() {
    const st = document.getElementById('koStatus');
    const btn = document.getElementById('btnExportKo');
    if (!st || !isKnockoutAccessible()) return;
    const md = koMatchesDone();
    const req = koMatchesRequired();
    const ed = koExtrasDone();
    const complete = isKnockoutComplete();
    if (!getActiveKoUser()) {
      st.textContent = 'Elige un participante arriba para empezar.';
    } else if (complete) {
      st.textContent = '✓ Eliminatorias al día — puedes exportar el PDF';
    } else if (isKoExtrasLocked() && ed < KO_EXTRAS_TOTAL) {
      st.textContent = `Partidos (${req} activos): ${md}/${req} · Especiales cerrados (${ed}/${KO_EXTRAS_TOTAL})`;
    } else {
      st.textContent = `Partidos (${req} activos): ${md}/${req} · Especiales: ${ed}/${KO_EXTRAS_TOTAL}`;
    }
    st.className = complete
      ? 'text-xs text-green-400 font-medium mt-3'
      : 'text-xs text-yellow-500 font-medium mt-3';
    if (btn) {
      btn.classList.toggle('is-locked', !complete);
      btn.setAttribute('aria-disabled', complete ? 'false' : 'true');
    }
    const clearBtn = document.getElementById('btnClearKo');
    const clearMatchesBtn = document.getElementById('btnClearKoMatches');
    const canClear = !!getActiveKoUser();
    [clearBtn, clearMatchesBtn].forEach(btn => {
      if (!btn) return;
      btn.disabled = !canClear;
      btn.style.opacity = canClear ? '1' : '.45';
      btn.style.pointerEvents = canClear ? '' : 'none';
    });
    const champEl = document.getElementById('koChampionDisplay');
    if (champEl) {
      champEl.textContent = getActiveKoData().extras.champion ? teamNameKo(getActiveKoData().extras.champion) : '—';
    }
  }

  function renderKnockout() {
    loadKnockoutStore();
    const preview = document.getElementById('koPreviewBadge');
    if (preview) preview.classList.toggle('hidden', !isKnockoutPreviewUnlocked() || (typeof isExtrasOpen === 'function' && isExtrasOpen()));
    const subtitle = document.getElementById('koSubtitle');
    if (subtitle) {
      subtitle.textContent = isKnockoutAccessible()
        ? 'Elige participante · especiales hasta dieciseisavos · toca al ganador en cada partido.'
        : 'Se abrirá el 12 de julio a las 7:00 (hora peninsular). Modo prueba con contraseña.';
    }
    renderKnockoutUserBar();
    renderKnockoutExtras();
    renderKnockoutMatches();
    updateKnockoutStatus();
  }

  const KO_PDF_C = {
    bg: [10, 14, 26], hdr: [30, 58, 95], card: [17, 24, 39], brd: [55, 65, 81],
    txt: [255, 255, 255], mut: [156, 163, 175],
    r: [239, 68, 68], y: [234, 179, 8], g: [34, 197, 94], gold: [250, 204, 21]
  };

  const KO_PDF = {
    M: 10, GAP: 3, PAGE_TOP: 10, PAGE_BOTTOM: 287,
    MATCH_H: 6.8, HEAD_H: 7, FOOT_H: 4,
    FLAG_W: 2.8, FLAG_H: 2.1, RADIUS: 2,
    MATCH_H_MIN: 8, MATCH_H_MAX: 23
  };

  function koPdfRoleLabel(role) {
    const m = KO_ROLE_META[role];
    return m ? m.labelPdf : '';
  }

  function koPdfSpecialsAlive(picks, ex) {
    const alive = new Set();
    const out = new Set();
    getPlayableMatches().forEach(m => {
      if (!isMatchReady(m)) return;
      const pick = picks[m.id];
      if (!isValidKoPick(pick)) return;
      const winner = pick === 'home' ? m.home : m.away;
      const loser = pick === 'home' ? m.away : m.home;
      if (getKoExtraRole(winner, ex)) alive.add(winner);
      if (getKoExtraRole(loser, ex)) out.add(loser);
    });
    out.forEach(c => alive.delete(c));
    return alive;
  }

  function koPdfChunkMatches(matches) {
    return koChunkMatches(matches);
  }

  function koPdfSyncColumns(colY) {
    return [Math.max(colY[0], colY[1]), Math.max(colY[0], colY[1])];
  }

  function koPdfBg(pdf, PW, PH) {
    pdf.setFillColor(...KO_PDF_C.bg);
    pdf.rect(0, 0, PW, PH, 'F');
  }

  function koPdfFooter(pdf, PW, PH, M, name, page, total) {
    pdf.setFontSize(5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...KO_PDF_C.mut);
    pdf.text(`Porra Mundial 2026 · Eliminatorias · ${name}`, M, PH - 4);
    pdf.text(`${page}/${total}`, PW - M, PH - 4, { align: 'right' });
  }

  function koPdfVenueShort(venue) {
    if (!venue) return '';
    const parts = venue.split(',');
    const city = (parts.length > 1 ? parts[parts.length - 1] : venue).trim();
    return city.length > 14 ? city.slice(0, 13) + '...' : city;
  }

  function koPdfTrimName(pdf, name, maxW) {
    if (pdf.getTextWidth(name) <= maxW) return name;
    let t = name;
    while (t.length > 3 && pdf.getTextWidth(t + '...') > maxW) t = t.slice(0, -1);
    return t + '...';
  }

  const KO_PDF_TAG = {
    semi: { bg: [109, 40, 217], bgHi: [147, 51, 234], fg: [255, 255, 255], border: [192, 132, 252], fill: [46, 16, 101] },
    finalist: { bg: [234, 88, 12], bgHi: [249, 115, 22], fg: [255, 255, 255], border: [251, 146, 60], fill: [67, 20, 7] },
    champion: { bg: [202, 138, 4], bgHi: [250, 204, 21], fg: [28, 20, 2], border: [253, 224, 71], fill: [66, 48, 6] }
  };

  function koPdfTagWidth(role) {
    if (role === 'champion') return 13;
    if (role === 'finalist') return 8.5;
    return 7;
  }

  function koPdfDrawRoleTag(pdf, role, x, y, highlight) {
    const lbl = koPdfRoleLabel(role);
    if (!lbl) return 0;
    const style = KO_PDF_TAG[role] || KO_PDF_TAG.semi;
    const w = koPdfTagWidth(role);
    const h = 3.4;

    pdf.setFillColor(...(highlight ? style.bgHi : style.bg));
    pdf.setDrawColor(...(highlight ? style.border : [70, 80, 100]));
    pdf.setLineWidth(highlight ? 0.28 : 0.15);
    pdf.roundedRect(x, y, w, h, 0.6, 0.6, 'FD');

    pdf.setFontSize(role === 'champion' ? 2.8 : 3.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...style.fg);
    pdf.text(lbl, x + w / 2, y + 2.35, { align: 'center' });
    return w;
  }

  function koPdfMatchRowHeight(startY, chunkLen) {
    const avail = KO_PDF.PAGE_BOTTOM - startY - 2;
    const rows = Math.max(chunkLen, 1);
    const raw = (avail - KO_PDF.HEAD_H - KO_PDF.FOOT_H) / rows;
    return Math.min(KO_PDF.MATCH_H_MAX, Math.max(KO_PDF.MATCH_H_MIN, raw));
  }

  function koPdfDrawSectionTitle(pdf, x, y, w, title) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(5.5);
    pdf.setTextColor(...KO_PDF_C.mut);
    pdf.text(title, x, y);
    pdf.setDrawColor(45, 55, 75);
    pdf.setLineWidth(0.15);
    pdf.line(x, y + 1.2, x + w, y + 1.2);
    return y + 4;
  }

  function koPdfDrawIntroLegend(pdf, PW, nameEndY) {
    const C = KO_PDF_C;
    let y = nameEndY + 5;
    pdf.setFontSize(4.6);
    pdf.setFont('helvetica', 'bold');

    const basic = [
      { lbl: 'Ganador', col: C.g },
      { lbl: 'Eliminado', col: C.r }
    ];
    let bx = (PW - 42) / 2;
    basic.forEach(row => {
      pdf.setFillColor(...row.col);
      pdf.rect(bx, y - 1.6, 2, 2, 'F');
      pdf.setTextColor(...C.txt);
      pdf.text(row.lbl, bx + 2.6, y);
      bx += 21;
    });

    y += 4.5;
    const roles = ['semi', 'finalist', 'champion'];
    const tagW = roles.map(r => koPdfTagWidth(r));
    const gap = 2;
    const totalW = tagW.reduce((a, b) => a + b, 0) + gap * (roles.length - 1);
    let tx = (PW - totalW) / 2;
    roles.forEach((role, i) => {
      koPdfDrawRoleTag(pdf, role, tx, y - 2.4, true);
      tx += tagW[i] + gap;
    });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(4.2);
    pdf.setTextColor(...C.mut);
    pdf.text('Tus especiales', PW / 2, y + 2.8, { align: 'center' });
    return y + 5;
  }

  function koPdfDrawIntro(pdf, PW, M, cardW, displayName, done, req, today, startY) {
    const C = KO_PDF_C;
    const pad = 5;
    const headerH = 12;
    const nameLines = pdf.splitTextToSize(displayName, cardW - pad * 2);
    const introH = headerH + nameLines.length * 4.5 + 18;
    const y = startY;

    pdf.setFillColor(12, 18, 32);
    pdf.roundedRect(M, y, cardW, introH, 2, 2, 'F');
    pdf.setFillColor(...C.hdr);
    pdf.roundedRect(M, y, cardW, headerH, 2, 2, 'F');
    pdf.setFillColor(18, 52, 42);
    pdf.rect(M, y + headerH * 0.5, cardW, introH - headerH * 0.5, 'F');
    pdf.setDrawColor(75, 85, 99);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(M, y, cardW, introH, 2, 2, 'S');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(...C.gold);
    pdf.text('PORRA MUNDIAL 2026', M + pad, y + 5.2);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(4.8);
    pdf.setTextColor(...C.mut);
    pdf.text('Eliminatorias · CEST', M + pad, y + 10);
    pdf.text('USA · Mexico · Canada', M + cardW - pad, y + 5.2, { align: 'right' });

    const trophy = typeof trophyCache !== 'undefined' ? trophyCache : null;
    if (trophy) pdf.addImage(trophy, 'PNG', M + cardW - pad - 10, y + 0.5, 10, 10);

    const greenY = y + headerH + 2.5;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(...C.txt);
    pdf.text(nameLines, PW / 2, greenY, { align: 'center' });
    const nameEndY = greenY + (nameLines.length - 1) * 4.5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(5.5);
    pdf.setTextColor(...C.mut);
    pdf.text(`${done}/${req} partidos  ·  ${today}`, PW / 2, nameEndY + 3.5, { align: 'center' });
    koPdfDrawIntroLegend(pdf, PW, nameEndY);

    return y + introH + 2;
  }

  function koPdfDrawPickRow(pdf, code, role, x, y, w, h, cache) {
    const C = KO_PDF_C;
    const { FLAG_W, FLAG_H } = KO_PDF;
    const style = role ? KO_PDF_TAG[role] : null;
    const tagW = role ? koPdfTagWidth(role) : 0;
    const pad = 1.5;

    pdf.setFillColor(...(style ? style.fill : [20, 28, 44]));
    pdf.setDrawColor(...(style ? style.border : [60, 70, 90]));
    pdf.setLineWidth(style ? 0.28 : 0.18);
    pdf.roundedRect(x, y, w, h, 0.8, 0.8, 'FD');
    if (style) {
      pdf.setFillColor(...style.bgHi);
      pdf.rect(x, y + 0.4, 1.2, h - 0.8, 'F');
    }

    const img = cache[code];
    let tx = x + pad + (style ? 1.4 : 0);
    if (img) {
      pdf.addImage(img, 'PNG', tx, y + (h - FLAG_H) / 2, FLAG_W, FLAG_H);
      tx += FLAG_W + 1;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(4.8);
    pdf.setTextColor(...(style ? style.border : C.txt));
    const name = koPdfTrimName(pdf, teamNameKo(code), w - (tx - x) - tagW - pad - 0.5);
    pdf.text(name, tx, y + h / 2 + 0.55);

    if (role) koPdfDrawRoleTag(pdf, role, x + w - pad - tagW, y + (h - 3.4) / 2, true);
  }

  function koPdfDrawChampionRow(pdf, code, cache, trophy, x, y, w, h) {
    const C = KO_PDF_C;
    const style = KO_PDF_TAG.champion;
    const { FLAG_W, FLAG_H } = KO_PDF;
    const pad = 1.5;
    const trophyW = Math.min(9, h - 1);

    pdf.setFillColor(...style.fill);
    pdf.setDrawColor(...style.border);
    pdf.setLineWidth(0.35);
    pdf.roundedRect(x, y, w, h, 1, 1, 'FD');
    pdf.setFillColor(...style.bgHi);
    pdf.rect(x, y + 0.4, 1.4, h - 0.8, 'F');

    let cx = x + pad;
    if (trophy) {
      pdf.addImage(trophy, 'PNG', cx, y + (h - trophyW) / 2, trophyW, trophyW);
      cx += trophyW + 2;
    }
    const img = cache[code];
    if (img) {
      pdf.addImage(img, 'PNG', cx, y + (h - FLAG_H) / 2, FLAG_W + 0.4, FLAG_H + 0.2);
      cx += FLAG_W + 1.5;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(5.8);
    pdf.setTextColor(...style.border);
    const tagW = koPdfTagWidth('champion');
    pdf.text(koPdfTrimName(pdf, teamNameKo(code), w - (cx - x) - tagW - pad), cx, y + h / 2 + 0.6);
    koPdfDrawRoleTag(pdf, 'champion', x + w - pad - tagW, y + (h - 3.4) / 2, true);
  }

  function koPdfDrawExtrasCard(pdf, data, cache, x, y, w, trophy) {
    const C = KO_PDF_C;
    const pad = 3.5;
    const GAP = 2;
    const innerW = w - pad * 2;
    const semiW = (innerW - GAP) / 2;
    const semiH = 6.5;
    const bottomH = 10;
    const cardH = 6 + 2 + semiH + GAP + semiH + 2.5 + 2 + bottomH + 3;

    pdf.setFillColor(...C.card);
    pdf.setDrawColor(...C.brd);
    pdf.setLineWidth(0.25);
    pdf.roundedRect(x, y, w, cardH, KO_PDF.RADIUS, KO_PDF.RADIUS, 'FD');
    pdf.setFillColor(...C.hdr);
    pdf.roundedRect(x, y, w, 6, KO_PDF.RADIUS, KO_PDF.RADIUS, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(251, 191, 36);
    pdf.text('TUS ESPECIALES', x + pad, y + 4.2);
    if (trophy) pdf.addImage(trophy, 'PNG', x + w - pad - 5.5, y + 0.5, 5.5, 5.5);

    let cy = y + 8;
    pdf.setFontSize(4.2);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...KO_PDF_TAG.semi.border);
    pdf.text('4 SEMIFINALISTAS', x + pad, cy);
    cy += 2;
    data.extras.semis.forEach((code, i) => {
      if (!code) return;
      const col = i % 2;
      const row = Math.floor(i / 2);
      koPdfDrawPickRow(
        pdf, code, 'semi',
        x + pad + col * (semiW + GAP), cy + row * (semiH + GAP),
        semiW, semiH, cache
      );
    });
    cy += semiH + GAP + semiH + 2.5;

    pdf.setDrawColor(45, 55, 75);
    pdf.setLineWidth(0.12);
    pdf.line(x + pad, cy, x + w - pad, cy);
    cy += 2;

    const colGap = 2.5;
    const champW = (innerW - colGap) / 2;
    const finColW = champW;
    const displayFinalists = koPdfFinalistsForDisplay(data.extras);
    const finW = displayFinalists.length > 1 ? (finColW - GAP) / 2 : finColW;

    pdf.setFontSize(4.2);
    pdf.setTextColor(...KO_PDF_TAG.champion.border);
    pdf.text('CAMPEON', x + pad, cy);
    pdf.setTextColor(...KO_PDF_TAG.finalist.border);
    pdf.text('FINALISTA', x + pad + champW + colGap, cy);
    cy += 2;

    const champ = data.extras.champion;
    if (champ) {
      koPdfDrawChampionRow(pdf, champ, cache, trophy, x + pad, cy, champW, bottomH);
    } else {
      pdf.setFillColor(20, 28, 44);
      pdf.setDrawColor(60, 70, 90);
      pdf.roundedRect(x + pad, cy, champW, bottomH, 1, 1, 'FD');
      pdf.setFontSize(4.8);
      pdf.setTextColor(...C.mut);
      pdf.text('Sin elegir', x + pad + champW / 2, cy + bottomH / 2 + 0.8, { align: 'center' });
    }

    const finX = x + pad + champW + colGap;
    if (displayFinalists.length) {
      displayFinalists.forEach((code, i) => {
        koPdfDrawPickRow(pdf, code, 'finalist', finX + i * (finW + (displayFinalists.length > 1 ? GAP : 0)), cy, finW, bottomH, cache);
      });
    } else {
      pdf.setFillColor(20, 28, 44);
      pdf.setDrawColor(60, 70, 90);
      pdf.roundedRect(finX, cy, finColW, bottomH, 1, 1, 'FD');
      pdf.setFontSize(4.8);
      pdf.setTextColor(...C.mut);
      pdf.text('Sin elegir', finX + finColW / 2, cy + bottomH / 2 + 0.8, { align: 'center' });
    }

    return y + cardH + 2;
  }

  function koPdfDrawTeamSide(pdf, code, isWin, isLose, role, x, midY, alignRight, maxW, cache, FLAG_W, FLAG_H, matchH) {
    const C = KO_PDF_C;
    const style = role ? KO_PDF_TAG[role] : null;
    const roleLbl = role ? ' ' + koRoleLabel(role, true) : '';
    const name = koPdfTrimName(pdf, teamNameKo(code) + roleLbl, maxW - FLAG_W - (isWin ? 2.2 : 0) - 1.2);
    const fontSize = matchH >= 12 ? 6.2 : matchH >= 10 ? 5.6 : 5;

    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isWin ? 'bold' : 'normal');
    if (isWin && style) pdf.setTextColor(...style.border);
    else if (isWin) pdf.setTextColor(...C.g);
    else if (isLose) pdf.setTextColor(180, 110, 110);
    else if (role && style) pdf.setTextColor(...style.border);
    else pdf.setTextColor(...C.txt);

    const img = cache[code];
    if (alignRight) {
      let rx = x;
      if (isWin) {
        pdf.setFillColor(...(style ? style.bgHi : C.g));
        pdf.circle(rx - 0.9, midY - 0.35, 0.7, 'F');
        rx -= 2.2;
      }
      if (img) {
        rx -= FLAG_W;
        pdf.addImage(img, 'PNG', rx, midY - FLAG_H / 2, FLAG_W, FLAG_H);
        rx -= 0.6;
      }
      pdf.text(name, rx, midY, { align: 'right' });
    } else {
      if (img) pdf.addImage(img, 'PNG', x, midY - FLAG_H / 2, FLAG_W, FLAG_H);
      let nx = x + FLAG_W + 0.7;
      pdf.text(name, nx, midY);
      if (isWin) {
        pdf.setFillColor(...(style ? style.bgHi : C.g));
        pdf.circle(nx + pdf.getTextWidth(name) + 1, midY - 0.35, 0.7, 'F');
      }
    }
  }

  function koPdfDrawMatchRow(pdf, m, pick, xOff, my, CW, cache, stripe, ex, matchH, showSpecials) {
    const C = KO_PDF_C;
    const { FLAG_W, FLAG_H } = KO_PDF;
    const halfW = (CW - 8) / 2;
    const dateSize = matchH >= 12 ? 4.2 : 3.6;
    const teamY = my + matchH * 0.62;

    if (stripe) {
      pdf.setFillColor(25, 35, 50);
      pdf.rect(xOff + 0.5, my, CW - 1, matchH - 0.2, 'F');
    }

    const homeRole = showSpecials ? getKoExtraRole(m.home, ex) : '';
    const awayRole = showSpecials ? getKoExtraRole(m.away, ex) : '';
    const homeStyle = homeRole ? KO_PDF_TAG[homeRole] : null;
    const awayStyle = awayRole ? KO_PDF_TAG[awayRole] : null;
    if (pick === 'home') {
      pdf.setFillColor(...(homeStyle ? homeStyle.bgHi : C.g));
      pdf.rect(xOff + 0.5, my, 1, matchH - 0.2, 'F');
    } else if (pick === 'away') {
      pdf.setFillColor(...(awayStyle ? awayStyle.bgHi : C.g));
      pdf.rect(xOff + CW - 1.5, my, 1, matchH - 0.2, 'F');
    }

    pdf.setFontSize(dateSize);
    pdf.setTextColor(...C.mut);
    pdf.setFont('helvetica', 'normal');
    const city = koPdfVenueShort(m.venue);
    pdf.text(`${m.date} ${m.hour}${city ? ' · ' + city : ''}`, xOff + 2, my + matchH * 0.28);

    koPdfDrawTeamSide(pdf, m.home, pick === 'home', pick === 'away',
      homeRole, xOff + 2, teamY, false, halfW, cache, FLAG_W, FLAG_H, matchH);
    koPdfDrawTeamSide(pdf, m.away, pick === 'away', pick === 'home',
      awayRole, xOff + CW - 2, teamY, true, halfW, cache, FLAG_W, FLAG_H, matchH);
  }

  function koPdfDrawMatchColumn(pdf, matches, xOff, y, CW, picks, cache, label, ex, matchH, showSpecials) {
    const { HEAD_H, FOOT_H, RADIUS } = KO_PDF;
    const groupH = HEAD_H + matches.length * matchH + FOOT_H;

    pdf.setFillColor(...KO_PDF_C.card);
    pdf.setDrawColor(...KO_PDF_C.brd);
    pdf.roundedRect(xOff, y, CW, groupH, RADIUS, RADIUS, 'FD');
    pdf.setFillColor(...KO_PDF_C.hdr);
    pdf.roundedRect(xOff, y, CW, HEAD_H, RADIUS, RADIUS, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(...KO_PDF_C.txt);
    pdf.text(label, xOff + 2.5, y + 4.8);

    const done = matches.filter(m => isValidKoPick(picks[m.id])).length;
    pdf.setFontSize(5);
    pdf.setTextColor(...KO_PDF_C.mut);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${done}/${matches.length}`, xOff + CW - 2.5, y + 4.8, { align: 'right' });

    let gy = y + HEAD_H;
    matches.forEach((m, idx) => {
      koPdfDrawMatchRow(pdf, m, picks[m.id], xOff, gy + idx * matchH, CW, cache, idx % 2 === 1, ex, matchH, showSpecials);
    });

    return y + groupH;
  }

  async function exportKnockoutPDFInner() {
    const user = getActiveKoUser();
    const data = getActiveKoData();
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const C = KO_PDF_C;
    const PW = 210;
    const PH = 297;
    const { M, GAP, PAGE_TOP, PAGE_BOTTOM } = KO_PDF;
    const CW = (PW - M * 2 - GAP) / 2;
    const cardW = PW - M * 2;
    const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    const displayName = user.replace(/\S+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    const req = koMatchesRequired();
    const done = koMatchesDone();

    const codes = new Set();
    getPlayableMatches().forEach(m => { codes.add(m.home); codes.add(m.away); });
    data.extras.semis.concat(data.extras.finalists, [data.extras.champion]).filter(Boolean).forEach(c => codes.add(c));
    if (typeof loadTrophyDataUrl === 'function') await loadTrophyDataUrl();
    await Promise.all([...codes].map(c => typeof loadFlagDataUrl === 'function' ? loadFlagDataUrl(c) : null));
    const cache = typeof flagCache !== 'undefined' ? flagCache : {};

    koPdfBg(pdf, PW, PH);
    let y = koPdfDrawIntro(pdf, PW, M, cardW, displayName, done, req, today, M);
    y = koPdfDrawExtrasCard(pdf, data, cache, M, y, cardW, typeof trophyCache !== 'undefined' ? trophyCache : null);
    y = koPdfDrawSectionTitle(pdf, M, y + 1, cardW, 'TUS PARTIDOS');

    const openPlayable = getOpenRounds().map(r => ({
      round: r,
      matches: r.matches.filter(isMatchReady)
    })).filter(x => x.matches.length);

    let maxChunkLen = 1;
    openPlayable.forEach(({ matches }) => {
      koPdfChunkMatches(matches).forEach(chunk => {
        if (chunk.length > maxChunkLen) maxChunkLen = chunk.length;
      });
    });
    const matchH = koPdfMatchRowHeight(y + GAP, maxChunkLen);

    let col = 0;
    let colY = [y + GAP, y + GAP];

    function placeGroup(groupH, fullWidth) {
      const bottom = colY[col] + groupH;
      if (bottom > PAGE_BOTTOM) {
        if (!fullWidth && col === 0 && colY[1] + groupH <= PAGE_BOTTOM) {
          col = 1;
          return;
        }
        pdf.addPage();
        koPdfBg(pdf, PW, PH);
        colY = [PAGE_TOP, PAGE_TOP];
        col = 0;
      }
    }

    openPlayable.forEach(({ round, matches }) => {
      const chunks = koPdfChunkMatches(matches);
      chunks.forEach((chunk, ci) => {
        if (!chunk.length) return;
        const fullWidth = chunks.length === 1;
        const colW = fullWidth ? cardW : CW;
        const groupH = KO_PDF.HEAD_H + chunk.length * matchH + KO_PDF.FOOT_H;
        placeGroup(groupH, fullWidth);
        const xOff = fullWidth ? M : M + col * (CW + GAP);
        const label = round.label + (chunks.length > 1 ? (ci ? ' B' : ' A') : '');
        colY[col] = koPdfDrawMatchColumn(pdf, chunk, xOff, colY[col], colW, data.picks, cache, label, data.extras, matchH, round.key === 'r32') + 2;
        if (fullWidth) {
          colY = koPdfSyncColumns(colY);
          col = 0;
        } else {
          col = col === 0 ? 1 : 0;
        }
      });
      colY = koPdfSyncColumns(colY);
      col = 0;
    });

    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      koPdfFooter(pdf, PW, PH, M, user, i, totalPages);
    }

    const safe = user.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    if (typeof downloadPdfBlob === 'function') {
      downloadPdfBlob(pdf, `porra-knockout-2026-${safe}.pdf`);
    } else {
      pdf.save(`porra-knockout-2026-${safe}.pdf`);
    }
  }

  async function exportKnockoutPDF() {
    if (!getActiveKoUser()) {
      alert('Elige un participante antes de exportar.');
      return;
    }
    if (!isKnockoutComplete()) {
      alert('Completa los partidos de las rondas abiertas y los pronósticos especiales antes de exportar.');
      return;
    }
    const btn = document.getElementById('btnExportKo');
    if (btn) {
      btn.classList.add('is-locked', 'opacity-60');
      btn.setAttribute('aria-disabled', 'true');
    }
    try {
      await exportKnockoutPDFInner();
    } finally {
      updateKnockoutStatus();
      if (btn) btn.classList.remove('opacity-60');
    }
  }

  function requestKnockoutAccess() {
    if (isKnockoutAccessible()) {
      if (typeof switchPhaseTab === 'function') switchPhaseTab('extras');
      return;
    }
    showKoPasswordModal();
  }

  window.isKnockoutAccessible = isKnockoutAccessible;
  window.isKnockoutPreviewUnlocked = isKnockoutPreviewUnlocked;
  window.isKnockoutComplete = isKnockoutComplete;
  window.renderKnockout = renderKnockout;
  window.setActiveKoUser = setActiveKoUser;
  window.PARTICIPANTS = PARTICIPANTS;
  window.pickKoResult = pickKoResult;
  window.setKoExtra = setKoExtra;
  window.submitKoPassword = submitKoPassword;
  window.hideKoPasswordModal = hideKoPasswordModal;
  window.clearKnockoutMatches = clearKnockoutMatches;
  window.clearKnockoutAll = clearKnockoutAll;
  window.clearKnockoutPicks = clearKnockoutPicks;
  window.exportKnockoutPDF = exportKnockoutPDF;
  window.requestKnockoutAccess = requestKnockoutAccess;
  window.KO_ROUNDS = KO_ROUNDS;
  window.KO_ROUND_OPENS = KO_ROUND_OPENS;

  loadKnockoutStore();
})();
