/* Lógica fase de grupos — Porra Mundial 2026 */
const MATCH_TOTAL = 72;
const IS_ADMIN = new URLSearchParams(location.search).get('admin') === '1';
const APP_BUILD = (typeof window !== 'undefined' && window.PORRA_BUILD) || '0';

function showAppReloadBannerIfNeeded() {
  if (!window.__appNeedsReload) return;
  if (document.getElementById('appReloadBanner')) return;
  const bar = document.createElement('div');
  bar.id = 'appReloadBanner';
  bar.className = 'app-reload-banner';
  bar.setAttribute('role', 'status');
  bar.innerHTML = '<p><strong>Nueva versión de la porra.</strong> Recarga para ver horarios y eliminatorias actualizados. <strong>Tus pronósticos guardados no se borran.</strong></p>' +
    '<button type="button" class="app-reload-btn" onclick="location.reload(true)">Recargar ahora</button>';
  document.body.prepend(bar);
}

(function checkAppBuild() {
  const key = 'porra2026_app_build';
  try {
    const prev = localStorage.getItem(key);
    if (prev && prev !== APP_BUILD) window.__appNeedsReload = true;
    localStorage.setItem(key, APP_BUILD);
  } catch (e) { /* */ }
})();

const SCHEDULE = (typeof window !== 'undefined' && window.PORRA_SCHEDULE) || {
  groupsClose: '2026-06-11T21:00:00+02:00',
  leaderboardOpen: '2026-06-27T00:00:00+02:00',
  extrasOpen: '2026-06-01T00:00:00+02:00'
};

function getKoOpenAt() {
  const ro = window.FIFA_KO_SCHEDULE && window.FIFA_KO_SCHEDULE.ROUND_OPENS;
  return (ro && ro.r32) || '2026-06-28T10:00:00+02:00';
}

function getKoPlazoCloseAt() {
  return (typeof window.KO_EXTRAS_LOCK_AT === 'string' && window.KO_EXTRAS_LOCK_AT)
    || (typeof window.KO_ROUND_CLOSES === 'object' && window.KO_ROUND_CLOSES.r32)
    || '2026-06-28T21:00:00+02:00';
}

function getCountdownToKoOpen() {
  const ms = new Date(getKoOpenAt()).getTime() - Date.now();
  if (ms <= 0) return null;
  const total = Math.floor(ms / 1000);
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
    ms
  };
}

function isGroupsOpen() { return Date.now() < new Date(SCHEDULE.groupsClose).getTime(); }
function isLeaderboardOpen() { return Date.now() >= new Date(SCHEDULE.leaderboardOpen).getTime(); }
function isExtrasOpen()  { return Date.now() >= new Date(SCHEDULE.extrasOpen).getTime(); }
function progressTotal() { return MATCH_TOTAL; }

let picks = {};
let results = {};
let leaderboardData = { entries: [] };
const flagCache = {};
let trophyCache = null;
let activePhaseTab = 'extras';

function getAllTeams() {
  const map = new Map();
  groups.forEach(g => g.teams.forEach(t => map.set(t.code, t)));
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

function teamByCode(code) {
  return getAllTeams().find(t => t.code === code);
}

function matchPicksDone() { return Object.keys(picks).length; }

function totalDoneCount() {
  return Object.keys(picks).length;
}

function isPorraComplete() {
  const name = document.getElementById('playerName')?.value.trim();
  if (!name) return false;
  return matchPicksDone() >= MATCH_TOTAL;
}

function getFirstIncompleteMatch() {
  for (const g of groups) {
    for (const m of g.matches) {
      if (!picks[m.id]) return { group: g, match: m };
    }
  }
  return null;
}

function scrollToFirstIncomplete() {
  const nameEl = document.getElementById('playerName');
  if (!nameEl.value.trim()) {
    nameEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    nameEl.focus();
    nameEl.classList.add('input-focus-hint');
    setTimeout(() => nameEl.classList.remove('input-focus-hint'), 2500);
    return;
  }

  const inc = getFirstIncompleteMatch();
  if (inc) {
    const el = document.getElementById('mr-' + inc.match.id);
    if (el) {
      el.classList.add('match-row-highlight');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => el.classList.remove('match-row-highlight'), 3000);
    }
    return;
  }
}

function updateFabHint() {
  const fab = document.getElementById('fabNext');
  const main = document.getElementById('fabMain');
  const sub = document.getElementById('fabSub');
  const icon = document.getElementById('fabIcon');
  if (!fab || !main || !sub) return;
  const nameOk = !!document.getElementById('playerName').value.trim();
  if (!nameOk) {
    if (icon) icon.textContent = '📝';
    main.textContent = 'Pon tu nombre';
    sub.textContent = 'Hace falta para exportar el PDF';
    fab.setAttribute('aria-label', 'Ir al campo de nombre');
    return;
  }
  const matchLeft = MATCH_TOTAL - matchPicksDone();
  if (matchLeft > 0) {
    if (icon) icon.textContent = '⚽';
    main.textContent = matchLeft === 1 ? 'Te falta 1 partido' : `Te faltan ${matchLeft} partidos`;
    sub.textContent = 'Toca para ir al que falta';
    fab.setAttribute('aria-label', `Ir al primer partido sin marcar. Faltan ${matchLeft}`);
    return;
  }
}

function updateExportButton() {
  const btn = document.getElementById('btnExport');
  const dockBtn = document.getElementById('btnExportDock');
  const dockHint = document.getElementById('dockHint');
  const hint = document.getElementById('exportHint');
  const note = document.getElementById('exportPhaseNote');
  const card = document.querySelector('.export-card');
  const fab = document.getElementById('fabNext');
  if (!btn || !hint) return;

  const nameOk = !!document.getElementById('playerName').value.trim();
  const complete = isPorraComplete();
  const canExport = nameOk && complete;

  btn.classList.toggle('is-locked', !canExport);
  btn.setAttribute('aria-disabled', canExport ? 'false' : 'true');
  if (dockBtn) {
    dockBtn.classList.toggle('is-locked', !canExport);
    dockBtn.classList.toggle('export-ready', canExport);
    dockBtn.setAttribute('aria-disabled', canExport ? 'false' : 'true');
    dockBtn.textContent = canExport ? '📄 Exportar PDF' : '📄 Ir a exportar';
  }
  if (card) card.classList.toggle('export-ready', canExport);
  if (fab) fab.classList.toggle('hidden-fab', complete || !isGroupsOpen());
  updateFabHint();

  if (!nameOk) {
    hint.innerHTML = 'Escribe tu <strong>nombre</strong> y completa los <strong>72 partidos</strong> de la fase de grupos para exportar.';
  } else if (matchPicksDone() < MATCH_TOTAL) {
    const left = MATCH_TOTAL - matchPicksDone();
    hint.innerHTML = 'Te faltan <strong>' + left + ' partido' + (left === 1 ? '' : 's') + '</strong> por marcar en la fase de grupos.';
  } else if (complete) {
    hint.innerHTML = '¡Quiniela de grupos completa! Pulsa el botón para descargar tu PDF.';
  }

  if (dockHint) {
    if (complete && nameOk) dockHint.innerHTML = '¡Listo! Pulsa <strong>Exportar PDF</strong> o usa el bloque de abajo.';
    else if (!nameOk) dockHint.innerHTML = 'Escribe tu <strong>nombre</strong> y marca los 72 partidos.';
    else if (matchPicksDone() < MATCH_TOTAL) dockHint.innerHTML = `Faltan <strong>${MATCH_TOTAL - matchPicksDone()}</strong> partidos por marcar.`;
    else dockHint.innerHTML = 'Casi listo — revisa los partidos pendientes.';
  }

  if (note) {
    note.style.display = '';
  }

  maybeCelebrate(canExport);
}

let _wasExportReady = false;
let _celebrationInitDone = false;

function maybeCelebrate(canExport) {
  if (!_celebrationInitDone) {
    _celebrationInitDone = true;
    _wasExportReady = canExport;
    return;
  }
  if (canExport && !_wasExportReady) {
    _wasExportReady = true;
    fireConfetti();
    const toast = document.getElementById('celebrationToast');
    if (toast) {
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4500);
    }
  }
  if (!canExport) _wasExportReady = false;
}

function fireConfetti() {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;width:100%;height:100%;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  const colors = ['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#fff', '#dc2626'];
  const pieces = Array.from({ length: 160 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height * 0.5 - canvas.height * 0.5,
    w: Math.random() * 8 + 4,
    h: Math.random() * 5 + 3,
    c: colors[Math.floor(Math.random() * colors.length)],
    vy: Math.random() * 2.5 + 1.5,
    vx: Math.random() * 2.4 - 1.2,
    rot: Math.random() * 360,
    vr: Math.random() * 12 - 6
  }));
  let frame = 0;
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.vy += 0.04;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    if (frame < 200) requestAnimationFrame(tick);
    else canvas.remove();
  }
  tick();
}

function handleExportClick() {
  if (!isPorraComplete() || !document.getElementById('playerName').value.trim()) {
    scrollToFirstIncomplete();
    return;
  }
  exportPDF();
}

function handleExportDockClick() {
  const section = document.getElementById('exportSection');
  const canExport = isPorraComplete() && document.getElementById('playerName').value.trim();
  if (canExport) {
    exportPDF();
    return;
  }
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => handleExportClick(), 450);
}

function initExportDock() {
  const dock = document.getElementById('exportDock');
  const section = document.getElementById('exportSection');
  if (!dock || !section) return;
  if (!window.IntersectionObserver) {
    dock.classList.remove('dock-hidden');
    return;
  }
  try {
    const obs = new IntersectionObserver((entries) => {
      const visible = entries.some(e => e.isIntersecting);
      dock.classList.toggle('dock-hidden', visible);
    }, { threshold: 0.12, rootMargin: '0px 0px -64px 0px' });
    obs.observe(section);
    dock.classList.remove('dock-hidden');
  } catch (e) {
    console.warn('exportDock', e);
    dock.classList.remove('dock-hidden');
  }
}

function getCountdownToKoLock() {
  return getCountdownToKoOpen();
}

function getActiveKoCountdownRound() {
  if (typeof isKoCuartosPhase === 'function' && isKoCuartosPhase()) return 'r8';
  if (typeof isKoOctavosPhase === 'function' && isKoOctavosPhase()) {
    if (typeof isKoRoundPickable === 'function' && isKoRoundPickable('r16')) return 'r16';
    if (typeof isKoRoundClosed === 'function' && isKoRoundClosed('r16')
      && typeof canViewCuartosBracket === 'function' && !canViewCuartosBracket()) return 'r8';
    return 'r16';
  }
  if (typeof isKoRoundPickable === 'function' && isKoRoundPickable('r16')
    && typeof shouldPrioritizeOctavos === 'function' && shouldPrioritizeOctavos()) {
    return 'r16';
  }
  if (typeof isKoRoundPickable === 'function' && isKoRoundPickable('r32')) return 'r32';
  return 'r32';
}

function renderKoCountdown() {
  const box = document.getElementById('koCountdownBox');
  if (!box) return;
  const koRound = getActiveKoCountdownRound();
  const closeC = typeof getCountdownToKoRoundClose === 'function' ? getCountdownToKoRoundClose(koRound) : null;
  let openC = null;
  if (!closeC) {
    if (koRound === 'r32') {
      openC = getCountdownToKoOpen();
    } else if (typeof getCountdownToKoRoundOpen === 'function') {
      openC = getCountdownToKoRoundOpen(koRound);
    }
  }
  const c = closeC || openC;
  if (!c) {
    box.classList.add('hidden');
    box.innerHTML = '';
    return;
  }
  const urgent = c.ms < 3600000 ? ' urgent' : '';
  let label;
  let when;
  if (closeC) {
    if (koRound === 'r8') {
      label = '⏳ Cierra el plazo de cuartos de final en:';
    } else if (koRound === 'r16') {
      label = '⏳ Cierra el plazo de octavos de final en:';
    } else {
      label = '⏳ Cierra el plazo (especiales + dieciseisavos) en:';
    }
    when = typeof formatKoRoundCloseShort === 'function' ? formatKoRoundCloseShort(koRound) : (koRound === 'r8' ? '9 jul, 22:00' : koRound === 'r16' ? '4 jul, 19:00' : '28 jun, 21:00');
  } else {
    if (koRound === 'r8') {
      label = '⏳ Abren cuartos de final en:';
      when = typeof formatKoOpensAtShort === 'function' ? formatKoOpensAtShort('r8') : '8 jul, 08:00';
    } else if (koRound === 'r16') {
      label = '⏳ Abren octavos de final en:';
      when = typeof formatKoOpensAtShort === 'function' ? formatKoOpensAtShort('r16') : '4 jul, 10:00';
    } else {
      label = '⏳ Abren eliminatorias en:';
      when = '28 jun, 10:00';
    }
  }
  box.classList.remove('hidden');
  box.innerHTML = `<span class="ko-countdown-label">${label} <strong>${when}</strong></span>` +
    `<span id="koCountdownTimer" class="ko-countdown-digits${urgent}">${formatCountdown(c)}</span>`;
}

function updateKoCountdownDisplay() {
  const koRound = getActiveKoCountdownRound();
  const closeC = typeof getCountdownToKoRoundClose === 'function' ? getCountdownToKoRoundClose(koRound) : null;
  let openC = null;
  if (!closeC) {
    if (koRound === 'r32') openC = getCountdownToKoOpen();
    else if (typeof getCountdownToKoRoundOpen === 'function') openC = getCountdownToKoRoundOpen(koRound);
  }
  const c = closeC || openC;
  if (c) {
    const el = document.getElementById('koCountdownTimer');
    if (!el) { renderKoCountdown(); return; }
    el.textContent = formatCountdown(c);
    el.classList.toggle('urgent', c.ms < 3600000);
    return;
  }
  renderKoCountdown();
}

function updateShareLinks() {
  const base = 'https://porra-mundial-2026-rust.vercel.app/';
  const cuartos = typeof shouldPrioritizeCuartos === 'function' && shouldPrioritizeCuartos()
    && typeof isKoRoundPickable === 'function' && isKoRoundPickable('r8');
  const octavos = !cuartos && typeof shouldPrioritizeOctavos === 'function' && shouldPrioritizeOctavos()
    && typeof isKoRoundPickable === 'function' && isKoRoundPickable('r16');
  const url = cuartos ? base + '?ko_round=cuartos' : octavos ? base + '?ko_round=octavos' : base;
  const msg = cuartos
    ? '⚽ Porra Mundial 2026 — cuartos de final abiertos. Marca tus cruces:'
    : octavos
      ? '⚽ Porra Mundial 2026 — octavos de final abiertos. Marca tus cruces:'
      : '⚽ Porra Mundial 2026 — la quiniela que cuenta son las eliminatorias';
  const wa = 'https://wa.me/?text=' + encodeURIComponent(url + ' ' + msg);
  document.querySelectorAll('.btn-share--wa').forEach(a => { a.href = wa; });
  document.querySelectorAll('.btn-share--official').forEach(a => { a.href = url; });
}

function getCountdownToGroupsClose() {
  const ms = new Date(SCHEDULE.groupsClose).getTime() - Date.now();
  if (ms <= 0) return null;
  const total = Math.floor(ms / 1000);
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
    ms
  };
}

function formatCountdown(c) {
  const p = n => String(n).padStart(2, '0');
  return p(c.h) + ':' + p(c.m) + ':' + p(c.s);
}

function renderScheduleBanner() {
  const el = document.getElementById('scheduleBanner');
  if (!el) return;
  if (isGroupsOpen()) {
    const c = getCountdownToGroupsClose();
    const digits = c ? formatCountdown(c) : '00:00:00';
    const urgent = c && c.ms < 3600000 ? ' urgent' : '';
    el.innerHTML = '<div class="schedule-banner schedule-open">' +
      '<div>⏰ <strong>¡Rellena tu quiniela!</strong> Fase de grupos abierta — cierra hoy <strong>11 de junio a las 21:00</strong> (inicio del primer partido)</div>' +
      '<div class="countdown-box">' +
      '<span class="countdown-label">Cuenta atrás para cerrar la fase de grupos:</span>' +
      '<span id="countdownTimer" class="countdown-digits' + urgent + '">' + digits + '</span>' +
      '</div></div>';
  } else if (!isExtrasOpen()) {
    el.innerHTML = '<div class="schedule-banner schedule-closed">🔒 <strong>Fase de grupos cerrada</strong> desde el 11 jun, 21:00. Ya no se pueden cambiar los pronósticos de grupos.</div>';
  } else if (typeof isKnockoutAccessible === 'function' && !isKnockoutAccessible()) {
    el.innerHTML = '<div class="schedule-banner schedule-closed">🔒 <strong>Eliminatorias</strong> — apertura oficial el <strong>28 de junio a las 10:00</strong> (hora peninsular)</div>';
  } else if (typeof isKoWaitingForCuartosPublic === 'function' && isKoWaitingForCuartosPublic()) {
    const opens = typeof formatKoOpensAtShort === 'function' ? formatKoOpensAtShort('r8') : '8 jul, 08:00';
    const codeHint = typeof shouldShowKoAccessCodeBtn === 'function' && shouldShowKoAccessCodeBtn()
      ? ' · <strong>🔑 Código</strong> para probar'
      : '';
    el.innerHTML = '<div class="schedule-banner schedule-closed">🔒 <strong>Octavos cerrados</strong> — partidos en juego · cuartos abren el <strong>' + opens + '</strong>' + codeHint + '</div>';
  } else if (typeof isKoDieciseisavosClosed === 'function' && isKoDieciseisavosClosed()
    && typeof canViewOctavosBracket === 'function' && !canViewOctavosBracket()
    && typeof isKoRoundClosedBySchedule === 'function' && !isKoRoundClosedBySchedule('r16')) {
    const opens = typeof formatKoOpensAtShort === 'function' ? formatKoOpensAtShort('r16') : '4 jul, 10:00';
    el.innerHTML = '<div class="schedule-banner schedule-closed">🔒 <strong>Dieciseisavos cerrados</strong> (28 jun, 21:00). Los octavos abren el <strong>' + opens + '</strong>. Organizadores: <strong>🔑 Código</strong> para probar antes.</div>';
  } else if (typeof isKoCuartosPreviewOnly === 'function' && isKoCuartosPreviewOnly()) {
    const closeLabel = typeof formatKoRoundCloseShort === 'function' ? formatKoRoundCloseShort('r8') : '9 jul, 22:00';
    el.innerHTML = '<div class="schedule-banner schedule-open">🧪 <strong>Cuartos en prueba</strong> (código) — el público los verá el <strong>8 jul, 08:00</strong> · cierran <strong>' + closeLabel + '</strong></div>';
  } else if (typeof isKoCuartosPhase === 'function' && isKoCuartosPhase()
    && typeof isKoRoundPickable === 'function' && isKoRoundPickable('r8')) {
    const closeLabel = typeof formatKoRoundCloseShort === 'function' ? formatKoRoundCloseShort('r8') : '9 jul, 22:00';
    el.innerHTML = '<div class="schedule-banner schedule-open">🏅 <strong>Cuartos de final abiertos</strong> — elige participante y marca cuartos · cierran <strong>' + closeLabel + '</strong></div>';
  } else if (typeof isKoCuartosPhase === 'function' && isKoCuartosPhase()
    && typeof isKoRoundClosed === 'function' && isKoRoundClosed('r8')) {
    const closeLabel = typeof formatKoRoundCloseShort === 'function' ? formatKoRoundCloseShort('r8') : '9 jul, 22:00';
    el.innerHTML = '<div class="schedule-banner schedule-closed">🔒 <strong>Cuartos de final cerrados</strong> — plazo finalizado a las <strong>' + closeLabel + '</strong></div>';
  } else if (typeof isKoOctavosPreviewOnly === 'function' && isKoOctavosPreviewOnly()) {
    const closeLabel = typeof formatKoRoundCloseShort === 'function' ? formatKoRoundCloseShort('r16') : '4 jul, 19:00';
    el.innerHTML = '<div class="schedule-banner schedule-open">🧪 <strong>Octavos en prueba</strong> (código) — el público los verá el <strong>4 jul, 10:00</strong> · cierran <strong>' + closeLabel + '</strong></div>';
  } else if (typeof isKoOctavosPhase === 'function' && isKoOctavosPhase()
    && typeof isKoRoundPickable === 'function' && isKoRoundPickable('r16')) {
    const closeLabel = typeof formatKoRoundCloseShort === 'function' ? formatKoRoundCloseShort('r16') : '4 jul, 19:00';
    el.innerHTML = '<div class="schedule-banner schedule-open">🏅 <strong>Octavos de final abiertos</strong> — elige participante y marca octavos · cierran <strong>' + closeLabel + '</strong></div>';
  } else if (typeof isKoOctavosPhase === 'function' && isKoOctavosPhase()
    && typeof isKoRoundClosed === 'function' && isKoRoundClosed('r16')
    && typeof canViewCuartosBracket === 'function' && !canViewCuartosBracket()) {
    const opens = typeof formatKoOpensAtShort === 'function' ? formatKoOpensAtShort('r8') : '8 jul, 08:00';
    el.innerHTML = '<div class="schedule-banner schedule-closed">🔒 <strong>Octavos cerrados</strong> — partidos en juego · cuartos abren el <strong>' + opens + '</strong></div>';
  } else if (typeof isKoRoundPickable === 'function' && isKoRoundPickable('r32')) {
    const closeLabel = typeof formatKoRoundCloseShort === 'function' ? formatKoRoundCloseShort('r32') : '28 jun, 21:00';
    el.innerHTML = '<div class="schedule-banner schedule-open">🏅 <strong>Plazo abierto (10:00–21:00)</strong> — elige participante, rellena <strong>especiales + dieciseisavos</strong> y exporta antes del <strong>' + closeLabel + '</strong></div>';
  } else if (typeof isKnockoutAccessible === 'function' && isKnockoutAccessible()) {
    el.innerHTML = '<div class="schedule-banner schedule-open">🏅 <strong>Eliminatorias</strong> — plazo único el 28 jun, <strong>10:00–21:00</strong> (participante, especiales y dieciseisavos)</div>';
  } else {
    el.innerHTML = '<div class="schedule-banner schedule-closed">🔒 <strong>Eliminatorias</strong> — apertura oficial el <strong>28 de junio a las 10:00</strong> (hora peninsular)</div>';
  }
}

function updateCountdownDisplay() {
  if (!isGroupsOpen()) return;
  const el = document.getElementById('countdownTimer');
  const c = getCountdownToGroupsClose();
  if (!el || !c) return;
  el.textContent = formatCountdown(c);
  el.classList.toggle('urgent', c.ms < 3600000);
}

function tickSchedule() {
  const g = isGroupsOpen(), e = isExtrasOpen(), lb = isLeaderboardOpen();
  const ko = typeof isKnockoutAccessible === 'function' ? isKnockoutAccessible() : e;
  const koOpenNow = typeof isKnockoutPublicOpen === 'function' ? isKnockoutPublicOpen() : ko;
  const koOpenDone = !!window._schedKoOpen;
  const r32Pickable = typeof isKoRoundPickable === 'function' ? isKoRoundPickable('r32') : false;
  const r32Closed = typeof isKoRoundClosed === 'function' ? isKoRoundClosed('r32') : false;
  const r16Pickable = typeof isKoRoundPickable === 'function' ? isKoRoundPickable('r16') : false;
  const r16Closed = typeof isKoRoundClosed === 'function' ? isKoRoundClosed('r16') : false;
  const r8Pickable = typeof isKoRoundPickable === 'function' ? isKoRoundPickable('r8') : false;
  const r8Closed = typeof isKoRoundClosed === 'function' ? isKoRoundClosed('r8') : false;
  updateCountdownDisplay();
  updateKoCountdownDisplay();
  if (g !== window._schedGroups || e !== window._schedExtras || lb !== window._schedLeaderboard || ko !== window._schedKo || koOpenNow !== koOpenDone || r32Pickable !== window._schedR32Pickable || r32Closed !== window._schedR32Closed || r16Pickable !== window._schedR16Pickable || r16Closed !== window._schedR16Closed || r8Pickable !== window._schedR8Pickable || r8Closed !== window._schedR8Closed) {
    window._schedGroups = g;
    window._schedExtras = e;
    window._schedLeaderboard = lb;
    window._schedKo = ko;
    window._schedKoOpen = koOpenNow;
    window._schedR32Pickable = r32Pickable;
    window._schedR32Closed = r32Closed;
    window._schedR16Pickable = r16Pickable;
    window._schedR16Closed = r16Closed;
    window._schedR8Pickable = r8Pickable;
    window._schedR8Closed = r8Closed;
    renderScheduleBanner();
    renderGroups();
    if (typeof renderKnockout === 'function') renderKnockout();
    renderKoCountdown();
    updateProgress();
    updateExportButton();
    updateShareLinks();
  }
}

function getPlayerDisplayName() {
  const raw = (document.getElementById('playerName')?.value || '').trim();
  return raw || 'amigo/a';
}

function showPhaseLockMessage(what, when) {
  const toast = document.getElementById('phaseLockToast');
  if (!toast) return;
  const name = getPlayerDisplayName();
  toast.innerHTML = `Hola, <strong>${name}</strong> — ${what} aún no está abierta.<br><span style="color:#fde68a">${when}</span>`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 5000);
}

function openDefaultPhaseTab() {
  if (typeof isKnockoutAccessible === 'function' && isKnockoutAccessible()) {
    switchPhaseTab('extras');
    return;
  }
  activePhaseTab = 'extras';
  document.getElementById('panelGrupos')?.classList.add('hidden');
  document.getElementById('panelExtras')?.classList.remove('hidden');
  document.getElementById('panelLeaderboard')?.classList.add('hidden');
  ['grupos', 'extras', 'leaderboard'].forEach(id => {
    const btn = document.getElementById('tab' + id.charAt(0).toUpperCase() + id.slice(1));
    if (btn) btn.classList.toggle('active', id === 'extras');
  });
  const dock = document.getElementById('exportDock');
  if (dock) dock.style.display = 'none';
  if (typeof renderKnockout === 'function') renderKnockout();
}

function switchPhaseTab(tab) {
  if (tab === 'extras' && typeof isKnockoutAccessible === 'function' && !isKnockoutAccessible()) {
    showPhaseLockMessage('Las eliminatorias', 'Apertura oficial el <strong>28 de junio a las 10:00</strong> (hora peninsular).');
    if (typeof requestKnockoutAccess === 'function') requestKnockoutAccess();
    return;
  }
  if (tab === 'leaderboard' && !isLeaderboardOpen()) {
    showPhaseLockMessage('La clasificación', 'Se publicará al terminar la <strong>fase de grupos</strong>.');
    return;
  }
  activePhaseTab = tab;
  document.getElementById('panelGrupos').classList.toggle('hidden', tab !== 'grupos');
  document.getElementById('panelExtras').classList.toggle('hidden', tab !== 'extras');
  document.getElementById('panelLeaderboard').classList.toggle('hidden', tab !== 'leaderboard');
  ['grupos', 'extras', 'leaderboard'].forEach(id => {
    const btn = document.getElementById('tab' + id.charAt(0).toUpperCase() + id.slice(1));
    if (btn) btn.classList.toggle('active', tab === id);
  });
  const dock = document.getElementById('exportDock');
  if (dock) dock.style.display = tab === 'grupos' ? '' : 'none';
  if (tab === 'leaderboard') renderLeaderboard();
  if (tab === 'extras' && typeof renderKnockout === 'function') {
    renderKnockout();
    renderQualifiedSummary();
    renderKoCountdown();
  }
  if (typeof syncPhaseTabA11y === 'function') syncPhaseTabA11y(tab);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updatePhaseTabs() {
  const tabExtras = document.getElementById('tabExtras');
  const tabLb = document.getElementById('tabLeaderboard');
  if (tabExtras) tabExtras.classList.toggle('is-locked', typeof isKnockoutAccessible === 'function' ? !isKnockoutAccessible() : !isExtrasOpen());
  if (tabLb) tabLb.classList.toggle('is-locked', !isLeaderboardOpen());
  if (activePhaseTab === 'extras' && typeof isKnockoutAccessible === 'function' && !isKnockoutAccessible()) switchPhaseTab('grupos');
  if (activePhaseTab === 'leaderboard' && !isLeaderboardOpen()) switchPhaseTab('grupos');
}

function loadMyScore() {
  try {
    const raw = localStorage.getItem('porra2026_my_score');
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function saveMyScore() {
  if (!isLeaderboardOpen()) {
    showPhaseLockMessage('La clasificación', 'Se publicará al terminar la <strong>fase de grupos</strong>.');
    return;
  }
  const name = getPlayerDisplayName();
  if (!name || name === 'amigo/a') {
    showPhaseLockMessage('Necesitas tu nombre', 'Escríbelo en la pestaña <strong>Grupos</strong> antes de registrar puntos.');
    switchPhaseTab('grupos');
    const nameEl = document.getElementById('playerName');
    if (nameEl) { nameEl.focus(); nameEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    return;
  }
  const pts = parseInt(document.getElementById('scorePoints')?.value, 10);
  if (isNaN(pts) || pts < 0) { alert('Introduce un número de puntos válido (0 o más).'); return; }
  const { played } = scoreStats();
  const entry = { name, points: pts, played: played || null, updatedAt: new Date().toISOString() };
  localStorage.setItem('porra2026_my_score', JSON.stringify(entry));
  renderLeaderboard();
  const toast = document.getElementById('phaseLockToast');
  if (toast) {
    toast.innerHTML = `✅ Guardado: <strong>${pts}</strong> puntos para <strong>${name}</strong>`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }
}

function copyScoreForManolin() {
  const name = getPlayerDisplayName();
  const pts = document.getElementById('scorePoints')?.value;
  if (!name || name === 'amigo/a' || pts === '' || pts == null) {
    alert('Escribe tu nombre y tus puntos antes de copiar.');
    return;
  }
  const text = `Porra Mundial 2026 — ${name}: ${pts} puntos (fase de grupos, provisional)`;
  navigator.clipboard.writeText(text).then(() => {
    alert('Copiado al portapapeles.\nEnvíaselo a Manolin por WhatsApp para que te meta en la tabla oficial.');
  }).catch(() => prompt('Copia este mensaje:', text));
}

function getLeaderboardEntries() {
  const shared = (leaderboardData.entries || []).slice();
  const my = loadMyScore();
  const names = new Set(shared.map(e => e.name.toLowerCase()));
  if (my && my.name && !names.has(my.name.toLowerCase())) {
    shared.push({ name: my.name, points: my.points, local: true });
  }
  return shared.sort((a, b) => (b.points || 0) - (a.points || 0) || a.name.localeCompare(b.name, 'es'));
}

const PODIUM_PRIZE_POOL = { 1: 60, 2: 30, 3: 10 };
/** Oculto en UI; la lógica y buildLeaderboardPrizeSummaryHTML se mantienen. */
const SHOW_LEADERBOARD_PRIZE_SUMMARY = false;

/** Desempate oficial: campeón → finalistas → semifinalistas (entry.tiebreak). */
function compareTiebreak(a, b) {
  const sa = a.tiebreak || {};
  const sb = b.tiebreak || {};
  if ((sb.champion || 0) !== (sa.champion || 0)) return (sb.champion || 0) - (sa.champion || 0);
  if ((sb.finalists || 0) !== (sa.finalists || 0)) return (sb.finalists || 0) - (sa.finalists || 0);
  if ((sb.semis || 0) !== (sa.semis || 0)) return (sb.semis || 0) - (sa.semis || 0);
  return 0;
}

function sortLeaderboardEntries(entries, useTiebreak) {
  return entries.slice().sort((a, b) => {
    const pd = (b.points || 0) - (a.points || 0);
    if (pd) return pd;
    if (useTiebreak) {
      const tb = compareTiebreak(a, b);
      if (tb) return tb;
    }
    return (a.name || '').localeCompare(b.name || '', 'es');
  });
}

/** Siempre 1, 2, 3… sin empates en el puesto (el desempate va en el orden previo). */
function computeUniqueRanks(sorted) {
  return sorted.map((_, i) => i + 1);
}

function computePrizeShares(ranks) {
  return ranks.map(r => {
    if (r === 1) return PODIUM_PRIZE_POOL[1];
    if (r === 2) return PODIUM_PRIZE_POOL[2];
    if (r === 3) return PODIUM_PRIZE_POOL[3];
    return null;
  });
}

function isKoPrizeLeaderboard(data) {
  return !!(data && data.phase === 'eliminatorias');
}

function formatPrizeSharePct(pct) {
  if (pct == null) return '';
  const rounded = Math.round(pct * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function getDisplayRank(sorted, index) {
  return index + 1;
}

function leaderboardRankCell(rank) {
  return String(rank);
}

function leaderboardFirstMedal(rank) {
  if (rank !== 1) return '';
  return '<span class="leaderboard-medal" aria-label="1º"> 🥇</span>';
}

function buildLeaderboardPrizeSummaryHTML(sorted, prizeShares) {
  const lines = [1, 2, 3].map(pos => {
    const e = sorted[pos - 1];
    if (!e || prizeShares[pos - 1] == null) return '';
    const tierLabel = pos === 1 ? '👑 1.º' : `${pos}.º`;
    const share = formatPrizeSharePct(prizeShares[pos - 1]);
    return `<li class="leaderboard-prize-item">
      <span class="leaderboard-prize-tier">${tierLabel}</span>
      <span class="leaderboard-prize-names">${escapeHtml(e.name)}</span>
      <span class="leaderboard-prize-amount"><strong>${share}%</strong> del bote</span>
    </li>`;
  }).filter(Boolean).join('');
  if (!lines) return '';
  return `<div class="leaderboard-prize-summary" role="region" aria-label="Reparto del bote">
    <p class="leaderboard-prize-title">💰 Reparto del bote (eliminatorias)</p>
    <ul class="leaderboard-prize-list">${lines}</ul>
    <p class="leaderboard-prize-rule">Un solo ganador por premio (60 % · 30 % · 10 %). Empate a puntos: desempate por aciertos en campeón, finalistas y semifinalistas (en ese orden).</p>
  </div>`;
}

function leaderboardHasBreakdown(entries) {
  return (entries || []).some(e => {
    const b = e.breakdown;
    return b && (b.grupos != null || b.r32 != null || b.r16 != null);
  });
}

function leaderboardBreakdownSubHTML(e) {
  const b = e.breakdown;
  if (!b) return '';
  const parts = [];
  if (b.grupos != null) parts.push('Gr. ' + b.grupos);
  if (b.r32 != null) parts.push('16 ' + b.r32);
  if (b.r16 != null) parts.push('Oct. ' + b.r16);
  if (!parts.length) return '';
  return '<span class="leaderboard-name-sub">' + parts.join(' · ') + '</span>';
}

function leaderboardBreakdownCells(e, showCols) {
  if (!showCols) return '';
  const b = e.breakdown || {};
  const g = b.grupos != null ? b.grupos : '—';
  const r32 = b.r32 != null ? b.r32 : '—';
  const r16 = b.r16 != null ? b.r16 : '—';
  return '<td class="leaderboard-breakdown-col">' + g + '</td><td class="leaderboard-breakdown-col">' + r32 + '</td><td class="leaderboard-breakdown-col">' + r16 + '</td>';
}

function renderLeaderboard() {
  if (!isLeaderboardOpen()) return;
  const tbody = document.getElementById('leaderboardBody');
  const empty = document.getElementById('leaderboardEmpty');
  const myCard = document.getElementById('myScoreCard');
  const hint = document.getElementById('scoreAutoHint');
  const ptsInput = document.getElementById('scorePoints');
  const scoreForm = document.getElementById('leaderboardScoreForm');
  const updatedEl = document.getElementById('leaderboardUpdated');
  if (!tbody) return;

  const official = (leaderboardData.entries || []).filter(e => e.name);
  const hasOfficial = official.length > 0;
  if (scoreForm) scoreForm.classList.toggle('hidden', hasOfficial);
  if (updatedEl) {
    if (hasOfficial && leaderboardData.updated) {
      updatedEl.textContent = 'Actualizado: ' + leaderboardData.updated + '.';
      updatedEl.classList.remove('hidden');
    } else {
      updatedEl.classList.add('hidden');
      updatedEl.textContent = '';
    }
  }

  const { played, correct } = scoreStats();
  if (!hasOfficial && ptsInput && (ptsInput.value === '' || ptsInput.dataset.auto === '1')) {
    if (played > 0) {
      ptsInput.value = correct;
      ptsInput.dataset.auto = '1';
      if (hint) hint.textContent = `En este móvil tienes ${correct} aciertos de ${played} partidos con resultado (puedes ajustarlo si cuentas desde el PDF).`;
    } else if (hint) {
      hint.textContent = 'Cuenta los aciertos de tu PDF y escribe el total aquí.';
    }
  } else if (hint && hasOfficial) {
    hint.textContent = '';
  }

  const my = loadMyScore();
  if (myCard) {
    if (my && !hasOfficial) {
      myCard.classList.remove('hidden');
      document.getElementById('myScoreName').textContent = my.name;
      document.getElementById('myScorePoints').textContent = my.points;
      if (ptsInput && ptsInput.value === '') ptsInput.value = my.points;
    } else {
      myCard.classList.add('hidden');
    }
  }

  const entries = hasOfficial
    ? official.slice().sort((a, b) => (b.points || 0) - (a.points || 0) || a.name.localeCompare(b.name, 'es'))
    : getLeaderboardEntries();
  const myName = getPlayerDisplayName().toLowerCase();
  const showBreakdown = hasOfficial && leaderboardHasBreakdown(entries);
  const table = document.getElementById('leaderboardTable');
  if (table) {
    table.classList.toggle('leaderboard-table--breakdown', showBreakdown);
    const ptsHeader = table.querySelector('th.leaderboard-points-col');
    if (ptsHeader) ptsHeader.textContent = showBreakdown ? 'Total' : 'Puntos';
  }
  const prizeSummaryEl = document.getElementById('leaderboardPrizeSummary');
  const prizeColHeader = document.querySelector('.leaderboard-prize-col-header');
  const isPrizePhase = isKoPrizeLeaderboard(leaderboardData);
  if (prizeColHeader) prizeColHeader.classList.toggle('hidden', !isPrizePhase);
  if (!entries.length) {
    tbody.innerHTML = '';
    if (prizeSummaryEl) { prizeSummaryEl.innerHTML = ''; prizeSummaryEl.classList.add('hidden'); }
    if (empty) empty.classList.remove('hidden');
    return;
  }
  if (empty) empty.classList.add('hidden');
  const sorted = sortLeaderboardEntries(entries, isPrizePhase);
  const ranks = computeUniqueRanks(sorted);
  const prizeShares = isPrizePhase ? computePrizeShares(ranks) : null;
  tbody.innerHTML = sorted.map((e, i) => {
    const isMe = e.name.toLowerCase() === myName;
    const suffix = !hasOfficial && e.local ? ' <span style="color:#9ca3af;font-size:.7rem">(tu registro)</span>' : '';
    const rankCell = leaderboardRankCell(ranks[i]);
    const prizeCol = isPrizePhase
      ? (prizeShares[i] != null
        ? `<td class="leaderboard-prize-cell"><span class="leaderboard-prize-col">${formatPrizeSharePct(prizeShares[i])}%</span></td>`
        : '<td class="leaderboard-prize-cell"><span class="leaderboard-prize-col leaderboard-prize-col--empty">—</span></td>')
      : '';
    const medal = hasOfficial ? leaderboardFirstMedal(ranks[i]) : '';
    const nameCell = `${e.name}${medal}${suffix}${showBreakdown ? leaderboardBreakdownSubHTML(e) : ''}`;
    const breakdownCols = showBreakdown ? leaderboardBreakdownCells(e, true) : '';
    return `<tr class="${isMe ? 'leaderboard-me' : ''}"><td class="leaderboard-rank">${rankCell}</td><td class="leaderboard-name">${nameCell}</td>${breakdownCols}<td class="leaderboard-points">${e.points}</td>${prizeCol}</tr>`;
  }).join('');
  if (prizeSummaryEl) {
    const html = isPrizePhase && SHOW_LEADERBOARD_PRIZE_SUMMARY ? buildLeaderboardPrizeSummaryHTML(sorted, prizeShares) : '';
    prizeSummaryEl.innerHTML = html;
    prizeSummaryEl.classList.toggle('hidden', !html);
  }
}

async function loadOfficialLeaderboard() {
  try {
    const res = await fetch('leaderboard.json?t=' + Date.now());
    if (!res.ok) return;
    const data = await res.json();
    leaderboardData = data && Array.isArray(data.entries) ? data : { entries: [] };
    renderLeaderboard();
    updateHeaderStats();
    if (IS_ADMIN) renderAdminLeaderboardEditor();
  } catch (e) { /* sin leaderboard aún */ }
}

function renderAdminLeaderboardEditor() {
  if (!IS_ADMIN) return;
  const el = document.getElementById('adminLeaderboardEditor');
  if (!el) return;
  if (!leaderboardData.entries) leaderboardData.entries = [];
  el.innerHTML = leaderboardData.entries.map((e, i) =>
    `<div class="flex items-center gap-2 text-xs py-1">
      <input class="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white" value="${(e.name || '').replace(/"/g, '&quot;')}" onchange="leaderboardData.entries[${i}].name=this.value"/>
      <input type="number" min="0" class="w-14 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white" value="${e.points || 0}" onchange="leaderboardData.entries[${i}].points=parseInt(this.value,10)||0"/>
      <button type="button" onclick="leaderboardData.entries.splice(${i},1);renderAdminLeaderboardEditor();renderLeaderboard();" class="text-red-400">✕</button>
    </div>`
  ).join('') || '<p class="text-xs text-gray-600">Sin entradas — añade filas o espera envíos por WhatsApp.</p>';
}

function adminAddLeaderboardRow() {
  if (!leaderboardData.entries) leaderboardData.entries = [];
  leaderboardData.entries.push({ name: '', points: 0 });
  renderAdminLeaderboardEditor();
}

function exportLeaderboardJson() {
  const json = JSON.stringify({ updated: new Date().toISOString().slice(0, 10), entries: leaderboardData.entries || [] }, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    alert('JSON copiado.\nPégalo en leaderboard.json y vuelve a desplegar en Vercel.');
  }).catch(() => prompt('Copia este JSON a leaderboard.json:', json));
}

// ============================================================
// HELPERS
// ============================================================
function teamInGroup(group, code) {
  return group.teams.find(t => t.code === code);
}

function teamName(group, code) {
  const t = teamInGroup(group, code);
  return t ? t.name : code;
}

function flagUrl(code, w) {
  return `https://flagcdn.com/w${w || 40}/${code}.png`;
}

function flagHTML(code, size) {
  size = size || 22;
  const h = Math.round(size * 0.72);
  return `<img src="${flagUrl(code, 80)}" alt="" class="flag-icon" width="${size}" height="${h}" loading="lazy"/>`;
}

function outcomeFromScore(h, a) {
  if (h > a) return '1';
  if (h < a) return '2';
  return 'X';
}

function getResult(matchId) {
  const r = results[matchId];
  if (!r || r.home === '' || r.away === '' || r.home == null || r.away == null) return null;
  const h = parseInt(r.home, 10), a = parseInt(r.away, 10);
  if (isNaN(h) || isNaN(a)) return null;
  return { home: h, away: a, outcome: outcomeFromScore(h, a) };
}

function findMatch(matchId) {
  for (const g of groups) {
    const m = g.matches.find(x => x.id === matchId);
    if (m) return { group: g, match: m };
  }
  return null;
}

function scoreStats() {
  let played = 0, correct = 0;
  groups.forEach(g => g.matches.forEach(m => {
    const res = getResult(m.id);
    const pick = picks[m.id];
    if (!res) return;
    played++;
    if (pick && pick === res.outcome) correct++;
  }));
  return { played, correct };
}

async function loadFlagDataUrl(code) {
  if (flagCache[code]) return flagCache[code];
  try {
    const res = await fetch(flagUrl(code, 40), { mode: 'cors' });
    const blob = await res.blob();
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    flagCache[code] = dataUrl;
    return dataUrl;
  } catch (e) {
    return null;
  }
}

function rasterizeToDataUrl(img, w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.getContext('2d').drawImage(img, 0, 0, w, h);
  return c.toDataURL('image/png');
}

async function loadImageAsDataUrl(path, w, h) {
  const res = await fetch(path);
  if (!res.ok) return null;
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const img = new Image();
    const obj = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(obj);
      resolve(rasterizeToDataUrl(img, w, h));
    };
    img.onerror = () => { URL.revokeObjectURL(obj); reject(new Error('img')); };
    img.src = obj;
  });
}

async function loadTrophyDataUrl() {
  if (trophyCache) return trophyCache;
  const sources = [
    { path: '/assets/wc2026-logo.png', w: 260, h: 260 }
  ];
  for (const src of sources) {
    try {
      trophyCache = await loadImageAsDataUrl(src.path, src.w, src.h);
      if (trophyCache) return trophyCache;
    } catch (e) { /* siguiente */ }
  }
  try {
    const res = await fetch('/assets/wc-trophy.svg');
    const svg = await res.text();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    trophyCache = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(rasterizeToDataUrl(img, 200, 260));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('svg')); };
      img.src = url;
    });
    return trophyCache;
  } catch (e) {
    return null;
  }
}

function downloadPdfBlob(pdf, filename) {
  const blob = pdf.output('blob');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 250);
}

function makePickPieDataUrl(counts, size) {
  size = size || 140;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const cx = size / 2, cy = size / 2, r = size / 2 - 3;
  const segments = [
    { v: counts['1'] || 0, rgb: [239, 68, 68] },
    { v: counts['X'] || 0, rgb: [234, 179, 8] },
    { v: counts['2'] || 0, rgb: [34, 197, 94] }
  ];
  const total = segments.reduce((s, x) => s + x.v, 0) || 1;
  let ang = -Math.PI / 2;
  segments.forEach(seg => {
    if (seg.v <= 0) return;
    const slice = (seg.v / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, ang, ang + slice);
    ctx.closePath();
    ctx.fillStyle = `rgb(${seg.rgb.join(',')})`;
    ctx.fill();
    ang += slice;
  });
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.52, 0, Math.PI * 2);
  ctx.fillStyle = 'rgb(14, 20, 34)';
  ctx.fill();
  return c.toDataURL('image/png');
}

// ============================================================
// STATE
// ============================================================
function loadState() {
  try {
    const saved = localStorage.getItem('porra2026v5');
    picks = saved ? JSON.parse(saved) : {};
    const nameEl = document.getElementById('playerName');
    if (nameEl) nameEl.value = localStorage.getItem('porra2026_name5') || '';
    results = {};
  } catch (e) {
    picks = {};
    results = {};
  }
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function showBootError(err, soft) {
  const box = document.getElementById('boot-error');
  if (!box) return;
  box.classList.remove('hidden');
  box.innerHTML =
    '<div class="boot-error-card">' +
    '<div class="boot-error-icon">' + (soft ? '⚽' : '🛠️') + '</div>' +
    '<h2>' + (soft ? 'Pequeño tropiezo al cargar' : 'No se pudo cargar la porra') + '</h2>' +
    '<p>' + (soft
      ? 'Puedes seguir usando la quiniela. Si algo se ve mal, recarga la página.'
      : 'Recarga con el botón de abajo. Usa el enlace de Vercel, no abras el archivo .html del ordenador.') + '</p>' +
    '<div class="boot-error-actions">' +
    '<button type="button" class="boot-error-btn" onclick="location.reload()">🔄 Recargar página</button>' +
    '<button type="button" class="boot-error-btn secondary" onclick="document.getElementById(\'boot-error\').classList.add(\'hidden\')">Seguir de todos modos</button>' +
    '</div>' +
    (err && err.message ? '<p class="boot-error-detail">' + escapeHtml(err.message) + '</p>' : '') +
    '</div>';
}

function saveState() {
  try {
    localStorage.setItem('porra2026v5', JSON.stringify(picks));
    localStorage.setItem('porra2026_name5', document.getElementById('playerName').value);
  } catch (e) {}
}

function saveResults() {
  try { localStorage.setItem('porra2026_results', JSON.stringify(results)); } catch (e) {}
}

function setPick(matchId, choice) {
  if (!isGroupsOpen() || getResult(matchId)) return;
  picks[matchId] = choice;
  saveState();
  renderMatchRow(matchId);
  updateProgress();
}

function clearAll() {
  if (!isGroupsOpen()) { alert('La fase de grupos está cerrada; no hay nada que borrar.'); return; }
  if (!confirm('¿Borrar tus selecciones de partidos de grupos?')) return;
  picks = {};
  _wasExportReady = false;
  saveState();
  renderGroups();
}

function setResult(matchId, side, value) {
  if (!results[matchId]) results[matchId] = { home: '', away: '' };
  results[matchId][side] = value;
  if (results[matchId].home === '' && results[matchId].away === '') {
    delete results[matchId];
  }
  saveResults();
  renderMatchRow(matchId);
  updateProgress();
  updateScoreHeader();
  refreshGroupStandingsAndKnockout();
}

function clearResult(matchId) {
  delete results[matchId];
  saveResults();
  renderMatchRow(matchId);
  updateProgress();
  updateScoreHeader();
  refreshGroupStandingsAndKnockout();
}

// ============================================================
// RENDER
// ============================================================
function renderGroupNav() {
  const nav = document.getElementById('groupNav');
  if (!nav) return;
  nav.innerHTML = groups.map(g => {
    const done = g.matches.every(m => picks[m.id]);
    return `<button type="button" class="group-nav-btn${done ? ' done' : ''}" data-group="${g.id}" onclick="scrollToGroup('${g.id}')">${g.id}</button>`;
  }).join('');
}

function scrollToGroup(id) {
  const el = document.getElementById('group-card-' + id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.classList.add('match-row-highlight');
    setTimeout(() => el.classList.remove('match-row-highlight'), 1500);
  }
  document.querySelectorAll('.group-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.group === id));
}

function renderGroups() {
  const container = document.getElementById('groups-grid');
  if (!container) throw new Error('No se encontró la cuadrícula de grupos');
  container.innerHTML = '';
  groups.forEach(g => {
    const card = document.createElement('div');
    card.className = 'group-card overflow-hidden';
    card.id = 'group-card-' + g.id;
    card.innerHTML = `
      <div class="group-header flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 flex-shrink-0">
          <span class="group-id-label">GRUPO</span>
          <span class="group-id-letter">${g.id}</span>
        </div>
        <div class="flex gap-1 flex-wrap justify-end items-center">${g.teams.map(t => flagHTML(t.code, 20)).join('')}</div>
      </div>
      <div>${g.matches.map(m => matchHTML(g, m)).join('')}</div>
      <div class="px-4 py-2 bg-gray-900 bg-opacity-50">
        <p class="group-standings-hint" id="gs-hint-${g.id}"></p>
        <div id="gs-${g.id}" class="group-standings-mini" aria-label="Clasificación grupo ${g.id}"></div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs text-gray-600">${g.matches.length} partidos</span>
          <span id="gc-${g.id}" class="text-yellow-500 font-semibold text-xs"></span>
        </div>
      </div>`;
    container.appendChild(card);
  });
  renderGroupNav();
  updateProgress();
  updateScoreHeader();
  groups.forEach(renderGroupStandings);
}

function matchHTML(group, m) {
  const p = picks[m.id];
  const res = getResult(m.id);
  const groupsLocked = !isGroupsOpen();
  const locked = groupsLocked || !!res;
  const pickOk = res && p && p === res.outcome;
  const pickBad = res && p && p !== res.outcome;
  const rowCls = ['match-row','px-3','py-2.5'];
  if (res) rowCls.push('has-result');
  if (pickOk) rowCls.push('pick-correct');
  if (pickBad) rowCls.push('pick-wrong');

  const cls1 = p === '1' ? 'active-1' : '';
  const clsX = p === 'X' ? 'active-x' : '';
  const cls2 = p === '2' ? 'active-2' : '';
  const lockCls = locked ? 'locked' : '';

  let resultBadge = '';
  if (res) {
    const badgeCls = pickOk ? 'correct' : (pickBad ? 'wrong' : '');
    const icon = pickOk ? '✓' : (pickBad ? '✗' : '·');
    resultBadge = `<span class="result-badge ${badgeCls}">${res.home}-${res.away} ${icon}</span>`;
  }

  return `<div class="${rowCls.join(' ')}" id="mr-${m.id}">
    <div class="match-meta">
      <span class="text-xs text-gray-500">${m.date}</span>
      <span class="hora-badge">${m.hour}</span>
      <span class="sede-badge">${m.venue}</span>
      ${resultBadge}
    </div>
    <div class="match-body">
      <div class="match-teams-line">
        <div class="match-team">
          ${flagHTML(m.home, 22)}
          <span class="match-team-name">${teamName(group, m.home)}</span>
        </div>
        <div class="match-team match-team-away">
          <span class="match-team-name">${teamName(group, m.away)}</span>
          ${flagHTML(m.away, 22)}
        </div>
      </div>
      <div class="match-picks">
        <button type="button" class="pick-btn ${cls1} ${lockCls}" onclick="setPick('${m.id}','1')" aria-label="Gana local">1</button>
        <button type="button" class="pick-btn ${clsX} ${lockCls}" onclick="setPick('${m.id}','X')" aria-label="Empate">X</button>
        <button type="button" class="pick-btn ${cls2} ${lockCls}" onclick="setPick('${m.id}','2')" aria-label="Gana visitante">2</button>
      </div>
    </div>
  </div>`;
}

function renderMatchRow(matchId) {
  const found = findMatch(matchId);
  if (!found) return;
  const el = document.getElementById(`mr-${matchId}`);
  if (!el) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = matchHTML(found.group, found.match);
  el.replaceWith(tmp.firstElementChild);
  updateGroupCount(found.group.id, found.group.matches);
}

function renderPickButtons(matchId) { renderMatchRow(matchId); }

function updateGroupCount(groupId, matches) {
  const el = document.getElementById(`gc-${groupId}`);
  const card = document.getElementById(`group-card-${groupId}`);
  const navBtn = document.querySelector(`.group-nav-btn[data-group="${groupId}"]`);
  const done = matches.filter(m => picks[m.id]).length;
  const complete = done === matches.length;
  if (el) {
    el.textContent = complete ? '✓ Completo' : `${done}/${matches.length}`;
    el.className = complete ? 'text-green-400 font-semibold text-xs' : 'text-yellow-500 font-semibold text-xs';
  }
  if (card) card.classList.toggle('group-complete', complete);
  if (navBtn) navBtn.classList.toggle('done', complete);
}

function getOfficialGroupStats(participantName) {
  const entries = (leaderboardData.entries || []).filter(e => e && e.name);
  if (!entries.length || !participantName) return null;
  const sorted = sortLeaderboardEntries(entries, false);
  const idx = sorted.findIndex(e => e.name.toLowerCase() === participantName.toLowerCase());
  if (idx < 0) return null;
  return { rank: getDisplayRank(sorted, idx), total: sorted.length, points: sorted[idx].points || 0 };
}

function setHeaderAciertos(correct, played) {
  const c = document.getElementById('totalCorrect');
  const p = document.getElementById('totalPlayed');
  const cm = document.getElementById('totalCorrectMobile');
  const pm = document.getElementById('totalPlayedMobile');
  if (c) c.textContent = correct;
  if (p) p.textContent = played;
  if (cm) cm.textContent = correct;
  if (pm) pm.textContent = played;
}

function setHeaderPuesto(rank, total) {
  document.getElementById('totalSelected').textContent = rank;
  const maxEl = document.getElementById('totalMax');
  if (maxEl) maxEl.textContent = total;
  const sm = document.getElementById('totalSelectedMobile');
  const smm = document.getElementById('totalMaxMobile');
  if (sm) sm.textContent = rank;
  if (smm) smm.textContent = total;
}

function updateHeaderStats() {
  const koUser = typeof getActiveKoUser === 'function' ? getActiveKoUser() : '';
  const official = koUser ? getOfficialGroupStats(koUser) : null;

  if (official) {
    setHeaderPuesto(String(official.rank), String(official.total));
    setHeaderAciertos(String(official.points), '72');
    return;
  }

  setHeaderPuesto('—', '—');
  setHeaderAciertos('—', '72');
}

window.updateHeaderStats = updateHeaderStats;

function updateProgress() {
  updateHeaderStats();
  const total = progressTotal();
  const allDone = totalDoneCount();
  const prog = document.getElementById('mainProgress');
  const pct = Math.round(allDone / total * 100);
  prog.style.width = pct + '%';
  prog.classList.toggle('complete', pct >= 100);
  groups.forEach(g => updateGroupCount(g.id, g.matches));
  updateExportButton();
}

function updateScoreHeader() {
  updateHeaderStats();
}

// ============================================================
// ADMIN
// ============================================================
function renderAdminEditor() {
  if (!IS_ADMIN) return;
  document.getElementById('adminPanel').classList.remove('hidden');
  const editor = document.getElementById('adminEditor');
  editor.innerHTML = groups.flatMap(g => g.matches.map(m => {
    const r = results[m.id] || { home: '', away: '' };
    return `<div class="flex items-center gap-2 text-xs py-1 border-b border-gray-800">
      <span class="w-8 text-gray-500">${m.id}</span>
      <span class="flex-1 truncate text-gray-400">${teamName(g, m.home)} vs ${teamName(g, m.away)}</span>
      <input type="number" min="0" max="20" class="score-input" value="${r.home}" placeholder="L"
        onchange="setResult('${m.id}','home',this.value)" oninput="setResult('${m.id}','home',this.value)"/>
      <span class="text-gray-600">-</span>
      <input type="number" min="0" max="20" class="score-input" value="${r.away}" placeholder="V"
        onchange="setResult('${m.id}','away',this.value)" oninput="setResult('${m.id}','away',this.value)"/>
      <button onclick="clearResult('${m.id}')" class="text-gray-600 hover:text-red-400 px-1" title="Borrar">✕</button>
    </div>`;
  })).join('');
}

function toggleAdminExpand() {
  const ed = document.getElementById('adminEditor');
  const btn = document.getElementById('adminToggleBtn');
  const hidden = ed.classList.toggle('hidden');
  btn.textContent = hidden ? 'Mostrar editor de resultados' : 'Ocultar editor de resultados';
}

// ============================================================
// CLASIFICACIÓN (resultados reales si hay, si no picks)
// ============================================================
function computeGroupTable(group, resultsOnly) {
  const pts = {};
  group.teams.forEach(t => {
    pts[t.code] = { code: t.code, name: t.name, p: 0, gf: 0, ga: 0, gd: 0, g: 0, w: 0, d: 0, l: 0 };
  });

  group.matches.forEach(m => {
    const res = getResult(m.id);
    let hG;
    let aG;
    if (res) {
      hG = res.home;
      aG = res.away;
    } else if (!resultsOnly) {
      const pick = picks[m.id];
      if (!pick) return;
      if (pick === '1') { hG = 1; aG = 0; }
      else if (pick === 'X') { hG = 0; aG = 0; }
      else { hG = 0; aG = 1; }
    } else {
      return;
    }
    const h = pts[m.home];
    const a = pts[m.away];
    if (!h || !a) return;
    h.g++; a.g++;
    h.gf += hG; h.ga += aG;
    a.gf += aG; a.ga += hG;
    if (hG > aG) { h.p += 3; h.w++; a.l++; }
    else if (hG < aG) { a.p += 3; a.w++; h.l++; }
    else { h.p += 1; a.p += 1; h.d++; a.d++; }
  });

  return Object.values(pts)
    .map(t => ({ ...t, gd: t.gf - t.ga }))
    .sort((a, b) => b.p - a.p || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name, 'es'));
}

function teamMatchCount(group, code) {
  return group.matches.filter(m => m.home === code || m.away === code).length;
}

function teamOfficialResultsPlayed(group, code) {
  return group.matches.filter(m => (m.home === code || m.away === code) && getResult(m.id)).length;
}

function getTeamQualificationRecord(code) {
  if (!code || code === 'tbd') return null;
  const posLabels = ['1º', '2º', '3º', '4º'];
  for (const g of groups) {
    const table = computeGroupTable(g, true);
    const idx = table.findIndex(t => t.code === code);
    if (idx < 0) continue;
    const row = table[idx];
    if (!row.g) return null;
    const posLabel = posLabels[idx] || (idx + 1) + 'º';
    const teamTotal = teamMatchCount(g, code);
    const teamPlayedOfficial = teamOfficialResultsPlayed(g, code);
    const provisional = teamPlayedOfficial < teamTotal;
    return {
      groupId: g.id,
      pos: idx + 1,
      label: `${posLabel} Gr. ${g.id}`,
      pts: row.p,
      w: row.w,
      d: row.d,
      l: row.l,
      gf: row.gf,
      ga: row.ga,
      gd: row.gd,
      played: row.g,
      total: teamTotal,
      provisional,
      line1: `${posLabel} Gr.${g.id} · ${row.p} pt`,
      line2: `${row.w}-${row.d}-${row.l} · ${row.gf}:${row.ga}`,
      short: `${posLabel} Gr.${g.id} · ${row.p}pt · ${row.w}-${row.d}-${row.l} · ${row.gf}:${row.ga}${provisional ? ' · prov.' : ''}`,
      detail: `${posLabel} del grupo ${g.id} · ${row.p} puntos · ${row.w}V ${row.d}E ${row.l}D · goles ${row.gf}:${row.ga} (${row.gd >= 0 ? '+' : ''}${row.gd})${provisional ? ' · provisional' : ''}`
    };
  }
  return null;
}

window.getTeamQualificationRecord = getTeamQualificationRecord;

function isGroupComplete(group) {
  return group.matches.every(m => getResult(m.id));
}

const BEST_THIRD_SLOTS = 8;

function compareBestThird(a, b) {
  if (typeof window.compareThirdPlaceEntry === 'function') return window.compareThirdPlaceEntry(a, b);
  return b.p - a.p || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name, 'es');
}

function getThirdPlaceEntry(group, standings) {
  const table = standings[group.id];
  if (!table || table.length < 3) return null;
  const row = table[2];
  if (!row || !row.g) return null;
  const groupComplete = isGroupComplete(group);
  const teamPlayedOfficial = teamOfficialResultsPlayed(group, row.code);
  const teamTotal = teamMatchCount(group, row.code);
  return {
    code: row.code,
    name: row.name,
    groupId: group.id,
    p: row.p,
    gd: row.gd,
    gf: row.gf,
    ga: row.ga,
    w: row.w,
    d: row.d,
    l: row.l,
    groupComplete,
    provisional: !groupComplete || teamPlayedOfficial < teamTotal
  };
}

function getBestThirdQualifiers() {
  const standings = buildOfficialGroupStandings();
  const all = groups.map(g => getThirdPlaceEntry(g, standings)).filter(Boolean);
  all.sort(compareBestThird);
  const qualifying = all.slice(0, BEST_THIRD_SLOTS);
  const qualifyingCodes = new Set(qualifying.map(t => t.code));
  const allGroupsClosed = groups.every(isGroupComplete);
  return { all, qualifying, qualifyingCodes, allGroupsClosed };
}

window.getBestThirdQualifiers = getBestThirdQualifiers;

function getQualifiedSummaryData() {
  const standings = buildOfficialGroupStandings();
  const { qualifying, qualifyingCodes, allGroupsClosed } = getBestThirdQualifiers();
  const groupCards = [];
  groups.forEach(g => {
    if (!isGroupComplete(g)) return;
    const table = standings[g.id] || computeGroupTable(g, true);
    groupCards.push({
      id: g.id,
      rows: table.slice(0, 4)
    });
  });
  groupCards.sort((a, b) => a.id.localeCompare(b.id));
  return { groupCards, qualifying, qualifyingCodes, allGroupsClosed };
}

function renderQualifiedSummary() {
  const data = getQualifiedSummaryData();

  const groupsEl = document.getElementById('qualifiedSummary');
  if (groupsEl) {
    const html = buildGroupsQualifiedSummaryHTML(data);
    if (!html) {
      groupsEl.classList.add('hidden');
      groupsEl.innerHTML = '';
    } else {
      groupsEl.classList.remove('hidden');
      groupsEl.innerHTML = html;
    }
  }

  const koEl = document.getElementById('koQualifiedSummary');
  if (koEl) {
    if ((typeof isKoDieciseisavosClosed === 'function' && isKoDieciseisavosClosed())
      || (typeof isKoOctavosPhase === 'function' && isKoOctavosPhase())) {
      koEl.classList.add('hidden');
      koEl.innerHTML = '';
    } else {
      const html = buildKoQualifiedFootHTML(data);
      if (!html) {
        koEl.classList.add('hidden');
        koEl.innerHTML = '';
      } else {
        koEl.classList.remove('hidden');
        koEl.innerHTML = html;
      }
    }
  }
}

function buildGroupsQualifiedSummaryHTML(data) {
  const { groupCards, qualifying, allGroupsClosed } = data;
  const cards = [];
  const posLabels = ['1º', '2º', '3º', '4º'];
  const posClasses = ['', '', ' qualified-team-pos--third', ' qualified-team-pos--fourth'];

  groupCards.forEach(g => {
    const rows = g.rows.map((t, i) =>
      `<div class="qualified-team-row">
        <span class="qualified-team-pos${posClasses[i] || ''}">${posLabels[i]}</span>
        ${flagHTML(t.code, 18)}
        <span class="qualified-team-name">${t.name}</span>
        <span class="qualified-team-meta">${t.p} pt</span>
      </div>`
    ).join('');
    cards.push(`<div class="qualified-group-card">
      <span class="qualified-group-id">Grupo ${g.id}</span>
      ${rows}
    </div>`);
  });

  let thirdsBlock = '';
  if (qualifying.length) {
    const provHint = allGroupsClosed
      ? 'Clasificación final: estos 8 mejores terceros completan los dieciseisavos.'
      : 'Provisional: puede cambiar mientras sigan partidos en otros grupos.';
    const rows = qualifying.map((t, i) => {
      const prov = t.provisional ? '<span class="ko-qual-prov">prov.</span>' : '';
      return `<div class="qualified-team-row">
        <span class="qualified-team-pos qualified-team-pos--third-qual">${i + 1}.</span>
        ${flagHTML(t.code, 18)}
        <span class="qualified-team-name">${t.name}</span>
        <span class="qualified-team-meta">Gr.${t.groupId} · ${t.p} pt${prov}</span>
      </div>`;
    }).join('');
    thirdsBlock = `<div class="qualified-thirds-block">
      <p class="qualified-summary-title qualified-summary-title--thirds">🥉 Mejores terceros que clasifican (${qualifying.length} de ${BEST_THIRD_SLOTS})</p>
      <div class="qualified-thirds-list">${rows}</div>
      <p class="qualified-summary-hint">De los 12 terceros, pasan los 8 mejores (puntos, diferencia, goles a favor, fair play y ranking FIFA). ${provHint}</p>
    </div>`;
  }

  if (!cards.length && !thirdsBlock) return '';

  let main = '';
  if (cards.length) {
    main = `<p class="qualified-summary-title">✅ Grupos cerrados (${cards.length})</p>
      <div class="qualified-grid">${cards.join('')}</div>
      <p class="qualified-summary-hint">1º y 2º pasan directo. De los 3º, clasifican los 8 mejores.</p>`;
  }
  return main + thirdsBlock;
}

function buildKoQualifiedFootHTML(data) {
  const { groupCards, qualifying, qualifyingCodes, allGroupsClosed } = data;
  if (!groupCards.length && !qualifying.length) return '';

  const posLabels = ['1º', '2º', '3º', '4º'];
  let groupsSection = '';

  if (groupCards.length) {
    const cards = groupCards.map(g => {
      const items = g.rows.map((t, i) => {
        const itemCls = ['ko-qual-list-item'];
        if (i < 2) itemCls.push('ko-qual-list-item--passes');
        if (i === 2 && qualifyingCodes.has(t.code)) itemCls.push('ko-qual-list-item--qualifies-third');
        return `<li class="${itemCls.join(' ')}">
          <span class="ko-qual-list-pos ko-qual-list-pos--${i + 1}">${posLabels[i]}</span>
          ${flagHTML(t.code, 14)}
          <span class="ko-qual-list-name">${t.name}</span>
          <span class="ko-qual-list-pts">${t.p} pt</span>
        </li>`;
      }).join('');
      return `<article class="ko-qual-group-card">
        <div class="ko-qual-group-head">Grupo ${g.id}</div>
        <ul class="ko-qual-list">${items}</ul>
      </article>`;
    }).join('');
    groupsSection = `<div class="ko-qual-section">
      <p class="ko-qual-section-title">Grupos cerrados (${groupCards.length})</p>
      <div class="ko-qual-groups-grid">${cards}</div>
    </div>`;
  }

  let thirdsSection = '';
  if (qualifying.length) {
    const prov = allGroupsClosed ? '' : ' <span class="ko-qual-prov">(provisional)</span>';
    const items = qualifying.map((t, i) =>
      `<li class="ko-qual-list-item ko-qual-list-item--qualifies-third">
        <span class="ko-qual-rank">${i + 1}.</span>
        ${flagHTML(t.code, 14)}
        <span class="ko-qual-list-name">${t.name}</span>
        <span class="ko-qual-list-meta">Gr. ${t.groupId} · ${t.p} pt</span>
      </li>`
    ).join('');
    thirdsSection = `<div class="ko-qual-section">
      <p class="ko-qual-section-title">8 mejores 3º${prov}</p>
      <ul class="ko-qual-list ko-qual-thirds-list">${items}</ul>
    </div>`;
  }

  const note = allGroupsClosed ? '' : '<p class="ko-qual-panel-note">Provisional — puede cambiar.</p>';

  return `<section class="ko-qual-panel" aria-label="Clasificación a dieciseisavos">
    <h3 class="ko-qual-panel-title">📋 Clasificación</h3>
    ${groupsSection}
    ${thirdsSection}
    ${note}
  </section>`;
}

function buildQualifiedSummaryHTML() {
  return buildGroupsQualifiedSummaryHTML(getQualifiedSummaryData());
}

function buildOfficialGroupStandings() {
  const out = {};
  groups.forEach(g => { out[g.id] = computeGroupTable(g, true); });
  return out;
}

function groupStandingsHint(group) {
  const played = group.matches.filter(m => getResult(m.id)).length;
  if (!played) return '';
  if (played === group.matches.length) return 'Clasificación final del grupo';
  return `Provisional · ${played}/${group.matches.length} partidos jugados`;
}

function renderGroupStandings(group) {
  const box = document.getElementById(`gs-${group.id}`);
  const hint = document.getElementById(`gs-hint-${group.id}`);
  if (!box) return;
  const table = computeGroupTable(group, true);
  const qualifyingCodes = window._bestThirdQualifiers?.qualifyingCodes || new Set();
  if (hint) hint.textContent = groupStandingsHint(group);
  if (!table.some(t => t.g > 0)) {
    box.innerHTML = '<span class="text-xs text-gray-600">Sin resultados oficiales aún</span>';
    return;
  }
  box.innerHTML = table.map((t, i) => {
    const leader = i === 0 ? ' group-standings-row--leader' : '';
    const qualified = isGroupComplete(group) && i < 2 ? ' group-standings-row--qualified' : '';
    const thirdQual = i === 2 && qualifyingCodes.has(t.code) ? ' group-standings-row--third-qualifies' : '';
    const pos = i === 0 ? '1º' : (i === 1 ? '2º' : (i === 2 ? '3º' : (i + 1) + 'º'));
    let badge = '';
    if (isGroupComplete(group) && i < 2) {
      badge = `<span class="group-standings-badge">${pos} · pasa</span>`;
    } else if (i === 2 && qualifyingCodes.has(t.code)) {
      badge = '<span class="group-standings-badge group-standings-badge--third">3º · clasifica</span>';
    }
    return `<div class="group-standings-row${leader}${qualified}${thirdQual}">
      <span class="group-standings-pos">${pos}</span>
      ${flagHTML(t.code, 14)}
      <span class="truncate">${t.name}</span>
      ${badge || `<span class="group-standings-pts">${t.p} pt</span>`}
    </div>`;
  }).join('');
}

function refreshGroupStandingsAndKnockout() {
  window._bestThirdQualifiers = getBestThirdQualifiers();
  groups.forEach(renderGroupStandings);
  renderQualifiedSummary();
  if (typeof syncKnockoutGroupSeeds === 'function') {
    syncKnockoutGroupSeeds(buildOfficialGroupStandings());
  }
  if (typeof syncKnockoutBracketFromResults === 'function') {
    syncKnockoutBracketFromResults();
  }
  if (typeof renderKnockout === 'function') renderKnockout();
}

function simulateGroup(group) {
  return computeGroupTable(group, false);
}

function classificationLabel() {
  const anyResult = groups.some(g => g.matches.some(m => getResult(m.id)));
  return anyResult ? 'CLASIFICACIÓN (resultados reales)' : 'CLASIFICACIÓN ESTIMADA';
}

// ============================================================
// PDF EXPORT
// ============================================================
async function exportPDF() {
  if (!isPorraComplete()) { scrollToFirstIncomplete(); return; }
  const btn = document.getElementById('btnExport');
  btn.classList.add('is-locked', 'opacity-60');
  btn.setAttribute('aria-disabled', 'true');
  try {
    await exportPDFInner();
  } finally {
    updateExportButton();
    btn.classList.remove('opacity-60');
  }
}

async function exportPDFInner() {
  const name = document.getElementById('playerName').value.trim();
  if (!name || !isPorraComplete()) { scrollToFirstIncomplete(); return; }
  const matchDone = Object.keys(picks).length;
  const done = totalDoneCount();
  const { played, correct } = scoreStats();
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const C = {
    bg: [10, 14, 26], hdr: [30, 58, 95], card: [17, 24, 39], brd: [55, 65, 81],
    txt: [255, 255, 255], mut: [156, 163, 175],
    r: [239, 68, 68], y: [234, 179, 8], g: [34, 197, 94], bl: [37, 99, 235]
  };
  const PW = 210, PH = 297, M = 10, GAP = 3, CW = (PW - M * 2 - GAP) / 2;
  const FLAG_W = 2.8, FLAG_H = 2.1;
  const PAGE_TOP = 16, PAGE_BOTTOM = PH - 11;
  const counts = { 1: 0, X: 0, 2: 0 };
  Object.values(picks).forEach(p => { if (counts[p] !== undefined) counts[p]++; });
  const total3 = counts['1'] + counts['X'] + counts['2'] || 1;
  const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  function bgPage() { pdf.setFillColor(...C.bg); pdf.rect(0, 0, PW, PH, 'F'); }
  bgPage();

  const codes = new Set();
  groups.forEach(g => { g.teams.forEach(t => codes.add(t.code)); });
  await Promise.all([...codes].map(c => loadFlagDataUrl(c)).concat(loadTrophyDataUrl()));

  let y = PAGE_TOP;

  // ---- Portada PDF (logo FIFA + nombre + quesito 1/X/2) ----
  const cardW = PW - M * 2, cardX = M, pad = 5;
  const headerH = 15;
  const pieDataUrl = makePickPieDataUrl(counts);
  const displayName = name.trim().replace(/\S+/g, w =>
    w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  );
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  const nameLines = pdf.splitTextToSize(displayName, cardW - pad * 2);
  const nameBlockH = nameLines.length * 5 + 6;
  const logoW = 20, logoH = 20, pieSize = 13, legW = 36, vizGap = 5;
  const vizRowH = Math.max(logoH, pieSize);
  const vizBlockH = vizRowH + 3;
  const introH = headerH + 5 + nameBlockH + vizBlockH + 7;

  pdf.setFillColor(12, 18, 32);
  pdf.roundedRect(cardX, y, cardW, introH, 3, 3, 'F');
  pdf.setFillColor(30, 58, 95);
  pdf.roundedRect(cardX, y, cardW, headerH, 3, 3, 'F');
  pdf.setFillColor(18, 52, 42);
  pdf.rect(cardX, y + headerH * 0.55, cardW, introH - headerH * 0.55, 'F');
  pdf.setDrawColor(75, 85, 99);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(cardX, y, cardW, introH, 3, 3, 'S');
  pdf.setDrawColor(250, 204, 21);
  pdf.setLineWidth(0.45);
  pdf.line(cardX + pad, y + 11, cardX + cardW - pad, y + 11);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(250, 204, 21);
  pdf.text('PORRA MUNDIAL 2026', cardX + pad, y + 7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(5.5);
  pdf.setTextColor(...C.mut);
  pdf.text('Fase de grupos · Hora CEST', cardX + pad, y + 14.5);
  pdf.text('USA · México · Canadá', cardX + cardW - pad, y + 7.5, { align: 'right' });

  const greenY = y + headerH + 4;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(...C.txt);
  pdf.text(nameLines, PW / 2, greenY, { align: 'center' });
  const nameEndY = greenY + (nameLines.length - 1) * 5;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.2);
  pdf.setTextColor(...C.mut);
  let progLine = `${matchDone}/${MATCH_TOTAL} partidos  ·  ${today}`;
  pdf.text(progLine, PW / 2, nameEndY + 5, { align: 'center' });

  const vizY = nameEndY + 10;
  const rowW = logoW + vizGap + pieSize + vizGap + legW;
  const rowX = (PW - rowW) / 2;
  if (trophyCache) {
    pdf.addImage(trophyCache, 'PNG', rowX, vizY, logoW, logoH);
  }
  const pieX = rowX + logoW + vizGap;
  const pieY = vizY + (vizRowH - pieSize) / 2;
  pdf.addImage(pieDataUrl, 'PNG', pieX, pieY, pieSize, pieSize);

  const legX = pieX + pieSize + vizGap;
  let legY = vizY + 2.5;
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'bold');
  [
    { lbl: '1 — Local', cnt: counts['1'], col: C.r },
    { lbl: 'X — Empate', cnt: counts['X'], col: C.y },
    { lbl: '2 — Visitante', cnt: counts['2'], col: C.g }
  ].forEach(row => {
    pdf.setFillColor(...row.col);
    pdf.circle(legX + 1.2, legY - 0.8, 1.1, 'F');
    pdf.setTextColor(...C.txt);
    pdf.text(row.lbl, legX + 3.5, legY);
    pdf.setTextColor(...row.col);
    pdf.text(String(row.cnt), legX + legW - 2, legY, { align: 'right' });
    legY += 4.2;
  });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(5.2);
  pdf.setTextColor(120, 130, 150);
  const rulesY = vizY + vizRowH + 5;
  pdf.text('10 € por persona  ·  1 punto por acierto  ·  Premios 60 / 30 / 10 %', PW / 2, rulesY, { align: 'center' });

  y += introH + 4;

  let colY = [y, y], col = 0;
  const matchH = 6.8, headH = 7, footH = 5.5;

  function placeGroup(groupH) {
    if (colY[col] + groupH > PAGE_BOTTOM) {
      if (col === 0 && colY[1] + groupH <= PAGE_BOTTOM) col = 1;
      else { pdf.addPage(); bgPage(); colY = [PAGE_TOP, PAGE_TOP]; col = 0; }
    }
  }

  for (const group of groups) {
    const groupH = headH + group.matches.length * matchH + footH;
    placeGroup(groupH);

    const xOff = M + col * (CW + GAP);
    let gy = colY[col];

    pdf.setFillColor(...C.card); pdf.setDrawColor(...C.brd);
    pdf.roundedRect(xOff, gy, CW, groupH, 2, 2, 'FD');
    pdf.setFillColor(...C.hdr);
    pdf.roundedRect(xOff, gy, CW, headH, 2, 2, 'F');
    pdf.setTextColor(...C.txt); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8);
    pdf.text(`GRUPO ${group.id}`, xOff + 2.5, gy + 4.8);

    let fx = xOff + CW - 2;
    [...group.teams].reverse().forEach(t => {
      const img = flagCache[t.code];
      if (img) {
        fx -= FLAG_W + 0.4;
        pdf.addImage(img, 'PNG', fx, gy + 1.8, FLAG_W, FLAG_H);
      }
    });
    gy += headH;

    for (let idx = 0; idx < group.matches.length; idx++) {
      const match = group.matches[idx];
      const my = gy + idx * matchH;
      const pick = picks[match.id];
      const res = getResult(match.id);

      if (idx % 2 === 1) { pdf.setFillColor(25, 35, 50); pdf.rect(xOff + 0.5, my, CW - 1, matchH - 0.2, 'F'); }
      if (res && pick) {
        const ok = pick === res.outcome;
        pdf.setFillColor(...(ok ? [20, 50, 35] : [50, 25, 25]));
        pdf.rect(xOff + 0.5, my, 1, matchH - 0.2, 'F');
      }

      pdf.setFontSize(4); pdf.setTextColor(...C.mut); pdf.setFont('helvetica', 'normal');
      pdf.text(`${match.date} ${match.hour}`, xOff + 2, my + 2.8);

      const hImg = flagCache[match.home], aImg = flagCache[match.away];
      const hN = teamName(group, match.home).substring(0, 9);
      const aN = teamName(group, match.away).substring(0, 9);
      const midY = my + 5.2;

      if (hImg) pdf.addImage(hImg, 'PNG', xOff + 2, midY - 1.8, FLAG_W, FLAG_H);
      pdf.setFontSize(5.2); pdf.setTextColor(...C.txt);
      pdf.text(hN, xOff + 2 + FLAG_W + 0.8, midY);

      if (aImg) pdf.addImage(aImg, 'PNG', xOff + CW - 2 - FLAG_W, midY - 1.8, FLAG_W, FLAG_H);
      pdf.text(aN, xOff + CW - 2 - FLAG_W - 0.8, midY, { align: 'right' });

      if (res) {
        pdf.setFontSize(4.5); pdf.setTextColor(...C.bl);
        pdf.text(`${res.home}-${res.away}`, xOff + CW / 2, my + 2.8, { align: 'center' });
      }

      const bS = 3.6, bY = my + 1.2, btnX = xOff + CW / 2;
      ['1', 'X', '2'].forEach((opt, i) => {
        const bx2 = btnX - 5.4 + i * 5.4;
        const isPicked = pick === opt;
        const col2 = opt === '1' ? C.r : opt === 'X' ? C.y : C.g;
        pdf.setFillColor(...(isPicked ? col2 : [40, 50, 65]));
        pdf.roundedRect(bx2 - bS / 2, bY, bS, bS, 0.6, 0.6, 'F');
        pdf.setTextColor(isPicked && opt !== 'X' ? 255 : (isPicked ? 0 : 100), isPicked && opt !== 'X' ? 255 : (isPicked ? 0 : 100), isPicked && opt !== 'X' ? 255 : (isPicked ? 0 : 100));
        pdf.setFontSize(4); pdf.setFont('helvetica', 'bold');
        pdf.text(opt, bx2, bY + 2.6, { align: 'center' });
      });
    }

    const standY = gy + group.matches.length * matchH + 0.6;
    pdf.setFillColor(12, 16, 28);
    pdf.rect(xOff + 0.5, standY, CW - 1, footH - 0.8, 'F');
    pdf.setFontSize(3.8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...C.mut);
    pdf.text('Clasif.', xOff + 2, standY + 1.5);
    const standing = simulateGroup(group);
    let sx = xOff + 11;
    standing.forEach((t, i) => {
      const img = flagCache[t.code];
      if (img) {
        pdf.addImage(img, 'PNG', sx, standY + 0.55, 2.3, 1.65);
        sx += 2.8;
      }
      pdf.setFont('helvetica', i === 0 ? 'bold' : 'normal');
      pdf.setTextColor(...(i === 0 ? [250, 204, 21] : C.mut));
      const short = teamName(group, t.code).substring(0, 8);
      pdf.text(`${short} ${t.p} pt`, sx, standY + 2.1);
      sx += 17.5;
    });

    colY[col] = gy + group.matches.length * matchH + footH + 1.5;
    col = col === 0 ? 1 : 0;
  }

  const nP = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= nP; i++) {
    pdf.setPage(i); pdf.setFontSize(5); pdf.setTextColor(...C.mut);
    pdf.text(`Porra Mundial 2026 · ${name}`, M, PH - 4);
    pdf.text(`${i}/${nP}`, PW - M, PH - 4, { align: 'right' });
  }

  downloadPdfBlob(pdf, `porra-mundial-2026-${name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf`);
}

// ============================================================
// RESULTADOS OFICIALES (results.json — compartido en Vercel)
// ============================================================
async function loadOfficialResults() {
  const urls = ['/api/results', 'results.json'];
  results = {};
  for (const url of urls) {
    try {
      const res = await fetch(url + '?t=' + Date.now());
      if (!res.ok) continue;
      const text = await res.text();
      if (!text || !text.trim()) continue;
      const data = JSON.parse(text);
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        delete data._meta;
        const keys = Object.keys(data).filter(k => k !== '_fixtures');
        if (!keys.length && !data._fixtures) continue;
        results = data;
        break;
      }
    } catch (e) { /* probar siguiente fuente */ }
  }
  renderGroups();
  updateScoreHeader();
  refreshGroupStandingsAndKnockout();
  if (IS_ADMIN) renderAdminEditor();
}

function exportResultsJson() {
  const json = JSON.stringify(results, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    alert('JSON copiado al portapapeles.\nPégalo en results.json y vuelve a desplegar en Vercel.');
  }).catch(() => {
    prompt('Copia este JSON a results.json:', json);
  });
}

// ============================================================
// INIT
// ============================================================
function bootApp() {
  try { showAppReloadBannerIfNeeded(); } catch (e) { console.warn(e); }
  try { loadState(); } catch (e) { console.warn('loadState', e); picks = {}; }
  window._schedGroups = isGroupsOpen();
  window._schedExtras = isExtrasOpen();
  window._schedLeaderboard = isLeaderboardOpen();
  window._schedKo = typeof isKnockoutAccessible === 'function' ? isKnockoutAccessible() : false;
  window._schedKoOpen = typeof isKnockoutPublicOpen === 'function' ? isKnockoutPublicOpen() : false;

  try { renderScheduleBanner(); } catch (e) { console.warn(e); }
  try { if (typeof renderKnockout === 'function') renderKnockout(); } catch (e) { console.warn(e); }
  try { renderKoCountdown(); } catch (e) { console.warn(e); }
  try { updateShareLinks(); } catch (e) { console.warn(e); }
  try { renderGroups(); } catch (e) {
    console.error(e);
    showBootError(e, false);
    return;
  }

  try { renderAdminEditor(); } catch (e) { console.warn(e); }
  const nameEl = document.getElementById('playerName');
  if (nameEl) nameEl.addEventListener('input', () => {
    saveState();
    updateExportButton();
    if (typeof renderKnockout === 'function') renderKnockout();
  });
  const scorePts = document.getElementById('scorePoints');
  if (scorePts) scorePts.addEventListener('input', () => { scorePts.dataset.auto = '0'; });
  updateExportButton();
  updatePhaseTabs();
  openDefaultPhaseTab();
  initExportDock();

  loadOfficialResults().then(() => { updateScoreHeader(); renderLeaderboard(); }).catch(e => console.warn('results', e));
  loadOfficialLeaderboard().catch(e => console.warn('leaderboard.json', e));
  try { setInterval(tickSchedule, 1000); } catch (e) {}
  try { setInterval(() => loadOfficialResults(), 5 * 60 * 1000); } catch (e) {}
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}
