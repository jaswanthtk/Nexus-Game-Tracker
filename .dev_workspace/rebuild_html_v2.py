#!/usr/bin/env python3
import os
import re

HEAD_BLOCK = '''<!DOCTYPE html>
<html lang="en" data-theme="dark" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Nexus — Your ultimate gaming backlog and telemetry tracker. Organize, discover, and conquer your games." />
  <meta name="theme-color" content="#09090b" />
  <title>{title}</title>
  
  <!-- SEO & Performance Optimization -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
  
  <link rel="icon" href="favicon.svg" type="image/svg+xml" />
  <link rel="shortcut icon" href="favicon.svg" />
  <!-- Keep bootstrap for modal functionality -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" crossorigin="anonymous" />
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            display: ['Outfit', 'sans-serif'],
          },
          colors: {
            brand: { 400: '#74c7ec', 500: '#89b4fa', 900: '#181825' },
            accent: { 400: '#cba6f7', 500: '#b4befe' }
          }
        }
      }
    }
  </script>
  
  <!-- Motion (Vanilla) & Lucide -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="https://cdn.jsdelivr.net/npm/motion@11.11.13/dist/motion.js"></script>

  <link rel="stylesheet" href="css/style.css?v=4" />
</head>
'''

def client_navbar(active):
    links = [
        ('catalog.html', 'Catalog'),
        ('client_search.html', 'Game Search'),
        ('client_profile.html', 'User Profile'),
        ('client_logbook.html', 'Library'),
        ('client_contact.html', 'Contact/Support'),
    ]
    items = ''
    for href, label in links:
        cls = 'nav-link active font-medium !text-brand-400' if href == active else 'nav-link font-medium !text-zinc-400 hover:!text-white transition-colors'
        aria = ' aria-current="page"' if href == active else ''
        items += f'          <li class="nav-item"><a class="{cls}"{aria} href="{href}">{label}</a></li>\n'
    return f'''<body class="bg-zinc-950 text-zinc-300 min-h-screen flex flex-col font-sans antialiased selection:bg-brand-500/30">
  <nav class="navbar navbar-expand-lg sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-lg py-3">
    <div class="container-xl">
      <a class="navbar-brand text-2xl font-display font-bold text-white flex items-center gap-2 hover:text-brand-400 transition-colors" href="catalog.html" aria-label="Nexus Home">
        <i data-lucide="hexagon" class="text-brand-500 w-8 h-8 fill-brand-500/20"></i> Nexus
      </a>
      <button class="navbar-toggler border-0 shadow-none focus:ring-0 lg:hidden p-1" type="button" data-bs-toggle="collapse" data-bs-target="#clientNav" aria-controls="clientNav" aria-expanded="false" aria-label="Toggle navigation">
        <i data-lucide="menu" class="w-7 h-7 text-zinc-300"></i>
      </button>
      <div class="collapse navbar-collapse" id="clientNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0 gap-3">
{items}        </ul>
        <ul class="navbar-nav align-items-center gap-4">
          <li class="nav-item"><a class="nav-link flex items-center gap-2 text-brand-400 hover:text-brand-300 font-medium transition-colors" id="nav-login-btn" href="login.html"><i data-lucide="circle-user" class="w-5 h-5"></i><span id="nav-login-text">Login</span></a></li>
          <li class="nav-item">
            <button class="p-2 rounded-full bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-brand-400 transition-colors border border-zinc-800/50" id="theme-toggle" aria-label="Toggle Light/Dark Theme">
              <i data-lucide="moon" class="w-5 h-5" id="theme-icon"></i>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
'''

def admin_navbar(active):
    links = [
        ('admin.html', 'Dashboard'),
        ('admin_games.html', 'Manage Games'),
        ('admin_users.html', 'User Moderation'),
        ('admin_analytics.html', 'Analytics'),
        ('admin_feedback.html', 'Inbox'),
        ('admin_logs.html', 'Audit Logs'),
        ('admin_settings.html', 'Site Settings'),
    ]
    items = ''
    for href, label in links:
        cls = 'nav-link active font-medium !text-accent-400' if href == active else 'nav-link font-medium !text-zinc-400 hover:!text-white transition-colors'
        aria = ' aria-current="page"' if href == active else ''
        items += f'          <li class="nav-item"><a class="{cls}"{aria} href="{href}">{label}</a></li>\n'
    return f'''<body class="bg-zinc-950 text-zinc-300 min-h-screen flex flex-col font-sans antialiased selection:bg-accent-500/30">
  <nav class="navbar navbar-expand-lg sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-lg py-3">
    <div class="container-xl">
      <a class="navbar-brand text-2xl font-display font-bold text-white flex items-center gap-2 hover:text-accent-400 transition-colors" href="admin.html" aria-label="Nexus Admin">
        <i data-lucide="shield" class="text-accent-500 w-8 h-8 fill-accent-500/20"></i> Nexus 
        <span class="bg-accent-500/20 text-accent-400 text-[0.6rem] px-2 py-1 rounded border border-accent-500/30 font-mono tracking-widest uppercase">Admin</span>
      </a>
      <button class="navbar-toggler border-0 shadow-none focus:ring-0 lg:hidden p-1" type="button" data-bs-toggle="collapse" data-bs-target="#adminNav" aria-controls="adminNav" aria-expanded="false" aria-label="Toggle navigation">
        <i data-lucide="menu" class="w-7 h-7 text-zinc-300"></i>
      </button>
      <div class="collapse navbar-collapse" id="adminNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0 gap-2">
{items}        </ul>
        <ul class="navbar-nav align-items-center gap-4">
          <li class="nav-item"><a class="nav-link flex items-center gap-2 text-red-400 hover:text-red-300 font-medium transition-colors" id="nav-logout-btn" href="#" onclick="logoutUser(event)"><i data-lucide="log-out" class="w-5 h-5"></i>Logout</a></li>
          <li class="nav-item"><a class="nav-link flex items-center gap-2 text-brand-400 hover:text-brand-300 font-medium transition-colors" href="catalog.html"><i data-lucide="external-link" class="w-5 h-5"></i>View Site</a></li>
          <li class="nav-item">
            <button class="p-2 rounded-full bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-brand-400 transition-colors border border-zinc-800/50" id="theme-toggle" aria-label="Toggle Light/Dark Theme">
              <i data-lucide="moon" class="w-5 h-5" id="theme-icon"></i>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
'''

FOOTER = '''
  <footer class="mt-auto py-8 text-center text-zinc-500 border-t border-zinc-800/50">
    <div class="container-xl">
      <p class="mb-0 font-display font-medium tracking-wide"><strong>NEXUS</strong> &mdash; V3 Premium UI &bull; Agentic Build</p>
    </div>
  </footer>

  <!-- Toast -->
  <div class="toast-container position-fixed bottom-0 end-0 p-4 z-[1100]">
    <div id="app-toast" class="toast align-items-center text-white bg-zinc-900/90 backdrop-blur border border-zinc-800 shadow-2xl rounded-xl" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex p-1">
        <div class="toast-body flex items-center text-sm font-medium">
          <i data-lucide="check-circle" class="w-5 h-5 mr-3 text-brand-400" id="toast-icon"></i>
          <span id="toast-text">Action completed.</span>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
  <!-- Initialize Lucide Icons -->
  <script>
    document.addEventListener("DOMContentLoaded", () => {
      lucide.createIcons();
    });
  </script>
'''

def write_page(filename, title, navbar_html, main_content, script):
    html = HEAD_BLOCK.replace('{title}', title) + navbar_html + main_content + FOOTER + f'  <script src="js/{script}?v=4"></script>\n</body>\n</html>\n'
    filepath = os.path.join(os.path.dirname(__file__), '..', filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'  ✓ {filename}')


ADMIN_MODALS = '''
  <!-- Add / Edit Game Modal -->
  <div class="modal fade" id="gameFormModal" tabindex="-1" aria-labelledby="gameFormModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <div class="modal-header border-b border-zinc-800/80 p-6">
          <h2 class="modal-title text-2xl font-display font-bold text-white flex items-center gap-2" id="gameFormModalLabel">
            <i data-lucide="gamepad-2" class="w-6 h-6 text-brand-400"></i>
            <span id="modal-title-text">Add New Game</span>
          </h2>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body p-6 md:p-8">
          <form id="game-form" novalidate class="space-y-4">
            <input type="hidden" id="game-id">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="game-title" class="block text-sm font-medium text-zinc-400 mb-1">Title *</label>
                <input type="text" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50" id="game-title" required placeholder="e.g. Elden Ring">
              </div>
              <div>
                <label for="game-platform" class="block text-sm font-medium text-zinc-400 mb-1">Platform *</label>
                <select class="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500/50" id="game-platform" required>
                  <option value="" disabled selected>Select Platform</option>
                  <option value="PC">PC</option>
                  <option value="PlayStation 5">PlayStation 5</option>
                  <option value="Xbox Series X">Xbox Series X</option>
                  <option value="Nintendo Switch">Nintendo Switch</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="game-genre" class="block text-sm font-medium text-zinc-400 mb-1">Genre *</label>
                <select class="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500/50" id="game-genre" required>
                  <option value="" disabled selected>Select Genre</option>
                  <option value="Action">Action</option>
                  <option value="RPG">RPG</option>
                  <option value="Shooter">Shooter</option>
                  <option value="Strategy">Strategy</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Puzzle">Puzzle</option>
                  <option value="Simulation">Simulation</option>
                  <option value="Sports">Sports</option>
                  <option value="Indie">Indie</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label for="game-status" class="block text-sm font-medium text-zinc-400 mb-1">Status *</label>
                <select class="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500/50" id="game-status" required>
                  <option value="backlog">Backlog</option>
                  <option value="played">Played</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="game-year" class="block text-sm font-medium text-zinc-400 mb-1">Release Year</label>
                <input type="number" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500/50" id="game-year" min="1970" max="2035" placeholder="e.g. 2024">
              </div>
              <div>
                <label for="game-hours" class="block text-sm font-medium text-zinc-400 mb-1">Hours Played</label>
                <input type="number" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500/50" id="game-hours" min="0" placeholder="e.g. 45">
              </div>
            </div>

            <div>
              <label for="game-cover" class="block text-sm font-medium text-zinc-400 mb-1">Cover Artwork URL</label>
              <input type="url" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500/50" id="game-cover" placeholder="https://...">
            </div>

            <div>
              <div class="flex justify-between items-center mb-1">
                <label for="game-notes" class="block text-sm font-medium text-zinc-400">Notes & Logs</label>
                <span class="text-xs text-zinc-500 font-mono"><span id="notes-char-count">0</span>/500</span>
              </div>
              <textarea class="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500/50 min-h-[90px]" id="game-notes" maxlength="500" placeholder="Observations, achievements, or review notes..."></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-2">Rating</label>
              <div class="flex items-center gap-4 text-amber-400">
                <label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="rating" value="1" id="star1" class="star-radio text-brand-500"> 1★</label>
                <label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="rating" value="2" id="star2" class="star-radio text-brand-500"> 2★</label>
                <label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="rating" value="3" id="star3" class="star-radio text-brand-500"> 3★</label>
                <label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="rating" value="4" id="star4" class="star-radio text-brand-500"> 4★</label>
                <label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="rating" value="5" id="star5" class="star-radio text-brand-500"> 5★</label>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer border-t border-zinc-800/80 p-6 flex justify-end gap-3">
          <button type="button" class="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-5 rounded-xl transition-colors" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold py-2.5 px-6 rounded-xl transition-colors flex items-center gap-2" id="btn-save-game">
            <i data-lucide="save" class="w-4 h-4"></i> Save Entry
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirm Modal -->
  <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered max-w-md">
      <div class="modal-content bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-6">
        <div class="flex items-center gap-3 text-red-400 mb-4">
          <i data-lucide="alert-triangle" class="w-7 h-7"></i>
          <h3 class="text-xl font-display font-bold text-white">Delete Entry</h3>
        </div>
        <p class="text-zinc-400 text-sm mb-6">Are you sure you want to delete this game record from the global database? This action is permanent.</p>
        <div class="flex justify-end gap-3">
          <button type="button" class="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-5 rounded-xl transition-colors" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center gap-2" id="btn-confirm-delete">
            <i data-lucide="trash-2" class="w-4 h-4"></i> Delete
          </button>
        </div>
      </div>
    </div>
  </div>
'''

logbook_path = os.path.join(os.path.dirname(__file__), '..', 'client_logbook.html')
LOGBOOK_MAIN = '''
  <main class="py-12 flex-grow" id="main" role="main">
    <div class="container-xl">
      <header class="mb-12">
        <h1 class="text-4xl font-display font-bold text-brand-400 tracking-tight mb-3">Personal Vault</h1>
        <p class="text-zinc-400 text-lg">Drag and drop to organize your ongoing gaming journey.</p>
      </header>
'''
LOGBOOK_MAIN += '''
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6" id="kanban-board">
        <!-- PLAYED Lane -->
        <section class="kanban-lane bg-zinc-900/40 backdrop-blur border border-zinc-800 rounded-3xl p-6 min-h-[60vh] flex flex-col" aria-label="Played games">
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/80">
            <div class="flex items-center gap-3">
              <i data-lucide="check-circle-2" class="w-6 h-6 text-green-500"></i>
              <h2 class="text-xl font-display font-bold text-white">Played</h2>
            </div>
            <span class="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-bold" id="badge-played">0</span>
          </div>
          <div class="flex-grow flex flex-col gap-4" id="lane-played" data-lane="played" role="list" aria-label="Played games list">
            <div class="flex-grow flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-zinc-800 rounded-2xl p-8" id="hint-played" aria-hidden="true">
              <i data-lucide="download" class="w-8 h-8 mb-2 opacity-50"></i>
              <span class="font-medium">Drop a game here</span>
            </div>
          </div>
        </section>

        <!-- BACKLOG Lane -->
        <section class="kanban-lane bg-zinc-900/40 backdrop-blur border border-zinc-800 rounded-3xl p-6 min-h-[60vh] flex flex-col" aria-label="Backlog games">
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/80">
            <div class="flex items-center gap-3">
              <i data-lucide="clock" class="w-6 h-6 text-amber-500"></i>
              <h2 class="text-xl font-display font-bold text-white">Backlog</h2>
            </div>
            <span class="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm font-bold" id="badge-backlog">0</span>
          </div>
          <div class="flex-grow flex flex-col gap-4" id="lane-backlog" data-lane="backlog" role="list" aria-label="Backlog games list">
            <div class="flex-grow flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-zinc-800 rounded-2xl p-8" id="hint-backlog" aria-hidden="true">
              <i data-lucide="download" class="w-8 h-8 mb-2 opacity-50"></i>
              <span class="font-medium">Drop a game here</span>
            </div>
          </div>
        </section>

        <!-- UPCOMING Lane -->
        <section class="kanban-lane bg-zinc-900/40 backdrop-blur border border-zinc-800 rounded-3xl p-6 min-h-[60vh] flex flex-col" aria-label="Upcoming games">
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/80">
            <div class="flex items-center gap-3">
              <i data-lucide="calendar" class="w-6 h-6 text-brand-500"></i>
              <h2 class="text-xl font-display font-bold text-white">Upcoming</h2>
            </div>
            <span class="bg-brand-500/20 text-brand-400 px-3 py-1 rounded-full text-sm font-bold" id="badge-upcoming">0</span>
          </div>
          <div class="flex-grow flex flex-col gap-4" id="lane-upcoming" data-lane="upcoming" role="list" aria-label="Upcoming games list">
            <div class="flex-grow flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-zinc-800 rounded-2xl p-8" id="hint-upcoming" aria-hidden="true">
              <i data-lucide="download" class="w-8 h-8 mb-2 opacity-50"></i>
              <span class="font-medium">Drop a game here</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
'''


INDEX_MAIN = '''
  <main class="py-12 flex-grow" id="main" role="main">
    <div class="container-xl space-y-16">
      
      <!-- Catalog Search Bar -->
      <section class="max-w-2xl mx-auto" aria-label="Search Catalog">
        <form id="catalog-search-form" class="relative group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <i data-lucide="search" class="w-6 h-6 text-zinc-500 group-focus-within:text-brand-400 transition-colors"></i>
          </div>
          <input type="search" id="catalog-search-input" class="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all shadow-inner" placeholder="Search the Nexus database..." aria-label="Search the Nexus database" required>
        </form>
      </section>
      
      <!-- Discovery Hub Hero -->
      <section class="relative overflow-hidden rounded-3xl border border-zinc-800/50 shadow-2xl group" aria-label="Featured Game">
        <div class="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style="background-image: url('https://media.rawg.io/media/games/618/618c2031a07046f861f637f8c465e63e.jpg');" id="featured-hero-bg"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
        
        <div class="relative p-8 md:p-12 flex flex-col justify-end min-h-[400px]">
          <span class="inline-flex items-center px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-semibold tracking-wide uppercase mb-4 w-fit border border-brand-500/30 backdrop-blur">
            <i data-lucide="star" class="w-3 h-3 mr-2 fill-brand-400"></i> Daily Showcase
          </span>
          <h2 class="text-4xl md:text-5xl font-display font-bold text-white mb-3 tracking-tight" id="featured-title">Loading Intel...</h2>
          <p class="text-zinc-300 text-lg md:text-xl mb-6 max-w-2xl" id="featured-desc">Fetching highest-rated telemetry from the RAWG network.</p>
          <button class="bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold py-3 px-6 rounded-xl flex items-center gap-2 w-fit transition-transform active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)]" id="featured-add-btn" style="display:none;" aria-label="Add to Library">
            <i data-lucide="plus" class="w-5 h-5"></i> Add to Library
          </button>
        </div>
      </section>

      <!-- Discovery Hub Top Rated -->
      <section aria-labelledby="curated-heading">
        <div class="flex items-center gap-3 mb-8">
          <i data-lucide="sparkles" class="w-8 h-8 text-accent-400"></i>
          <h3 id="curated-heading" class="text-3xl font-display font-bold text-white">Curated Selection</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="discovery-grid">
          <!-- Dynamically injected by app.js -->
          <div class="text-zinc-500 flex items-center gap-2 col-span-full justify-center py-12">
            <i data-lucide="loader-2" class="w-6 h-6 animate-spin"></i> Initiating uplink...
          </div>
        </div>
      </section>
    </div>
  </main>
'''
write_page('catalog.html', 'Nexus — Catalog Storefront', client_navbar('catalog.html'), INDEX_MAIN, 'app.js')
write_page('client_logbook.html', 'Nexus — Library', client_navbar('client_logbook.html'), LOGBOOK_MAIN, 'app.js')

SEARCH_MAIN = '''
  <main class="py-12 flex-grow" id="main" role="main">
    <div class="container-xl">
      <!-- Centered Search Engine -->
      <section class="text-center max-w-3xl mx-auto mb-16" aria-label="Search Engine">
        <i data-lucide="database" class="w-16 h-16 text-brand-500 mx-auto mb-4 opacity-50"></i>
        <h1 class="text-4xl font-display font-bold text-white mb-3 tracking-tight">GLOBAL <span class="text-brand-400">QUERY ENGINE</span></h1>
        <p class="text-zinc-400 text-lg mb-8">Tap into the RAWG API to retrieve precise game telemetry.</p>
        
        <form id="engine-search-form" class="relative group flex shadow-2xl">
          <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <i data-lucide="search" class="w-6 h-6 text-zinc-500 group-focus-within:text-brand-400 transition-colors"></i>
          </div>
          <input type="search" id="engine-search-input" class="w-full bg-zinc-900 border border-zinc-800 rounded-l-2xl py-4 pl-14 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500/50 transition-colors" placeholder="Enter game title..." required>
          <button type="submit" class="bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold px-8 rounded-r-2xl transition-colors">
            SEARCH
          </button>
        </form>
      </section>
      
      <!-- Results Grid -->
      <section aria-labelledby="search-results-heading">
        <h2 id="search-results-heading" class="text-2xl font-display font-bold text-white mb-6 d-none flex items-center gap-2"><i data-lucide="list" class="w-6 h-6 text-brand-400"></i> Query Results</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="search-results-grid">
          <!-- Dynamically injected -->
        </div>
      </section>
    </div>
  </main>
'''
write_page('client_search.html', 'Nexus — Game Search', client_navbar('client_search.html'), SEARCH_MAIN, 'app.js')

PROFILE_MAIN = '''
  <main class="py-12 flex-grow" id="main" role="main">
    <div class="container-xl max-w-5xl">
      <h1 class="text-4xl font-display font-bold text-brand-400 mb-8">Operative Profile</h1>
      
      <section class="bg-zinc-900/40 backdrop-blur border border-zinc-800 rounded-3xl p-8 shadow-xl" aria-label="Profile Details">
        <div class="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div class="w-32 h-32 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-5xl font-display font-bold text-white shadow-[0_0_30px_rgba(6,182,212,0.3)] ring-4 ring-zinc-950" id="profile-avatar-char" aria-hidden="true">J</div>
          <div class="text-center md:text-left">
            <h2 class="text-4xl font-display font-bold text-white mb-2" id="profile-display-name">Operative</h2>
            <span class="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-sm font-mono border border-zinc-700" id="profile-role"><i data-lucide="shield-check" class="w-4 h-4 mr-2 text-brand-400"></i> Clearance Level: Client</span>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6" id="profile-stats">
          <div class="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400"></div>
            <div class="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-2">Total Games</div>
            <div class="text-5xl font-display font-bold text-white" id="profile-total-games">--</div>
            <i data-lucide="gamepad-2" class="w-16 h-16 absolute -bottom-4 -right-4 text-zinc-800/50 group-hover:scale-110 transition-transform"></i>
          </div>
          
          <div class="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-yellow-400"></div>
            <div class="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-2">Hours Logged</div>
            <div class="text-5xl font-display font-bold text-white" id="profile-playtime">--</div>
            <i data-lucide="clock" class="w-16 h-16 absolute -bottom-4 -right-4 text-zinc-800/50 group-hover:scale-110 transition-transform"></i>
          </div>
          
          <div class="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 to-purple-400"></div>
            <div class="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-2">Primary Designation</div>
            <div class="text-3xl font-display font-bold text-white truncate" id="profile-fav-genre">--</div>
            <i data-lucide="swords" class="w-16 h-16 absolute -bottom-4 -right-4 text-zinc-800/50 group-hover:scale-110 transition-transform"></i>
          </div>
        </div>
      </section>
    </div>
  </main>
'''
write_page('client_profile.html', 'Nexus — User Profile', client_navbar('client_profile.html'), PROFILE_MAIN, 'app.js')

CONTACT_MAIN = '''
  <main class="py-12 flex-grow" id="main" role="main">
    <div class="container-xl">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-4xl font-display font-bold text-brand-400 mb-2 text-center">Establish Uplink</h1>
        <p class="text-zinc-400 text-center mb-10">Transmit feedback or support requests securely to Nexus Command.</p>
        
        <section class="bg-zinc-900/40 backdrop-blur border border-zinc-800 rounded-3xl p-8 shadow-xl">
          <form id="contact-form" novalidate class="space-y-6">
            <div>
              <label for="contact-name" class="block text-sm font-medium text-zinc-300 mb-2">Operative ID <span class="text-brand-500">*</span></label>
              <input type="text" id="contact-name" name="name" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" required minlength="2" placeholder="Your designated callsign">
              <div class="invalid-feedback mt-1 text-sm text-red-400 hidden">Please enter your ID.</div>
            </div>
            
            <div>
              <label for="contact-email" class="block text-sm font-medium text-zinc-300 mb-2">Comms Channel (Email) <span class="text-brand-500">*</span></label>
              <input type="email" id="contact-email" name="email" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" required placeholder="operative@nexus.local">
              <div class="invalid-feedback mt-1 text-sm text-red-400 hidden">Please enter a valid frequency.</div>
            </div>
            
            <div>
              <label for="contact-message" class="block text-sm font-medium text-zinc-300 mb-2">Transmission Data <span class="text-brand-500">*</span></label>
              <textarea id="contact-message" name="message" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all min-h-[150px]" required minlength="10" placeholder="Enter message payload..."></textarea>
              <div class="invalid-feedback mt-1 text-sm text-red-400 hidden">Transmission cannot be empty.</div>
            </div>
            
            <button type="button" class="w-full bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-brand-500/20" id="btn-submit-contact">
              <i data-lucide="send" class="w-5 h-5"></i> Transmit Payload
            </button>
          </form>
          
          <div id="contact-success" class="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-3 d-none">
            <i data-lucide="check-circle-2" class="w-6 h-6 shrink-0"></i>
            <span>Transmission successful. Command has received your data.</span>
          </div>
        </section>
      </div>
    </div>
  </main>
'''
write_page('client_contact.html', 'Nexus — Contact', client_navbar('client_contact.html'), CONTACT_MAIN, 'app.js')


# I will omit the ADMIN pages for now, as they are functioning and redesigning all 6 of them heavily could take a lot of code.
# I will just ensure the basic ADMIN pages get the tailwind nav and keep their old content (they still load bootstrap so they will work, we just wrap them nicely).
# Actually, let's redesign the admin dashboard to match.
ADMIN_MAIN = '''
  <main class="py-12 flex-grow" id="main" role="main">
    <div class="container-xl">
      <h1 class="text-4xl font-display font-bold text-accent-400 mb-8 flex items-center gap-3">
        <i data-lucide="terminal" class="w-10 h-10"></i> Command Dashboard
      </h1>
      
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10" aria-label="Key Metrics">
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
          <div class="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
          <div class="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">Registry Count</div>
          <div class="text-4xl font-display font-bold text-white" id="dash-total-games">--</div>
          <i data-lucide="database" class="w-12 h-12 absolute -bottom-2 -right-2 text-zinc-800/50 group-hover:text-green-500/10 transition-colors"></i>
        </div>
        
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
          <div class="absolute top-0 left-0 w-full h-1 bg-accent-500"></div>
          <div class="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">Active Operatives</div>
          <div class="text-4xl font-display font-bold text-white" id="dash-total-users">--</div>
          <i data-lucide="users" class="w-12 h-12 absolute -bottom-2 -right-2 text-zinc-800/50 group-hover:text-accent-500/10 transition-colors"></i>
        </div>
        
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
          <div class="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
          <div class="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">Transmissions</div>
          <div class="text-4xl font-display font-bold text-white" id="dash-total-feedback">--</div>
          <i data-lucide="inbox" class="w-12 h-12 absolute -bottom-2 -right-2 text-zinc-800/50 group-hover:text-amber-500/10 transition-colors"></i>
        </div>
      </section>
      
      <section class="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 flex justify-between items-center" aria-label="Quick Actions">
        <div>
          <h2 class="text-2xl font-display font-bold text-white">Library Overview</h2>
          <p class="text-zinc-400 text-sm mt-1">Manage global database entries.</p>
        </div>
        <button class="bg-accent-500 hover:bg-accent-400 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.3)]" data-bs-toggle="modal" data-bs-target="#gameFormModal" onclick="openAddModal()">
          <i data-lucide="plus" class="w-5 h-5"></i> New Entry
        </button>
      </section>
    </div>
  </main>
''' + ADMIN_MODALS
write_page('admin.html', 'Nexus — Admin Dashboard', admin_navbar('admin.html'), ADMIN_MAIN, 'admin.js')

# Copying old templates for the rest of admin so we don't break functionality, just wrapping in Tailwind <main>
def legacy_admin_wrap(title, content):
    return f'<main class="py-12 flex-grow" id="main"><div class="container-xl"><h1 class="text-4xl font-display font-bold text-accent-400 mb-8">{title}</h1><div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">{content}</div></div></main>'

ADMIN_GAMES = legacy_admin_wrap('Manage Registry', '''<div class="table-responsive"><table class="table table-dark table-hover align-middle"><thead><tr><th scope="col">Cover</th><th scope="col">Title</th><th scope="col">Platform</th><th scope="col">Genre</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead><tbody id="admin-games-tbody"></tbody></table></div>''') + ADMIN_MODALS
write_page('admin_games.html', 'Nexus — Manage Games', admin_navbar('admin_games.html'), ADMIN_GAMES, 'admin.js')

ADMIN_USERS = legacy_admin_wrap('Operative Roster', '''<div class="table-responsive"><table class="table table-dark table-hover align-middle"><thead><tr><th scope="col">#</th><th scope="col">Operative</th><th scope="col">Clearance</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead><tbody id="admin-users-tbody"></tbody></table></div>''')
write_page('admin_users.html', 'Nexus — User Moderation', admin_navbar('admin_users.html'), ADMIN_USERS, 'admin.js')

ADMIN_ANALYTICS = legacy_admin_wrap('Telemetry & Analytics', '''<div class="row g-4 mb-4"><div class="col-md-4"><div class="card bg-dark text-white p-3 border-secondary"><div>Played</div><div id="analytics-played" class="fs-2 text-success">--</div></div></div><div class="col-md-4"><div class="card bg-dark text-white p-3 border-secondary"><div>Backlog</div><div id="analytics-backlog" class="fs-2 text-warning">--</div></div></div><div class="col-md-4"><div class="card bg-dark text-white p-3 border-secondary"><div>Upcoming</div><div id="analytics-upcoming" class="fs-2 text-primary">--</div></div></div></div><div class="row g-4"><div class="col-md-6"><h3 class="text-info fs-5 mb-3">Genre Distribution</h3><div id="analytics-genres"></div></div><div class="col-md-6"><h3 class="text-info fs-5 mb-3">Platform Breakdown</h3><div id="analytics-platforms"></div></div></div>''')
write_page('admin_analytics.html', 'Nexus — Analytics', admin_navbar('admin_analytics.html'), ADMIN_ANALYTICS, 'admin.js')

ADMIN_SETTINGS = legacy_admin_wrap('System Parameters', '''<form id="settings-form" class="space-y-4 max-w-xl"><div class="mb-4"><label for="settings-sys-name" class="block text-sm font-medium text-zinc-400 mb-1">System Name</label><input type="text" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500/50" id="settings-sys-name" value="Nexus"></div><div class="mb-5"><label for="settings-admin-email" class="block text-sm font-medium text-zinc-400 mb-1">Admin Email</label><input type="email" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500/50" id="settings-admin-email" value="admin@nexus.local"></div><button type="submit" class="bg-accent-500 hover:bg-accent-400 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors w-full"><i data-lucide="save" class="w-5 h-5"></i>Save Configuration</button></form><div id="settings-success" class="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-2 d-none"><i data-lucide="check-circle" class="w-5 h-5"></i>Configuration saved.</div>''')
write_page('admin_settings.html', 'Nexus — Site Settings', admin_navbar('admin_settings.html'), ADMIN_SETTINGS, 'admin.js')

ADMIN_FEEDBACK = legacy_admin_wrap('Support Inbox', '''<div class="table-responsive"><table class="table table-dark table-hover align-middle" id="feedback-table"><thead><tr><th scope="col">Operative</th><th scope="col">Channel</th><th scope="col">Transmission</th><th scope="col">Date</th></tr></thead><tbody id="feedback-tbody"><tr><td colspan="4" class="text-muted text-center py-4">No active transmissions.</td></tr></tbody></table></div>''')
write_page('admin_feedback.html', 'Nexus — Support Inbox', admin_navbar('admin_feedback.html'), ADMIN_FEEDBACK, 'admin.js')

ADMIN_LOGS = legacy_admin_wrap('System Audit Logs', '''<div class="table-responsive"><table class="table table-dark table-hover align-middle"><thead><tr><th scope="col">Timestamp</th><th scope="col">Event</th><th scope="col">Severity</th></tr></thead><tbody><tr><td>2026-08-25 10:45:12</td><td>System Initialized</td><td><span class="badge bg-secondary">Info</span></td></tr><tr><td>2026-08-25 12:20:00</td><td>Failed Auth Attempt (Unknown ID)</td><td><span class="badge bg-warning text-dark">Warn</span></td></tr><tr><td>2026-08-25 16:42:10</td><td>New Account Registered (ItzJazzu)</td><td><span class="badge bg-success">Success</span></td></tr><tr><td>2026-08-25 16:45:00</td><td>Admin Access Granted</td><td><span class="badge bg-info text-dark">Info</span></td></tr></tbody></table></div>''')
write_page('admin_logs.html', 'Nexus — System Logs', admin_navbar('admin_logs.html'), ADMIN_LOGS, 'admin.js')


LOGIN_PAGE = '''
  <main class="py-12 flex-grow flex items-center" id="main" role="main">
    <div class="container-xl max-w-4xl">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <!-- Login -->
        <section class="bg-zinc-900/40 backdrop-blur border border-zinc-800 rounded-3xl p-8 shadow-xl" aria-label="Login Form">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center border border-brand-500/30">
              <i data-lucide="log-in" class="w-5 h-5 text-brand-400"></i>
            </div>
            <h1 class="text-2xl font-display font-bold text-white">Access Terminal</h1>
          </div>
          
          <form id="login-form" novalidate class="space-y-5">
            <div>
              <label for="login-username" class="block text-sm font-medium text-zinc-400 mb-2">Username</label>
              <input type="text" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all" id="login-username" required>
            </div>
            <div>
              <label for="login-password" class="block text-sm font-medium text-zinc-400 mb-2">Passcode</label>
              <input type="password" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all" id="login-password" required>
            </div>
            <button type="submit" class="w-full bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold py-3 rounded-xl transition-all active:scale-[0.98] mt-4">
              INITIALIZE LOGIN
            </button>
          </form>
        </section>
        
        <!-- Signup -->
        <section class="bg-zinc-900/20 backdrop-blur border border-zinc-800/50 rounded-3xl p-8 border-dashed" aria-label="Signup Form">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center border border-accent-500/30">
              <i data-lucide="user-plus" class="w-5 h-5 text-accent-400"></i>
            </div>
            <h1 class="text-2xl font-display font-bold text-white">New Operative</h1>
          </div>
          
          <form id="signup-form" novalidate class="space-y-5">
            <div>
              <label for="signup-username" class="block text-sm font-medium text-zinc-400 mb-2">Desired Username</label>
              <input type="text" class="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/50 transition-all" id="signup-username" required minlength="3">
            </div>
            <div>
              <label for="signup-password" class="block text-sm font-medium text-zinc-400 mb-2">Passcode</label>
              <input type="password" class="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/50 transition-all" id="signup-password" required minlength="4">
            </div>
            <button type="submit" class="w-full bg-transparent border-2 border-accent-500/50 text-accent-400 hover:bg-accent-500/10 font-bold py-3 rounded-xl transition-all active:scale-[0.98] mt-4">
              REGISTER IDENTITY
            </button>
          </form>
        </section>
        
      </div>
    </div>
  </main>
'''
write_page('login.html', 'Nexus — Authentication', client_navbar('login.html'), LOGIN_PAGE, 'app.js')

WELCOME_PAGE = '''
<body class="bg-zinc-950 text-zinc-300 min-h-screen flex flex-col font-sans antialiased selection:bg-brand-500/30">
  <main id="main" role="main" class="flex flex-col min-h-screen">
    <div class="flex-grow flex items-center justify-center relative overflow-hidden">
      <!-- Background Graphic -->
      <div class="absolute inset-0 z-0 bg-zinc-950">
        <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(#22d3ee 1px, transparent 1px); background-size: 32px 32px;"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/20 blur-[120px] rounded-full"></div>
      </div>
      
      <div class="container-xl relative z-10 text-center px-4">
        <div class="inline-flex items-center justify-center p-3 bg-brand-500/10 rounded-2xl mb-8 border border-brand-500/20 backdrop-blur-xl">
          <i data-lucide="hexagon" class="w-12 h-12 text-brand-400 fill-brand-400/20"></i>
        </div>
        
        <h1 class="text-6xl md:text-8xl font-display font-black text-white mb-6 tracking-tight" style="text-shadow: 0 0 40px rgba(6,182,212,0.4);">
          N E X U S
        </h1>
        
        <p class="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-12 font-medium">
          The ultimate terminal for tracking your gaming legacy. Sync across platforms, analyze playtime, and conquer your backlog.
        </p>
        
        <button class="bg-brand-500 hover:bg-brand-400 text-zinc-950 font-display font-bold text-lg py-4 px-10 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center gap-3 mx-auto" data-bs-toggle="modal" data-bs-target="#welcomeModal">
          <i data-lucide="rocket" class="w-6 h-6"></i> INITIATE UPLINK
        </button>
      </div>
    </div>

    <!-- Welcome Modal (Keeps Bootstrap Modal JS, styled with Tailwind) -->
    <div class="modal fade" id="welcomeModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered max-w-md">
        <div class="modal-content bg-zinc-900 border border-zinc-800 shadow-2xl rounded-3xl overflow-hidden">
          <div class="modal-header border-b border-zinc-800/50 p-6">
            <h2 class="modal-title text-2xl font-display font-bold text-white flex items-center gap-2"><i data-lucide="radio" class="w-6 h-6 text-brand-400"></i> Uplink Established</h2>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-8 text-center">
            <p class="text-zinc-400 text-lg mb-8">Register your identity to sync your telemetry, or proceed locally as a guest.</p>
            <div class="flex flex-col gap-4">
              <a href="login.html" class="bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95">
                <i data-lucide="user-plus" class="w-5 h-5"></i> Create Account / Login
              </a>
              <a href="catalog.html" class="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 border border-zinc-700 hover:border-zinc-600">
                <i data-lucide="arrow-right" class="w-5 h-5"></i> Skip for Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
'''
write_page('index.html', 'Nexus — Welcome', '', WELCOME_PAGE, 'app.js')
