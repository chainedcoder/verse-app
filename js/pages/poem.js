// ============================================
// VERSE — Poem Details Page
// ============================================

import { getPoem, getAuthor, isLiked, getLikeCount, toggleLike, toggleFollow, isFollowing } from '../data.js';
import { renderAuthorCard } from '../components/authorCard.js';
import { showToast } from '../toast.js';

export function renderPoem(poemId) {
  const poem = getPoem(poemId);
  if (!poem) {
    return `
      <div class="container" style="padding:60px 0; text-align:center;">
        <i class="ti ti-mood-sad" style="font-size:48px; color:var(--text-tertiary); margin-bottom:16px; display:block;"></i>
        <h2 style="margin-bottom:8px;">Poem not found</h2>
        <p style="color:var(--text-secondary); margin-bottom:24px;">The poem you're looking for doesn't exist.</p>
        <a href="#/" class="btn btn-primary">Back to feed</a>
      </div>
    `;
  }

  const author = getAuthor(poem.authorId);
  const liked = isLiked(poem.id);
  const likeCount = getLikeCount(poem.id);

  const poemHtml = poem.fullText.split('\n').map(line =>
    line.trim() === '' ? '<br>' : line
  ).join('<br>');

  return `
    <div class="poem-layout">
      <!-- Main poem -->
      <div class="poem-main">
        <div style="margin-bottom:24px;">
          <button class="poem-viewer-back" id="poem-back">
            <i class="ti ti-arrow-left" style="font-size:18px;" aria-hidden="true"></i>
            <span>Back to feed</span>
          </button>
        </div>

        <div class="tag-row" style="margin-bottom:16px;">
          ${poem.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <h1 class="poem-viewer-title serif">${poem.title}</h1>
        <div class="poem-viewer-meta">${author.name} · published ${poem.date}</div>

        <div class="poem-body">
          <div class="poem-viewer-text">
            ${poemHtml}
          </div>
        </div>

        <!-- Poem footer: like, share, download -->
        <div class="poem-footer" style="margin-top:32px; padding-top:20px; border-top:1px solid var(--border-tertiary); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <button class="action-icon ${liked ? 'liked' : ''}" data-action="like" data-poem-id="${poem.id}" id="poem-like-btn" style="font-size:14px;">
            <i class="ti ${liked ? 'ti-heart-filled' : 'ti-heart'}" style="font-size:20px;" aria-hidden="true"></i>
            <span class="like-count">${likeCount}</span> likes
          </button>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-ghost btn-sm" id="poem-share-btn">
              <i class="ti ti-share" style="font-size:14px;" aria-hidden="true"></i> Share
            </button>
            <a href="#/export/${poem.id}" class="btn btn-primary btn-sm" id="poem-download-btn">
              <i class="ti ti-download" style="font-size:14px;" aria-hidden="true"></i> Download
            </a>
          </div>
        </div>
      </div>

      <!-- Side panel -->
      <div class="poem-side">
        ${renderAuthorCard(author)}

        <hr class="divider" style="margin-bottom:20px;">

        <!-- Download formats -->
        <div class="section-title">Download as</div>
        <div class="download-options">
          <a href="#/export/${poem.id}" class="download-option" data-template="minimal" id="dl-minimal">
            <div>
              <div class="download-option-title">Minimal poster</div>
              <div class="download-option-desc">Clean white, typography only</div>
            </div>
            <i class="ti ti-download" style="font-size:16px; color:var(--text-tertiary);" aria-hidden="true"></i>
          </a>
          <a href="#/export/${poem.id}" class="download-option" data-template="dark" id="dl-dark">
            <div>
              <div class="download-option-title">Dark cinematic</div>
              <div class="download-option-desc">Deep navy, serif layout</div>
            </div>
            <i class="ti ti-download" style="font-size:16px; color:var(--text-tertiary);" aria-hidden="true"></i>
          </a>
          <a href="#/export/${poem.id}" class="download-option" data-template="love" id="dl-love">
            <div>
              <div class="download-option-title">Love letter</div>
              <div class="download-option-desc">Cream + floral illustration</div>
            </div>
            <i class="ti ti-download" style="font-size:16px; color:var(--text-tertiary);" aria-hidden="true"></i>
          </a>
          <a href="#/export/${poem.id}" class="download-option" data-template="story" id="dl-story">
            <div>
              <div class="download-option-title">Instagram story</div>
              <div class="download-option-desc">9:16 vertical format</div>
            </div>
            <i class="ti ti-download" style="font-size:16px; color:var(--text-tertiary);" aria-hidden="true"></i>
          </a>
        </div>

        <hr class="divider" style="margin:20px 0;">
        <div class="section-title">Share</div>
        <div class="share-buttons">
          <button class="btn btn-ghost btn-sm" id="copy-link-btn" style="flex:1; display:flex; align-items:center; justify-content:center; gap:5px;">
            <i class="ti ti-copy" style="font-size:13px;" aria-hidden="true"></i> Copy link
          </button>
          <button class="btn btn-ghost btn-sm" id="share-instagram-btn" style="flex:1; display:flex; align-items:center; justify-content:center; gap:5px;">
            <i class="ti ti-brand-instagram" style="font-size:13px;" aria-hidden="true"></i> Instagram
          </button>
        </div>
      </div>
    </div>
  `;
}

export function initPoem(poemId) {
  // Back button
  document.getElementById('poem-back')?.addEventListener('click', () => {
    window.history.back();
  });

  // Like button
  const likeBtn = document.getElementById('poem-like-btn');
  likeBtn?.addEventListener('click', () => {
    const nowLiked = toggleLike(poemId);
    const icon = likeBtn.querySelector('i');
    const countEl = likeBtn.querySelector('.like-count');

    likeBtn.classList.toggle('liked', nowLiked);
    if (icon) icon.className = `ti ${nowLiked ? 'ti-heart-filled' : 'ti-heart'}`;
    if (countEl) countEl.textContent = getLikeCount(poemId);
  });

  // Share button (in footer)
  document.getElementById('poem-share-btn')?.addEventListener('click', () => {
    copyPoemLink(poemId);
  });

  // Follow button
  document.querySelectorAll('[data-action="follow"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const authorId = btn.dataset.authorId;
      const nowFollowing = toggleFollow(authorId);
      btn.classList.toggle('btn-primary', nowFollowing);
      btn.classList.toggle('btn-ghost', !nowFollowing);
      btn.textContent = nowFollowing ? 'Following' : 'Follow author';
    });
  });

  // Copy link button (sidebar)
  document.getElementById('copy-link-btn')?.addEventListener('click', () => {
    copyPoemLink(poemId);
  });

  // Instagram share
  document.getElementById('share-instagram-btn')?.addEventListener('click', () => {
    showToast('Open Instagram and paste your poem image!');
  });
}

function copyPoemLink(poemId) {
  const url = `${window.location.origin}${window.location.pathname}#/poem/${poemId}`;
  navigator.clipboard.writeText(url).then(() => {
    showToast('Link copied to clipboard!');
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Link copied to clipboard!');
  });
}
