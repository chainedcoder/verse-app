// ============================================
// VERSE — Home / Discover Feed Page
// ============================================

import { poems, allTags, toggleLike, toggleFollow, isLiked, getLikeCount, isFollowing } from '../data.js';
import { renderFeaturedCard } from '../components/poemCard.js';
import { renderSidebar } from '../components/sidebar.js';
import { showToast } from '../toast.js';

let activeTag = 'all';

export function renderHome() {
  activeTag = 'all';
  const filteredPoems = getFilteredPoems();

  return `
    <div class="feed-layout">
      <div class="feed-main" id="feed-main">
        <div class="tag-row-scroll" id="tag-filters" style="margin-bottom:20px;">
          <span class="tag active" data-tag="all" id="tag-all">All</span>
          ${allTags.map(t => `<span class="tag" data-tag="${t}" id="tag-${t.replace(/\s/g, '-')}">${t}</span>`).join('')}
        </div>

        <div id="poem-feed">
          ${renderPoemFeed(filteredPoems)}
        </div>
      </div>

      ${renderSidebar()}
    </div>
  `;
}

function getFilteredPoems() {
  if (activeTag === 'all') return poems;
  return poems.filter(p => p.tags.includes(activeTag));
}

function renderPoemFeed(poemList) {
  if (poemList.length === 0) {
    return `
      <div class="empty-state">
        <i class="ti ti-feather" aria-hidden="true"></i>
        <p>No poems found for this tag</p>
      </div>
    `;
  }

  return poemList.map(poem => renderFeaturedCard(poem)).join('');
}

export function initHome() {
  // Tag filters
  const tagFilters = document.getElementById('tag-filters');
  tagFilters?.addEventListener('click', (e) => {
    const tag = e.target.closest('.tag');
    if (!tag) return;

    activeTag = tag.dataset.tag;

    // Update active tag style
    tagFilters.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
    tag.classList.add('active');

    // Re-render feed with animation
    const feed = document.getElementById('poem-feed');
    if (feed) {
      feed.style.opacity = '0';
      feed.style.transform = 'translateY(8px)';
      setTimeout(() => {
        feed.innerHTML = renderPoemFeed(getFilteredPoems());
        // Re-attach feed event listeners
        attachFeedListeners();
        requestAnimationFrame(() => {
          feed.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          feed.style.opacity = '1';
          feed.style.transform = 'translateY(0)';
        });
      }, 150);
    }
  });

  attachFeedListeners();
  attachSidebarListeners();
}

function attachFeedListeners() {
  // Poem card clicks (navigate to poem)
  document.querySelectorAll('.poem-card-featured, .poem-card-compact').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't navigate if clicking action icons
      if (e.target.closest('.action-icon') || e.target.closest('.author-info')) return;
      const poemId = card.dataset.poemId;
      if (poemId) {
        window.location.hash = `#/poem/${poemId}`;
      }
    });
  });

  // Like buttons
  document.querySelectorAll('[data-action="like"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const poemId = btn.dataset.poemId;
      const nowLiked = toggleLike(poemId);
      const icon = btn.querySelector('i');
      const countEl = btn.querySelector('.like-count');

      btn.classList.toggle('liked', nowLiked);
      if (icon) {
        icon.className = `ti ${nowLiked ? 'ti-heart-filled' : 'ti-heart'}`;
        icon.style.fontSize = icon.style.fontSize || '16px';
      }
      if (countEl) {
        countEl.textContent = getLikeCount(poemId);
      }
    });
  });

  // Download buttons
  document.querySelectorAll('[data-action="download"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const poemId = btn.dataset.poemId;
      window.location.hash = `#/export/${poemId}`;
    });
  });

  // Share buttons
  document.querySelectorAll('[data-action="share"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const poemId = btn.dataset.poemId;
      const url = `${window.location.origin}${window.location.pathname}#/poem/${poemId}`;
      navigator.clipboard.writeText(url).then(() => {
        showToast('Link copied to clipboard!');
      }).catch(() => {
        showToast('Could not copy link');
      });
    });
  });
}

function attachSidebarListeners() {
  // Follow buttons in sidebar
  document.querySelectorAll('[data-action="follow"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const authorId = btn.dataset.authorId;
      const nowFollowing = toggleFollow(authorId);

      btn.classList.toggle('btn-primary', nowFollowing);
      btn.classList.toggle('btn-ghost', !nowFollowing);
      btn.textContent = nowFollowing ? 'Following' : 'Follow';
    });
  });

  // Sidebar tag clicks
  document.querySelectorAll('#sidebar-tags .tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const tagName = tag.dataset.tag;
      activeTag = tagName;

      // Update main tag filter bar
      const tagFilters = document.getElementById('tag-filters');
      if (tagFilters) {
        tagFilters.querySelectorAll('.tag').forEach(t => {
          t.classList.toggle('active', t.dataset.tag === tagName);
        });
      }

      // Re-render feed
      const feed = document.getElementById('poem-feed');
      if (feed) {
        feed.style.opacity = '0';
        setTimeout(() => {
          feed.innerHTML = renderPoemFeed(getFilteredPoems());
          attachFeedListeners();
          requestAnimationFrame(() => {
            feed.style.transition = 'opacity 0.3s ease';
            feed.style.opacity = '1';
          });
        }, 150);
      }
    });
  });
}
