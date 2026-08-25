/**
 * Nexus — app.js
 */

'use strict';

/* ============================================================
   CONSTANTS & STATE
   ============================================================ */
const STORAGE_KEY = 'gameTrackerData_v5';
const RAWG_API_KEY = 'dd8cbf748091445ca77bf2168ec4e34e';
let games = [];
let pendingDeleteId = null;
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
   UTILITY
   ============================================================ */
function generateId() {
  return 'game_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
}

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
   LOCAL STORAGE
   ============================================================ */
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Storage parse error:', e);
    return [];
  }
}

/* ============================================================
   DOM RENDER: KANBAN (Library)
   ============================================================ */
function createKanbanCard(game) {
  const card = document.createElement('div');
  card.className = 'kanban-card';
  card.setAttribute('data-id', game.id);
  card.setAttribute('draggable', 'true');

  // Drag events
  card.addEventListener('dragstart', (e) => {
    draggedGameId = game.id;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => card.style.opacity = '0.5', 0);
  });
  card.addEventListener('dragend', () => {
    draggedGameId = null;
    card.style.opacity = '1';
  });

  const coverHtml = game.cover 
    ? `<img src="${escapeHtml(game.cover)}" class="kanban-card-img" onerror="this.src='https://placehold.co/60x80/111/555?text=NA'">`
    : `<div class="kanban-card-img" style="background:#111; display:flex; align-items:center; justify-content:center; color:#555; font-size:10px;">NA</div>`;

  card.innerHTML = `
    ${coverHtml}
    <div class="kanban-card-content">
      <div class="card-title-text text-truncate" title="${escapeHtml(game.title)}">${escapeHtml(game.title)}</div>
      <div class="text-muted" style="font-size:0.8rem;">${escapeHtml(game.platform)}</div>
      <div class="text-cyan" style="font-size:0.75rem;"><i class="bi bi-star-fill text-amber me-1"></i>${game.rating ? game.rating+'/5' : 'NR'}</div>
    </div>
  `;
  return card;
}

function renderKanban(filteredGames) {
  const source = filteredGames !== undefined ? filteredGames : games;
  
  const lanes = {
    played:   document.getElementById('lane-played'),
    backlog:  document.getElementById('lane-backlog'),
    upcoming: document.getElementById('lane-upcoming'),
  };

  // Only run on library page
  if (!lanes.played) return;

  Object.values(lanes).forEach(lane => {
    if (lane) {
      const cards = lane.querySelectorAll('.kanban-card');
      cards.forEach(c => c.remove());
    }
  });

  const counts = { played: 0, backlog: 0, upcoming: 0 };
  source.forEach(game => {
    if (counts[game.status] !== undefined) {
      counts[game.status]++;
      const laneEl = lanes[game.status];
      if (laneEl) {
        laneEl.appendChild(createKanbanCard(game));
      }
    }
  });

  ['played', 'backlog', 'upcoming'].forEach(s => {
    const badge = document.getElementById(`badge-${s}`);
    if (badge) badge.textContent = counts[s];
    
    const hint = document.getElementById(`hint-${s}`);
    if (hint) hint.classList.toggle('d-none', counts[s] > 0);
  });
}

function setupDragDrop() {
  const lanes = document.querySelectorAll('.kanban-lane');
  if (lanes.length === 0) return;

  lanes.forEach(lane => {
    lane.addEventListener('dragover', (e) => {
      e.preventDefault();
      lane.style.borderColor = 'var(--cyan)';
    });
    lane.addEventListener('dragleave', () => {
      lane.style.borderColor = 'var(--glass-border)';
    });
    lane.addEventListener('drop', (e) => {
      e.preventDefault();
      lane.style.borderColor = 'var(--glass-border)';
      if (!draggedGameId) return;

      const newStatus = lane.id.replace('lane-', '');
      const game = games.find(g => g.id === draggedGameId);
      if (game && game.status !== newStatus) {
        game.status = newStatus;
        saveToStorage();
        renderKanban();
      }
    });
  });
}

/* ============================================================
   ADD TO LIBRARY LOGIC
   ============================================================ */
function addToLibrary(title, cover, rawgId) {
  // Check if already in library
  const exists = games.find(g => g.rawgId === String(rawgId) || g.title.toLowerCase() === title.toLowerCase());
  if (exists) {
    showToast(`"${title}" is already in your library.`, true);
    return;
  }

  const newGame = {
    id: generateId(),
    rawgId: String(rawgId),
    title: title,
    platform: 'PC', // Default fallback
    genre: 'Unknown',
    status: 'upcoming',
    rating: null,
    year: null,
    hours: null,
    cover: cover || null,
    notes: '',
    source: 'rawg'
  };

  games.push(newGame);
  saveToStorage();
  showToast(`Added "${title}" to your library.`);
  renderKanban();
}

window.addToLibrary = addToLibrary;

/* ============================================================
   DOM RENDER: API RESULTS (Grid)
   ============================================================ */
function renderApiGamesGrid(containerId, results) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  grid.innerHTML = '';

  if (!results || results.length === 0) {
    grid.innerHTML = '<p class="text-muted">No results found.</p>';
    return;
  }

  results.forEach(game => {
    const card = document.createElement('div');
    card.className = 'store-card';
    
    const coverUrl = game.background_image || 'https://placehold.co/400x600/111/333?text=No+Cover';
    const ratingHtml = game.rating ? game.rating + '/5' : 'NR';
    const genreText = game.genres && game.genres.length > 0 ? game.genres[0].name : 'Unknown';
    const platText = game.platforms && game.platforms.length > 0 ? game.platforms[0].platform.name : 'Unknown';
    const released = game.released ? game.released.split('-')[0] : 'N/A';
    
    card.innerHTML = `
      <img src="${escapeHtml(coverUrl)}" class="store-card-img" alt="${escapeHtml(game.name)}" onerror="this.src='https://placehold.co/400x600/111/333?text=No+Cover'">
      <div class="store-card-body d-flex flex-column">
        <h3 class="store-card-title" title="${escapeHtml(game.name)}">${escapeHtml(game.name)}</h3>
        <div class="store-card-meta mb-2">${escapeHtml(platText)} &bull; ${escapeHtml(genreText)}</div>
        <div class="d-flex justify-content-between align-items-center mt-auto mb-3">
          <span class="text-amber" style="font-size:0.85rem;"><i class="bi bi-star-fill me-1"></i>${ratingHtml}</span>
          <span class="text-muted" style="font-size:0.85rem;"><i class="bi bi-calendar3 me-1"></i>${released}</span>
        </div>
        <button class="btn btn-save w-100 mt-auto" onclick="addToLibrary('${escapeHtml(game.name).replace(/'/g,"\\'").replace(/"/g,'&quot;')}', '${escapeHtml(coverUrl)}', ${game.id})">
          <i class="bi bi-plus-lg me-1"></i> Add to Library
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ============================================================
   RAWG API LOGIC
   ============================================================ */
async function fetchDailyShowcase() {
  const cacheKey = 'nexus_daily_showcase';
  const today = new Date().toISOString().split('T')[0];
  
  let cachedData = null;
  try {
    cachedData = JSON.parse(localStorage.getItem(cacheKey));
  } catch (e) {}

  if (cachedData && cachedData.date === today && cachedData.games) {
    console.log('Loading Daily Showcase from Cache');
    renderShowcase(cachedData.games);
    return;
  }

  console.log('Fetching Daily Showcase from RAWG');
  try {
    const randomPage = Math.floor(Math.random() * 10) + 1;
    const res = await fetch(`https://api.rawg.io/api/games?metacritic=80,100&page=${randomPage}&page_size=12&key=${RAWG_API_KEY}`);
    const data = await res.json();
    
    if (data.results && data.results.length > 0) {
      localStorage.setItem(cacheKey, JSON.stringify({ date: today, games: data.results }));
      renderShowcase(data.results);
    } else {
      throw new Error('No results');
    }
  } catch (e) {
    console.error('Failed to fetch daily showcase:', e);
    const grid = document.getElementById('discovery-grid');
    if (grid) grid.innerHTML = '<p class="text-red">Failed to establish uplink with RAWG network. Please check API Key.</p>';
  }
}

function renderShowcase(results) {
  renderApiGamesGrid('discovery-grid', results);

  // Update Hero
  if (results.length > 0) {
    // Pick highest rated for hero
    const heroGame = [...results].sort((a,b) => (b.rating||0) - (a.rating||0))[0];
    
    const heroTitle = document.getElementById('featured-title');
    if (heroTitle) heroTitle.textContent = heroGame.name;
    
    const heroDesc = document.getElementById('featured-desc');
    const released = heroGame.released ? heroGame.released.split('-')[0] : 'N/A';
    if (heroDesc) heroDesc.textContent = `Released: ${released} | Metacritic: ${heroGame.metacritic || 'N/A'}`;
    
    const heroBg = document.getElementById('featured-hero-bg');
    if (heroBg && heroGame.background_image) {
      heroBg.style.backgroundImage = `url('${heroGame.background_image}')`;
    }

    const heroBtn = document.getElementById('featured-add-btn');
    if (heroBtn) {
      heroBtn.style.display = 'inline-block';
      heroBtn.onclick = () => {
        addToLibrary(heroGame.name, heroGame.background_image, heroGame.id);
      };
    }
  }
}

async function performSearch(query) {
  const grid = document.getElementById('search-results-grid');
  const heading = document.getElementById('search-results-heading');
  if (!grid) return;
  
  if (heading) heading.classList.remove('d-none');
  grid.innerHTML = '<div class="text-muted"><i class="bi bi-arrow-repeat spin me-2"></i>Querying RAWG network...</div>';

  try {
    const res = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&page_size=20&key=${RAWG_API_KEY}`);
    const data = await res.json();
    renderApiGamesGrid('search-results-grid', data.results || []);
  } catch (e) {
    console.error('Search error:', e);
    grid.innerHTML = '<p class="text-red">Search failed. Please check API Key and network connection.</p>';
  }
}

/* ============================================================
   TOAST NOTIFICATION
   ============================================================ */
function showToast(message, isError = false) {
  const toastEl   = document.getElementById('app-toast');
  if (!toastEl) return;
  const toastText = document.getElementById('toast-text');
  const toastIcon = document.getElementById('toast-icon');

  toastText.textContent = message;
  toastIcon.className   = isError
    ? 'bi bi-exclamation-circle-fill me-2 text-red'
    : 'bi bi-check-circle-fill me-2 text-cyan';

  const bsToast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3000 });
  bsToast.show();
}

/* ============================================================
   INIT
   ============================================================ */
function init() {
  initTheme();
  games = loadFromStorage();

  // If we are on logbook page, setup drag and drop
  renderKanban();
  setupDragDrop();
}

init();

/* ============================================================
   PAGE ROUTING & EVENTS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  // Apply Global Settings
  const settings = JSON.parse(localStorage.getItem('nexus_settings') || '{"name": "NEXUS"}');
  document.querySelectorAll('.navbar-brand').forEach(brand => {
    const icon = brand.querySelector('i');
    if (icon) {
      brand.innerHTML = '';
      brand.appendChild(icon);
      brand.append(' ' + settings.name.toUpperCase());
    }
  });

  // Profile Page
  if (path.includes('client_profile.html')) {
    const session = JSON.parse(localStorage.getItem('nexus_session') || '{}');
    const allGames = JSON.parse(localStorage.getItem('gameTrackerData_v5') || '[]');
    
    const userRole = session.role === 'admin' ? 'Admin' : 'Client';
    const username = session.username || 'Operative';
    
    const avatarEl = document.getElementById('profile-avatar-char');
    const nameEl = document.getElementById('profile-display-name');
    const roleEl = document.getElementById('profile-role');
    
    if (avatarEl) avatarEl.textContent = username.charAt(0).toUpperCase();
    if (nameEl) nameEl.textContent = username;
    if (roleEl) roleEl.textContent = `Clearance Level: ${userRole}`;
    
    let totalGames = allGames.length;
    let totalHours = allGames.reduce((sum, g) => sum + ((parseInt(g.rating) || 0) * 10), 0) + (allGames.length * 2);
    
    const gamesEl = document.getElementById('profile-total-games');
    const timeEl = document.getElementById('profile-playtime');
    if (gamesEl) gamesEl.textContent = totalGames;
    if (timeEl) timeEl.textContent = totalHours + 'h';
    
    const genreCounts = {};
    allGames.forEach(g => {
      if (g.genre) genreCounts[g.genre] = (genreCounts[g.genre] || 0) + 1;
    });
    const genreEl = document.getElementById('profile-fav-genre');
    if (genreEl) {
      if (Object.keys(genreCounts).length === 0) {
        genreEl.textContent = 'None';
      } else {
        genreEl.textContent = Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b);
      }
    }
  }

  // Catalog Page routing to Search
  const catSearchForm = document.getElementById('catalog-search-form');
  if (catSearchForm) {
    catSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('catalog-search-input').value.trim();
      if (q) window.location.href = `client_search.html?q=${encodeURIComponent(q)}`;
    });
    
    // Also load daily showcase
    if (document.getElementById('discovery-grid')) {
      fetchDailyShowcase();
    }
  }

  // Search Engine Page
  if (path.includes('client_search.html')) {
    const searchForm = document.getElementById('engine-search-form');
    const searchInput = document.getElementById('engine-search-input');
    
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = searchInput.value.trim();
        if (q) {
          // Update URL without reload to make it shareable
          const url = new URL(window.location);
          url.searchParams.set('q', q);
          window.history.pushState({}, '', url);
          performSearch(q);
        }
      });
    }

    // Check if query exists in URL on load
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q && searchInput) {
      searchInput.value = q;
      performSearch(q);
    }
  }

  // Contact Form
  const btnSubmitContact = document.getElementById('btn-submit-contact');
  if (btnSubmitContact) {
    btnSubmitContact.addEventListener('click', () => {
      const form = document.getElementById('contact-form');
      form.classList.add('was-validated');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      
      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const message = document.getElementById('contact-message').value;
      const date = new Date().toISOString().split('T')[0];

      const feedback = JSON.parse(localStorage.getItem('nexus_feedback') || '[]');
      feedback.push({ name, email, message, date });
      localStorage.setItem('nexus_feedback', JSON.stringify(feedback));

      document.getElementById('contact-success').classList.remove('d-none');
      btnSubmitContact.disabled = true;
      btnSubmitContact.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Transmitted';
    });
  }

  // Profile Page
  if (path.includes('client_profile.html')) {
    let totalHours = 0;
    const genreCounts = {};

    games.forEach(g => {
      if (g.hours) totalHours += parseInt(g.hours, 10) || 0;
      if (g.genre) {
        genreCounts[g.genre] = (genreCounts[g.genre] || 0) + 1;
      }
    });

    let favGenre = 'None';
    let maxCount = 0;
    for (const [genre, count] of Object.entries(genreCounts)) {
      if (count > maxCount) { maxCount = count; favGenre = genre; }
    }

    const totalGamesEl = document.getElementById('profile-total-games');
    const playtimeEl   = document.getElementById('profile-playtime');
    const favGenreEl   = document.getElementById('profile-fav-genre');

    if (totalGamesEl) totalGamesEl.textContent = games.length;
    if (playtimeEl)   playtimeEl.textContent   = totalHours;
    if (favGenreEl)   favGenreEl.textContent   = favGenre;
  }
});

// Auth Logic
window.logoutUser = function(e) {
  if (e) e.preventDefault();
  localStorage.removeItem('nexus_session');
  window.location.href = 'login.html';
};

document.addEventListener('DOMContentLoaded', () => {
  const session = localStorage.getItem('nexus_session');
  const loginBtn = document.getElementById('nav-login-btn');
  if (session && loginBtn) {
    loginBtn.innerHTML = '<i class="bi bi-box-arrow-right me-1"></i><span id="nav-login-text">Logout</span>';
    loginBtn.classList.remove('text-amber');
    loginBtn.classList.add('text-danger');
    loginBtn.href = '#';
    loginBtn.addEventListener('click', window.logoutUser);
  }

  if (window.location.pathname.includes('login.html')) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loginForm.classList.add('was-validated');
        if (!loginForm.checkValidity()) return;

        const u = document.getElementById('login-username').value.trim();
        const p = document.getElementById('login-password').value;

        if (u === 'admin' && p === 'admin') {
          localStorage.setItem('nexus_session', 'admin');
          window.location.href = 'admin.html';
          return;
        }

        const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
        const user = users.find(x => x.username === u && x.password === p);
        if (user) {
          localStorage.setItem('nexus_session', u);
          window.location.href = 'catalog.html';
        } else {
          alert('Invalid credentials!');
        }
      });
    }

    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        signupForm.classList.add('was-validated');
        if (!signupForm.checkValidity()) return;

        const u = document.getElementById('signup-username').value.trim();
        const p = document.getElementById('signup-password').value;

        const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
        if (users.find(x => x.username === u)) {
          alert('Username already exists!');
          return;
        }

        users.push({ username: u, password: p });
        localStorage.setItem('nexus_users', JSON.stringify(users));
        alert('Registration successful! You may now log in.');
        signupForm.reset();
        signupForm.classList.remove('was-validated');
      });
    }
  }
});
