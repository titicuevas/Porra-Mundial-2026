/* Eliminatorias — Porra Mundial 2026 */
(function () {
  const KO_PASSWORD = 'Españita';
  const KO_EXTRAS_TOTAL = 7;
  const KO_MATCH_TOTAL = 31;

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

  const KO_R32_SEEDS = [
    ['mx', 'cz'], ['kr', 'qa'], ['br', 'ch'], ['de', 'cw'],
    ['us', 'au'], ['ca', 'ma'], ['es', 'uy'], ['fr', 'ar'],
    ['gb-eng', 'hr'], ['pt', 'co'], ['nl', 'jp'], ['be', 'eg'],
    ['at', 'jo'], ['dz', 'uz'], ['sn', 'no'], ['gh', 'pa']
  ];

  function buildR16() {
    const pairs = [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15]];
    return pairs.map((p, i) => ({
      id: 'KO16-' + (i + 1),
      feeds: ['KO32-' + (p[0] + 1), 'KO32-' + (p[1] + 1)]
    }));
  }

  function buildFeedRound(prefix, prevPrefix, count) {
    return Array.from({ length: count }, (_, i) => ({
      id: prefix + '-' + (i + 1),
      feeds: [prevPrefix + '-' + (i * 2 + 1), prevPrefix + '-' + (i * 2 + 2)]
    }));
  }

  const KNOCKOUT_ROUNDS = [
    {
      key: 'r32',
      label: 'Dieciseisavos',
      matches: KO_R32_SEEDS.map((pair, i) => ({
        id: 'KO32-' + (i + 1),
        home: pair[0],
        away: pair[1],
        date: 'Jul 2026',
        hour: '—',
        venue: 'Mundial 2026'
      }))
    },
    { key: 'r16', label: 'Octavos', matches: buildR16() },
    { key: 'r8', label: 'Cuartos', matches: buildFeedRound('KO8', 'KO16', 4) },
    { key: 'r4', label: 'Semifinales', matches: buildFeedRound('KO4', 'KO8', 2) },
    { key: 'r2', label: 'Final', matches: [{ id: 'KOF-1', feeds: ['KO4-1', 'KO4-2'] }] }
  ];

  const koMatchMap = new Map();
  KNOCKOUT_ROUNDS.forEach(r => r.matches.forEach(m => koMatchMap.set(m.id, m)));

  const KO_R32_CODES = new Set();
  KO_R32_SEEDS.forEach(pair => { KO_R32_CODES.add(pair[0]); KO_R32_CODES.add(pair[1]); });

  let koStore = { activeUser: '', users: {} };

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

  function loadKnockoutStore() {
    try {
      const raw = localStorage.getItem('porra2026_knockout');
      if (raw) koStore = JSON.parse(raw);
    } catch (e) {
      koStore = { activeUser: '', users: {} };
    }
    if (!koStore.users) koStore.users = {};
    if (!koStore.activeUser && PARTICIPANTS.length) koStore.activeUser = PARTICIPANTS[0];
  }

  function saveKnockoutStore() {
    try {
      localStorage.setItem('porra2026_knockout', JSON.stringify(koStore));
    } catch (e) { /* */ }
  }

  function ensureUser(name) {
    if (!koStore.users[name]) {
      koStore.users[name] = {
        picks: {},
        extras: { semis: ['', '', '', ''], finalists: ['', ''], champion: '' }
      };
    }
    koStore.users[name].extras = sanitizeKoExtras(koStore.users[name].extras);
    return koStore.users[name];
  }

  function normalizeKoExtras(ex) {
    const out = {
      semis: ['', '', '', ''],
      finalists: ['', ''],
      champion: ''
    };
    if (!ex || typeof ex !== 'object') return out;
    if (Array.isArray(ex.semis)) ex.semis.forEach((c, i) => { if (i < 4) out.semis[i] = c || ''; });
    if (Array.isArray(ex.finalists)) ex.finalists.forEach((c, i) => { if (i < 2) out.finalists[i] = c || ''; });
    if (ex.champion) out.champion = ex.champion;
    return out;
  }

  function getActiveKoUser() {
    return koStore.activeUser || '';
  }

  function getActiveKoData() {
    const u = getActiveKoUser();
    if (!u) return { picks: {}, extras: normalizeKoExtras({}) };
    const data = ensureUser(u);
    data.extras = normalizeKoExtras(data.extras);
    return data;
  }

  function setActiveKoUser(name) {
    koStore.activeUser = name;
    ensureUser(name);
    saveKnockoutStore();
    renderKnockout();
  }

  function teamNameKo(code) {
    if (!code || code === 'tbd') return 'Por definir';
    const t = typeof teamByCode === 'function' ? teamByCode(code) : null;
    return t ? t.name : code.toUpperCase();
  }

  function getKoPick(matchId) {
    return getActiveKoData().picks[matchId] || null;
  }

  function getKnockoutWinnerCode(matchId) {
    const pick = getKoPick(matchId);
    if (!pick) return null;
    const teams = resolveKoTeams(matchId);
    if (!teams.home || teams.home === 'tbd' || !teams.away || teams.away === 'tbd') return null;
    return pick === 'home' ? teams.home : teams.away;
  }

  function resolveKoTeams(matchId) {
    const m = koMatchMap.get(matchId);
    if (!m) return { home: 'tbd', away: 'tbd' };
    if (m.home && m.away) return { home: m.home, away: m.away };
    if (m.feeds && m.feeds.length === 2) {
      return {
        home: getKnockoutWinnerCode(m.feeds[0]) || 'tbd',
        away: getKnockoutWinnerCode(m.feeds[1]) || 'tbd'
      };
    }
    return { home: 'tbd', away: 'tbd' };
  }

  function pickKoWinner(matchId, side) {
    if (!isKnockoutAccessible()) return;
    const teams = resolveKoTeams(matchId);
    if (teams.home === 'tbd' || teams.away === 'tbd') return;
    const data = getActiveKoData();
    const prev = data.picks[matchId];
    data.picks[matchId] = side;
    if (prev !== side) clearDownstreamPicks(matchId);
    saveKnockoutStore();
    renderKnockoutBracket();
    updateKnockoutStatus();
  }
  let koClickBound = false;
  let koExtrasClickBound = false;
  let koBoardScroll = { left: 0, top: 0 };
  let koExtraWarn = '';
  let koActiveExtraSlot = null;

  function saveKoBoardScroll() {
    const board = document.querySelector('#koBracket .ko-bracket-board');
    if (!board) return;
    koBoardScroll = { left: board.scrollLeft, top: board.scrollTop };
  }

  function restoreKoBoardScroll() {
    const board = document.querySelector('#koBracket .ko-bracket-board');
    if (!board) return;
    board.scrollLeft = koBoardScroll.left;
    board.scrollTop = koBoardScroll.top;
    requestAnimationFrame(() => {
      board.scrollLeft = koBoardScroll.left;
      board.scrollTop = koBoardScroll.top;
    });
  }

  function bindKoBracketClicks() {
    if (koClickBound) return;
    const root = document.getElementById('koBracket');
    if (!root) return;
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-ko-match][data-ko-side]');
      if (!btn || btn.disabled) return;
      e.preventDefault();
      e.stopPropagation();
      saveKoBoardScroll();
      pickKoWinner(btn.getAttribute('data-ko-match'), btn.getAttribute('data-ko-side'));
      if (btn.blur) btn.blur();
    });
    koClickBound = true;
  }

  const BRACKET_LAYOUT = {
    left: {
      r32: ['KO32-1','KO32-2','KO32-3','KO32-4','KO32-5','KO32-6','KO32-7','KO32-8'],
      inner: [
        { label: 'Octavos', ids: ['KO16-1','KO16-2','KO16-3','KO16-4'] },
        { label: 'Cuartos', ids: ['KO8-1','KO8-2'] },
        { label: 'Semis', ids: ['KO4-1'] }
      ]
    },
    right: {
      r32: ['KO32-9','KO32-10','KO32-11','KO32-12','KO32-13','KO32-14','KO32-15','KO32-16'],
      inner: [
        { label: 'Octavos', ids: ['KO16-5','KO16-6','KO16-7','KO16-8'] },
        { label: 'Cuartos', ids: ['KO8-3','KO8-4'] },
        { label: 'Semis', ids: ['KO4-2'] }
      ]
    },
    final: 'KOF-1'
  };

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

  function getKoExtraBadge(code) {
    if (!code || code === 'tbd') return { cls: '', star: '', label: '' };
    const ex = getActiveKoData().extras;
    if (ex.champion === code) return { cls: 'ko-team-pick--echamp', star: '<span class="ko-special-star" title="Tu campeón">⭐</span>', label: 'Campeón' };
    if (ex.finalists.includes(code)) return { cls: 'ko-team-pick--efinal', star: '<span class="ko-special-star" title="Tu finalista">★</span>', label: 'Finalista' };
    if (ex.semis.includes(code)) return { cls: 'ko-team-pick--esemi', star: '<span class="ko-special-star" title="Tu semifinalista">✦</span>', label: 'Semifinalista' };
    return { cls: '', star: '', label: '' };
  }

  function getKoExtraRoleInPicker(code, ex) {
    if (ex.champion === code) return 'champion';
    if (ex.finalists.includes(code)) return 'finalist';
    if (ex.semis.includes(code)) return 'semi';
    return '';
  }

  function teamNameKoShort(code, max) {
    max = max || 13;
    const n = teamNameKo(code);
    return n.length > max ? n.slice(0, max - 1) + '…' : n;
  }

  function koTeamBtnHTML(matchId, side, code, ready) {
    const pick = getKoPick(matchId);
    const cls = ['ko-team-pick'];
    if (!ready || !code || code === 'tbd') cls.push('tbd');
    if (pick === side) cls.push('winner');
    else if (pick && ready) cls.push('eliminated');
    const extra = getKoExtraBadge(code);
    if (extra.cls) cls.push(extra.cls);
    const flag = ready && code && code !== 'tbd' && typeof flagHTML === 'function'
      ? flagHTML(code, 18) : '<span class="flag-icon" style="width:18px;height:13px;opacity:.2"></span>';
    const dis = ready ? '' : ' disabled';
    const name = teamNameKoShort(code);
    const ariaExtra = extra.label ? ` (${extra.label})` : '';
    const aria = ready
      ? (pick === side ? `Ganador ${teamNameKo(code)}${ariaExtra}` : `Elegir a ${teamNameKo(code)}${ariaExtra}`)
      : 'Por definir';
    const pressed = pick === side ? 'true' : 'false';
    return `<button type="button" class="${cls.join(' ')}" data-ko-match="${matchId}" data-ko-side="${side}" aria-label="${aria}" aria-pressed="${pressed}"${dis}>
      ${extra.star}${flag}<span class="ko-team-name">${name}</span></button>`;
  }

  function koPairHTML(matchId, grid) {
    const m = koMatchMap.get(matchId);
    let home, away;
    if (m && m.home && m.away) {
      home = m.home;
      away = m.away;
    } else {
      const t = resolveKoTeams(matchId);
      home = t.home;
      away = t.away;
    }
    const ready = home !== 'tbd' && away !== 'tbd';
    const pick = getKoPick(matchId);
    const gridStyle = grid
      ? ` style="grid-column:${grid.col};grid-row:${grid.row} / span ${grid.rowSpan}"`
      : '';
    return `<div class="ko-pair${pick ? ' has-pick' : ''}" id="kom-${matchId}"${gridStyle}>
      ${koTeamBtnHTML(matchId, 'home', home, ready)}
      ${koTeamBtnHTML(matchId, 'away', away, ready)}
    </div>`;
  }

  function koBracketHalfHTML(side) {
    const r32Ids = BRACKET_LAYOUT[side].r32;
    const inner = BRACKET_LAYOUT[side].inner;
    const totalCols = inner.length + 1;
    const isLeft = side === 'left';
    const sideLabel = isLeft ? 'Izquierda · 16 equipos' : 'Derecha · 16 equipos';
    let html = `<div class="ko-bracket-grid ko-bracket-grid--${side}" aria-label="Mitad ${isLeft ? 'izquierda' : 'derecha'} del cuadro">`;
    html += `<div class="ko-side-label" style="grid-column:1/-1">${sideLabel}</div>`;

    r32Ids.forEach((id, i) => {
      const col = isLeft ? 1 : totalCols;
      html += koPairHTML(id, { col, row: i * 2 + 1, rowSpan: 2 });
    });

    inner.forEach((round, ri) => {
      const col = isLeft ? ri + 2 : totalCols - ri - 1;
      const rowSpan = 16 / round.ids.length;
      round.ids.forEach((id, i) => {
        html += koPairHTML(id, { col, row: i * rowSpan + 1, rowSpan });
      });
    });

    html += '</div>';
    return html;
  }

  function renderKnockoutBracket() {
    const el = document.getElementById('koBracket');
    if (!el) return;
    bindKoBracketClicks();
    const existingBoard = el.querySelector('.ko-bracket-board');
    if (existingBoard) {
      koBoardScroll = { left: existingBoard.scrollLeft, top: existingBoard.scrollTop };
    }
    if (!isKnockoutAccessible()) {
      el.innerHTML = `<div class="extras-locked">
        <p class="text-gray-400 text-sm">🔒 Las eliminatorias se abren el <strong class="text-white">12 de julio a las 7:00</strong>.</p>
        <p class="text-xs text-gray-500 mt-2">Modo prueba: pulsa la pestaña e introduce la contraseña.</p>
      </div>`;
      return;
    }
    if (!getActiveKoUser()) {
      el.innerHTML = '<p class="text-yellow-500 text-sm">Selecciona tu nombre en el desplegable de arriba.</p>';
      return;
    }

    const finalTeams = resolveKoTeams(BRACKET_LAYOUT.final);
    const finalPick = getKoPick(BRACKET_LAYOUT.final);
    const finalWinner = finalPick
      ? (finalPick === 'home' ? finalTeams.home : finalTeams.away) : null;
    const champDisplay = finalWinner && finalWinner !== 'tbd' ? teamNameKo(finalWinner) : '—';

    el.innerHTML = `
      <div class="ko-bracket-scroll-wrap">
        <p class="ko-scroll-hint">← Desliza el cuadro para ver los 16 equipos de cada lado →</p>
        <div class="ko-bracket-board">
          <div class="ko-board-half ko-board-left">
            ${koBracketHalfHTML('left')}
          </div>
          <div class="ko-board-center">
            <div class="ko-board-center-label">Final</div>
            ${koPairHTML(BRACKET_LAYOUT.final)}
            <img src="/assets/wc2026-logo.png" class="ko-final-trophy-center" alt="" onerror="this.src='/assets/wc-trophy.svg'"/>
            <p class="ko-champion-name" style="margin:0;font-size:.95rem;">${champDisplay}</p>
          </div>
          <div class="ko-board-half ko-board-right">
            ${koBracketHalfHTML('right')}
          </div>
        </div>
      </div>
      <p class="ko-bracket-hint"><strong>16 equipos a cada lado.</strong> Toca al ganador (✓ verde). Los equipos con ✦ ★ ⭐ son tus pronósticos especiales.</p>`;

    requestAnimationFrame(() => {
      restoreKoBoardScroll();
      bindKoBracketScrollHints();
    });
  }

  function bindKoBracketScrollHints() {
    const wrap = document.querySelector('#koBracket .ko-bracket-scroll-wrap');
    const board = wrap && wrap.querySelector('.ko-bracket-board');
    if (!wrap || !board) return;
    const update = () => {
      const max = board.scrollWidth - board.clientWidth;
      wrap.classList.toggle('can-scroll-left', board.scrollLeft > 4);
      wrap.classList.toggle('can-scroll-right', max - board.scrollLeft > 4);
    };
    if (!board._koScrollHintBound) {
      board.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      board._koScrollHintBound = true;
    }
    update();
  }

  function clearDownstreamPicks(fromMatchId) {
    const data = getActiveKoData();
    const toClear = [];
    function collectDependents(matchId) {
      koMatchMap.forEach((m, id) => {
        if (!m.feeds || !m.feeds.includes(matchId) || toClear.includes(id)) return;
        toClear.push(id);
        collectDependents(id);
      });
    }
    collectDependents(fromMatchId);
    toClear.forEach(id => delete data.picks[id]);
  }

  function koExtrasDone() {
    const ex = getActiveKoData().extras;
    let n = ex.semis.filter(Boolean).length + ex.finalists.filter(Boolean).length;
    if (ex.champion) n++;
    return n;
  }

  function koMatchesDone() {
    let n = 0;
    KNOCKOUT_ROUNDS.forEach(r => {
      r.matches.forEach(m => {
        const t = resolveKoTeams(m.id);
        if (t.home !== 'tbd' && t.away !== 'tbd' && getKoPick(m.id)) n++;
      });
    });
    return n;
  }

  function isKnockoutComplete() {
    return getActiveKoUser() && koMatchesDone() >= KO_MATCH_TOTAL && koExtrasDone() >= KO_EXTRAS_TOTAL;
  }

  function isKoExtraDuplicate(ex, field, index, code) {
    if (!code) return false;
    if (field === 'semis') {
      return ex.semis.some((c, i) => c === code && i !== index);
    }
    if (field === 'finalists') {
      return ex.finalists.some((c, i) => c === code && i !== index);
    }
    return false;
  }

  function getUsedExtraCodes(ex, field, activeSlot) {
    const used = new Set();
    if (field === 'semis') {
      ex.semis.filter(Boolean).forEach(c => used.add(c));
    } else if (field === 'finalists') {
      ex.finalists.filter(Boolean).forEach(c => used.add(c));
    }
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
    if (!isKnockoutAccessible()) return;
    const data = getActiveKoData();
    const ex = data.extras;
    if (code) {
      if (field === 'semis' && !isKoR32Team(code)) {
        koExtraWarn = 'Los semifinalistas deben ser uno de los 32 equipos del cuadro.';
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
    data.extras = sanitizeKoExtras(ex);
    saveKnockoutStore();
    saveKoBoardScroll();
    renderKnockoutExtras();
    renderKnockoutBracket();
    updateKnockoutStatus();
  }

  function koExtraSlotHTML(field, index, selected, label) {
    const filled = !!selected;
    const isActive = koActiveExtraSlot && koActiveExtraSlot.field === field && koActiveExtraSlot.index === index;
    const flag = filled && typeof flagHTML === 'function'
      ? flagHTML(selected, 32)
      : '<span class="ko-extra-plus" aria-hidden="true">+</span>';
    const name = filled ? teamNameKo(selected) : 'Vacío';
    let roleStar = '';
    if (filled) {
      if (field === 'champion') roleStar = '<span class="ko-extra-role-star">⭐</span>';
      else if (field === 'finalists') roleStar = '<span class="ko-extra-role-star">★</span>';
      else roleStar = '<span class="ko-extra-role-star">✦</span>';
    }
    return `<div class="ko-extra-slot${filled ? ' ko-extra-slot--filled' : ''}${isActive ? ' ko-extra-slot--active' : ''} ko-extra-slot--${field}">
      <span class="ko-extra-slot-num">${label}</span>
      <button type="button" class="ko-extra-slot-card" data-ko-extra-slot data-ko-extra-field="${field}" data-ko-extra-index="${index}" aria-pressed="${isActive}">
        ${roleStar}
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
    const star = role === 'champion' ? '⭐' : role === 'finalist' ? '★' : role === 'semi' ? '✦' : '';
    const flag = typeof flagHTML === 'function' ? flagHTML(code, field === 'semis' ? 24 : 32) : '';
    const name = teamNameKo(code);
    return `<button type="button" class="${cls.join(' ')}" data-ko-pick-code="${code}" data-ko-picker-field="${field}"${taken ? ' disabled' : ''} aria-label="${name}">
      ${star ? `<span class="ko-r32-pick-star">${star}</span>` : ''}
      ${flag}
      <span class="ko-r32-pick-name">${teamNameKoShort(code, field === 'semis' ? 11 : 14)}</span>
    </button>`;
  }

  function koSectionPickerHTML(field) {
    const ex = getActiveKoData().extras;
    const used = getUsedExtraCodes(ex, field, koActiveExtraSlot);
    let teams = [];
    let hint = '';
    let locked = false;

    if (field === 'semis') {
      teams = getKoR32TeamsSorted();
      const n = ex.semis.filter(Boolean).length;
      if (koActiveExtraSlot && koActiveExtraSlot.field === 'semis') {
        hint = `Elige equipo para <strong>SF ${koActiveExtraSlot.index + 1}</strong> (32 del cuadro)`;
      } else if (n < 4) {
        hint = `Toca un equipo → se asigna a SF ${n + 1}. O toca una casilla para elegir cuál cambiar.`;
      } else {
        hint = 'Las 4 casillas están llenas. Toca una casilla para cambiarla.';
      }
    } else if (field === 'finalists') {
      const semis = ex.semis.filter(Boolean);
      if (semis.length < 4) {
        locked = true;
        return `<p class="ko-section-locked">🔒 Completa los <strong>4 semifinalistas</strong> para desbloquear los finalistas.</p>`;
      }
      teams = semis.map(code => ({ code, name: teamNameKo(code) }));
      const n = ex.finalists.filter(Boolean).length;
      if (koActiveExtraSlot && koActiveExtraSlot.field === 'finalists') {
        hint = `Elige uno de tus semifinalistas para <strong>Final ${koActiveExtraSlot.index + 1}</strong>`;
      } else if (n < 2) {
        hint = `Solo tus 4 semifinalistas · toca uno para Final ${n + 1}`;
      } else {
        hint = 'Toca una casilla de finalista para cambiarla.';
      }
    } else if (field === 'champion') {
      const finals = ex.finalists.filter(Boolean);
      if (finals.length < 2) {
        locked = true;
        return `<p class="ko-section-locked">🔒 Completa los <strong>2 finalistas</strong> para elegir campeón.</p>`;
      }
      teams = finals.map(code => ({ code, name: teamNameKo(code) }));
      hint = koActiveExtraSlot && koActiveExtraSlot.field === 'champion'
        ? 'Elige campeón entre tus 2 finalistas'
        : 'Toca uno de tus finalistas para ser campeón ⭐';
    }

    return `<div class="ko-section-picker${locked ? ' ko-section-picker--locked' : ''}" data-ko-picker-field="${field}">
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
    const grid = document.getElementById('koExtrasGrid');
    if (!grid || !isKnockoutAccessible()) return;
    bindKoExtrasClicks();
    const data = getActiveKoData();
    data.extras = sanitizeKoExtras(data.extras);
    const ex = data.extras;
    const done = koExtrasDone();
    const pct = Math.round((done / KO_EXTRAS_TOTAL) * 100);
    const semisFull = ex.semis.filter(Boolean).length >= 4;
    const finalsFull = ex.finalists.filter(Boolean).length >= 2;

    grid.innerHTML = `
      ${koExtraWarn ? `<p class="ko-extra-warn" role="alert">${koExtraWarn}</p>` : ''}
      <div class="ko-extras-progress-wrap">
        <div class="ko-extras-progress"><div class="ko-extras-progress-fill" style="width:${pct}%"></div></div>
        <span class="ko-extras-progress-label">${done}/${KO_EXTRAS_TOTAL} completados</span>
      </div>
      <div class="ko-r32-picker-legend">
        <span><span class="ko-legend-dot ko-legend-dot--semi"></span> Semifinalista ✦</span>
        <span><span class="ko-legend-dot ko-legend-dot--final"></span> Finalista ★</span>
        <span><span class="ko-legend-dot ko-legend-dot--champ"></span> Campeón ⭐</span>
      </div>
      <section class="ko-extras-step">
        <h4 class="ko-extras-step-title"><span class="ko-extras-step-badge">1</span>4 semifinalistas</h4>
        <p class="ko-extras-step-hint">Elige entre los <strong>32 equipos del cuadro</strong> · distintos entre sí</p>
        <div class="ko-extras-row ko-extras-row--4">
          ${ex.semis.map((s, i) => koExtraSlotHTML('semis', i, s, 'SF ' + (i + 1))).join('')}
        </div>
        ${koSectionPickerHTML('semis')}
      </section>
      <section class="ko-extras-step${semisFull ? '' : ' ko-extras-step--locked'}">
        <h4 class="ko-extras-step-title"><span class="ko-extras-step-badge">2</span>2 finalistas</h4>
        <p class="ko-extras-step-hint">Solo entre tus <strong>4 semifinalistas</strong></p>
        <div class="ko-extras-row ko-extras-row--2">
          ${ex.finalists.map((s, i) => koExtraSlotHTML('finalists', i, s, 'Final ' + (i + 1))).join('')}
        </div>
        ${koSectionPickerHTML('finalists')}
      </section>
      <section class="ko-extras-step ko-extras-step--champion${finalsFull ? '' : ' ko-extras-step--locked'}">
        <h4 class="ko-extras-step-title"><span class="ko-extras-step-badge ko-extras-step-badge--gold">3</span>Campeón del mundo</h4>
        <p class="ko-extras-step-hint">Solo entre tus <strong>2 finalistas</strong></p>
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

  function renderKnockoutUserSelect() {
    const sel = document.getElementById('koUserSelect');
    if (!sel) return;
    sel.innerHTML = PARTICIPANTS.map(p =>
      `<option value="${p.replace(/"/g, '&quot;')}"${p === koStore.activeUser ? ' selected' : ''}>${p}</option>`
    ).join('');
  }

  function updateKnockoutStatus() {
    const st = document.getElementById('koStatus');
    const btn = document.getElementById('btnExportKo');
    if (!st || !isKnockoutAccessible()) return;
    const md = koMatchesDone();
    const ed = koExtrasDone();
    const complete = isKnockoutComplete();
    st.textContent = complete
      ? '✓ Eliminatorias completas — puedes exportar el PDF'
      : `Partidos: ${md}/${KO_MATCH_TOTAL} · Extras: ${ed}/${KO_EXTRAS_TOTAL}`;
    st.className = complete
      ? 'text-xs text-green-400 font-medium mt-3'
      : 'text-xs text-yellow-500 font-medium mt-3';
    if (btn) {
      btn.classList.toggle('is-locked', !complete);
      btn.setAttribute('aria-disabled', complete ? 'false' : 'true');
    }
    const champEl = document.getElementById('koChampionDisplay');
    if (champEl) {
      const ex = getActiveKoData().extras;
      champEl.textContent = ex.champion ? teamNameKo(ex.champion) : '—';
    }
  }

  function renderKnockout() {
    loadKnockoutStore();
    renderKnockoutUserSelect();
    const preview = document.getElementById('koPreviewBadge');
    if (preview) preview.classList.toggle('hidden', !isKnockoutPreviewUnlocked() || (typeof isExtrasOpen === 'function' && isExtrasOpen()));
    const subtitle = document.getElementById('koSubtitle');
    if (subtitle) {
      subtitle.textContent = isKnockoutAccessible()
        ? '1º Especiales (32 → 4 semis → 2 finales → campeón). 2º Cuadro. Toca el equipo directamente.'
        : 'Se abrirá el 12 de julio a las 7:00 (hora peninsular). Modo prueba con contraseña.';
    }
    renderKnockoutExtras();
    renderKnockoutBracket();
    updateKnockoutStatus();
  }

  async function exportKnockoutPDF() {
    if (!isKnockoutComplete()) {
      alert('Completa todos los partidos y los extras antes de exportar.');
      return;
    }
    const user = getActiveKoUser();
    const data = getActiveKoData();
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const C = {
      bg: [10, 14, 26], hdr: [30, 58, 95], card: [17, 24, 39], brd: [55, 65, 81],
      txt: [255, 255, 255], mut: [156, 163, 175],
      r: [239, 68, 68], g: [34, 197, 94], y: [250, 204, 21]
    };
    const PW = 210, PH = 297, M = 10;
    const codes = new Set();
    KNOCKOUT_ROUNDS.forEach(r => r.matches.forEach(m => {
      const t = resolveKoTeams(m.id);
      if (t.home && t.home !== 'tbd') codes.add(t.home);
      if (t.away && t.away !== 'tbd') codes.add(t.away);
    }));
    data.extras.semis.concat(data.extras.finalists, [data.extras.champion]).filter(Boolean).forEach(c => codes.add(c));
    if (typeof loadTrophyDataUrl === 'function') await loadTrophyDataUrl();
    await Promise.all([...codes].map(c => typeof loadFlagDataUrl === 'function' ? loadFlagDataUrl(c) : null));

    let y = M;
    pdf.setFillColor(...C.bg);
    pdf.rect(0, 0, PW, PH, 'F');
    pdf.setFillColor(...C.hdr);
    pdf.roundedRect(M, y, PW - M * 2, 28, 3, 3, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(...C.y);
    pdf.text('PORRA MUNDIAL 2026 — ELIMINATORIAS', M + 5, y + 10);
    pdf.setFontSize(14);
    pdf.setTextColor(...C.txt);
    pdf.text(user, M + 5, y + 20);
    y += 34;

    for (const round of KNOCKOUT_ROUNDS) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...C.y);
      pdf.text(round.label.toUpperCase(), M, y);
      y += 5;
      for (const m of round.matches) {
        if (y > PH - 25) { pdf.addPage(); pdf.setFillColor(...C.bg); pdf.rect(0, 0, PW, PH, 'F'); y = M; }
        const teams = resolveKoTeams(m.id);
        const pick = data.picks[m.id];
        const w = pick === 'home' ? teams.home : pick === 'away' ? teams.away : null;
        pdf.setFontSize(7);
        pdf.setTextColor(...C.mut);
        pdf.text(m.id, M, y);
        pdf.setTextColor(...C.txt);
        pdf.setFont('helvetica', 'normal');
        const line = teamNameKo(teams.home) + '  vs  ' + teamNameKo(teams.away);
        pdf.text(line, M + 12, y);
        if (w) {
          pdf.setTextColor(...C.g);
          pdf.setFont('helvetica', 'bold');
          pdf.text('→ ' + teamNameKo(w), PW - M, y, { align: 'right' });
        }
        y += 4.5;
      }
      y += 3;
    }

    if (y > PH - 45) { pdf.addPage(); pdf.setFillColor(...C.bg); pdf.rect(0, 0, PW, PH, 'F'); y = M; }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(...C.y);
    pdf.text('PRONÓSTICOS ESPECIALES', M, y);
    y += 6;
    pdf.setFontSize(7);
    pdf.setTextColor(...C.txt);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Semifinalistas: ' + data.extras.semis.map(c => teamNameKo(c)).join(' · '), M, y);
    y += 5;
    pdf.text('Finalistas: ' + data.extras.finalists.map(c => teamNameKo(c)).join(' · '), M, y);
    y += 8;

    const champY = y + 8;
    if (typeof trophyCache !== 'undefined' && trophyCache) {
      pdf.addImage(trophyCache, 'PNG', PW / 2 - 12, champY, 24, 24);
    }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(...C.y);
    pdf.text(teamNameKo(data.extras.champion), PW / 2, champY + 32, { align: 'center' });
    pdf.setFontSize(8);
    pdf.setTextColor(...C.mut);
    pdf.text('Campeón del mundo', PW / 2, champY + 38, { align: 'center' });

    const safe = user.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    if (typeof downloadPdfBlob === 'function') {
      downloadPdfBlob(pdf, `porra-knockout-2026-${safe}.pdf`);
    } else {
      pdf.save(`porra-knockout-2026-${safe}.pdf`);
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
  window.renderKnockout = renderKnockout;
  window.pickKoWinner = pickKoWinner;
  window.setKoExtra = setKoExtra;
  window.setActiveKoUser = setActiveKoUser;
  window.submitKoPassword = submitKoPassword;
  window.hideKoPasswordModal = hideKoPasswordModal;
  window.exportKnockoutPDF = exportKnockoutPDF;
  window.requestKnockoutAccess = requestKnockoutAccess;
  window.KO_MATCH_TOTAL = KO_MATCH_TOTAL;
  window.PARTICIPANTS = PARTICIPANTS;

  loadKnockoutStore();
})();
