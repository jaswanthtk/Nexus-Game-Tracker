/**
 * Nexus — admin.js (V2 Premium Edition)
 * Refactored using modern ES6+ (Ponytail Architecture)
 */

'use strict';

const STORAGE_KEY = 'gameTrackerData_v5';
let games = [];
let pendingDeleteId = null;

// ==========================================
// Admin Auth Check & Theme
// ==========================================
(() => {
  try {
    const session = JSON.parse(localStorage.getItem('nexus_session') || '{}');
    if (session.role !== 'admin') window.location.href = 'login.html';
  } catch(e) {
    window.location.href = 'login.html';
  }
})();

const initTheme = () => {
  const currentTheme = localStorage.getItem('nexus_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    const updateIcon = (theme) => {
      const iconEl = toggleBtn.querySelector('[data-lucide]');
      if (iconEl) {
        iconEl.setAttribute('data-lucide', theme === 'light' ? 'sun' : 'moon');
        if (window.lucide) lucide.createIcons({ nodes: [iconEl] });
      }
    };
    updateIcon(currentTheme);
    
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
      updateIcon(newTheme);
    });
  }
};

// ==========================================
// Utilities
// ==========================================
const generateId = () => `game_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

const escapeHtml = (str) => String(str || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

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
const loadFromStorage = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

// ==========================================
// XML / Fallback Seed Logic (Unit 4)
// ==========================================
const getFallbackGames = () => [
  { id: generateId(), title: 'Elden Ring', platform: 'PC', genre: 'RPG', status: 'played', rating: 5, year: '2022', hours: '120', cover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg', notes: 'Masterpiece.', addedAt: new Date().toISOString() },
  { id: generateId(), title: 'Cyberpunk 2077', platform: 'PS5', genre: 'RPG', status: 'backlog', rating: 4, year: '2020', hours: null, cover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg', notes: 'Need to play Phantom Liberty.', addedAt: new Date().toISOString() }
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

    parsed.length > 0 ? onSuccess(parsed) : onError();
  };
  xhr.onerror = onError;
  xhr.send();
};

const syncCoversWithXML = () => {
  fetchGamesFromXML((xmlGames) => {
    let updated = false;
    xmlGames.forEach(xg => {
      const match = games.find(g => g.title.toLowerCase() === xg.title.toLowerCase());
      if (match && xg.cover && match.cover !== xg.cover) {
        match.cover = xg.cover;
        updated = true;
      }
    });
    if (updated) saveToStorage();
  }, () => {});
};

// ==========================================
// Admin UI Core Logic
// ==========================================
const initAdminUI = () => {
  const path = window.location.pathname;
  
  // Dashboard Metrics
  if (path.includes('admin.html') && !path.includes('_')) {
    document.getElementById('dash-total-games')?.replaceChildren(games.length);
    document.getElementById('dash-total-users')?.replaceChildren(JSON.parse(localStorage.getItem('nexus_users') || '[]').length);
    document.getElementById('dash-total-feedback')?.replaceChildren(JSON.parse(localStorage.getItem('nexus_feedback') || '[]').length);
  }
  
  // Games Table
  if (path.includes('admin_games.html')) {
    const tbody = document.getElementById('admin-games-tbody');
    if (tbody) {
      tbody.innerHTML = games.map(g => `
        <tr class="animate-fade-up">
          <td><img src="${escapeHtml(g.cover || 'https://placehold.co/40x50/111/333')}" alt="Cover" style="width:40px;height:50px;object-fit:cover;border-radius:4px;"></td>
          <td class="fw-bold">${escapeHtml(g.title)}</td>
          <td><span class="badge" style="background:var(--border-subtle); color:var(--text-primary);">${escapeHtml(g.platform)}</span></td>
          <td>${escapeHtml(g.genre || 'N/A')}</td>
          <td><span class="text-${g.status === 'played' ? 'neon-green' : g.status === 'backlog' ? 'amber' : 'purple'}">${escapeHtml(g.status).toUpperCase()}</span></td>
          <td>
            <button class="btn btn-sm btn-save me-1" onclick="openEditModal('${g.id}')" aria-label="Edit Game"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="openDeleteConfirm('${g.id}')" aria-label="Delete Game"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `).join('');
    }
  }

  // Users Table
  if (path.includes('admin_users.html')) {
    const usersTbody = document.getElementById('admin-users-tbody');
    const renderUsers = () => {
      const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
      if (!usersTbody) return;
      usersTbody.innerHTML = users.map((u, i) => `
        <tr class="animate-fade-up delay-100">
          <td>${i + 1}</td>
          <td class="text-cyan">${escapeHtml(u.username)}</td>
          <td><span class="badge ${u.role === 'admin' ? 'bg-purple' : 'bg-secondary'}">${u.role === 'admin' ? 'Admin' : 'User'}</span></td>
          <td><span class="text-neon-green"><i class="bi bi-circle-fill me-1" style="font-size:0.5rem;"></i>Active</span></td>
          <td>
            ${u.role !== 'admin' ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${i})"><i class="bi bi-ban"></i> Ban</button>` : '<span class="text-muted">Protected</span>'}
          </td>
        </tr>
      `).join('');
    };
    renderUsers();
    
    window.deleteUser = (idx) => {
      if (confirm('Ban this operative?')) {
        const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
        users.splice(idx, 1);
        localStorage.setItem('nexus_users', JSON.stringify(users));
        renderUsers();
      }
    };
  }

  // Analytics
  if (path.includes('admin_analytics.html')) {
    let played = 0, backlog = 0, upcoming = 0;
    const genres = {}, platforms = {};

    games.forEach(g => {
      if (g.status === 'played') played++;
      if (g.status === 'backlog') backlog++;
      if (g.status === 'upcoming') upcoming++;
      if (g.genre) genres[g.genre] = (genres[g.genre] || 0) + 1;
      if (g.platform) platforms[g.platform] = (platforms[g.platform] || 0) + 1;
    });

    document.getElementById('analytics-played')?.replaceChildren(played);
    document.getElementById('analytics-backlog')?.replaceChildren(backlog);
    document.getElementById('analytics-upcoming')?.replaceChildren(upcoming);

    const renderBars = (id, data, color) => {
      const el = document.getElementById(id);
      if (!el) return;
      const max = Math.max(...Object.values(data), 1);
      el.innerHTML = Object.entries(data).sort((a,b) => b[1]-a[1]).map(([k, v]) => `
        <div class="mb-3 animate-fade-up">
          <div class="d-flex justify-content-between mb-1"><span>${escapeHtml(k)}</span><span style="color:var(--${color})">${v}</span></div>
          <div style="background:var(--border-subtle); border-radius:4px; height:8px; overflow:hidden;">
            <div style="width:${(v/max)*100}%; height:100%; background:var(--${color}); border-radius:4px; transition:width 1s ease;"></div>
          </div>
        </div>
      `).join('');
    };

    renderBars('analytics-genres', genres, 'cyan');
    renderBars('analytics-platforms', platforms, 'purple');
  }

  // Feedback
  if (path.includes('admin_feedback.html')) {
    const feedback = JSON.parse(localStorage.getItem('nexus_feedback') || '[]');
    const tbody = document.getElementById('feedback-tbody');
    if (tbody && feedback.length > 0) {
      tbody.innerHTML = feedback.reverse().map((f, i) => `
        <tr class="animate-fade-up delay-${Math.min((i+1)*100, 500)}">
          <td class="text-cyan">${escapeHtml(f.name)}</td>
          <td>${escapeHtml(f.email)}</td>
          <td class="text-truncate" style="max-width:300px;" title="${escapeHtml(f.message)}">${escapeHtml(f.message)}</td>
          <td class="text-muted" style="font-size:0.8rem;">${escapeHtml(f.date)}</td>
        </tr>
      `).join('');
    }
  }

  // Settings
  if (path.includes('admin_settings.html')) {
    const form = document.getElementById('settings-form');
    const settings = JSON.parse(localStorage.getItem('nexus_settings') || '{"name":"NEXUS"}');
    
    document.getElementById('settings-sys-name').value = settings.name;
    document.getElementById('settings-admin-email').value = settings.email || 'admin@nexus.local';

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      localStorage.setItem('nexus_settings', JSON.stringify({
        name: document.getElementById('settings-sys-name').value.trim() || 'NEXUS',
        email: document.getElementById('settings-admin-email').value.trim() || 'admin@nexus.local'
      }));
      document.getElementById('settings-success').classList.remove('d-none');
    });
  }
};

// ==========================================
// Game Modals (Add / Edit / Delete)
// ==========================================
let bsGameModal = null;
let bsDeleteModal = null;

const resetForm = () => {
  const form = document.getElementById('game-form');
  if (form) {
    form.reset();
    form.classList.remove('was-validated');
  }
  document.getElementById('game-id').value = '';
  document.getElementById('notes-char-count').textContent = '0';
  document.querySelectorAll('.star-radio').forEach(r => r.checked = false);
};

window.openAddModal = () => {
  resetForm();
  document.getElementById('modal-title-text').textContent = 'Add New Game';
  if (!bsGameModal) bsGameModal = new bootstrap.Modal(document.getElementById('gameFormModal'));
  bsGameModal.show();
};

window.openEditModal = (id) => {
  const game = games.find(g => g.id === id);
  if (!game) return;
  resetForm();
  
  document.getElementById('modal-title-text').textContent = 'Edit Game';
  document.getElementById('game-id').value = game.id;
  document.getElementById('game-title').value = game.title;
  document.getElementById('game-platform').value = game.platform;
  document.getElementById('game-genre').value = game.genre;
  document.getElementById('game-status').value = game.status;
  document.getElementById('game-year').value = game.year || '';
  document.getElementById('game-hours').value = game.hours || '';
  document.getElementById('game-cover').value = game.cover || '';
  document.getElementById('game-notes').value = game.notes || '';
  document.getElementById('notes-char-count').textContent = (game.notes || '').length;

  if (game.rating) {
    const radio = document.getElementById(`star${game.rating}`);
    if (radio) radio.checked = true;
  }

  if (!bsGameModal) bsGameModal = new bootstrap.Modal(document.getElementById('gameFormModal'));
  bsGameModal.show();
};

window.openDeleteConfirm = (id) => {
  pendingDeleteId = id;
  if (!bsDeleteModal) bsDeleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
  bsDeleteModal.show();
};

document.getElementById('btn-save-game')?.addEventListener('click', () => {
  const form = document.getElementById('game-form');
  form.classList.add('was-validated');
  if (!form.checkValidity()) return form.reportValidity();

  const id = document.getElementById('game-id').value;
  const ratingEl = document.querySelector('.star-radio:checked');
  
  const gameData = {
    title: document.getElementById('game-title').value.trim(),
    platform: document.getElementById('game-platform').value,
    genre: document.getElementById('game-genre').value,
    status: document.getElementById('game-status').value,
    year: document.getElementById('game-year').value || null,
    hours: document.getElementById('game-hours').value || null,
    cover: document.getElementById('game-cover').value.trim() || null,
    notes: document.getElementById('game-notes').value.trim() || null,
    rating: ratingEl ? parseInt(ratingEl.value, 10) : null
  };

  if (id) {
    const idx = games.findIndex(g => g.id === id);
    if (idx > -1) games[idx] = { ...games[idx], ...gameData };
    showToast('Game updated successfully.');
  } else {
    games.push({ id: generateId(), addedAt: new Date().toISOString(), ...gameData });
    showToast('Game added to library.');
  }

  saveToStorage();
  bsGameModal.hide();
  setTimeout(() => window.location.reload(), 500); // quick reload to reflect changes in tables
});

document.getElementById('btn-confirm-delete')?.addEventListener('click', () => {
  if (pendingDeleteId) {
    games = games.filter(g => g.id !== pendingDeleteId);
    saveToStorage();
    showToast('Game deleted.', true);
    pendingDeleteId = null;
    bsDeleteModal.hide();
    setTimeout(() => window.location.reload(), 500);
  }
});

// Character Counter
document.getElementById('game-notes')?.addEventListener('input', (e) => {
  document.getElementById('notes-char-count').textContent = e.target.value.length;
});

// Logout Helper
window.logoutUser = (e) => {
  e?.preventDefault();
  localStorage.removeItem('nexus_session');
  window.location.href = 'login.html';
};

// ==========================================
// Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  games = loadFromStorage();

  if (games.length === 0) {
    fetchGamesFromXML(
      (parsed) => { games = parsed; saveToStorage(); initAdminUI(); showToast('Loaded XML seed data.'); },
      () => { games = getFallbackGames(); saveToStorage(); initAdminUI(); }
    );
  } else {
    syncCoversWithXML();
    initAdminUI();
  }
});
