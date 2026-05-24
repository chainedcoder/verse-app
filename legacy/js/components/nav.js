// ============================================
// VERSE — Navigation Component
// ============================================

import { getTheme } from '../theme.js';

export function renderNav(currentPage = 'discover') {
  const theme = getTheme();
  const themeIcon = theme === 'dark' ? 'ti-sun' : 'ti-moon';
  const themeLabel = theme === 'dark' ? 'Light' : 'Dark';

  return `
    <nav class="navbar" id="navbar">
      <a class="navbar-logo" href="#/" id="nav-logo">verse</a>

      <div class="navbar-links" id="nav-links">
        <a class="navbar-link ${currentPage === 'discover' ? 'active' : ''}" href="#/" id="nav-discover">Discover</a>
        <a class="navbar-link ${currentPage === 'collections' ? 'active' : ''}" href="#/" id="nav-collections">Collections</a>
        <a class="navbar-link ${currentPage === 'authors' ? 'active' : ''}" href="#/" id="nav-authors">Authors</a>
      </div>

      <div class="navbar-actions">
        <button class="btn btn-ghost btn-sm" id="theme-toggle" aria-label="${themeLabel} mode">
          <i class="ti ${themeIcon}" style="font-size:15px;" aria-hidden="true"></i> ${themeLabel}
        </button>
        <button class="btn btn-ghost btn-sm" id="nav-login">Log in</button>
        <button class="btn btn-primary btn-sm" id="nav-signup">Sign up</button>
        <button class="hamburger" id="hamburger" aria-label="Menu">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>
    </nav>

    <div class="drawer-overlay" id="drawer-overlay"></div>
    <div class="mobile-drawer" id="mobile-drawer">
      <a class="mobile-drawer-link ${currentPage === 'discover' ? 'active' : ''}" href="#/" id="mobile-discover">
        <i class="ti ti-compass" aria-hidden="true"></i> Discover
      </a>
      <a class="mobile-drawer-link ${currentPage === 'collections' ? 'active' : ''}" href="#/" id="mobile-collections">
        <i class="ti ti-folders" aria-hidden="true"></i> Collections
      </a>
      <a class="mobile-drawer-link ${currentPage === 'authors' ? 'active' : ''}" href="#/" id="mobile-authors">
        <i class="ti ti-users" aria-hidden="true"></i> Authors
      </a>
      <hr class="mobile-drawer-divider">
      <div class="mobile-drawer-link" id="mobile-theme-toggle" style="cursor:pointer;">
        <i class="ti ${themeIcon}" aria-hidden="true"></i> ${themeLabel} mode
      </div>
      <hr class="mobile-drawer-divider">
      <button class="btn btn-ghost btn-full" id="mobile-login" style="margin-bottom:8px;">Log in</button>
      <button class="btn btn-primary btn-full" id="mobile-signup">Sign up</button>
    </div>
  `;
}

export function initNav() {
  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('drawer-overlay');

  function openDrawer() {
    hamburger.classList.add('open');
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    hamburger.classList.remove('open');
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    if (drawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  overlay?.addEventListener('click', closeDrawer);

  // Close drawer on link click
  drawer?.querySelectorAll('.mobile-drawer-link[href]').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Mobile theme toggle opens panel too (handled by themePanel.js)
  // No direct toggle here — themePanel.js handles opening the panel on #theme-toggle click

  // Listen for external theme changes to update button text/icon
  window.addEventListener('themechange', (e) => {
    updateThemeIcons(e.detail.theme);
  });
}

function updateThemeIcons(theme) {
  const icon = theme === 'dark' ? 'ti-sun' : 'ti-moon';
  const label = theme === 'dark' ? 'Light' : 'Dark';

  const desktopBtn = document.getElementById('theme-toggle');
  if (desktopBtn) {
    desktopBtn.innerHTML = `<i class="ti ${icon}" style="font-size:15px;" aria-hidden="true"></i> ${label}`;
    desktopBtn.setAttribute('aria-label', `${label} mode`);
  }

  const mobileBtn = document.getElementById('mobile-theme-toggle');
  if (mobileBtn) {
    mobileBtn.innerHTML = `<i class="ti ${icon}" aria-hidden="true"></i> ${label} mode`;
  }
}
