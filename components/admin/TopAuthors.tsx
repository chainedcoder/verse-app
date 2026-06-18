"use client";

import React from 'react';

interface Author {
  id: string;
  name: string;
  image: string | null;
  poemCount: number;
  likesCount: number;
}

interface TopAuthorsProps {
  authors: Author[];
}

export const TopAuthors: React.FC<TopAuthorsProps> = ({ authors }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', backdropFilter: 'blur(4px)', padding: '24px', borderRadius: '32px', border: 'none', color: 'var(--text-primary)', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Top Performing Poets
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>Poets driving platform catalog size</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'space-around' }}>
        {authors.map((author, index) => (
          <div key={author.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Rank badge */}
            <span style={{ fontSize: '14px', fontWeight: 700, color: index === 0 ? '#b45309' : 'var(--text-secondary)', width: '16px' }}>
              #{index + 1}
            </span>

            {/* Avatar */}
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-secondary)', flexShrink: 0, border: '1px solid var(--border-secondary)' }}>
              <img 
                src={author.image && author.image.startsWith('http') ? author.image : `https://i.pravatar.cc/100?img=${(index * 5) + 1}`} 
                alt={author.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Details */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {author.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', gap: '8px' }}>
                <span>{author.poemCount} Verses</span>
                <span>•</span>
                <span>{author.likesCount} Likes</span>
              </div>
            </div>
          </div>
        ))}
        {authors.length === 0 && (
          <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>No top performing poets found.</p>
        )}
      </div>
    </div>
  );
};
