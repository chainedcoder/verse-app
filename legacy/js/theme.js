// ============================================
// VERSE — Theme Engine
// Light/Dark mode + accent color switching
// ============================================

const THEME_KEY = 'verse_theme';
const ACCENT_KEY = 'verse_accent';

const accents = ['indigo', 'rose', 'emerald', 'amber', 'violet', 'ocean'];

export function getTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || getSystemTheme();
  } catch {
    return getSystemTheme();
  }
}

export function getAccent() {
  try {
    return localStorage.getItem(ACCENT_KEY) || 'indigo';
  } catch {
    return 'indigo';
  }
}

function getSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
  // Dispatch custom event for components to react
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

export function setAccent(accent) {
  if (!accents.includes(accent)) return;
  document.documentElement.setAttribute('data-accent', accent);
  try { localStorage.setItem(ACCENT_KEY, accent); } catch {}
  window.dispatchEvent(new CustomEvent('accentchange', { detail: { accent } }));
}

export function toggleTheme() {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

export function initTheme() {
  const theme = getTheme();
  const accent = getAccent();

  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-accent', accent);

  // Listen for system preference changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only auto-switch if user hasn't explicitly chosen
      try {
        if (!localStorage.getItem(THEME_KEY)) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      } catch {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

export function getAccents() {
  return accents;
}
