// ============================================
// VERSE — App Shell / Router
// Hash-based SPA routing
// ============================================

import { initTheme } from './theme.js';
import { renderNav, initNav } from './components/nav.js';
import { renderThemePanel, initThemePanel } from './components/themePanel.js';
import { renderHome, initHome } from './pages/home.js';
import { renderPoem, initPoem } from './pages/poem.js';
import { renderExport, initExport } from './pages/export.js?v=6';
import { renderAuthor, initAuthor } from './pages/author.js';

const app = document.getElementById('app');

// ============================================
// Router
// ============================================
function parseRoute(hash) {
  const path = hash.replace('#', '') || '/';
  const parts = path.split('/').filter(Boolean);

  if (parts.length === 0 || parts[0] === '') {
    return { page: 'home', params: {} };
  }

  switch (parts[0]) {
    case 'poem':
      return { page: 'poem', params: { id: parts[1] } };
    case 'export':
      return { page: 'export', params: { id: parts[1] } };
    case 'author':
      return { page: 'author', params: { id: parts[1] } };
    default:
      return { page: 'home', params: {} };
  }
}

function getActivePage(page) {
  switch (page) {
    case 'poem':
    case 'export':
      return 'discover';
    case 'author':
      return 'authors';
    default:
      return 'discover';
  }
}

function renderPage(route) {
  const { page, params } = route;

  // Build page content
  let pageContent = '';
  const activePage = getActivePage(page);

  switch (page) {
    case 'home':
      pageContent = renderHome();
      break;
    case 'poem':
      pageContent = renderPoem(params.id);
      break;
    case 'export':
      pageContent = renderExport(params.id);
      break;
    case 'author':
      pageContent = renderAuthor(params.id);
      break;
    default:
      pageContent = renderHome();
  }

  // Assemble full page with nav
  app.innerHTML = `
    ${renderNav(activePage)}
    ${renderThemePanel()}
    <main id="main-content" class="page-enter">
      ${pageContent}
    </main>
  `;

  // Initialize components
  initNav();
  initThemePanel();

  // Initialize page-specific logic
  switch (page) {
    case 'home':
      initHome();
      break;
    case 'poem':
      initPoem(params.id);
      break;
    case 'export':
      initExport(params.id);
      break;
    case 'author':
      initAuthor(params.id);
      break;
  }

  // Scroll to top
  window.scrollTo(0, 0);
}

function handleRoute() {
  const hash = window.location.hash || '#/';
  const route = parseRoute(hash);
  renderPage(route);
}

// ============================================
// Init
// ============================================
function initApp() {
  // Initialize theme first (before rendering)
  initTheme();

  // Listen for hash changes
  window.addEventListener('hashchange', handleRoute);

  // Initial render
  handleRoute();
}

// Start the app
initApp();
