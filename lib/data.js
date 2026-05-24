// ============================================
// VERSE — Data Store (Local State Only)
// ============================================
// State Management
// ============================================

const STATE_KEY = 'verse_state';

function loadState() {
  try {
    const saved = sessionStorage.getItem(STATE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore */ }
  return { likedPoems: [], followedAuthors: ['emily-dickins'] };
}

function saveState() {
  try {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) { /* ignore */ }
}

export const state = loadState();

export function toggleLike(poemId) {
  const idx = state.likedPoems.indexOf(poemId);
  if (idx === -1) {
    state.likedPoems.push(poemId);
  } else {
    state.likedPoems.splice(idx, 1);
  }
  saveState();
  return idx === -1; // true if now liked
}

export function isLiked(poemId) {
  return state.likedPoems.includes(poemId);
}

export function toggleFollow(authorId) {
  const idx = state.followedAuthors.indexOf(authorId);
  if (idx === -1) {
    state.followedAuthors.push(authorId);
  } else {
    state.followedAuthors.splice(idx, 1);
  }
  saveState();
  return idx === -1; // true if now following
}

export function isFollowing(authorId) {
  return state.followedAuthors.includes(authorId);
}

