// ============================================
// VERSE — Author Profile Page
// ============================================

import { getAuthor, getPoemsByAuthor, authors, isFollowing, toggleFollow, isLiked, getLikeCount, toggleLike } from '../data.js';

export function renderAuthor(authorId) {
  const author = getAuthor(authorId);
  if (!author) {
    return `
      <div class="container" style="padding:60px 0; text-align:center;">
        <i class="ti ti-user-off" style="font-size:48px; color:var(--text-tertiary); margin-bottom:16px; display:block;"></i>
        <h2 style="margin-bottom:8px;">Author not found</h2>
        <p style="color:var(--text-secondary); margin-bottom:24px;">The author you're looking for doesn't exist.</p>
        <a href="#/" class="btn btn-primary">Back to feed</a>
      </div>
    `;
  }

  const poems = getPoemsByAuthor(authorId);
  const following = isFollowing(authorId);

  // Collect unique tags from author's poems
  const authorTags = [...new Set(poems.flatMap(p => p.tags))];

  const worksHtml = poems.map(poem => {
    const liked = isLiked(poem.id);
    const likeCount = getLikeCount(poem.id);
    return `
      <div class="card card-clickable work-card" data-poem-id="${poem.id}" id="work-${poem.id}">
        <div class="work-card-category">${poem.tags[0] || ''}</div>
        <div class="work-card-title">${poem.title}</div>
        <div class="work-card-excerpt">${poem.excerpt}</div>
        <div class="work-card-meta">
          ${poem.date} ·
          <button class="action-icon ${liked ? 'liked' : ''}" data-action="like" data-poem-id="${poem.id}" style="font-size:11px; padding:2px;">
            <i class="ti ${liked ? 'ti-heart-filled' : 'ti-heart'}" style="font-size:13px;" aria-hidden="true"></i>
            <span class="like-count">${likeCount}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!-- Profile hero -->
    <div class="profile-hero">
      <div class="avatar avatar-xl ${author.avatarClass}">${author.initials}</div>
      <div style="flex:1;">
        <h1 class="profile-name">${author.name}</h1>
        <p class="profile-bio">${author.bio} · ${author.location}</p>
        <div class="profile-stats">
          <span class="stat"><strong>${author.poems}</strong> poems</span>
          <span class="stat"><strong>${author.readers}</strong> readers</span>
          <span class="stat"><strong>${author.reading}</strong> reading</span>
        </div>
        <button class="btn ${following ? 'btn-primary' : 'btn-ghost'}" data-action="follow" data-author-id="${author.id}" id="profile-follow-btn" style="font-size:12px; padding:7px 20px;">
          ${following ? 'Following' : 'Follow'}
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tab-bar" id="author-tabs">
      <button class="tab-item active" data-tab="all" id="tab-all">All works</button>
      ${authorTags.map(tag => `
        <button class="tab-item" data-tab="${tag}" id="tab-${tag.replace(/\s/g, '-')}">${tag}</button>
      `).join('')}
    </div>

    <!-- Work grid -->
    <div style="padding:24px;">
      <div class="profile-works-grid" id="works-grid">
        ${worksHtml}
      </div>
    </div>
  `;
}

export function initAuthor(authorId) {
  const poems = getPoemsByAuthor(authorId);

  // Follow button
  document.getElementById('profile-follow-btn')?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const nowFollowing = toggleFollow(authorId);
    btn.classList.toggle('btn-primary', nowFollowing);
    btn.classList.toggle('btn-ghost', !nowFollowing);
    btn.textContent = nowFollowing ? 'Following' : 'Follow';
  });

  // Tab filtering
  const tabs = document.getElementById('author-tabs');
  tabs?.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab-item');
    if (!tab) return;

    const tagFilter = tab.dataset.tab;

    // Update active tab
    tabs.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Filter works
    const grid = document.getElementById('works-grid');
    if (!grid) return;

    const filteredPoems = tagFilter === 'all'
      ? poems
      : poems.filter(p => p.tags.includes(tagFilter));

    grid.style.opacity = '0';
    grid.style.transform = 'translateY(6px)';

    setTimeout(() => {
      if (filteredPoems.length === 0) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column: 1/-1;">
            <i class="ti ti-feather" aria-hidden="true"></i>
            <p>No ${tagFilter} poems yet</p>
          </div>
        `;
      } else {
        grid.innerHTML = filteredPoems.map(poem => {
          const liked = isLiked(poem.id);
          const likeCount = getLikeCount(poem.id);
          return `
            <div class="card card-clickable work-card" data-poem-id="${poem.id}">
              <div class="work-card-category">${poem.tags[0] || ''}</div>
              <div class="work-card-title">${poem.title}</div>
              <div class="work-card-excerpt">${poem.excerpt}</div>
              <div class="work-card-meta">
                ${poem.date} ·
                <button class="action-icon ${liked ? 'liked' : ''}" data-action="like" data-poem-id="${poem.id}" style="font-size:11px; padding:2px;">
                  <i class="ti ${liked ? 'ti-heart-filled' : 'ti-heart'}" style="font-size:13px;" aria-hidden="true"></i>
                  <span class="like-count">${likeCount}</span>
                </button>
              </div>
            </div>
          `;
        }).join('');
        attachWorkListeners();
      }

      requestAnimationFrame(() => {
        grid.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        grid.style.opacity = '1';
        grid.style.transform = 'translateY(0)';
      });
    }, 150);
  });

  attachWorkListeners();
}

function attachWorkListeners() {
  // Work card clicks → navigate to poem
  document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.action-icon')) return;
      const poemId = card.dataset.poemId;
      if (poemId) window.location.hash = `#/poem/${poemId}`;
    });
  });

  // Like buttons
  document.querySelectorAll('.work-card [data-action="like"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const poemId = btn.dataset.poemId;
      const nowLiked = toggleLike(poemId);
      const icon = btn.querySelector('i');
      const countEl = btn.querySelector('.like-count');

      btn.classList.toggle('liked', nowLiked);
      if (icon) icon.className = `ti ${nowLiked ? 'ti-heart-filled' : 'ti-heart'}`;
      if (countEl) countEl.textContent = getLikeCount(poemId);
    });
  });
}
