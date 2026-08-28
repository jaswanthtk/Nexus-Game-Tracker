/**
 * Nexus — app.js (V2 Premium Edition)
 * Refactored using modern ES6+ (Ponytail Architecture)
 */

'use strict';

const STORAGE_KEY = 'gameTrackerData_v5';
const RAWG_API_KEY = 'dd8cbf748091445ca77bf2168ec4e34e';

let games = [];
let draggedGameId = null;

// ==========================================
// Theme Logic
// ==========================================
const initTheme = () => {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  const currentTheme = localStorage.getItem('nexus_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  const icon = toggleBtn.querySelector('i');
  icon.className = currentTheme === 'light' ? 'bi bi-sun-fill text-amber' : 'bi bi-moon-stars-fill text-cyan';

  toggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('nexus_theme', newTheme);
    icon.className = newTheme === 'light' ? 'bi bi-sun-fill text-amber' : 'bi bi-moon-stars-fill text-cyan';
  });
};

// ==========================================
// Utilities
// ==========================================
const generateId = () => `game_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

const escapeHtml = (str) => {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const showToast = (message, isError = false) => {
  const toastEl = document.getElementById('app-toast');
  if (!toastEl) return;
  
  document.getElementById('toast-text').textContent = message;
  document.getElementById('toast-icon').className = isError
    ? 'bi bi-exclamation-triangle-fill me-2 text-danger'
    : 'bi bi-check-circle-fill me-2 text-neon-green';

  bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3000 }).show();
};

const saveToStorage = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(games));

const loadFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    console.error('Storage Error:', e);
    return [];
  }
};

// ==========================================
// 3D Vanilla Tilt Effect (Premium Polish)
// ==========================================
const attachTiltEffect = (card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.boxShadow = `0 15px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 229, 255, 0.1)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    card.style.boxShadow = '';
  });
};

// ==========================================
// Kanban Logic (Library)
// ==========================================
const createKanbanCard = (game, index) => {
  const card = document.createElement('div');
  card.className = `kanban-card animate-fade-up delay-${Math.min((index + 1) * 100, 500)}`;
  card.setAttribute('data-id', game.id);
  card.setAttribute('draggable', 'true');

  card.addEventListener('dragstart', (e) => {
    draggedGameId = game.id;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => card.style.opacity = '0.4', 0);
  });
  card.addEventListener('dragend', () => {
    draggedGameId = null;
    card.style.opacity = '1';
  });
  
  attachTiltEffect(card);

  const coverHtml = game.cover 
    ? `<img src="${escapeHtml(game.cover)}" class="kanban-card-img" alt="${escapeHtml(game.title)}">`
    : `<div class="kanban-card-img d-flex align-items-center justify-content-center bg-dark text-muted" style="font-size:10px;">NA</div>`;

  card.innerHTML = `
    ${coverHtml}
    <div class="kanban-card-content p-2">
      <div class="fw-bold text-truncate" title="${escapeHtml(game.title)}" style="font-size:0.9rem;">${escapeHtml(game.title)}</div>
      <div class="text-muted" style="font-size:0.75rem;">${escapeHtml(game.platform)}</div>
      <div class="text-cyan mt-1" style="font-size:0.75rem;"><i class="bi bi-star-fill text-amber me-1"></i>${game.rating ? game.rating+'/5' : 'NR'}</div>
    </div>
  `;
  return card;
};

const renderKanban = () => {
  const lanes = {
    played: document.getElementById('lane-played'),
    backlog: document.getElementById('lane-backlog'),
    upcoming: document.getElementById('lane-upcoming'),
  };

  if (!lanes.played) return; // Not on library page

  Object.values(lanes).forEach(lane => {
    if (lane) lane.innerHTML = '';
  });

  const counts = { played: 0, backlog: 0, upcoming: 0 };
  const fragments = {
    played: document.createDocumentFragment(),
    backlog: document.createDocumentFragment(),
    upcoming: document.createDocumentFragment(),
  };

  games.forEach(game => {
    if (counts[game.status] !== undefined) {
      const idx = counts[game.status]++;
      fragments[game.status].appendChild(createKanbanCard(game, idx));
    }
  });

  ['played', 'backlog', 'upcoming'].forEach(s => {
    lanes[s]?.appendChild(fragments[s]);
    const badge = document.getElementById(`badge-${s}`);
    const hint = document.getElementById(`hint-${s}`);
    if (badge) badge.textContent = counts[s];
    if (hint) hint.classList.toggle('d-none', counts[s] > 0);
  });
};

const setupDragDrop = () => {
  document.querySelectorAll('.kanban-lane').forEach(lane => {
    lane.addEventListener('dragover', (e) => {
      e.preventDefault();
      lane.style.borderColor = 'var(--cyan)';
      lane.style.background = 'rgba(0, 229, 255, 0.05)';
    });
    lane.addEventListener('dragleave', () => {
      lane.style.borderColor = 'var(--glass-border)';
      lane.style.background = 'transparent';
    });
    lane.addEventListener('drop', (e) => {
      e.preventDefault();
      lane.style.borderColor = 'var(--glass-border)';
      lane.style.background = 'transparent';
      
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
};

// ==========================================
// Core Library Methods
// ==========================================
window.addToLibrary = (title, cover, rawgId) => {
  if (games.some(g => String(g.rawgId) === String(rawgId) || g.title.toLowerCase() === title.toLowerCase())) {
    showToast(`"${title}" is already in your library.`, true);
    return;
  }

  games.push({
    id: generateId(),
    rawgId: String(rawgId),
    title,
    platform: 'PC',
    genre: 'Unknown',
    status: 'upcoming',
    rating: null,
    year: null,
    hours: null,
    cover: cover || null,
    notes: '',
    source: 'rawg'
  });

  saveToStorage();
  showToast(`Added "${title}" to your library.`);
  renderKanban();
};

// ==========================================
// API Grid Rendering
// ==========================================
const renderApiGamesGrid = (containerId, results) => {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  
  if (!results?.length) {
    grid.innerHTML = '<p class="text-muted text-center py-5">No telemetry found matching criteria.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();
  
  results.forEach((game, idx) => {
    const delay = Math.min((idx + 1) * 100, 600); // Stagger up to 600ms
    const card = document.createElement('div');
    card.className = `store-card animate-fade-up delay-${delay}`;
    
    attachTiltEffect(card);

    const coverUrl = game.background_image || 'https://placehold.co/400x600/111/333?text=No+Cover';
    const ratingHtml = game.rating ? game.rating + '/5' : 'NR';
    const genreText = game.genres?.[0]?.name || 'Unknown';
    const platText = game.platforms?.[0]?.platform?.name || 'Unknown';
    const released = game.released?.split('-')[0] || 'N/A';
    
    // Pass strictly escaped strings to inline handler
    const safeTitle = escapeHtml(game.name).replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const safeCover = escapeHtml(coverUrl).replace(/'/g, "\\'").replace(/"/g, '&quot;');

    card.innerHTML = `
      <img src="${escapeHtml(coverUrl)}" class="store-card-img" alt="${escapeHtml(game.name)}" loading="lazy">
      <div class="store-card-body d-flex flex-column h-100">
        <h3 class="store-card-title detail-title fs-5 mb-1 text-truncate" title="${escapeHtml(game.name)}">${escapeHtml(game.name)}</h3>
        <div class="text-muted mb-3" style="font-size:0.8rem;">${escapeHtml(platText)} &bull; ${escapeHtml(genreText)}</div>
        <div class="d-flex justify-content-between align-items-center mt-auto mb-3">
          <span class="text-amber" style="font-size:0.9rem;"><i class="bi bi-star-fill me-1"></i>${ratingHtml}</span>
          <span class="text-muted" style="font-size:0.9rem;"><i class="bi bi-calendar3 me-1"></i>${released}</span>
        </div>
        <button class="btn btn-save w-100" onclick="addToLibrary('${safeTitle}', '${safeCover}', ${game.id})">
          <i class="bi bi-plus-lg me-1"></i> Add
        </button>
      </div>
    `;
    fragment.appendChild(card);
  });
  
  grid.innerHTML = '';
  grid.appendChild(fragment);
};

// ==========================================
// RAWG API Fetching
// ==========================================
const fetchDailyShowcase = async () => {
  const cacheKey = 'nexus_daily_showcase';
  const today = new Date().toISOString().split('T')[0];
  
  const cachedData = JSON.parse(localStorage.getItem(cacheKey) || 'null');
  if (cachedData?.date === today && cachedData?.games) {
    return renderShowcase(cachedData.games);
  }

  try {
    const res = await fetch(`https://api.rawg.io/api/games?metacritic=80,100&page=${Math.floor(Math.random() * 10) + 1}&page_size=12&key=${RAWG_API_KEY}`);
    const data = await res.json();
    
    if (data.results?.length) {
      localStorage.setItem(cacheKey, JSON.stringify({ date: today, games: data.results }));
      renderShowcase(data.results);
    }
  } catch (e) {
    console.error('Showcase fetch failed:', e);
    const grid = document.getElementById('discovery-grid');
    if (grid) grid.innerHTML = '<p class="text-danger py-4"><i class="bi bi-exclamation-triangle-fill me-2"></i>RAWG uplink failed.</p>';
  }
};

const renderShowcase = (results) => {
  renderApiGamesGrid('discovery-grid', results);
  
  if (results.length > 0) {
    const heroGame = [...results].sort((a,b) => (b.rating || 0) - (a.rating || 0))[0];
    
    const elements = {
      title: document.getElementById('featured-title'),
      desc: document.getElementById('featured-desc'),
      bg: document.getElementById('featured-hero-bg'),
      btn: document.getElementById('featured-add-btn')
    };

    if (elements.title) elements.title.textContent = heroGame.name;
    if (elements.desc) elements.desc.textContent = `Released: ${heroGame.released?.split('-')[0] || 'N/A'} | Metacritic: ${heroGame.metacritic || 'N/A'}`;
    if (elements.bg && heroGame.background_image) elements.bg.style.backgroundImage = `url('${heroGame.background_image}')`;
    
    if (elements.btn) {
      elements.btn.style.display = 'inline-block';
      elements.btn.onclick = () => addToLibrary(heroGame.name, heroGame.background_image, heroGame.id);
    }
  }
};

const performSearch = async (query) => {
  const grid = document.getElementById('search-results-grid');
  const heading = document.getElementById('search-results-heading');
  
  if (!grid) return;
  if (heading) heading.classList.remove('d-none');
  
  grid.innerHTML = '<div class="text-cyan py-4 w-100 text-center"><i class="bi bi-arrow-repeat spin me-2"></i>Querying RAWG network...</div>';

  try {
    const res = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&page_size=20&key=${RAWG_API_KEY}`);
    const data = await res.json();
    renderApiGamesGrid('search-results-grid', data.results || []);
  } catch (e) {
    grid.innerHTML = '<p class="text-danger py-4 w-100 text-center"><i class="bi bi-wifi-off me-2"></i>Search failed. Terminal offline.</p>';
  }
};

// ==========================================
// Page Routing & Initialization
// ==========================================
const initPageLogic = () => {
  const path = window.location.pathname;
  
  // Profile Logic
  if (path.includes('client_profile.html')) {
    const session = JSON.parse(localStorage.getItem('nexus_session') || '{}');
    const userRole = session.role === 'admin' ? 'Admin' : 'Client';
    const username = session.username || 'Operative';
    
    document.getElementById('profile-avatar-char')?.replaceChildren(username.charAt(0).toUpperCase());
    document.getElementById('profile-display-name')?.replaceChildren(username);
    document.getElementById('profile-role')?.replaceChildren(`Clearance Level: ${userRole}`);
    
    let totalHours = 0;
    const genreCounts = {};
    games.forEach(g => {
      if (g.hours) totalHours += parseInt(g.hours, 10) || 0;
      if (g.genre) genreCounts[g.genre] = (genreCounts[g.genre] || 0) + 1;
    });

    const favGenre = Object.keys(genreCounts).length > 0 
      ? Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b) 
      : 'None';

    document.getElementById('profile-total-games')?.replaceChildren(games.length);
    document.getElementById('profile-playtime')?.replaceChildren(`${totalHours}h`);
    document.getElementById('profile-fav-genre')?.replaceChildren(favGenre);
  }

  // Catalog Routing
  if (path.includes('catalog.html')) {
    document.getElementById('catalog-search-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('catalog-search-input').value.trim();
      if (q) window.location.href = `client_search.html?q=${encodeURIComponent(q)}`;
    });
    if (document.getElementById('discovery-grid')) fetchDailyShowcase();
  }

  // Search Page Routing
  if (path.includes('client_search.html')) {
    const form = document.getElementById('engine-search-form');
    const input = document.getElementById('engine-search-input');
    
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (q) {
        window.history.pushState({}, '', `?q=${encodeURIComponent(q)}`);
        performSearch(q);
      }
    });

    const q = new URLSearchParams(window.location.search).get('q');
    if (q && input) {
      input.value = q;
      performSearch(q);
    }
  }

  // Contact Form
  document.getElementById('btn-submit-contact')?.addEventListener('click', () => {
    const form = document.getElementById('contact-form');
    form.classList.add('was-validated');
    if (!form.checkValidity()) return form.reportValidity();
    
    const feedback = JSON.parse(localStorage.getItem('nexus_feedback') || '[]');
    feedback.push({
      name: document.getElementById('contact-name').value,
      email: document.getElementById('contact-email').value,
      message: document.getElementById('contact-message').value,
      date: new Date().toISOString().split('T')[0]
    });
    localStorage.setItem('nexus_feedback', JSON.stringify(feedback));
    
    document.getElementById('contact-success').classList.remove('d-none');
    const btn = document.getElementById('btn-submit-contact');
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Transmitted';
  });
};

// ==========================================
// Authentication
// ==========================================
window.logoutUser = (e) => {
  e?.preventDefault();
  localStorage.removeItem('nexus_session');
  window.location.href = 'login.html';
};

const initAuth = () => {
  const session = localStorage.getItem('nexus_session');
  const loginBtn = document.getElementById('nav-login-btn');
  
  if (session && loginBtn) {
    loginBtn.innerHTML = '<i class="bi bi-box-arrow-right me-1"></i><span>Logout</span>';
    loginBtn.className = 'nav-link text-danger';
    loginBtn.href = '#';
    loginBtn.addEventListener('click', window.logoutUser);
  }

  if (window.location.pathname.includes('login.html')) {
    document.getElementById('login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;
      form.classList.add('was-validated');
      if (!form.checkValidity()) return;

      const u = document.getElementById('login-username').value.trim();
      const p = document.getElementById('login-password').value;

      if (u === 'NexBoss' && p === 'NexusLib1144') {
        localStorage.setItem('nexus_session', JSON.stringify({ role: 'admin', username: u }));
        return window.location.href = 'admin.html';
      }

      const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
      if (users.some(x => x.username === u && x.password === p)) {
        localStorage.setItem('nexus_session', JSON.stringify({ role: 'client', username: u }));
        window.location.href = 'catalog.html';
      } else {
        showToast('Invalid credentials!', true);
      }
    });

    document.getElementById('signup-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;
      form.classList.add('was-validated');
      if (!form.checkValidity()) return;

      const u = document.getElementById('signup-username').value.trim();
      const p = document.getElementById('signup-password').value;

      const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
      if (users.some(x => x.username === u)) return showToast('Username exists!', true);

      users.push({ username: u, password: p });
      localStorage.setItem('nexus_users', JSON.stringify(users));
      showToast('Registration successful!');
      form.reset();
      form.classList.remove('was-validated');
    });
  }
};

// ==========================================
// Bootstrap
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  games = loadFromStorage();
  
  initPageLogic();
  initAuth();
  
  renderKanban();
  setupDragDrop();
});
