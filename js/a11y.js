/* Accesibilidad — Porra Mundial 2026 (KISS: un solo módulo) */
(function () {
  const PHASE_TABS = [
    { id: 'grupos', tabId: 'tabGrupos', panelId: 'panelGrupos' },
    { id: 'extras', tabId: 'tabExtras', panelId: 'panelExtras' },
    { id: 'leaderboard', tabId: 'tabLeaderboard', panelId: 'panelLeaderboard' }
  ];

  let modalTrigger = null;

  function getFocusable(root) {
    if (!root) return [];
    return [...root.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter(el => !el.closest('.hidden') && el.offsetParent !== null);
  }

  window.syncPhaseTabA11y = function syncPhaseTabA11y(activeTab) {
    PHASE_TABS.forEach(({ id, tabId, panelId }) => {
      const selected = id === activeTab;
      const tab = document.getElementById(tabId);
      const panel = document.getElementById(panelId);
      if (tab) {
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        tab.tabIndex = selected ? 0 : -1;
      }
      if (panel) {
        panel.setAttribute('aria-hidden', selected ? 'false' : 'true');
      }
    });
  };

  window.initPhaseTabsA11y = function initPhaseTabsA11y() {
    const list = document.querySelector('.phase-tabs[role="tablist"]');
    if (!list) return;

    list.addEventListener('keydown', (e) => {
      const tabs = PHASE_TABS.map(t => document.getElementById(t.tabId)).filter(Boolean);
      const idx = tabs.indexOf(document.activeElement);
      if (idx < 0) return;

      let next = idx;
      if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      else return;

      e.preventDefault();
      tabs[next].focus();
    });
  };

  window.openKoPasswordModalA11y = function openKoPasswordModalA11y(trigger) {
    const modal = document.getElementById('koPasswordModal');
    if (!modal) return;
    modalTrigger = trigger || document.activeElement;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    const focusables = getFocusable(modal);
    (focusables[0] || modal).focus();
  };

  window.closeKoPasswordModalA11y = function closeKoPasswordModalA11y() {
    const modal = document.getElementById('koPasswordModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (modalTrigger && typeof modalTrigger.focus === 'function') modalTrigger.focus();
    modalTrigger = null;
  };

  function trapModalFocus(e) {
    const modal = document.getElementById('koPasswordModal');
    if (!modal || modal.classList.contains('hidden')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      if (typeof hideKoPasswordModal === 'function') hideKoPasswordModal();
      return;
    }

    if (e.key !== 'Tab') return;
    const focusables = getFocusable(modal);
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  document.addEventListener('keydown', trapModalFocus);

  const modal = document.getElementById('koPasswordModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal && typeof hideKoPasswordModal === 'function') hideKoPasswordModal();
    });
  }

  const skip = document.getElementById('skipToContent');
  if (skip) {
    skip.addEventListener('click', (e) => {
      const main = document.getElementById('mainContent');
      if (!main) return;
      e.preventDefault();
      main.focus({ preventScroll: false });
      main.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof initPhaseTabsA11y === 'function') initPhaseTabsA11y();
    if (typeof syncPhaseTabA11y === 'function') syncPhaseTabA11y('extras');
  });
})();
