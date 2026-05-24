// ============================================
// VERSE — Author Card Component
// ============================================

import { isFollowing } from '../data.js';

export function renderAuthorCard(author) {
  const following = isFollowing(author.id);

  return `
    <div class="author-side-panel" id="author-card-${author.id}">
      <div class="avatar avatar-lg ${author.avatarClass}" style="margin-bottom:12px;">${author.initials}</div>
      <div class="author-name">${author.name}</div>
      <div class="author-bio">${author.bio}</div>
      <div class="author-stats">
        <span><strong>${author.poems}</strong> poems</span>
        <span><strong>${author.readers}</strong> readers</span>
      </div>
      <button class="btn ${following ? 'btn-primary' : 'btn-ghost'} btn-full"
              data-action="follow" data-author-id="${author.id}"
              id="poem-follow-${author.id}"
              style="font-size:12px;">
        ${following ? 'Following' : 'Follow author'}
      </button>
    </div>
  `;
}
