// ============================================
// VERSE — Theme Panel Component
// Light/Dark toggle + accent color swatches
// ============================================

import { getTheme, getAccent, setTheme, setAccent, getAccents, toggleTheme } from '../theme.js';

export function renderThemePanel() {
  const theme = getTheme();
  const accent = getAccent();
  const accents = getAccents();

  const swatches = accents.map(a => `
    <button class="accent-swatch accent-swatch-${a} ${accent === a ? 'active' : ''}"
            data-accent="${a}" title="${a.charAt(0).toUpperCase() + a.slice(1)}"
            aria-label="Set accent color to ${a}"
            id="accent-${a}"></button>
  `).join('');

  return `
    <div class="theme-panel" id="theme-panel">
      <div class="theme-panel-title">Appearance</div>

      <div class="theme-mode-toggle" id="theme-mode-toggle">
        <button class="theme-mode-option ${theme === 'light' ? 'active' : ''}" data-mode="light" id="mode-light">
          <i class="ti ti-sun" style="font-size:14px;" aria-hidden="true"></i> Light
        </button>
        <button class="theme-mode-option ${theme === 'dark' ? 'active' : ''}" data-mode="dark" id="mode-dark">
          <i class="ti ti-moon" style="font-size:14px;" aria-hidden="true"></i> Dark
        </button>
      </div>

      <div class="accent-label">Accent color</div>
      <div class="accent-swatches" id="accent-swatches">
        ${swatches}
      </div>
    </div>
  `;
}

export function initThemePanel() {
  const panel = document.getElementById('theme-panel');
  const themeToggle = document.getElementById('theme-toggle');
  const mobileThemeToggle = document.getElementById('mobile-theme-toggle');

  if (!panel || !themeToggle) return;

  // Toggle panel open/close on desktop theme button click
  themeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('open');
  });

  // Mobile theme toggle — directly switch theme (no panel on mobile)
  mobileThemeToggle?.addEventListener('click', () => {
    toggleTheme();
    // Close drawer
    const hamburger = document.getElementById('hamburger');
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('drawer-overlay');
    hamburger?.classList.remove('open');
    drawer?.classList.remove('open');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
  });

  // Close panel when clicking outside
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && e.target !== themeToggle && !themeToggle.contains(e.target)) {
      panel.classList.remove('open');
    }
  });

  // Mode toggles inside panel
  const modeToggle = document.getElementById('theme-mode-toggle');
  modeToggle?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-mode]');
    if (!btn) return;
    const mode = btn.dataset.mode;
    setTheme(mode);
    // Update active state
    modeToggle.querySelectorAll('.theme-mode-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });

  // Accent swatches
  const swatches = document.getElementById('accent-swatches');
  swatches?.addEventListener('click', (e) => {
    const swatch = e.target.closest('[data-accent]');
    if (!swatch) return;
    setAccent(swatch.dataset.accent);
    swatches.querySelectorAll('.accent-swatch').forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');
  });

  // Listen for external theme changes to keep panel in sync
  window.addEventListener('themechange', (e) => {
    const mode = e.detail.theme;
    modeToggle?.querySelectorAll('.theme-mode-option').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });
  });
}
