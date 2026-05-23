// ============================================
// VERSE — Poem Card Component
// Featured large card (single variant)
// ============================================

import { getAuthor, isLiked, getLikeCount } from '../data.js';

function estimateReadTime(text) {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return minutes < 1 ? 1 : minutes;
}

export function renderFeaturedCard(poem) {
  const author = getAuthor(poem.authorId);
  const liked = isLiked(poem.id);
  const likeCount = getLikeCount(poem.id);
  const likeClass = liked ? 'liked' : '';
  const heartIcon = liked ? 'ti-heart-filled' : 'ti-heart';
  const readTime = estimateReadTime(poem.fullText || poem.excerpt);

  return `
    <div class="card card-clickable poem-card-featured" data-poem-id="${poem.id}" id="poem-card-${poem.id}">
      ${poem.featured ? '<span class="badge badge-featured">featured</span>' : ''}
      <div class="category-label" style="margin-bottom:6px;">${poem.tags.join(' · ')}</div>
      <h2 class="serif" style="font-size:22px; margin-bottom:12px; letter-spacing:-0.3px;">${poem.title}</h2>
      <div class="poem-excerpt" style="font-size:15px;">
        ${poem.excerpt.split('\n').join('<br>')}
      </div>
      <div class="card-footer">
        <a class="author-info" href="#/author/${poem.authorId}" style="text-decoration:none; color:inherit;">
          <div class="avatar avatar-sm ${author.avatarClass}">${author.initials}</div>
          <div>
            <div class="author-name">${author.name}</div>
            <div style="font-size:11px; color:var(--text-tertiary);">${poem.date} · ${readTime} min read</div>
          </div>
        </a>
        <div class="action-icons">
          <button class="action-icon ${likeClass}" data-action="like" data-poem-id="${poem.id}" id="like-${poem.id}" aria-label="Like">
            <i class="ti ${heartIcon}" style="font-size:16px;" aria-hidden="true"></i>
            <span class="like-count">${likeCount}</span>
          </button>
          <button class="action-icon" data-action="download" data-poem-id="${poem.id}" aria-label="Download">
            <i class="ti ti-download" style="font-size:16px;" aria-hidden="true"></i>
          </button>
          <button class="action-icon" data-action="share" data-poem-id="${poem.id}" aria-label="Share">
            <i class="ti ti-share" style="font-size:16px;" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}
