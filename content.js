// Runs inside app.myhours.com (injected into the iframe).
// 1. Removes elements from the DOM entirely.
// 2. Strips specific text nodes from buttons (keeps the icon/element intact).
// 3. Injects style overrides.

// Only run when loaded inside the extension's iframe (side panel), not in a regular tab.
if (window === window.top) { throw new Error('MyHours ext: skipping top-level tab'); }

// ── Style overrides ───────────────────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
  mh-extra-extra-large-layout {
    padding: 0 !important;
  }
  .container.container-xxl {
    margin: 0 !important;
    padding: 8px !important;
  }
  /* toolbar: vertically center all children */
  .d-flex.flex-row.flex-wrap.gap-3 {
    align-items: center !important;
  }
  /* push duration block to the far right */
  .d-flex.flex-row.flex-wrap.gap-3 mh-track-total-duration-display {
    margin-left: auto !important;
  }
  /* 2-column grid layout for log items */
  .log-item {
    display: grid !important;
    grid-template-columns: 1fr auto !important;
    align-items: center !important;
    gap: 2px 8px !important;
    padding-top: 4px !important;
    padding-bottom: 4px !important;
  }
  /* col 1: details + badge */
  .log-item > .log-item-details,
  .log-item > .log-item-badge {
    grid-column: 1 !important;
  }
  /* col 2: toolbar and time-display share the same cell, overlapping */
  .log-item > .log-item-toolbar,
  .log-item > .log-item-time-display {
    grid-column: 2 !important;
    grid-row: 1 / -1 !important;
    align-self: center !important;
  }
  /* Default: toolbar hidden */
  .log-item > .log-item-toolbar {
    opacity: 0 !important;
    pointer-events: none !important;
  }
  /* Hover: toolbar visible, time hidden */
  .log-item:hover > .log-item-toolbar {
    opacity: 1 !important;
    pointer-events: auto !important;
  }
  .log-item:hover > .log-item-time-display {
    opacity: 0 !important;
    pointer-events: none !important;
  }
  .log-item > .log-item-time-display {
    align-items: flex-end !important;
  }
  .log-item-details .row-gap-2 {
    row-gap: 2px !important;
  }
  .log-item-details .mb-2 {
    margin-bottom: 2px !important;
  }
  .log-item-start-end-time-display {
    margin-top: 0 !important;
  }

  /* ── Compact spacing ─────────────────────────────────────────── */
  /* Nav bar: date-picker row bottom margin */
  mh-track-navigation-bar .mb-3 {
    margin-bottom: 4px !important;
  }
  /* Nav bar: gap between action buttons */
  mh-track-navigation-bar .gap-3 {
    gap: 6px !important;
  }
  /* Nav bar: make date picker fixed width */
  mh-track-date-picker sds-date-picker [role="group"].datepicker {
    width: 300px !important;
    min-width: 300px !important;
  }
  mh-track-date-picker sds-date-picker .selected-period {
    flex: 1 !important;
    min-width: 0 !important;
    max-width: none !important;
  }
  /* Nav bar: make the outer column layout a single flex-row */
  mh-track-navigation-bar .d-flex.flex-column {
    flex-direction: row !important;
    align-items: center !important;
    flex-wrap: nowrap !important;
  }
  /* Favourites: tighten the wrapping row and individual groups */
  mh-favourites-list .d-flex.flex-wrap {
    gap: 4px !important;
    row-gap: 4px !important;
  }
  .favorites-group {
    margin-bottom: 0 !important;
  }
  mh-favourites-list {
    margin-bottom: 8px !important;
  }
  /* Minimize padding on favourite item buttons */
  mh-favourites-list .btn.favourite-item-max-width,
  mh-favourites-list .btn-group .btn {
    padding: 2px 6px !important;
  }
  /* Log add-form: reduce card padding */
  .log-form {
    padding: 10px !important;
  }
  #logFormWrapper {
    background-color: #e4e8ec !important;
  }
  .cdk-drag.modal-content {
    background-color: #e4e8ec !important;
    padding: 0 !important;
    overflow-x: hidden !important;
  }
  .modal-body.pb-0 {
    padding: 0 !important;
    overflow-x: hidden !important;
  }
  /* Bootstrap .row negative margins cause overflow when parent padding is 0 */
  .cdk-drag.modal-content .row {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  .cdk-drag.modal-content [class*="col-12"] {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  .log-form-body-left {
    border-right: none !important;
  }
  .dx-overlay-content.dx-popup-normal {
    min-width: 300px !important;
  }
  /* Log form internal section top margins */
  .log-form .mt-3 {
    margin-top: 6px !important;
  }
  .log-form .mt-4 {
    margin-top: 8px !important;
  }
  /* Log list: reduce gap above the list */
  mh-log-list > .mt-4 {
    margin-top: 8px !important;
  }
  /* Reduce padding inside each log item row */
  mh-log-item .log-item-wrapper {
    padding: 2px 4px !important;
  }
  mh-log-item .border-bottom {
    padding: 0 !important;
  }
  /* Favourites row between toolbar and favourites */
  .fade-in-quick.gap-3 {
    gap: 4px !important;
  }
  /* Log form body columns: remove top margin */
  .log-form-body-left,
  .log-form-body-right {
    margin-top: 0 !important;
  }
  /* Reduce gap between project/task/note inputs */
  .log-form-body-left .row.gap-3 {
    gap: 6px !important;
  }
  /* Reduce form-label bottom margin */
  .log-form-body-left .form-label,
  .log-form-body-right .form-label {
    margin-bottom: 2px !important;
  }
  /* Duration + time inputs single row */
  .mh-time-inputs-row {
    display: flex !important;
    gap: 4px !important;
    align-items: flex-start !important;
    flex-wrap: nowrap !important;
  }
  .mh-time-inputs-row > * {
    flex: 1 !important;
    min-width: 0 !important;
    margin-top: 0 !important;
    width: auto !important;
  }
  .mh-time-inputs-row > *:has(mh-duration-input) {
    flex: 1.25 !important;
  }
`;
document.head && document.head.appendChild(style);

// ── Elements to remove completely ────────────────────────────────────────────
const REMOVE_SELECTORS = [
  'mh-track-view-selector',
  'mh-header',
  '#addFavouriteButton',
  '#favouriteSettingsButton',
  'mh-sidebar',
  '#intercom-frame',
  '#logFormAddLogCloseBtn',
  '#trackPageTrackGroupLogsButton',
  'mh-log-billable-amount',
  'mh-log-labor-cost',
  '.cdk-drag-handle.modal-drag-handle',
];

// ── Text nodes to strip from buttons (element stays, text is removed) ────────
const STRIP_TEXT_MAP = [
  { selector: '#trackPageTrackShowAddTimeLogBtn', text: 'Add time log' },
  { selector: '#startButton',                    text: 'New timer' },
  { selector: '#logFormAddTimeLogBtn',            text: 'Add time log' },
  { selector: '#logFormStartTimerBtn',            text: 'Start timer' }
];

function removeElements() {
  REMOVE_SELECTORS.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => el.remove());
  });
  // Remove log form header row ("Add time log" title + close button)
  document.querySelector('mh-button[id="closeLogFormBtn"]')?.parentElement?.remove();
}

function stripText() {
  STRIP_TEXT_MAP.forEach(({ selector, text }) => {
    const el = document.querySelector(selector);
    if (!el) return;

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const toRemove = [];
    while (walker.nextNode()) {
      if (walker.currentNode.textContent.includes(text)) {
        toRemove.push(walker.currentNode);
      }
    }
    toRemove.forEach((node) => node.remove());
  });
}

function removeMb4Classes() {
  document.querySelectorAll('.mb-4').forEach((el) => el.classList.remove('mb-4'));
}

function removeMe3Classes() {
  document.querySelectorAll('.me-3').forEach((el) => el.classList.remove('me-3'));
}

function setToolbarVisibility(logItem, visible) {
  logItem.querySelectorAll('mh-log-item-toolbar').forEach((toolbar) => {
    toolbar.style.setProperty('visibility', visible ? 'visible' : 'hidden', 'important');
    // Also override inner divs Angular controls
    toolbar.querySelectorAll('[style*="visibility"]').forEach((el) => {
      el.style.setProperty('visibility', visible ? 'visible' : 'hidden', 'important');
    });
  });
}

function applyToolbarHover() {
  document.querySelectorAll('.log-item').forEach((logItem) => {
    if (logItem._mhHoverBound) return;
    logItem._mhHoverBound = true;

    // Hide initially
    setToolbarVisibility(logItem, false);

    logItem.addEventListener('mouseenter', () => setToolbarVisibility(logItem, true));
    logItem.addEventListener('mouseleave', () => setToolbarVisibility(logItem, false));
  });
}

function compactTextareas() {
  document.querySelectorAll('.log-form textarea').forEach((ta) => {
    ta.setAttribute('rows', '1');
  });
}

function replaceDurationLabel() {
  document.querySelectorAll('.log-form-body-right .form-label').forEach((label) => {
    if (label.textContent.trim() === 'Duration') {
      label.textContent = 'Time';
    }
  });
}

function restructureNavBar() {
  const nav = document.querySelector('mh-track-navigation-bar');
  if (!nav || nav._mhNavDone) return;

  const colWrapper = nav.querySelector('.d-flex.flex-column');
  if (!colWrapper || colWrapper.children.length < 2) return;

  const datePickerRow = colWrapper.children[0];
  const datePicker = nav.querySelector('mh-track-date-picker');
  const buttonsInner = nav.querySelector('.d-flex.flex-row.flex-wrap.gap-3');

  if (!datePicker || !buttonsInner) return;

  // Move date picker to the start of the buttons row
  buttonsInner.insertBefore(datePicker, buttonsInner.firstChild);

  // Remove the now-empty date picker row
  datePickerRow.remove();

  nav._mhNavDone = true;
}

function restructureTimeInputs() {
  const right = document.querySelector('.log-form-body-right');
  if (!right || right._mhTimeInputsDone) return;

  const durationRow = right.querySelector('mh-duration-input')?.closest('.row');
  const timeRow = right.querySelector('.row.gx-2');

  if (!durationRow || !timeRow) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'mh-time-inputs-row';

  Array.from(durationRow.children).forEach(col => wrapper.appendChild(col));
  Array.from(timeRow.children).forEach(col => wrapper.appendChild(col));

  durationRow.replaceWith(wrapper);
  timeRow.remove();
  right._mhTimeInputsDone = true;
}

function restructureTotalDuration() {
  const host   = document.querySelector('mh-track-total-duration-display');
  const target = document.querySelector('.d-flex.flex-row.flex-wrap.gap-3');

  if (host && target && !target.contains(host)) {
    target.appendChild(host);
  }
}

function restructureLogFormFooter() {
  const addBtn = document.querySelector('#logFormAddTimeLogBtn');
  if (!addBtn) return;
  const outer = addBtn.closest('.flex-column-reverse');
  if (!outer || outer._logFormFooterDone) return;

  // Make the outer wrapper always row.
  outer.classList.remove('flex-column-reverse', 'flex-lg-row', 'align-items-start', 'align-items-lg-center', 'flex-wrap', 'mt-4');
  outer.classList.add('align-items-center');

  // The buttons container uses d-grid at narrow widths — force flex.
  const btnsContainer = addBtn.closest('.d-sm-flex');
  if (btnsContainer) {
    btnsContainer.classList.remove('d-grid');
    btnsContainer.classList.add('d-flex');
  }

  outer._logFormFooterDone = true;
}

// ── Auto-click sign-out on /profile if flagged ───────────────────────────────
if (window.location.pathname === '/profile' && sessionStorage.getItem('mh-ext-pending-signout') === '1') {
  sessionStorage.removeItem('mh-ext-pending-signout');
  let attempts = 0;
  const poll = setInterval(() => {
    attempts++;
    if (attempts > 60) { clearInterval(poll); return; }
    const signOutBtn =
      document.querySelector('mh-button#profileSignOutBtn button') ||
      document.querySelector('#profileSignOutBtn button') ||
      document.querySelector('#profileSignOutBtn');
    if (signOutBtn) {
      clearInterval(poll);
      signOutBtn.click();
    }
  }, 50);
}

function injectSignOutButton() {
  if (document.getElementById('mh-ext-signout')) return;

  const btn = document.createElement('button');
  btn.id = 'mh-ext-signout';
  btn.type = 'button';
  btn.title = 'Sign out';
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;
  btn.style.cssText = `
    position: fixed; bottom: 16px; left: 16px; z-index: 2147483647;
    width: 36px; height: 36px; border-radius: 50%;
    background: #fff; border: 1px solid #ddd;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    display: flex; align-items: center; justify-content: center;
    color: #666; cursor: pointer; padding: 0;
  `;
  btn.addEventListener('mouseenter', () => { btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)'; btn.style.color = '#e53e3e'; });
  btn.addEventListener('mouseleave', () => { btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'; btn.style.color = '#666'; });
  btn.addEventListener('click', () => {
    sessionStorage.setItem('mh-ext-pending-signout', '1');
    window.location.href = '/profile';
  });

  document.body.appendChild(btn);
}

function run() {
  removeElements();
  stripText();
  removeMb4Classes();
  removeMe3Classes();
  replaceDurationLabel();
  restructureNavBar();
  restructureTimeInputs();
  compactTextareas();
  restructureTotalDuration();
  restructureLogFormFooter();
  applyToolbarHover();
  injectSignOutButton();

  // Hide sign-out button while the app loading screen is visible
  const btn = document.getElementById('mh-ext-signout');
  if (btn) {
    const isLoading = !!document.querySelector('mh-root img[src*="loader-dark.svg"]');
    btn.style.display = isLoading ? 'none' : 'flex';
  }
}

// Run once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run);
} else {
  run();
}

// Re-run on SPA navigation / dynamic content changes
const observer = new MutationObserver(run);
observer.observe(document.documentElement, { childList: true, subtree: true });
