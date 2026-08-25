#!/usr/bin/env python3
import os

HEAD_BLOCK = '''<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Nexus — Elite Terminal for Game Tracking" />
  <title>{title}</title>
  <link rel="icon" href="favicon.svg" type="image/svg+xml" />
  <link rel="shortcut icon" href="favicon.svg" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
  <link rel="stylesheet" href="css/style.css" />
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
  <div class="atmospheric-bg atmospheric-bg-layer1"></div>
  <nav class="navbar navbar-expand-lg navbar-dark nexus-navbar">
    <div class="container-xl">
      <a class="navbar-brand" href="catalog.html">Nexus</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#clientNav" aria-controls="clientNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="clientNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
{items}        </ul>
        <ul class="navbar-nav align-items-center">
          <li class="nav-item"><a class="nav-link text-amber" id="nav-login-btn" href="login.html"><i class="bi bi-person-circle me-1"></i><span id="nav-login-text">Login</span></a></li>
          <li class="nav-item">
            <button class="theme-switcher" id="theme-toggle" aria-label="Toggle Theme">
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
  <div class="atmospheric-bg atmospheric-bg-layer1"></div>
  <nav class="navbar navbar-expand-lg navbar-dark nexus-navbar">
    <div class="container-xl">
      <a class="navbar-brand" href="admin.html">Nexus <span style="font-size:0.6em;color:var(--red);font-weight:600;vertical-align:middle;">ADMIN</span></a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNav" aria-controls="adminNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="adminNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
{items}        </ul>
        <ul class="navbar-nav align-items-center">
          <li class="nav-item"><a class="nav-link text-danger me-2" id="nav-logout-btn" href="#" onclick="logoutUser(event)"><i class="bi bi-box-arrow-right me-1"></i>Logout</a></li>
          <li class="nav-item"><a class="nav-link text-cyan" href="catalog.html"><i class="bi bi-box-arrow-up-right me-1"></i>View Site</a></li>
          <li class="nav-item">
            <button class="theme-switcher" id="theme-toggle" aria-label="Toggle Theme">
              <i class="bi bi-moon-stars-fill"></i>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
'''

FOOTER = '''
  <footer class="site-footer-bottom py-4 text-center text-muted" style="border-top: 1px solid var(--glass-border);">
    <div class="container-xl">
      <p class="mb-0 font-rajdhani"><span>NEXUS</span> &mdash; B.Tech &bull; 01CE0306</p>
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
    html = HEAD_BLOCK.format(title=title) + navbar_html + main_content + FOOTER + f'  <script src="js/{script}"></script>\n</body>\n</html>\n'
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'  ✓ {filename}')

import re

# We need the modals from admin pages.
with open('admin.html', 'r') as f:
    adm = f.read()
adm_modal_match = re.search(r'(<!-- ADD / EDIT GAME MODAL -->.*?<!-- TOAST -->)', adm, re.DOTALL)
ADMIN_MODALS = '\n  ' + adm_modal_match.group(1).replace('<!-- TOAST -->', '').strip() + '\n\n' if adm_modal_match else ''

# Also grab the old Kanban container to move it to library.
with open('client_logbook.html', 'r') as f:
    idx = f.read()
kanban_match = re.search(r'(<div class="row g-4" id="kanban-board">.*?</main>)', idx, re.DOTALL)
LOGBOOK_MAIN = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <h2 class="rajdhani-font text-cyan mb-4">Personal Vault</h2>
''' + (kanban_match.group(1) if kanban_match else '')

INDEX_MAIN = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <!-- Catalog Search Bar -->
      <div class="row justify-content-center mb-5">
        <div class="col-md-8">
          <form id="catalog-search-form" class="d-flex gap-2">
            <input type="text" id="catalog-search-input" class="form-control form-control-lg" placeholder="Search the Nexus database..." style="background:rgba(0,0,0,0.2) !important; color:#fff;" required>
            <button type="submit" class="btn btn-nexus px-4"><i class="bi bi-search"></i></button>
          </form>
        </div>
      </div>
      
      <!-- Discovery Hub Hero -->
      <div class="hero-banner mb-5">
        <div class="hero-bg" style="background-image: url('https://placehold.co/1200x500/111/333?text=Daily+Showcase');" id="featured-hero-bg"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <span class="badge bg-purple mb-2 rajdhani-font" style="background-color: var(--purple);">Daily Showcase</span>
          <h1 class="detail-title text-white" id="featured-title">Loading...</h1>
          <p class="text-white-50 fs-5 mb-4 max-w-2xl" id="featured-desc">Fetching high-rated Intel from RAWG network.</p>
          <button class="btn-nexus" id="featured-add-btn" style="display:none;"><i class="bi bi-plus-lg me-2"></i>Add to Library</button>
        </div>
      </div>

      <!-- Discovery Hub Top Rated -->
      <h3 class="rajdhani-font text-purple mb-4"><i class="bi bi-stars me-2"></i>RAWG Curated Selection</h3>
      <div class="game-grid" id="discovery-grid">
        <!-- Dynamically injected by app.js -->
        <div class="text-muted">Initiating uplink...</div>
      </div>
    </div>
  </main>
'''

write_page('catalog.html', 'Nexus — Catalog Storefront', client_navbar('catalog.html'), INDEX_MAIN, 'app.js')
write_page('client_logbook.html', 'Nexus — Library', client_navbar('client_logbook.html'), LOGBOOK_MAIN, 'app.js')

SEARCH_MAIN = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <!-- Centered Search Engine -->
      <div class="text-center mb-5">
        <h1 class="rajdhani-font text-cyan mb-3" style="font-size: 3rem;">NEXUS SEARCH ENGINE</h1>
        <p class="text-muted fs-5 mb-4">Querying the RAWG Global Database</p>
        <div class="row justify-content-center">
          <div class="col-md-8">
            <form id="engine-search-form" class="d-flex gap-2">
              <input type="text" id="engine-search-input" class="form-control form-control-lg" placeholder="Enter game title..." style="background:rgba(0,0,0,0.2) !important; color:#fff;" required>
              <button type="submit" class="btn btn-nexus px-4"><i class="bi bi-search"></i> Search</button>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Results Grid -->
      <h3 class="rajdhani-font text-purple mb-4 d-none" id="search-results-heading"><i class="bi bi-database me-2"></i>Search Results</h3>
      <div class="game-grid" id="search-results-grid">
        <!-- Dynamically injected -->
      </div>
    </div>
  </main>
'''
write_page('client_search.html', 'Nexus — Game Search', client_navbar('client_search.html'), SEARCH_MAIN, 'app.js')

PROFILE_MAIN = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <h2 class="rajdhani-font text-cyan mb-4">Operative Profile</h2>
      <div class="bento-card mb-4">
        <div class="d-flex align-items-center gap-4 mb-4">
          <div class="profile-avatar" id="profile-avatar-char">J</div>
          <div>
            <h3 class="rajdhani-font text-cyan mb-0 fs-2" id="profile-display-name">Operative</h3>
            <p class="text-muted mb-0" id="profile-role">Clearance Level: Client</p>
          </div>
        </div>
        <div class="row g-4" id="profile-stats">
          <div class="col-md-4">
            <div class="kpi-card kpi-played">
              <div class="bento-label">Total Games</div>
              <div class="kpi-value text-neon-green mt-3" id="profile-total-games">--</div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="kpi-card kpi-backlog">
              <div class="bento-label">Hours Logged</div>
              <div class="kpi-value text-amber mt-3" id="profile-playtime">--</div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="kpi-card kpi-upcoming">
              <div class="bento-label">Primary Designation</div>
              <div class="kpi-value text-purple mt-3" id="profile-fav-genre">--</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
'''
write_page('client_profile.html', 'Nexus — User Profile', client_navbar('client_profile.html'), PROFILE_MAIN, 'app.js')

CONTACT_MAIN = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <h2 class="rajdhani-font text-cyan mb-4 text-center">Establish Uplink</h2>
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="bento-card">
            <form id="contact-form" novalidate>
              <div class="mb-4">
                <label for="contact-name" class="form-label">Operative ID <span class="text-red">*</span></label>
                <input type="text" id="contact-name" name="name" class="form-control" required minlength="2" placeholder="Your name">
                <div class="invalid-feedback">Please enter your name.</div>
              </div>
              <div class="mb-4">
                <label for="contact-email" class="form-label">Comms Channel (Email) <span class="text-red">*</span></label>
                <input type="email" id="contact-email" name="email" class="form-control" required placeholder="you@example.com">
                <div class="invalid-feedback">Please enter a valid email.</div>
              </div>
              <div class="mb-4">
                <label for="contact-message" class="form-label">Transmission <span class="text-red">*</span></label>
                <textarea id="contact-message" name="message" class="form-control" rows="5" required minlength="10" placeholder="Message content..."></textarea>
                <div class="invalid-feedback">Please enter your message.</div>
              </div>
              <button type="button" class="btn btn-save w-100" id="btn-submit-contact"><i class="bi bi-send-fill me-2"></i>Transmit</button>
            </form>
            <div id="contact-success" class="alert mt-4 d-none" style="background:rgba(57,255,20,0.1);border:1px solid rgba(57,255,20,0.3);color:var(--green);">
              <i class="bi bi-check-circle-fill me-2"></i>Transmission successful.
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
'''
write_page('client_contact.html', 'Nexus — Contact', client_navbar('client_contact.html'), CONTACT_MAIN, 'app.js')

ADMIN_MAIN = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <h2 class="rajdhani-font text-red mb-4">Command Dashboard</h2>
      <div class="row g-4 mb-4">
        <div class="col-md-4">
          <div class="kpi-card kpi-played">
            <div class="bento-label">Registry Count</div>
            <div class="kpi-value text-neon-green mt-2" id="dash-total-games">--</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="kpi-card kpi-upcoming">
            <div class="bento-label">Active Operatives</div>
            <div class="kpi-value text-purple mt-2" id="dash-total-users">--</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="kpi-card kpi-backlog">
            <div class="bento-label">Transmissions</div>
            <div class="kpi-value text-amber mt-2" id="dash-total-feedback">--</div>
          </div>
        </div>
      </div>
      <div class="bento-card mb-4">
        <div class="d-flex justify-content-between align-items-center">
          <h3 class="rajdhani-font mb-0 text-cyan">Library Overview</h3>
          <button class="btn btn-save" data-bs-toggle="modal" data-bs-target="#gameFormModal" onclick="openAddModal()">
            <i class="bi bi-plus-lg me-2"></i>New Entry
          </button>
        </div>
      </div>
    </div>
  </main>
''' + ADMIN_MODALS
write_page('admin.html', 'Nexus — Admin Dashboard', admin_navbar('admin.html'), ADMIN_MAIN, 'admin.js')

ADMIN_GAMES = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <h2 class="rajdhani-font text-red mb-4">Manage Registry</h2>
      <div class="bento-card">
        <div class="table-responsive">
          <table class="table table-dark table-hover" style="background:transparent;">
            <thead><tr><th>Cover</th><th>Title</th><th>Platform</th><th>Genre</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody id="admin-games-tbody">
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
''' + ADMIN_MODALS
write_page('admin_games.html', 'Nexus — Manage Games', admin_navbar('admin_games.html'), ADMIN_GAMES, 'admin.js')

ADMIN_USERS = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <h2 class="rajdhani-font text-red mb-4">Operative Roster</h2>
      <div class="bento-card">
        <div class="table-responsive">
          <table class="table table-dark table-hover" style="background:transparent;">
            <thead><tr><th>#</th><th>Operative</th><th>Clearance</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody id="admin-users-tbody">
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
'''
write_page('admin_users.html', 'Nexus — User Moderation', admin_navbar('admin_users.html'), ADMIN_USERS, 'admin.js')

ADMIN_ANALYTICS = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <h2 class="rajdhani-font text-red mb-4">Telemetry & Analytics</h2>
      <div class="row g-4 mb-4">
        <div class="col-md-4">
          <div class="kpi-card kpi-played">
            <div class="bento-label">Played</div>
            <div class="kpi-value text-neon-green mt-2" id="analytics-played">--</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="kpi-card kpi-backlog">
            <div class="bento-label">Backlog</div>
            <div class="kpi-value text-amber mt-2" id="analytics-backlog">--</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="kpi-card kpi-upcoming">
            <div class="bento-label">Upcoming</div>
            <div class="kpi-value text-purple mt-2" id="analytics-upcoming">--</div>
          </div>
        </div>
      </div>
      <div class="row g-4">
        <div class="col-md-6">
          <div class="bento-card">
            <h4 class="rajdhani-font text-cyan mb-4">Genre Distribution</h4>
            <div id="analytics-genres"></div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="bento-card">
            <h4 class="rajdhani-font text-cyan mb-4">Platform Breakdown</h4>
            <div id="analytics-platforms"></div>
          </div>
        </div>
      </div>
    </div>
  </main>
'''
write_page('admin_analytics.html', 'Nexus — Analytics', admin_navbar('admin_analytics.html'), ADMIN_ANALYTICS, 'admin.js')

ADMIN_SETTINGS = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <h2 class="rajdhani-font text-red mb-4">System Parameters</h2>
      <div class="bento-card">
        <form id="settings-form">
          <h4 class="rajdhani-font text-cyan mb-3">Core Config</h4>
          <div class="mb-3">
            <label class="form-label">System Name</label>
            <input type="text" class="form-control" id="settings-sys-name" value="Nexus">
          </div>
          <div class="mb-4">
            <label class="form-label">Admin Email</label>
            <input type="email" class="form-control" id="settings-admin-email" value="admin@nexus.local">
          </div>
          <button type="submit" class="btn btn-save w-100"><i class="bi bi-save me-2"></i>Save Configuration</button>
        </form>
        <div id="settings-success" class="alert mt-4 d-none" style="background:rgba(57,255,20,0.1);border:1px solid rgba(57,255,20,0.3);color:var(--green);">
          <i class="bi bi-check-circle-fill me-2"></i>Configuration saved.
        </div>
      </div>
    </div>
  </main>
'''
write_page('admin_settings.html', 'Nexus — Site Settings', admin_navbar('admin_settings.html'), ADMIN_SETTINGS, 'admin.js')

ADMIN_FEEDBACK = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <h2 class="rajdhani-font text-red mb-4">Support Inbox</h2>
      <div class="bento-card">
        <div class="table-responsive">
          <table class="table table-dark table-hover" style="background:transparent;" id="feedback-table">
            <thead><tr><th>Operative</th><th>Channel</th><th>Transmission</th><th>Date</th></tr></thead>
            <tbody id="feedback-tbody">
              <tr><td colspan="4" class="text-muted text-center py-4">No active transmissions.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
'''
write_page('admin_feedback.html', 'Nexus — Support Inbox', admin_navbar('admin_feedback.html'), ADMIN_FEEDBACK, 'admin.js')

ADMIN_LOGS = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <h2 class="rajdhani-font text-red mb-4">System Audit Logs</h2>
      <div class="bento-card">
        <div class="table-responsive">
          <table class="table table-dark table-hover" style="background:transparent;">
            <thead><tr><th>Timestamp</th><th>Event</th><th>Severity</th></tr></thead>
            <tbody>
              <tr><td>2026-08-25 10:45:12</td><td>System Initialized</td><td><span class="badge bg-secondary">Info</span></td></tr>
              <tr><td>2026-08-25 12:20:00</td><td>Failed Auth Attempt (Unknown ID)</td><td><span class="badge text-bg-warning">Warn</span></td></tr>
              <tr><td>2026-08-25 16:42:10</td><td>New Account Registered (ItzJazzu)</td><td><span class="badge text-bg-success">Success</span></td></tr>
              <tr><td>2026-08-25 16:45:00</td><td>Admin Access Granted</td><td><span class="badge text-bg-info">Info</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
'''
write_page('admin_logs.html', 'Nexus — System Logs', admin_navbar('admin_logs.html'), ADMIN_LOGS, 'admin.js')

LOGIN_PAGE = '''
  <main class="py-5" id="main" role="main">
    <div class="container-xl">
      <div class="row justify-content-center">
        <div class="col-md-5 mb-4">
          <div class="bento-card h-100">
            <h3 class="rajdhani-font text-cyan mb-4"><i class="bi bi-door-open-fill me-2"></i>Access Terminal</h3>
            <form id="login-form" novalidate>
              <div class="mb-3">
                <label class="form-label text-muted">Username</label>
                <input type="text" class="form-control" id="login-username" required>
                <div class="invalid-feedback">Requires valid credential.</div>
              </div>
              <div class="mb-4">
                <label class="form-label text-muted">Passcode</label>
                <input type="password" class="form-control" id="login-password" required>
                <div class="invalid-feedback">Requires valid credential.</div>
              </div>
              <button type="submit" class="btn btn-nexus w-100">INITIALIZE LOGIN</button>
            </form>
          </div>
        </div>
        <div class="col-md-5 mb-4">
          <div class="bento-card h-100">
            <h3 class="rajdhani-font text-amber mb-4"><i class="bi bi-person-plus-fill me-2"></i>New Operative</h3>
            <form id="signup-form" novalidate>
              <div class="mb-3">
                <label class="form-label text-muted">Desired Username</label>
                <input type="text" class="form-control" id="signup-username" required minlength="3">
                <div class="invalid-feedback">Must be at least 3 characters.</div>
              </div>
              <div class="mb-4">
                <label class="form-label text-muted">Passcode</label>
                <input type="password" class="form-control" id="signup-password" required minlength="4">
                <div class="invalid-feedback">Must be at least 4 characters.</div>
              </div>
              <button type="submit" class="btn btn-outline-amber w-100">REGISTER IDENTITY</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>
'''
write_page('login.html', 'Nexus — Authentication', client_navbar('login.html'), LOGIN_PAGE, 'app.js')

WELCOME_PAGE = '''
  <div class="welcome-hero d-flex align-items-center justify-content-center text-center" style="min-height: 100vh; background: linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(10,5,20,0.8) 100%), url('img/bg_cyber.jpg') center/cover;">
    <div class="container-xl z-2">
      <h1 class="display-1 rajdhani-font text-white mb-3" style="text-shadow: 0 0 20px var(--cyan);">N E X U S</h1>
      <p class="lead text-white-50 mb-5 max-w-2xl mx-auto">The ultimate terminal for tracking your gaming legacy. Sync across platforms, analyze your playtime, and organize your backlog.</p>
      
      <button class="btn btn-nexus btn-lg px-5 py-3 fs-4" data-bs-toggle="modal" data-bs-target="#welcomeModal">GET STARTED</button>
    </div>
  </div>

  <!-- Welcome Modal -->
  <div class="modal fade glass-modal" id="welcomeModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h5 class="modal-title rajdhani-font text-cyan fs-3">Initialize Uplink</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body text-center py-5">
          <p class="text-white-50 mb-4">Would you like to register your identity or proceed as a guest?</p>
          <div class="d-flex flex-column gap-3 max-w-sm mx-auto">
            <a href="login.html" class="btn btn-nexus w-100 text-white"><i class="bi bi-person-plus-fill me-2"></i>Create Account / Login</a>
            <a href="catalog.html" class="btn btn-outline-light w-100 text-white"><i class="bi bi-box-arrow-in-right me-2"></i>Skip for Now</a>
          </div>
        </div>
      </div>
    </div>
  </div>
'''
write_page('index.html', 'Nexus — Welcome', '', WELCOME_PAGE, 'app.js')

