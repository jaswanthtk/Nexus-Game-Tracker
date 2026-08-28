#!/usr/bin/env python3
import os

HEAD_BLOCK = '''<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Nexus — Your ultimate gaming backlog and telemetry tracker. Organize, discover, and conquer your games." />
  <meta name="theme-color" content="#09090b" />
  <title>{title}</title>
  
  <!-- SEO & Performance Optimization -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  
  <link rel="icon" href="favicon.svg" type="image/svg+xml" />
  <link rel="shortcut icon" href="favicon.svg" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
  <link rel="stylesheet" href="css/style.css?v=2" />
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
        cls = 'nav-link active' if href == active else 'nav-link'
        aria = ' aria-current="page"' if href == active else ''
        items += f'          <li class="nav-item"><a class="{cls}"{aria} href="{href}">{label}</a></li>\n'
    return f'''<body>
  <nav class="navbar navbar-expand-lg nexus-navbar animate-fade-up">
    <div class="container-xl">
      <a class="navbar-brand" href="catalog.html" aria-label="Nexus Home"><i class="bi bi-hexagon-fill"></i> Nexus</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#clientNav" aria-controls="clientNav" aria-expanded="false" aria-label="Toggle navigation">
        <i class="bi bi-list text-white"></i>
      </button>
      <div class="collapse navbar-collapse" id="clientNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0 gap-2">
{items}        </ul>
        <ul class="navbar-nav align-items-center gap-3">
          <li class="nav-item"><a class="nav-link text-cyan" id="nav-login-btn" href="login.html"><i class="bi bi-person-circle me-1"></i><span id="nav-login-text">Login</span></a></li>
          <li class="nav-item">
            <button class="theme-switcher" id="theme-toggle" aria-label="Toggle Light/Dark Theme">
              <i class="bi bi-moon-stars-fill"></i>
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
        cls = 'nav-link active' if href == active else 'nav-link'
        aria = ' aria-current="page"' if href == active else ''
        items += f'          <li class="nav-item"><a class="{cls}"{aria} href="{href}">{label}</a></li>\n'
    return f'''<body>
  <nav class="navbar navbar-expand-lg nexus-navbar animate-fade-up">
    <div class="container-xl">
      <a class="navbar-brand" href="admin.html" aria-label="Nexus Admin"><i class="bi bi-hexagon-fill text-purple"></i> Nexus <span class="badge bg-purple ms-2" style="font-size:0.6rem;">ADMIN</span></a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNav" aria-controls="adminNav" aria-expanded="false" aria-label="Toggle navigation">
        <i class="bi bi-list text-white"></i>
      </button>
      <div class="collapse navbar-collapse" id="adminNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
{items}        </ul>
        <ul class="navbar-nav align-items-center gap-3">
          <li class="nav-item"><a class="nav-link text-danger" id="nav-logout-btn" href="#" onclick="logoutUser(event)" aria-label="Logout"><i class="bi bi-box-arrow-right me-1"></i>Logout</a></li>
          <li class="nav-item"><a class="nav-link text-cyan" href="catalog.html" aria-label="View Main Site"><i class="bi bi-box-arrow-up-right me-1"></i>View Site</a></li>
          <li class="nav-item">
            <button class="theme-switcher" id="theme-toggle" aria-label="Toggle Light/Dark Theme">
              <i class="bi bi-moon-stars-fill"></i>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
'''

FOOTER = '''
  <footer class="py-4 text-center text-muted animate-fade-up delay-300" style="border-top: 1px solid var(--border-subtle); margin-top: 5rem;">
    <div class="container-xl">
      <p class="mb-0" style="font-family: 'Space Grotesk', sans-serif;"><strong>NEXUS</strong> &mdash; B.Tech Final Project &bull; Vanilla Architecture</p>
    </div>
  </footer>

  <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index:1100">
    <div id="app-toast" class="toast glass-toast align-items-center border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi bi-check-circle-fill me-2 text-cyan" id="toast-icon"></i>
          <span id="toast-text">Action completed.</span>
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
'''

def write_page(filename, title, navbar_html, main_content, script):
    html = HEAD_BLOCK.format(title=title) + navbar_html + main_content + FOOTER + f'  <script src="js/{script}?v=2"></script>\n</body>\n</html>\n'
    # Write directly to the parent folder since we are executing from .dev_workspace
    filepath = os.path.join(os.path.dirname(__file__), '..', filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'  ✓ {filename}')

import re

# Safely extract modals if admin.html is in parent directory
admin_path = os.path.join(os.path.dirname(__file__), '..', 'admin.html')
ADMIN_MODALS = ''
if os.path.exists(admin_path):
    with open(admin_path, 'r') as f:
        adm = f.read()
    adm_modal_match = re.search(r'(<!-- ADD / EDIT GAME MODAL -->.*?<!-- TOAST -->)', adm, re.DOTALL)
    ADMIN_MODALS = '\n  ' + adm_modal_match.group(1).replace('<!-- TOAST -->', '').strip() + '\n\n' if adm_modal_match else ''

logbook_path = os.path.join(os.path.dirname(__file__), '..', 'client_logbook.html')
LOGBOOK_MAIN = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <header class="mb-5 animate-fade-up">
        <h1 class="detail-title text-cyan mb-2">Personal Vault</h1>
        <p class="text-muted">Drag and drop to organize your ongoing gaming journey.</p>
      </header>
'''
if os.path.exists(logbook_path):
    with open(logbook_path, 'r') as f:
        idx = f.read()
    kanban_match = re.search(r'(<div class="row g-4" id="kanban-board">.*?</main>)', idx, re.DOTALL)
    if kanban_match:
        LOGBOOK_MAIN += kanban_match.group(1)
    else:
        LOGBOOK_MAIN += '</div></main>'
else:
    LOGBOOK_MAIN += '</div></main>'

INDEX_MAIN = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <!-- Catalog Search Bar -->
      <section class="row justify-content-center mb-5 animate-fade-up" aria-label="Search Catalog">
        <div class="col-md-8">
          <form id="catalog-search-form" class="d-flex gap-2">
            <input type="search" id="catalog-search-input" class="form-control form-control-lg" placeholder="Search the Nexus database..." aria-label="Search the Nexus database" required>
            <button type="submit" class="btn btn-nexus px-4" aria-label="Submit Search"><i class="bi bi-search"></i></button>
          </form>
        </div>
      </section>
      
      <!-- Discovery Hub Hero -->
      <section class="hero-banner mb-5 animate-fade-up delay-100" aria-label="Featured Game">
        <div class="hero-bg" style="background-image: url('https://placehold.co/1200x500/111/333?text=Daily+Showcase');" id="featured-hero-bg"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <span class="detail-meta-chip mb-3"><i class="bi bi-star-fill text-amber"></i> Daily Showcase</span>
          <h2 class="detail-title text-white" id="featured-title">Loading Intel...</h2>
          <p class="text-white-50 fs-5 mb-4" id="featured-desc">Fetching highest-rated telemetry from the RAWG network.</p>
          <button class="btn-nexus" id="featured-add-btn" style="display:none;" aria-label="Add to Library"><i class="bi bi-plus-lg me-2"></i>Add to Library</button>
        </div>
      </section>

      <!-- Discovery Hub Top Rated -->
      <section aria-labelledby="curated-heading" class="animate-fade-up delay-200">
        <h3 id="curated-heading" class="detail-title fs-3 text-purple mb-4"><i class="bi bi-stars me-2"></i>Curated Selection</h3>
        <div class="game-grid" id="discovery-grid">
          <!-- Dynamically injected by app.js -->
          <div class="text-muted">Initiating uplink...</div>
        </div>
      </section>
    </div>
  </main>
'''

write_page('catalog.html', 'Nexus — Catalog Storefront', client_navbar('catalog.html'), INDEX_MAIN, 'app.js')
write_page('client_logbook.html', 'Nexus — Library', client_navbar('client_logbook.html'), LOGBOOK_MAIN, 'app.js')

SEARCH_MAIN = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <!-- Centered Search Engine -->
      <section class="text-center mb-5 animate-fade-up" aria-label="Search Engine">
        <h1 class="detail-title text-cyan mb-3">NEXUS SEARCH ENGINE</h1>
        <p class="text-muted fs-5 mb-4">Querying the RAWG Global Database</p>
        <div class="row justify-content-center">
          <div class="col-md-8">
            <form id="engine-search-form" class="d-flex gap-2">
              <input type="search" id="engine-search-input" class="form-control form-control-lg" placeholder="Enter game title..." aria-label="Game Title Search" required>
              <button type="submit" class="btn btn-nexus px-4"><i class="bi bi-search"></i> Search</button>
            </form>
          </div>
        </div>
      </section>
      
      <!-- Results Grid -->
      <section aria-labelledby="search-results-heading" class="animate-fade-up delay-100">
        <h2 id="search-results-heading" class="detail-title fs-3 text-purple mb-4 d-none"><i class="bi bi-database me-2"></i>Search Results</h2>
        <div class="game-grid" id="search-results-grid">
          <!-- Dynamically injected -->
        </div>
      </section>
    </div>
  </main>
'''
write_page('client_search.html', 'Nexus — Game Search', client_navbar('client_search.html'), SEARCH_MAIN, 'app.js')

PROFILE_MAIN = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <h1 class="detail-title text-cyan mb-4 animate-fade-up">Operative Profile</h1>
      <section class="bento-card mb-4 animate-fade-up delay-100" aria-label="Profile Details">
        <div class="d-flex align-items-center gap-4 mb-5">
          <div class="profile-avatar" id="profile-avatar-char" aria-hidden="true">J</div>
          <div>
            <h2 class="detail-title fs-2 text-cyan mb-1" id="profile-display-name">Operative</h2>
            <p class="text-muted mb-0" id="profile-role">Clearance Level: Client</p>
          </div>
        </div>
        
        <div class="row g-4" id="profile-stats">
          <div class="col-md-4">
            <div class="kpi-card" style="border-top: 3px solid var(--lane-played);">
              <div class="bento-label">Total Games</div>
              <div class="kpi-value text-neon-green" id="profile-total-games">--</div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="kpi-card" style="border-top: 3px solid var(--lane-backlog);">
              <div class="bento-label">Hours Logged</div>
              <div class="kpi-value text-amber" id="profile-playtime">--</div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="kpi-card" style="border-top: 3px solid var(--lane-upcoming);">
              <div class="bento-label">Primary Designation</div>
              <div class="kpi-value text-purple" id="profile-fav-genre">--</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
'''
write_page('client_profile.html', 'Nexus — User Profile', client_navbar('client_profile.html'), PROFILE_MAIN, 'app.js')

CONTACT_MAIN = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <h1 class="detail-title text-cyan mb-4 text-center animate-fade-up">Establish Uplink</h1>
      <section class="row justify-content-center animate-fade-up delay-100" aria-label="Contact Form">
        <div class="col-lg-8">
          <div class="bento-card">
            <form id="contact-form" novalidate>
              <div class="mb-4">
                <label for="contact-name" class="form-label">Operative ID <span class="text-danger" aria-hidden="true">*</span></label>
                <input type="text" id="contact-name" name="name" class="form-control" required minlength="2" placeholder="Your name">
                <div class="invalid-feedback">Please enter your name.</div>
              </div>
              <div class="mb-4">
                <label for="contact-email" class="form-label">Comms Channel (Email) <span class="text-danger" aria-hidden="true">*</span></label>
                <input type="email" id="contact-email" name="email" class="form-control" required placeholder="you@example.com">
                <div class="invalid-feedback">Please enter a valid email.</div>
              </div>
              <div class="mb-4">
                <label for="contact-message" class="form-label">Transmission <span class="text-danger" aria-hidden="true">*</span></label>
                <textarea id="contact-message" name="message" class="form-control" rows="5" required minlength="10" placeholder="Message content..."></textarea>
                <div class="invalid-feedback">Please enter your message.</div>
              </div>
              <button type="button" class="btn btn-save w-100" id="btn-submit-contact"><i class="bi bi-send-fill me-2"></i>Transmit</button>
            </form>
            <div id="contact-success" class="alert mt-4 d-none" style="background:var(--border-subtle); border:1px solid var(--lane-played); color:var(--lane-played);">
              <i class="bi bi-check-circle-fill me-2"></i>Transmission successful.
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
'''
write_page('client_contact.html', 'Nexus — Contact', client_navbar('client_contact.html'), CONTACT_MAIN, 'app.js')

ADMIN_MAIN = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <h1 class="detail-title text-purple mb-4 animate-fade-up">Command Dashboard</h1>
      <section class="row g-4 mb-4 animate-fade-up delay-100" aria-label="Key Metrics">
        <div class="col-md-4">
          <div class="kpi-card" style="border-top: 3px solid var(--lane-played);">
            <div class="bento-label">Registry Count</div>
            <div class="kpi-value text-neon-green" id="dash-total-games">--</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="kpi-card" style="border-top: 3px solid var(--accent-purple);">
            <div class="bento-label">Active Operatives</div>
            <div class="kpi-value text-purple" id="dash-total-users">--</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="kpi-card" style="border-top: 3px solid var(--lane-backlog);">
            <div class="bento-label">Transmissions</div>
            <div class="kpi-value text-amber" id="dash-total-feedback">--</div>
          </div>
        </div>
      </section>
      <section class="bento-card mb-4 animate-fade-up delay-200" aria-label="Quick Actions">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h2 class="detail-title fs-3 mb-0 text-cyan">Library Overview</h2>
          <button class="btn btn-save" data-bs-toggle="modal" data-bs-target="#gameFormModal" onclick="openAddModal()">
            <i class="bi bi-plus-lg me-2"></i>New Entry
          </button>
        </div>
      </section>
    </div>
  </main>
''' + ADMIN_MODALS
write_page('admin.html', 'Nexus — Admin Dashboard', admin_navbar('admin.html'), ADMIN_MAIN, 'admin.js')

ADMIN_GAMES = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <h1 class="detail-title text-purple mb-4 animate-fade-up">Manage Registry</h1>
      <section class="bento-card animate-fade-up delay-100" aria-label="Games Table">
        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle" style="background:transparent;">
            <thead><tr><th scope="col">Cover</th><th scope="col">Title</th><th scope="col">Platform</th><th scope="col">Genre</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
            <tbody id="admin-games-tbody">
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
''' + ADMIN_MODALS
write_page('admin_games.html', 'Nexus — Manage Games', admin_navbar('admin_games.html'), ADMIN_GAMES, 'admin.js')

ADMIN_USERS = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <h1 class="detail-title text-purple mb-4 animate-fade-up">Operative Roster</h1>
      <section class="bento-card animate-fade-up delay-100" aria-label="Users Table">
        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle" style="background:transparent;">
            <thead><tr><th scope="col">#</th><th scope="col">Operative</th><th scope="col">Clearance</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
            <tbody id="admin-users-tbody">
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
'''
write_page('admin_users.html', 'Nexus — User Moderation', admin_navbar('admin_users.html'), ADMIN_USERS, 'admin.js')

ADMIN_ANALYTICS = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <h1 class="detail-title text-purple mb-4 animate-fade-up">Telemetry & Analytics</h1>
      <section class="row g-4 mb-5 animate-fade-up delay-100" aria-label="Gameplay Status Metrics">
        <div class="col-md-4">
          <div class="kpi-card" style="border-top: 3px solid var(--lane-played);">
            <div class="bento-label">Played</div>
            <div class="kpi-value text-neon-green" id="analytics-played">--</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="kpi-card" style="border-top: 3px solid var(--lane-backlog);">
            <div class="bento-label">Backlog</div>
            <div class="kpi-value text-amber" id="analytics-backlog">--</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="kpi-card" style="border-top: 3px solid var(--lane-upcoming);">
            <div class="bento-label">Upcoming</div>
            <div class="kpi-value text-purple" id="analytics-upcoming">--</div>
          </div>
        </div>
      </section>
      <section class="row g-4 animate-fade-up delay-200" aria-label="Detailed Analytics">
        <div class="col-md-6">
          <div class="bento-card h-100">
            <h2 class="detail-title fs-3 text-cyan mb-4">Genre Distribution</h2>
            <div id="analytics-genres"></div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="bento-card h-100">
            <h2 class="detail-title fs-3 text-cyan mb-4">Platform Breakdown</h2>
            <div id="analytics-platforms"></div>
          </div>
        </div>
      </section>
    </div>
  </main>
'''
write_page('admin_analytics.html', 'Nexus — Analytics', admin_navbar('admin_analytics.html'), ADMIN_ANALYTICS, 'admin.js')

ADMIN_SETTINGS = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <h1 class="detail-title text-purple mb-4 animate-fade-up">System Parameters</h1>
      <section class="bento-card animate-fade-up delay-100" aria-label="Settings Form">
        <form id="settings-form">
          <h2 class="detail-title fs-3 text-cyan mb-4">Core Config</h2>
          <div class="mb-4">
            <label for="settings-sys-name" class="form-label">System Name</label>
            <input type="text" class="form-control" id="settings-sys-name" value="Nexus">
          </div>
          <div class="mb-5">
            <label for="settings-admin-email" class="form-label">Admin Email</label>
            <input type="email" class="form-control" id="settings-admin-email" value="admin@nexus.local">
          </div>
          <button type="submit" class="btn btn-save w-100"><i class="bi bi-save me-2"></i>Save Configuration</button>
        </form>
        <div id="settings-success" class="alert mt-4 d-none" style="background:var(--border-subtle); border:1px solid var(--lane-played); color:var(--lane-played);">
          <i class="bi bi-check-circle-fill me-2"></i>Configuration saved.
        </div>
      </section>
    </div>
  </main>
'''
write_page('admin_settings.html', 'Nexus — Site Settings', admin_navbar('admin_settings.html'), ADMIN_SETTINGS, 'admin.js')

ADMIN_FEEDBACK = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <h1 class="detail-title text-purple mb-4 animate-fade-up">Support Inbox</h1>
      <section class="bento-card animate-fade-up delay-100" aria-label="Inbox Messages">
        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle" style="background:transparent;" id="feedback-table">
            <thead><tr><th scope="col">Operative</th><th scope="col">Channel</th><th scope="col">Transmission</th><th scope="col">Date</th></tr></thead>
            <tbody id="feedback-tbody">
              <tr><td colspan="4" class="text-muted text-center py-4">No active transmissions.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
'''
write_page('admin_feedback.html', 'Nexus — Support Inbox', admin_navbar('admin_feedback.html'), ADMIN_FEEDBACK, 'admin.js')

ADMIN_LOGS = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <h1 class="detail-title text-purple mb-4 animate-fade-up">System Audit Logs</h1>
      <section class="bento-card animate-fade-up delay-100" aria-label="Audit Logs Table">
        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle" style="background:transparent;">
            <thead><tr><th scope="col">Timestamp</th><th scope="col">Event</th><th scope="col">Severity</th></tr></thead>
            <tbody>
              <tr><td>2026-08-25 10:45:12</td><td>System Initialized</td><td><span class="badge bg-secondary">Info</span></td></tr>
              <tr><td>2026-08-25 12:20:00</td><td>Failed Auth Attempt (Unknown ID)</td><td><span class="badge bg-warning text-dark">Warn</span></td></tr>
              <tr><td>2026-08-25 16:42:10</td><td>New Account Registered (ItzJazzu)</td><td><span class="badge bg-success">Success</span></td></tr>
              <tr><td>2026-08-25 16:45:00</td><td>Admin Access Granted</td><td><span class="badge bg-info text-dark">Info</span></td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
'''
write_page('admin_logs.html', 'Nexus — System Logs', admin_navbar('admin_logs.html'), ADMIN_LOGS, 'admin.js')

LOGIN_PAGE = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <div class="row justify-content-center g-4">
        <div class="col-md-5 animate-fade-up">
          <section class="bento-card h-100" aria-label="Login Form">
            <h1 class="detail-title fs-3 text-cyan mb-4"><i class="bi bi-door-open-fill me-2"></i>Access Terminal</h1>
            <form id="login-form" novalidate>
              <div class="mb-3">
                <label for="login-username" class="form-label text-muted">Username</label>
                <input type="text" class="form-control" id="login-username" required>
                <div class="invalid-feedback">Requires valid credential.</div>
              </div>
              <div class="mb-5">
                <label for="login-password" class="form-label text-muted">Passcode</label>
                <input type="password" class="form-control" id="login-password" required>
                <div class="invalid-feedback">Requires valid credential.</div>
              </div>
              <button type="submit" class="btn btn-nexus w-100">INITIALIZE LOGIN</button>
            </form>
          </section>
        </div>
        <div class="col-md-5 animate-fade-up delay-100">
          <section class="bento-card h-100" aria-label="Signup Form">
            <h1 class="detail-title fs-3 text-purple mb-4"><i class="bi bi-person-plus-fill me-2"></i>New Operative</h1>
            <form id="signup-form" novalidate>
              <div class="mb-3">
                <label for="signup-username" class="form-label text-muted">Desired Username</label>
                <input type="text" class="form-control" id="signup-username" required minlength="3">
                <div class="invalid-feedback">Must be at least 3 characters.</div>
              </div>
              <div class="mb-5">
                <label for="signup-password" class="form-label text-muted">Passcode</label>
                <input type="password" class="form-control" id="signup-password" required minlength="4">
                <div class="invalid-feedback">Must be at least 4 characters.</div>
              </div>
              <button type="submit" class="btn btn-outline-light w-100" style="border-color: var(--accent-purple); color: var(--text-primary);">REGISTER IDENTITY</button>
            </form>
          </section>
        </div>
      </div>
    </div>
  </main>
'''
write_page('login.html', 'Nexus — Authentication', client_navbar('login.html'), LOGIN_PAGE, 'app.js')

WELCOME_PAGE = '''
  <main id="main" role="main">
    <div class="welcome-hero d-flex align-items-center justify-content-center text-center animate-fade-up" style="min-height: 100vh; background: linear-gradient(135deg, rgba(9,9,11,0.85) 0%, rgba(9,9,11,1) 100%), url('img/bg_cyber.jpg') center/cover;">
      <div class="container-xl z-2">
        <h1 class="detail-title text-white mb-3" style="font-size: 5rem; letter-spacing: -0.05em; text-shadow: 0 0 30px rgba(0, 229, 255, 0.4);">N E X U S</h1>
        <p class="text-muted fs-4 mb-5 max-w-2xl mx-auto" style="font-weight: 500;">The ultimate terminal for tracking your gaming legacy. Sync across platforms, analyze your playtime, and organize your backlog.</p>
        
        <button class="btn btn-nexus btn-lg px-5 py-3 fs-5" data-bs-toggle="modal" data-bs-target="#welcomeModal">GET STARTED</button>
      </div>
    </div>

    <!-- Welcome Modal -->
    <div class="modal fade glass-modal" id="welcomeModal" tabindex="-1" aria-labelledby="welcomeModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0" style="background: var(--bg-surface);">
          <div class="modal-header border-0 pb-0">
            <h2 class="modal-title detail-title fs-3 text-cyan" id="welcomeModalLabel">Initialize Uplink</h2>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center py-5">
            <p class="text-muted mb-4 fs-5">Would you like to register your identity or proceed as a guest?</p>
            <div class="d-flex flex-column gap-3 max-w-sm mx-auto" style="max-width: 300px;">
              <a href="login.html" class="btn btn-nexus w-100 text-white"><i class="bi bi-person-plus-fill me-2"></i>Create Account / Login</a>
              <a href="catalog.html" class="btn btn-outline-light w-100"><i class="bi bi-box-arrow-in-right me-2"></i>Skip for Now</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
'''
write_page('index.html', 'Nexus — Welcome', '', WELCOME_PAGE, 'app.js')
