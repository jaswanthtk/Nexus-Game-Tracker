/**
 * Nexus — app.js
 * Units covered:
 *   Unit 4: JSON + XML data structuring & parsing; XMLHttpRequest (AJAX)
 *   Unit 5: DOM manipulation, JS Events, LocalStorage, Drag & Drop API
 */

'use strict';

/* ============================================================
   CONSTANTS & STATE
   ============================================================ */
const STORAGE_KEY = 'gameTrackerData_v5';

// Admin Auth Check
(function() {
  const session = localStorage.getItem('nexus_session');
  if (session !== 'admin') {
    window.location.href = 'login.html';
  }
})();

// Application state — all games stored as an array of objects (JSON - Unit 4)
let games = [];

// Tracks which game is pending deletion
let pendingDeleteId = null;

// Tracks the currently dragged card's game id
let draggedGameId = null;

/* ============================================================
   THEME SWITCHER LOGIC
   ============================================================ */
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  const currentTheme = localStorage.getItem('nexus_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  const icon = toggleBtn.querySelector('i');
  if (currentTheme === 'light') {
    icon.className = 'bi bi-sun-fill';
  } else {
    icon.className = 'bi bi-moon-stars-fill';
  }

  toggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('nexus_theme', 'light');
      icon.className = 'bi bi-sun-fill';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('nexus_theme', 'dark');
      icon.className = 'bi bi-moon-stars-fill';
    }
  });
}

/* ============================================================
   UTILITY: Unique ID generator
   ============================================================ */
function generateId() {
  return 'game_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
}

/* ============================================================
   UTILITY: Render star string
   ============================================================ */
function buildStarHTML(rating) {
  if (!rating) return '<span class="text-muted" style="font-size:0.75rem">No rating</span>';
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += i <= rating
      ? '<span>&#9733;</span>'
      : '<span class="star-empty">&#9733;</span>';
  }
  return html;
}

/* ============================================================
   UNIT 5: LocalStorage — persist and retrieve data
   ============================================================ */
function saveToStorage() {
  // JSON.stringify serialises the JS array into a JSON string (Unit 4)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    // JSON.parse deserialises the JSON string back to JS objects (Unit 4)
    return JSON.parse(raw);
  } catch (e) {
    console.error('Storage parse error:', e);
    return [];
  }
}

/* ============================================================
   UNIT 5: DOM MANIPULATION — build a single game card element
   ============================================================ */
function createCardElement(game) {
  const card = document.createElement('article');
  card.className = 'game-card card-enter';
  card.setAttribute('data-id', game.id);
  card.setAttribute('role', 'listitem');
  // Drag & Drop (Unit 5) — make card draggable
  card.setAttribute('draggable', 'true');
  card.setAttribute('aria-label', `${game.title} — drag to move`);

  // Cover image or SVG placeholder
  const placeholderSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 112" width="100%" height="100%" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="phGrad_${game.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e1128"/><stop offset="100%" stop-color="#0c1a2e"/>
        </linearGradient>
      </defs>
      <rect width="200" height="112" fill="url(#phGrad_${game.id})"/>
      <rect x="62" y="34" width="76" height="44" rx="12" fill="#a855f7" opacity="0.25"/>
      <rect x="70" y="42" width="6" height="20" rx="3" fill="#c084fc" opacity="0.7"/>
      <rect x="63" y="49" width="20" height="6" rx="3" fill="#c084fc" opacity="0.7"/>
      <circle cx="118" cy="46" r="5" fill="#f0abfc" opacity="0.7"/>
      <circle cx="128" cy="54" r="5" fill="#7dd3fc" opacity="0.7"/>
      <circle cx="118" cy="62" r="5" fill="#86efac" opacity="0.7"/>
      <circle cx="108" cy="54" r="5" fill="#fda4af" opacity="0.7"/>
      <text x="100" y="96" text-anchor="middle" font-family="monospace" font-size="9" fill="#64748b" opacity="0.8">No Cover Art</text>
    </svg>`;

  const coverSection = `
    ${game.cover ? `<img class="card-cover" src="${escapeHtml(game.cover)}" alt="${escapeHtml(game.title)} cover" loading="lazy" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='block';" />` : ''}
    <div class="card-cover-placeholder" aria-hidden="true" style="${game.cover ? 'display:none;' : ''}">${placeholderSVG}</div>
  `;

  const starsHtml = buildStarHTML(game.rating);

  const hoursText = game.hours ? `${game.hours}h played` : '';
  const yearText  = game.year  ? `${game.year}`          : '';
  const infoText  = [yearText, hoursText].filter(Boolean).join(' &bull; ');

  const notesHtml = game.notes
    ? `<p class="card-notes-text" title="${escapeHtml(game.notes)}">${escapeHtml(game.notes)}</p>`
    : '';

  card.innerHTML = `
    ${coverSection}
    <div class="card-body-inner">
      <h3 class="card-title-text" title="${escapeHtml(game.title)}">${escapeHtml(game.title)}</h3>
      <div class="card-meta">
        <span class="meta-tag">${escapeHtml(game.platform)}</span>
        <span class="meta-tag">${escapeHtml(game.genre)}</span>
      </div>
      <div class="card-stars" aria-label="Rating: ${game.rating || 0} out of 5 stars">${starsHtml}</div>
      ${notesHtml}
      <div class="card-footer-row">
        <span class="card-info-small">${infoText}</span>
        <div class="card-actions">
          <button class="btn-card-icon edit-btn" data-id="${game.id}" title="Edit game" aria-label="Edit ${escapeHtml(game.title)}">
            <i class="bi bi-pencil-fill"></i>
          </button>
          <button class="btn-card-icon delete-btn" data-id="${game.id}" title="Delete game" aria-label="Delete ${escapeHtml(game.title)}">
            <i class="bi bi-trash3-fill"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  /* ---- Drag & Drop events on the card (Unit 5) ---- */
  card.addEventListener('dragstart', onCardDragStart);
  card.addEventListener('dragend',   onCardDragEnd);

  /* ---- Card action button events (Unit 5 - JS Events) ---- */
  card.querySelector('.edit-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    openEditModal(game.id);
  });
  card.querySelector('.delete-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    openDeleteConfirm(game.id);
  });

  return card;
}

/* ============================================================
   UTILITY: Escape HTML to prevent XSS
   ============================================================ */
function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ============================================================
   RENDER: render all games into their lanes
   ============================================================ */
function renderBoard(filteredGames) {
  const source = filteredGames !== undefined ? filteredGames : games;

  const lanes = {
    played:   document.getElementById('lane-played'),
    backlog:  document.getElementById('lane-backlog'),
    upcoming: document.getElementById('lane-upcoming'),
  };

  // Clear only game cards (preserve drop hints)
  Object.values(lanes).forEach(lane => {
    if (lane) {
      const cards = lane.querySelectorAll('.game-card');
      cards.forEach(c => c.remove());
    }
  });

  // Populate lanes
  const counts = { played: 0, backlog: 0, upcoming: 0 };

  source.forEach(game => {
    counts[game.status]++;
    const laneEl = lanes[game.status];
    if (laneEl) {
      const card = createCardElement(game);
      laneEl.appendChild(card);
    }
  });

  // Update counts
  updateCounts(counts);
  updateDropHints(counts);
}

/* ============================================================
   UPDATE: header stat pills and lane badges
   ============================================================ */
function updateCounts(counts) {
  const els = [
    { id: 'count-played', val: counts.played },
    { id: 'count-backlog', val: counts.backlog },
    { id: 'count-upcoming', val: counts.upcoming },
    { id: 'badge-played', val: counts.played },
    { id: 'badge-backlog', val: counts.backlog },
    { id: 'badge-upcoming', val: counts.upcoming }
  ];
  els.forEach(el => {
    const node = document.getElementById(el.id);
    if (node) node.textContent = el.val;
  });
}

function updateDropHints(counts) {
  ['played', 'backlog', 'upcoming'].forEach(lane => {
    const hint = document.getElementById('hint-' + lane);
    if (hint) {
      hint.classList.toggle('hidden', counts[lane] > 0);
    }
  });
}

/* ============================================================
   UNIT 5: DRAG & DROP API
   ============================================================ */
function onCardDragStart(e) {
  draggedGameId = this.getAttribute('data-id');
  this.classList.add('dragging');
  // Required for Firefox
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', draggedGameId);
}

function onCardDragEnd() {
  this.classList.remove('dragging');
  draggedGameId = null;
  // Remove all drag-over highlights
  document.querySelectorAll('.lane-drop-zone').forEach(z => z.classList.remove('drag-over'));
}

function setupDropZones() {
  document.querySelectorAll('.lane-drop-zone').forEach(zone => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', (e) => {
      // Only remove if truly leaving the zone
      if (!zone.contains(e.relatedTarget)) {
        zone.classList.remove('drag-over');
      }
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');

      const id = e.dataTransfer.getData('text/plain') || draggedGameId;
      if (!id) return;

      const newStatus = zone.getAttribute('data-lane');
      const gameIndex = games.findIndex(g => g.id === id);
      if (gameIndex === -1) return;

      const oldStatus = games[gameIndex].status;
      if (oldStatus === newStatus) return;

      // Update game status in array (Unit 4 — modifying JSON data)
      games[gameIndex].status = newStatus;
      saveToStorage();
      applyFilters();
      showToast(`Moved "${games[gameIndex].title}" to ${capitalise(newStatus)}.`);
    });
  });
}

/* ============================================================
   UNIT 5: FORM — MODAL OPEN / RESET
   ============================================================ */
const gameFormModal = document.getElementById('gameFormModal');
const bsGameModal   = gameFormModal ? new bootstrap.Modal(gameFormModal) : null;

function resetForm() {
  const form = document.getElementById('game-form');
  form.reset();
  form.classList.remove('was-validated');
  document.getElementById('game-id').value = '';
  document.getElementById('notes-char-count').textContent = '0';
  // Clear star radio selections
  document.querySelectorAll('.star-radio').forEach(r => r.checked = false);
  // Clear cover preview and fetch status
  updateCoverPreview('');
  setCoverFetchStatus('');
}

function openAddModal() {
  resetForm();
  document.getElementById('modal-title-text').textContent = 'Add New Game';
  document.getElementById('btn-save-text').textContent    = 'Save Game';
  if (bsGameModal) bsGameModal.show();
}

function openEditModal(id) {
  const game = games.find(g => g.id === id);
  if (!game) return;

  resetForm();
  document.getElementById('modal-title-text').textContent = 'Edit Game';
  document.getElementById('btn-save-text').textContent    = 'Update Game';

  // Populate fields (DOM manipulation - Unit 5)
  document.getElementById('game-id').value       = game.id;
  document.getElementById('game-title').value    = game.title;
  document.getElementById('game-platform').value = game.platform;
  document.getElementById('game-genre').value    = game.genre;
  document.getElementById('game-status').value   = game.status;
  document.getElementById('game-year').value     = game.year    || '';
  document.getElementById('game-hours').value    = game.hours   || '';
  document.getElementById('game-cover').value    = game.cover   || '';
  document.getElementById('game-notes').value    = game.notes   || '';
  document.getElementById('notes-char-count').textContent = (game.notes || '').length;

  // Show existing cover in preview
  if (game.cover) updateCoverPreview(game.cover);

  if (game.rating) {
    const radioEl = document.getElementById('star' + game.rating);
    if (radioEl) radioEl.checked = true;
  }

  if (bsGameModal) bsGameModal.show();
}

/* ============================================================
   UNIT 5: FORM SUBMISSION EVENT + HTML5 VALIDATION
   ============================================================ */
const btnSaveGame = document.getElementById('btn-save-game');
if (btnSaveGame) btnSaveGame.addEventListener('click', () => {
  const form = document.getElementById('game-form');
  form.classList.add('was-validated');

  if (!form.checkValidity()) {
    // Browser native validation UI is triggered (Unit 1 - built-in validations)
    form.reportValidity();
    return;
  }

  const id        = document.getElementById('game-id').value;
  const title     = document.getElementById('game-title').value.trim();
  const platform  = document.getElementById('game-platform').value;
  const genre     = document.getElementById('game-genre').value;
  const status    = document.getElementById('game-status').value;
  const year      = document.getElementById('game-year').value   || null;
  const hours     = document.getElementById('game-hours').value  || null;
  const cover     = document.getElementById('game-cover').value.trim() || null;
  const notes     = document.getElementById('game-notes').value.trim() || null;

  // Get selected star rating
  const selectedStar = document.querySelector('.star-radio:checked');
  const rating = selectedStar ? parseInt(selectedStar.value, 10) : null;

  // JSON data object construction (Unit 4)
  if (id) {
    // Edit existing
    const idx = games.findIndex(g => g.id === id);
    if (idx !== -1) {
      games[idx] = { ...games[idx], title, platform, genre, status, year, hours, cover, notes, rating };
      showToast(`"${title}" updated successfully.`);
    }
  } else {
    // Add new — construct JSON-structured game object (Unit 4)
    const newGame = {
      id:       generateId(),
      title,
      platform,
      genre,
      status,
      year,
      hours,
      cover,
      notes,
      rating,
      addedAt:  new Date().toISOString()
    };
    games.push(newGame);
    showToast(`"${title}" added to ${capitalise(status)}!`);
  }

  saveToStorage();
  if (bsGameModal) bsGameModal.hide();
  applyFilters();
});

/* ============================================================
   UNIT 5: DELETE GAME
   ============================================================ */
function openDeleteConfirm(id) {
  pendingDeleteId = id;
  const bsDeleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
  bsDeleteModal.show();
}

const btnConfirmDelete = document.getElementById('btn-confirm-delete');
if (btnConfirmDelete) btnConfirmDelete.addEventListener('click', () => {
  if (!pendingDeleteId) return;
  const game = games.find(g => g.id === pendingDeleteId);
  const title = game ? game.title : 'Game';

  games = games.filter(g => g.id !== pendingDeleteId);
  pendingDeleteId = null;

  saveToStorage();
  applyFilters();
  showToast(`"${title}" deleted.`, true);

  const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
  if (deleteModal) deleteModal.hide();
});

/* ============================================================
   UNIT 5: SEARCH & FILTER — JS Events on input/select change
   ============================================================ */
function applyFilters() {
  const searchTerm  = document.getElementById('search-input').value.toLowerCase().trim();
  const genreFilter = document.getElementById('filter-genre').value;
  const ratingFilter = parseInt(document.getElementById('filter-rating').value, 10);

  const filtered = games.filter(game => {
    const matchesSearch = !searchTerm || game.title.toLowerCase().includes(searchTerm);
    const matchesGenre  = !genreFilter || game.genre === genreFilter;
    const matchesRating = !ratingFilter || (game.rating && game.rating >= ratingFilter);
    return matchesSearch && matchesGenre && matchesRating;
  });

  renderBoard(filtered);
}

const searchInput = document.getElementById('search-input');
if (searchInput) searchInput.addEventListener('input', applyFilters);
const filterGenre = document.getElementById('filter-genre');
if (filterGenre) filterGenre.addEventListener('change', applyFilters);
const filterRating = document.getElementById('filter-rating');
if (filterRating) filterRating.addEventListener('change', applyFilters);

/* ============================================================
   UNIT 5: COVER PREVIEW — live thumbnail from URL input
   ============================================================ */
function updateCoverPreview(url) {
  const img       = document.getElementById('cover-preview-img');
  const emptyMsg  = document.getElementById('cover-preview-empty');
  if (!img || !emptyMsg) return;

  if (url && url.trim()) {
    img.src = url.trim();
    img.style.display = 'block';
    emptyMsg.style.display = 'none';
    img.onerror = () => {
      img.style.display = 'none';
      emptyMsg.style.display = 'flex';
    };
  } else {
    img.src = '';
    img.style.display = 'none';
    emptyMsg.style.display = 'flex';
  }
}

// Update preview whenever the URL field changes manually
const gameCoverInput = document.getElementById('game-cover');
if (gameCoverInput) gameCoverInput.addEventListener('input', function () {
  updateCoverPreview(this.value);
});

/* ============================================================
   UNIT 5: COVER FETCH STATUS — tiny badge below title field
   ============================================================ */
function setCoverFetchStatus(state, message) {
  const el = document.getElementById('cover-fetch-status');
  if (!el) return;
  el.className = 'cover-fetch-status';
  if (!state) { el.innerHTML = ''; return; }
  el.classList.add('status-' + state);
  const icons = { loading: 'bi-arrow-repeat spin', found: 'bi-check-circle-fill', notfound: 'bi-x-circle-fill', error: 'bi-exclamation-triangle-fill' };
  el.innerHTML = `<i class="bi ${icons[state] || ''} me-1"></i>${message}`;
}

/* ============================================================
   UNIT 5: Wikipedia API Fallback Helper (AJAX - Unit 5)
   Searches Wikipedia for title + "video game", retrieves pageimages thumbnail.
   ============================================================ */
async function fetchCoverFromWikipedia(title) {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}%20video%20game&utf8=&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();

    if (!searchData.query || !searchData.query.search || searchData.query.search.length === 0) {
      return null;
    }

    const pageTitle = searchData.query.search[0].title;
    // Use Wikipedia Page REST API summary for reliable original / thumbnail images (HTTP 200 guaranteed)
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`;
    const summaryRes = await fetch(summaryUrl);
    if (!summaryRes.ok) return null;
    const summaryData = await summaryRes.json();

    const coverUrl = (summaryData.originalimage && summaryData.originalimage.source) ||
                     (summaryData.thumbnail && summaryData.thumbnail.source);

    if (coverUrl) {
      return {
        url: coverUrl,
        title: summaryData.title || pageTitle
      };
    }
    return null;
  } catch (e) {
    console.warn('[Wikipedia Fetch] Error:', e);
    return null;
  }
}

/* ============================================================
   UNIT 5: Multi-Source AJAX — CheapShark API + Wikipedia Fallback
   Triggered by blur event on the game title input. No API key required.
   Attempt 1: CheapShark API (PC/Steam store images)
   Attempt 2: Wikipedia API (Console exclusives / upcoming games)
   ============================================================ */
async function fetchCoverArt(title) {
  // Guard: cover already set manually by user — don't overwrite it
  const currentCover = document.getElementById('game-cover').value.trim();
  if (currentCover) return;

  setCoverFetchStatus('loading', 'Searching CheapShark…');

  let coverUrl = null;
  let sourceName = '';

  // Attempt 1: CheapShark API
  try {
    const csEndpoint = 'https://www.cheapshark.com/api/1.0/games?title=' + encodeURIComponent(title);
    const csRes = await fetch(csEndpoint, {
      headers: { 'User-Agent': 'GameTrackerLogbook/1.0 (student project)' }
    });

    if (csRes.ok) {
      const csData = await csRes.json();
      if (Array.isArray(csData) && csData.length > 0) {
        const firstMatch = csData[0];
        if (firstMatch.steamAppID && firstMatch.steamAppID !== '0') {
          coverUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${firstMatch.steamAppID}/header.jpg`;
          sourceName = `CheapShark: “${firstMatch.external || title}”`;
        } else if (firstMatch.thumb) {
          coverUrl = firstMatch.thumb;
          sourceName = `CheapShark: “${firstMatch.external || title}”`;
        }
      }
    }
  } catch (err) {
    console.warn('[CheapShark Fetch] Error:', err);
  }

  // Attempt 2: Wikipedia API Fallback if CheapShark returned no result
  if (!coverUrl) {
    setCoverFetchStatus('loading', 'Searching Wikipedia…');
    const wikiResult = await fetchCoverFromWikipedia(title);
    if (wikiResult && wikiResult.url) {
      coverUrl = wikiResult.url;
      sourceName = `Wikipedia: “${wikiResult.title}”`;
    }
  }

  // Apply result or show not found
  if (coverUrl) {
    document.getElementById('game-cover').value = coverUrl;
    updateCoverPreview(coverUrl);
    setCoverFetchStatus('found', `Cover found via ${sourceName}`);
  } else {
    setCoverFetchStatus('notfound', 'Cover art not found on CheapShark or Wikipedia.');
  }
}

// Trigger cover fetch when user tabs out of the title field
const gameTitleInput = document.getElementById('game-title');
if (gameTitleInput) gameTitleInput.addEventListener('blur', function () {
  const title = this.value.trim();
  if (title.length >= 2) {
    fetchCoverArt(title);
  }
});

/* ============================================================
   UNIT 5: NOTES CHARACTER COUNTER
   ============================================================ */
const gameNotesInput = document.getElementById('game-notes');
if (gameNotesInput) gameNotesInput.addEventListener('input', function () {
  document.getElementById('notes-char-count').textContent = this.value.length;
});

/* ============================================================
   UNIT 5: TOAST NOTIFICATION (HTML5 API Bootstrap Toast)
   ============================================================ */
function showToast(message, isError = false) {
  const toastEl   = document.getElementById('app-toast');
  const toastText = document.getElementById('toast-text');
  const toastIcon = document.getElementById('toast-icon');

  toastText.textContent = message;
  toastIcon.className   = isError
    ? 'bi bi-exclamation-circle-fill me-2 toast-icon error'
    : 'bi bi-check-circle-fill me-2 toast-icon';

  const bsToast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3000 });
  bsToast.show();
}

/* ============================================================
   UTILITY: Capitalise first letter
   ============================================================ */
function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ============================================================
   UNIT 3: "Add Game" header button wires to Bootstrap Modal
   ============================================================ */
const btnOpenModal = document.getElementById('btn-open-modal');
if (btnOpenModal) btnOpenModal.addEventListener('click', openAddModal);

// Reset form state when modal is closed
if (gameFormModal) gameFormModal.addEventListener('hidden.bs.modal', resetForm);

/* ============================================================
   UNIT 4: XML + AJAX — XMLHttpRequest to parse games.xml
   Fetches the seed XML file on first visit, walks the XML DOM,
   converts each <game> node into a JS object, and seeds LocalStorage.
   ============================================================ */
function fetchGamesFromXML(onSuccess, onError) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'games.xml', true); // async GET request
  if (xhr.overrideMimeType) {
    xhr.overrideMimeType('text/xml');
  }

  xhr.onload = function () {
    if (xhr.status !== 200 && xhr.status !== 0) {
      console.warn('XHR: non-200 status', xhr.status);
      onError();
      return;
    }

    // xhr.responseXML gives us the XML Document object (XML DOM - Unit 4)
    let xmlDoc = xhr.responseXML;

    // Fallback to DOMParser if responseXML is null or invalid
    if (!xmlDoc || !xmlDoc.documentElement || xmlDoc.getElementsByTagName('parsererror').length > 0) {
      try {
        const parser = new DOMParser();
        xmlDoc = parser.parseFromString(xhr.responseText, 'text/xml');
      } catch (e) {
        console.error('DOMParser error:', e);
      }
    }

    if (!xmlDoc) { onError(); return; }

    const gameNodes = xmlDoc.getElementsByTagName('game');
    if (!gameNodes || gameNodes.length === 0) {
      console.warn('XHR: No <game> nodes found in XML');
      onError();
      return;
    }

    const parsed = [];

    // Walk each <game> element and read child text nodes (XML DOM traversal)
    for (let i = 0; i < gameNodes.length; i++) {
      const node = gameNodes[i];

      // Helper: safely read text content of a named child element
      function getText(tagName) {
        const el = node.getElementsByTagName(tagName)[0] || (node.querySelector ? node.querySelector(tagName) : null);
        return el ? (el.textContent || el.innerText || '').trim() : '';
      }

      const ratingRaw = getText('rating');
      const hoursRaw  = getText('hours');
      const coverVal  = getText('cover');

      // Build a JS game object from the XML data (Unit 4 — XML to JSON object)
      const gameObj = {
        id:      getText('id') || generateId(),
        title:   getText('title'),
        platform:getText('platform'),
        genre:   getText('genre'),
        status:  getText('status'),
        rating:  ratingRaw  ? parseInt(ratingRaw, 10)  : null,
        year:    getText('year')  || null,
        hours:   hoursRaw   ? hoursRaw                 : null,
        cover:   coverVal   || null,
        notes:   getText('notes') || null,
        addedAt: new Date().toISOString(),
        source:  'xml'   // tag to show this record came from XML seed
      };

      if (gameObj.title) parsed.push(gameObj);
    }

    if (parsed.length > 0) {
      console.info(`XHR: parsed ${parsed.length} game(s) from games.xml`);
      onSuccess(parsed);
    } else {
      onError();
    }
  };

  xhr.onerror = function () {
    console.warn('XHR: network error loading games.xml');
    onError();
  };

  xhr.send();
}

/* ============================================================
   JS fallback seed data (used when XHR cannot run,
   e.g. file:// protocol or network unavailable)
   ============================================================ */
function getFallbackGames() {
  return [
    { id: generateId(), title: 'Elden Ring',     platform: 'PC',             genre: 'RPG',    status: 'played',   rating: 5, year: '2022', hours: '120', cover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg', notes: 'Absolute masterpiece. 120+ hours and still going.', addedAt: new Date().toISOString() },
    { id: generateId(), title: 'Hollow Knight',  platform: 'PC',             genre: 'Action', status: 'played',   rating: 5, year: '2017', hours: '52',  cover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg', notes: 'Tight controls, incredible world-building.',         addedAt: new Date().toISOString() },
    { id: generateId(), title: 'Cyberpunk 2077', platform: 'PlayStation 5',  genre: 'RPG',    status: 'backlog',  rating: 4, year: '2020', hours: null,  cover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg', notes: 'Picked it up after 2.0 patch. Need to start.',       addedAt: new Date().toISOString() },
    { id: generateId(), title: 'Hades II',        platform: 'PC',             genre: 'Action', status: 'backlog',  rating: null, year: '2024', hours: null, cover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145350/header.jpg', notes: 'Early access — waiting for full release.',          addedAt: new Date().toISOString() },
    { id: generateId(), title: 'GTA VI',          platform: 'PlayStation 5',  genre: 'Action', status: 'upcoming', rating: null, year: '2025', hours: null, cover: 'https://upload.wikimedia.org/wikipedia/en/4/46/Grand_Theft_Auto_VI.png', notes: 'Most anticipated game of the decade.',              addedAt: new Date().toISOString() },
    { id: generateId(), title: 'Fable (2025)',     platform: 'Xbox Series X',  genre: 'RPG',    status: 'upcoming', rating: null, year: '2025', hours: null, cover: 'https://upload.wikimedia.org/wikipedia/en/b/b8/Fable_key_art.png', notes: 'A full reboot of the beloved franchise.',            addedAt: new Date().toISOString() },
  ];
}

/* ============================================================
   FORCE LOCALSTORAGE REFRESH — Update placehold.co / outdated covers
   ============================================================ */
function syncCoversWithXML() {
  fetchGamesFromXML(
    function onXMLSuccess(xmlGames) {
      let updated = false;
      xmlGames.forEach(xmlGame => {
        const match = games.find(g => g.title.toLowerCase() === xmlGame.title.toLowerCase() || g.id === xmlGame.id);
        if (match && xmlGame.cover) {
          if (!match.cover || match.cover.includes('placehold.co') || match.cover.includes('vox-cdn') || match.cover.includes('alphacoders') || match.cover.includes('/thumb/') || match.cover !== xmlGame.cover) {
            match.cover = xmlGame.cover;
            updated = true;
          }
        }
      });
      if (updated) {
        saveToStorage();
        renderBoard();
      }
    },
    function onXMLError() {
      const fallbacks = getFallbackGames();
      let updated = false;
      fallbacks.forEach(fb => {
        const match = games.find(g => g.title.toLowerCase() === fb.title.toLowerCase());
        if (match && fb.cover) {
          if (!match.cover || match.cover.includes('placehold.co') || match.cover.includes('vox-cdn') || match.cover.includes('alphacoders') || match.cover.includes('/thumb/') || match.cover !== fb.cover) {
            match.cover = fb.cover;
            updated = true;
          }
        }
      });
      if (updated) {
        saveToStorage();
        renderBoard();
      }
    }
  );
}

/* ============================================================
   INIT: Load data from LocalStorage and render (Unit 5)
   On first visit (empty storage): fetch games.xml via AJAX,
   parse the XML DOM, and seed LocalStorage (Unit 4).
   If storage already exists: sync any outdated/placehold covers.
   ============================================================ */
function init() {
  initTheme();
  games = loadFromStorage();
  setupDropZones();
  renderBoard();

  if (games.length === 0) {
    // First visit — attempt to seed from XML via XMLHttpRequest (Unit 4 AJAX)
    fetchGamesFromXML(
      function onXMLSuccess(parsedGames) {
        games = parsedGames;
        saveToStorage();
        renderBoard();
        showToast('Library loaded from XML data source.');
      },
      function onXMLError() {
        // XHR failed (e.g. opened via file:// without a server)
        console.info('Falling back to JS seed data.');
        games = getFallbackGames();
        saveToStorage();
        renderBoard();
      }
    );
  } else {
    // Existing data present — update any placehold.co or outdated seed covers
    syncCoversWithXML();
  }
}

// Boot the app
init();

/* ============================================================
   DYNAMIC ADMIN ANALYTICS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if (path.includes('admin_analytics.html')) {
    const allGames = JSON.parse(localStorage.getItem('gameTrackerData_v5') || '[]');
    let played = 0, backlog = 0, upcoming = 0;
    const genreCounts = {};
    const platformCounts = {};

    allGames.forEach(g => {
      if (g.status === 'played')   played++;
      if (g.status === 'backlog')  backlog++;
      if (g.status === 'upcoming') upcoming++;
      if (g.genre) genreCounts[g.genre] = (genreCounts[g.genre] || 0) + 1;
      if (g.platform) platformCounts[g.platform] = (platformCounts[g.platform] || 0) + 1;
    });

    // KPI values
    const playedEl   = document.getElementById('analytics-played');
    const backlogEl  = document.getElementById('analytics-backlog');
    const upcomingEl = document.getElementById('analytics-upcoming');
    if (playedEl)   playedEl.textContent   = played;
    if (backlogEl)  backlogEl.textContent  = backlog;
    if (upcomingEl) upcomingEl.textContent = upcoming;

    // Genre distribution bars
    const genresEl = document.getElementById('analytics-genres');
    if (genresEl) {
      const maxGenre = Math.max(...Object.values(genreCounts), 1);
      genresEl.innerHTML = Object.entries(genreCounts).map(([genre, count]) => {
        const pct = Math.round((count / maxGenre) * 100);
        return `<div class="mb-3">
          <div class="d-flex justify-content-between mb-1"><span>${genre}</span><span class="text-cyan">${count}</span></div>
          <div style="background:rgba(255,255,255,0.05);border-radius:4px;height:8px;overflow:hidden;">
            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,var(--cyan),var(--purple));border-radius:4px;transition:width 0.6s ease;"></div>
          </div>
        </div>`;
      }).join('');
    }

    // Platform breakdown bars
    const platformsEl = document.getElementById('analytics-platforms');
    if (platformsEl) {
      const maxPlat = Math.max(...Object.values(platformCounts), 1);
      platformsEl.innerHTML = Object.entries(platformCounts).map(([plat, count]) => {
        const pct = Math.round((count / maxPlat) * 100);
        return `<div class="mb-3">
          <div class="d-flex justify-content-between mb-1"><span>${plat}</span><span class="text-purple">${count}</span></div>
          <div style="background:rgba(255,255,255,0.05);border-radius:4px;height:8px;overflow:hidden;">
            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,var(--purple),var(--cyan));border-radius:4px;transition:width 0.6s ease;"></div>
          </div>
        </div>`;
      }).join('');
    }
  }

  // Feedback Page Logic
  if (path.includes('admin_feedback.html')) {
    const feedback = JSON.parse(localStorage.getItem('nexus_feedback') || '[]');
    const tbody = document.getElementById('feedback-tbody');
    if (tbody && feedback.length > 0) {
      tbody.innerHTML = feedback.reverse().map(f => `
        <tr>
          <td><span class="text-cyan">${escapeHtml(f.name)}</span></td>
          <td>${escapeHtml(f.email)}</td>
          <td><span class="d-inline-block text-truncate" style="max-width: 250px;" title="${escapeHtml(f.message)}">${escapeHtml(f.message)}</span></td>
          <td><span class="text-muted">${escapeHtml(f.date)}</span></td>
        </tr>
      `).join('');
    }
  }

  // Dashboard Page Logic (admin.html)
  if (path.includes('admin.html') && !path.includes('_')) {
    const allGames = JSON.parse(localStorage.getItem('gameTrackerData_v5') || '[]');
    const allUsers = JSON.parse(localStorage.getItem('nexus_users') || '[]');
    const allFeedback = JSON.parse(localStorage.getItem('nexus_feedback') || '[]');

    const gamesEl = document.getElementById('dash-total-games');
    const usersEl = document.getElementById('dash-total-users');
    const feedbackEl = document.getElementById('dash-total-feedback');

    if (gamesEl) gamesEl.textContent = allGames.length;
    if (usersEl) usersEl.textContent = allUsers.length;
    if (feedbackEl) feedbackEl.textContent = allFeedback.length;
  }

  // Admin Games Page (Data Table)
  if (path.includes('admin_games.html')) {
    const gamesTbody = document.getElementById('admin-games-tbody');
    const allGames = JSON.parse(localStorage.getItem('gameTrackerData_v5') || '[]');
    if (gamesTbody) {
      gamesTbody.innerHTML = allGames.map(g => `
        <tr>
          <td><img src="${escapeHtml(g.cover || '')}" alt="Cover" style="width: 40px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
          <td>${escapeHtml(g.title)}</td>
          <td><span class="badge bg-dark">${escapeHtml(g.platform)}</span></td>
          <td>${escapeHtml(g.genre || 'N/A')}</td>
          <td><span class="text-${g.status === 'played' ? 'neon-green' : g.status === 'backlog' ? 'amber' : 'purple'}">${escapeHtml(g.status).toUpperCase()}</span></td>
          <td>
            <button class="btn btn-sm btn-outline-light me-1" onclick="openEditModal('${g.id}')"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="openDeleteConfirm('${g.id}')"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }
  }

  // Admin Users Page
  if (path.includes('admin_users.html')) {
    const usersTbody = document.getElementById('admin-users-tbody');
    const renderUsers = () => {
      const allUsers = JSON.parse(localStorage.getItem('nexus_users') || '[]');
      if (usersTbody) {
        usersTbody.innerHTML = allUsers.map((u, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${escapeHtml(u.username)}</td>
            <td><span class="badge" style="background:${u.role === 'admin' ? 'var(--purple)' : '#6c757d'};">${u.role === 'admin' ? 'Admin' : 'User'}</span></td>
            <td><span class="text-neon-green">Active</span></td>
            <td>
              ${u.role !== 'admin' ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${i})"><i class="bi bi-ban"></i> Ban</button>` : ''}
            </td>
          </tr>
        `).join('');
      }
    };
    renderUsers();

    window.deleteUser = function(index) {
      if (confirm('Are you sure you want to ban this operative?')) {
        const allUsers = JSON.parse(localStorage.getItem('nexus_users') || '[]');
        allUsers.splice(index, 1);
        localStorage.setItem('nexus_users', JSON.stringify(allUsers));
        renderUsers();
      }
    };
  }

  // Admin Settings Page
  if (path.includes('admin_settings.html')) {
    const settingsForm = document.getElementById('settings-form');
    const nameInput = document.getElementById('settings-sys-name');
    const emailInput = document.getElementById('settings-admin-email');
    const successMsg = document.getElementById('settings-success');

    const currentSettings = JSON.parse(localStorage.getItem('nexus_settings') || '{"name": "NEXUS", "email": "admin@nexus.local"}');
    if (nameInput) nameInput.value = currentSettings.name;
    if (emailInput) emailInput.value = currentSettings.email || 'admin@nexus.local';

    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        localStorage.setItem('nexus_settings', JSON.stringify({
          name: nameInput.value.trim() || 'NEXUS',
          email: emailInput.value.trim() || 'admin@nexus.local'
        }));
        successMsg.classList.remove('d-none');
        setTimeout(() => successMsg.classList.add('d-none'), 3000);
        
        // Update local navbar immediately
        document.querySelectorAll('.navbar-brand').forEach(brand => {
          const icon = brand.querySelector('i');
          if (icon) {
            brand.innerHTML = '';
            brand.appendChild(icon);
            brand.append(' ' + (nameInput.value.trim() || 'NEXUS').toUpperCase());
          }
        });
      });
    }
  }
});
