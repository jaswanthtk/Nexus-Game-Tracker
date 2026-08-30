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
  if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  const updateThemeIcon = (theme) => {
    const iconEl = toggleBtn.querySelector('[data-lucide]');
    if (iconEl) {
      iconEl.setAttribute('data-lucide', theme === 'light' ? 'sun' : 'moon');
      if (window.lucide) lucide.createIcons({ nodes: [iconEl] });
    }
  };
  updateThemeIcon(currentTheme);

  toggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nexus_theme', newTheme);
    updateThemeIcon(newTheme);
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
  
  const textEl = document.getElementById('toast-text');
  const iconEl = document.getElementById('toast-icon');
  if (textEl) textEl.textContent = message;
  if (iconEl) {
    iconEl.setAttribute('data-lucide', isError ? 'alert-triangle' : 'check-circle');
    iconEl.className = isError
      ? 'w-5 h-5 mr-3 text-red-400'
      : 'w-5 h-5 mr-3 text-brand-400';
    if (window.lucide) lucide.createIcons({ nodes: [iconEl] });
  }

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
// 3D Vanilla Tilt Effect
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
    card.style.boxShadow = `0 15px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 229, 255, 0.15)`;
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
  card.className = `bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg cursor-grab active:cursor-grabbing hover:border-brand-500/50 transition-colors animate-fade-up delay-${Math.min((index + 1) * 100, 600)}`;
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
    ? `<img src="${escapeHtml(game.cover)}" class="w-full h-32 object-cover object-center border-b border-zinc-800" alt="${escapeHtml(game.title)}" onerror="this.src='https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg'">`
    : `<div class="w-full h-32 flex items-center justify-center bg-zinc-900 text-zinc-500 border-b border-zinc-800 text-xs font-mono"><i data-lucide="gamepad" class="w-6 h-6 mr-1"></i> ${escapeHtml(game.title.slice(0, 8))}</div>`;

  card.innerHTML = `
    ${coverHtml}
    <div class="p-3 bg-zinc-900/50">
      <div class="font-display font-bold text-white truncate mb-1" title="${escapeHtml(game.title)}">${escapeHtml(game.title)}</div>
      <div class="text-zinc-400 text-xs mb-2">${escapeHtml(game.platform)}</div>
      <div class="flex items-center text-brand-400 text-xs font-medium"><i data-lucide="star" class="w-3 h-3 mr-1 fill-brand-400/20"></i>${game.rating ? game.rating+'/5' : 'NR'}</div>
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
  if (window.lucide) lucide.createIcons();
};

const setupDragDrop = () => {
  document.querySelectorAll('.kanban-lane').forEach(lane => {
    lane.addEventListener('dragover', (e) => {
      e.preventDefault();
      lane.style.borderColor = 'var(--accent-cyan)';
      lane.style.background = 'rgba(0, 229, 255, 0.05)';
    });
    lane.addEventListener('dragleave', () => {
      lane.style.borderColor = 'var(--border-subtle)';
      lane.style.background = 'transparent';
    });
    lane.addEventListener('drop', (e) => {
      e.preventDefault();
      lane.style.borderColor = 'var(--border-subtle)';
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
  
  if (!results || !results.length) {
    grid.innerHTML = '<p class="text-muted text-center py-5">No telemetry found matching criteria.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();
  
  results.forEach((game, idx) => {
    const delay = Math.min((idx + 1) * 100, 600);
    const card = document.createElement('div');
    card.className = `bg-zinc-900/40 backdrop-blur border border-zinc-800 rounded-2xl overflow-hidden shadow-xl hover:border-brand-500/30 transition-colors animate-fade-up delay-${delay} flex flex-col h-full group`;
    
    attachTiltEffect(card);

    const coverUrl = game.background_image || 'https://media.rawg.io/media/games/618/618c2031a07046f861f637f8c465e63e.jpg';
    const ratingHtml = game.rating ? game.rating + '/5' : 'NR';
    const genreText = game.genres && game.genres.length > 0 ? game.genres[0].name : 'Action';
    const platText = game.platforms && game.platforms.length > 0 ? game.platforms[0].platform.name : 'PC';
    const released = game.released ? game.released.split('-')[0] : 'N/A';
    
    const safeTitle = escapeHtml(game.name).replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const safeCover = escapeHtml(coverUrl).replace(/'/g, "\\'").replace(/"/g, '&quot;');

    card.innerHTML = `
      <div class="relative w-full pt-[130%] overflow-hidden">
        <img src="${escapeHtml(coverUrl)}" class="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="${escapeHtml(game.name)}" loading="lazy" onerror="this.src='https://media.rawg.io/media/games/618/618c2031a07046f861f637f8c465e63e.jpg'">
        <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
      </div>
      <div class="p-5 flex flex-col flex-grow bg-zinc-950 relative -mt-4 rounded-t-2xl z-10">
        <h3 class="text-xl font-display font-bold text-white mb-1 truncate" title="${escapeHtml(game.name)}">${escapeHtml(game.name)}</h3>
        <div class="text-zinc-400 text-sm mb-4 font-medium">${escapeHtml(platText)} &bull; ${escapeHtml(genreText)}</div>
        <div class="flex justify-between items-center mb-5 mt-auto">
          <span class="flex items-center text-amber-400 text-sm font-bold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20"><i data-lucide="star" class="w-4 h-4 mr-1 fill-amber-400/20"></i>${ratingHtml}</span>
          <span class="text-zinc-500 text-sm font-mono">${released}</span>
        </div>
        <button class="w-full bg-zinc-800 hover:bg-brand-500 text-zinc-300 hover:text-zinc-950 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2" onclick="addToLibrary('${safeTitle}', '${safeCover}', ${game.id})">
           <i data-lucide="plus" class="w-5 h-5"></i> Add to Library
        </button>
      </div>
    `;
    fragment.appendChild(card);
  });
  
  grid.innerHTML = '';
  grid.appendChild(fragment);
  if (window.lucide) lucide.createIcons();
};

// ==========================================
// RAWG API Fetching (Robust Fallback)
// ==========================================
const fetchDailyShowcase = async () => {
  const cacheKey = 'nexus_daily_showcase';
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const cachedData = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    if (cachedData && cachedData.date === today && cachedData.games && cachedData.games.length > 0) {
      renderShowcase(cachedData.games);
      return;
    }
  } catch (e) {}

  try {
    const res = await fetch(`https://api.rawg.io/api/games?metacritic=80,100&page_size=12&key=${RAWG_API_KEY}`);
    const data = await res.json();
    
    if (data && data.results && data.results.length > 0) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ date: today, games: data.results }));
      } catch (e) {}
      renderShowcase(data.results);
    } else {
      throw new Error('No results from RAWG');
    }
  } catch (e) {
    console.warn('RAWG API network fallback engaged:', e);
    // Reliable Fallback Games if API key rate-limited or offline
    const fallbackResults = [
      { id: 3498, name: 'Grand Theft Auto V', rating: 4.47, released: '2013-09-17', metacritic: 92, background_image: 'https://media.rawg.io/media/games/20a/20aa03a10e7208d8599f250ba64b970c.jpg', genres: [{name: 'Action'}], platforms: [{platform: {name: 'PC'}}] },
      { id: 3328, name: 'The Witcher 3: Wild Hunt', rating: 4.65, released: '2015-05-18', metacritic: 92, background_image: 'https://media.rawg.io/media/games/618/618c2031a07046f861f637f8c465e63e.jpg', genres: [{name: 'RPG'}], platforms: [{platform: {name: 'PC'}}] },
      { id: 4200, name: 'Portal 2', rating: 4.61, released: '2011-04-18', metacritic: 95, background_image: 'https://media.rawg.io/media/games/2ba/2bac0e87cf45e5b508f227d85e0f9252.jpg', genres: [{name: 'Shooter'}], platforms: [{platform: {name: 'PC'}}] },
      { id: 5286, name: 'Tomb Raider', rating: 4.05, released: '2013-03-05', metacritic: 86, background_image: 'https://media.rawg.io/media/games/021/021c4e21a1824d2526f925edd63246bb.jpg', genres: [{name: 'Action'}], platforms: [{platform: {name: 'PC'}}] },
      { id: 13536, name: 'Portal', rating: 4.51, released: '2007-10-09', metacritic: 90, background_image: 'https://media.rawg.io/media/games/7fa/7fa0b586293c5861ee32490e953a4996.jpg', genres: [{name: 'Puzzle'}], platforms: [{platform: {name: 'PC'}}] },
      { id: 12020, name: 'Left 4 Dead 2', rating: 4.09, released: '2009-11-17', metacritic: 89, background_image: 'https://media.rawg.io/media/games/d58/d588947d4286e7b5e0e12e1bea7d9844.jpg', genres: [{name: 'Action'}], platforms: [{platform: {name: 'PC'}}] }
    ];
    renderShowcase(fallbackResults);
  }
};

const renderShowcase = (results) => {
  renderApiGamesGrid('discovery-grid', results);
  
  if (results && results.length > 0) {
    const heroGame = [...results].sort((a,b) => (b.rating || 0) - (a.rating || 0))[0];
    
    const titleEl = document.getElementById('featured-title');
    const descEl = document.getElementById('featured-desc');
    const bgEl = document.getElementById('featured-hero-bg');
    const btnEl = document.getElementById('featured-add-btn');

    if (titleEl) titleEl.textContent = heroGame.name;
    if (descEl) {
      const released = heroGame.released ? heroGame.released.split('-')[0] : 'N/A';
      descEl.textContent = `Released: ${released} | Metacritic: ${heroGame.metacritic || '90+'}`;
    }
    if (bgEl && heroGame.background_image) {
      bgEl.style.backgroundImage = `url('${heroGame.background_image}')`;
    }
    
    if (btnEl) {
      btnEl.style.display = 'inline-flex';
      btnEl.onclick = () => addToLibrary(heroGame.name, heroGame.background_image, heroGame.id);
    }
  }
};

const performSearch = async (query) => {
  const grid = document.getElementById('search-results-grid');
  const heading = document.getElementById('search-results-heading');
  
  if (!grid) return;
  if (heading) heading.classList.remove('d-none');
  
  grid.innerHTML = '<div class="text-cyan py-5 w-100 text-center fs-5">Querying RAWG network...</div>';

  try {
    const res = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&page_size=20&key=${RAWG_API_KEY}`);
    const data = await res.json();
    renderApiGamesGrid('search-results-grid', data.results || []);
  } catch (e) {
    grid.innerHTML = '<p class="text-danger py-4 w-100 text-center">Search failed. Please check network connection.</p>';
  }
};

// ==========================================
// Page Routing & Initialization (Element-based)
// ==========================================
const initPageLogic = () => {
  // Discovery / Catalog Page
  const discoveryGrid = document.getElementById('discovery-grid');
  const catalogSearchForm = document.getElementById('catalog-search-form');
  if (catalogSearchForm) {
    catalogSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('catalog-search-input')?.value.trim();
      if (q) window.location.href = `client_search.html?q=${encodeURIComponent(q)}`;
    });
  }
  if (discoveryGrid) {
    fetchDailyShowcase();
  }

  // Profile Page
  const profileTotalGames = document.getElementById('profile-total-games');
  if (profileTotalGames) {
    let session = {};
    try { session = JSON.parse(localStorage.getItem('nexus_session') || '{}'); } catch (e) {}
    const userRole = session.role === 'admin' ? 'Admin' : 'Client';
    const username = session.username || 'Operative';
    
    const avatarEl = document.getElementById('profile-avatar-char');
    const nameEl = document.getElementById('profile-display-name');
    const roleEl = document.getElementById('profile-role');
    
    if (avatarEl) avatarEl.textContent = username.charAt(0).toUpperCase();
    if (nameEl) nameEl.textContent = username;
    if (roleEl) roleEl.textContent = `Clearance Level: ${userRole}`;
    
    let totalHours = 0;
    const genreCounts = {};
    games.forEach(g => {
      if (g.hours) totalHours += parseInt(g.hours, 10) || 0;
      if (g.genre) genreCounts[g.genre] = (genreCounts[g.genre] || 0) + 1;
    });

    const favGenre = Object.keys(genreCounts).length > 0 
      ? Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b) 
      : 'Action';

    profileTotalGames.textContent = games.length;
    document.getElementById('profile-playtime')?.replaceChildren(`${totalHours}h`);
    document.getElementById('profile-fav-genre')?.replaceChildren(favGenre);
  }

  // Search Engine Page
  const engineForm = document.getElementById('engine-search-form');
  const engineInput = document.getElementById('engine-search-input');
  if (engineForm && engineInput) {
    engineForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = engineInput.value.trim();
      if (q) {
        window.history.pushState({}, '', `?q=${encodeURIComponent(q)}`);
        performSearch(q);
      }
    });

    const q = new URLSearchParams(window.location.search).get('q');
    if (q) {
      engineInput.value = q;
      performSearch(q);
    }
  }

  // Contact Form
  const btnSubmitContact = document.getElementById('btn-submit-contact');
  if (btnSubmitContact) {
    btnSubmitContact.addEventListener('click', () => {
      const form = document.getElementById('contact-form');
      if (!form) return;
      form.classList.add('was-validated');
      if (!form.checkValidity()) return form.reportValidity();
      
      const feedback = JSON.parse(localStorage.getItem('nexus_feedback') || '[]');
      feedback.push({
        name: document.getElementById('contact-name')?.value || 'Operative',
        email: document.getElementById('contact-email')?.value || 'anon@nexus.local',
        message: document.getElementById('contact-message')?.value || '',
        date: new Date().toISOString().split('T')[0]
      });
      localStorage.setItem('nexus_feedback', JSON.stringify(feedback));
      
      document.getElementById('contact-success')?.classList.remove('d-none');
      btnSubmitContact.disabled = true;
      btnSubmitContact.innerHTML = 'Transmitted';
    });
  }
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
    loginBtn.innerHTML = '<i data-lucide="log-out" class="w-5 h-5"></i><span>Logout</span>';
    loginBtn.className = 'nav-link flex items-center gap-2 !text-red-400 hover:!text-red-300 font-medium transition-colors';
    loginBtn.href = '#';
    loginBtn.addEventListener('click', window.logoutUser);
    if (window.lucide) lucide.createIcons({ nodes: [loginBtn] });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loginForm.classList.add('was-validated');
      if (!loginForm.checkValidity()) return;

      const u = document.getElementById('login-username')?.value.trim();
      const p = document.getElementById('login-password')?.value;

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

      const u = document.getElementById('signup-username')?.value.trim();
      const p = document.getElementById('signup-password')?.value;

      const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
      if (users.some(x => x.username === u)) return showToast('Username exists!', true);

      users.push({ username: u, password: p });
      localStorage.setItem('nexus_users', JSON.stringify(users));
      showToast('Registration successful! You can now log in.');
      form.reset();
      form.classList.remove('was-validated');
    });
  }
};

// ==========================================
// XML / Fallback Seed Logic for Client
// ==========================================
const getFallbackSeedGames = () => [
  { id: 'xml_seed_001', title: 'Elden Ring', platform: 'PC', genre: 'RPG', status: 'played', rating: 5, year: '2022', hours: '120', cover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg', notes: 'Absolute masterpiece. 120+ hours and still going strong.', addedAt: new Date().toISOString() },
  { id: 'xml_seed_002', title: 'Hollow Knight', platform: 'PC', genre: 'Action', status: 'played', rating: 5, year: '2017', hours: '52', cover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg', notes: 'Tight controls and incredible world-building.', addedAt: new Date().toISOString() },
  { id: 'xml_seed_003', title: 'Cyberpunk 2077', platform: 'PlayStation 5', genre: 'RPG', status: 'backlog', rating: 4, year: '2020', hours: null, cover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg', notes: 'Picked it up after the 2.0 patch.', addedAt: new Date().toISOString() },
  { id: 'xml_seed_004', title: 'Hades II', platform: 'PC', genre: 'Action', status: 'backlog', rating: 5, year: '2024', hours: null, cover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145350/header.jpg', notes: 'In early access. Waiting for full release.', addedAt: new Date().toISOString() },
  { id: 'xml_seed_005', title: 'GTA VI', platform: 'PlayStation 5', genre: 'Action', status: 'upcoming', rating: null, year: '2025', hours: null, cover: 'https://upload.wikimedia.org/wikipedia/en/4/46/Grand_Theft_Auto_VI.png', notes: 'Most anticipated game of the decade.', addedAt: new Date().toISOString() },
  { id: 'xml_seed_006', title: 'Fable (2025)', platform: 'Xbox Series X', genre: 'RPG', status: 'upcoming', rating: null, year: '2025', hours: null, cover: 'https://upload.wikimedia.org/wikipedia/en/b/b8/Fable_key_art.png', notes: 'A full reboot of the Lionhead franchise.', addedAt: new Date().toISOString() }
];

const fetchGamesFromXML = (onSuccess, onError) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'games.xml', true);
  if (xhr.overrideMimeType) xhr.overrideMimeType('text/xml');
  
  xhr.onload = () => {
    if (xhr.status !== 200 && xhr.status !== 0) return onError();
    let xmlDoc = xhr.responseXML;
    if (!xmlDoc?.documentElement || xmlDoc.getElementsByTagName('parsererror').length) {
      try { xmlDoc = new DOMParser().parseFromString(xhr.responseText, 'text/xml'); } 
      catch (e) { return onError(); }
    }
    if (!xmlDoc) return onError();

    const nodes = xmlDoc.getElementsByTagName('game');
    const parsed = Array.from(nodes).map(node => {
      const getText = tag => (node.getElementsByTagName(tag)[0]?.textContent || '').trim();
      const title = getText('title');
      if (!title) return null;
      return {
        id: getText('id') || generateId(),
        title,
        platform: getText('platform'),
        genre: getText('genre'),
        status: getText('status'),
        rating: parseInt(getText('rating')) || null,
        year: getText('year') || null,
        hours: getText('hours') || null,
        cover: getText('cover') || null,
        notes: getText('notes') || null,
        addedAt: new Date().toISOString(),
        source: 'xml'
      };
    }).filter(Boolean);

    if (parsed.length) onSuccess(parsed);
    else onError();
  };
  xhr.onerror = onError;
  xhr.send();
};

// ==========================================
// Bootstrap
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  games = loadFromStorage();
  
  if (games.length === 0) {
    fetchGamesFromXML(
      (parsed) => {
        games = parsed;
        saveToStorage();
        initPageLogic();
        renderKanban();
        setupDragDrop();
      },
      () => {
        games = getFallbackSeedGames();
        saveToStorage();
        initPageLogic();
        renderKanban();
        setupDragDrop();
      }
    );
  } else {
    initPageLogic();
    renderKanban();
    setupDragDrop();
  }
  
  initAuth();
});
