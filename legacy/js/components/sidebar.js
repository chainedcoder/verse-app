// ============================================
// VERSE — Sidebar Component
// Trending authors + Popular tags
// ============================================

import { authors, trendingAuthors, allTags, isFollowing } from '../data.js';

export function renderSidebar() {
  const trendingHtml = trendingAuthors.map(authorId => {
    const author = authors.find(a => a.id === authorId);
    if (!author) return '';
    const following = isFollowing(author.id);

    return `
      <div class="author-list-item">
        <div class="author-list-info">
          <div class="avatar ${author.avatarClass}">${author.initials}</div>
          <div>
            <div style="font-size:13px; font-weight:500;">
              <a href="#/author/${author.id}" style="text-decoration:none; color:inherit;">${author.name}</a>
            </div>
            <div style="font-size:11px; color:var(--text-tertiary);">${author.bio}</div>
          </div>
        </div>
        <button class="btn ${following ? 'btn-primary' : 'btn-ghost'} btn-sm"
                data-action="follow" data-author-id="${author.id}"
                id="sidebar-follow-${author.id}">
          ${following ? 'Following' : 'Follow'}
        </button>
      </div>
    `;
  }).join('<hr class="divider">');

  const tagsHtml = allTags.map(tag =>
    `<span class="tag" data-tag="${tag}">${tag}</span>`
  ).join('');

  return `
    <div class="feed-sidebar" id="feed-sidebar">
      <div class="section-title">Trending authors</div>
      <div class="author-list">
        ${trendingHtml}
      </div>

      <div style="margin-top:24px; padding-top:20px; border-top:1px solid var(--border-tertiary);">
        <div class="section-title">Popular tags</div>
        <div class="tag-row" id="sidebar-tags">
          ${tagsHtml}
        </div>
      </div>
    </div>
  `;
}
