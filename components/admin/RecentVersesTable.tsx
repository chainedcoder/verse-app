"use client";

import React, { useState, useEffect } from 'react';
import { togglePoemFeatured } from '@/app/actions/admin';
import Avatar from '@/components/Avatar';

interface RecentPoem {
  id: string;
  title: string;
  author: string | { name: string; image?: string | null; email?: string };
  likes: number;
  comments: number;
  hasVibe: boolean;
  createdAt: string;
}

interface RecentVersesTableProps {
  recentPoems: RecentPoem[];
}

export const RecentVersesTable: React.FC<RecentVersesTableProps> = ({ recentPoems }) => {
  const [poems, setPoems] = useState<RecentPoem[]>(recentPoems);
  const [featuredIds, setFeaturedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setPoems(recentPoems);
  }, [recentPoems]);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleFeatureClick = async (poemId: string) => {
    try {
      setFeaturedIds(prev => ({ ...prev, [poemId]: true }));
      await togglePoemFeatured(poemId, true);
      
      // Smoothly fade out curation candidates after 800ms
      setTimeout(() => {
        setPoems(prev => prev.filter(p => p.id !== poemId));
      }, 800);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', backdropFilter: 'blur(4px)', border: 'none', padding: '24px', borderRadius: '32px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', minHeight: '440px', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            High-Velocity Curation Feed
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Spike-analyzed trending publications recommended for homepage curations</p>
        </div>
      </div>

      {/* High-Fidelity Curation Datatable with clean height containment */}
      <div className="custom-premium-table-container" style={{ overflowX: 'auto', border: '1px solid var(--border-secondary)', borderRadius: '12px', background: 'var(--bg-secondary)', width: '100%', boxSizing: 'border-box' }}>
        <table className="custom-premium-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', color: 'var(--text-primary)', tableLayout: 'fixed', margin: 0 }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid var(--border-secondary)', color: 'var(--text-secondary)', fontWeight: 600, background: 'var(--bg-secondary)' }}>
              <th className="adt-th" style={{ padding: '14px 16px', width: '30%' }}>Verse Title</th>
              <th className="adt-th" style={{ padding: '14px 16px', width: '22%' }}>Poet</th>
              <th className="adt-th" style={{ padding: '14px 16px', textAlign: 'center', width: '15%' }}>Vibe Theme</th>
              <th className="adt-th" style={{ padding: '14px 16px', textAlign: 'center', width: '10%' }}>Likes</th>
              <th className="adt-th" style={{ padding: '14px 16px', width: '13%' }}>Published At</th>
              <th className="adt-th" style={{ padding: '14px 16px', textAlign: 'right', width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {poems.map((poem, idx) => {
              const isFeatured = featuredIds[poem.id];
              const authorName = typeof poem.author === 'object' && poem.author !== null ? (poem.author.name || 'Anonymous') : String(poem.author || 'Anonymous');
              const authorImage = typeof poem.author === 'object' && poem.author !== null ? poem.author.image : null;

              return (
                <tr 
                  key={poem.id} 
                  style={{ borderBottom: '1px solid var(--bg-secondary)', transition: 'background-color 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Title - Ellipsis + Tooltip */}
                  <td 
                    className="adt-td" 
                    style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Georgia, serif', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    title={`"${poem.title}"`}
                  >
                    "{poem.title}"
                  </td>
                  
                  {/* Poet Avatar + Name - Ellipsis + Tooltip */}
                  <td className="adt-td" style={{ padding: '14px 16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={String(authorName)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                      <Avatar image={authorImage} name={authorName} size="sm" style={{ width: '24px', height: '24px', fontSize: '9px', flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{authorName}</span>
                    </div>
                  </td>

                  {/* Vibe Status Badge */}
                  <td className="adt-td" style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        padding: '4px 10px', 
                        borderRadius: '100px', 
                        fontSize: '11px', 
                        fontWeight: 500,
                        background: poem.hasVibe ? '#e0f2fe' : 'var(--bg-secondary)', 
                        color: poem.hasVibe ? '#0369a1' : 'var(--text-secondary)' 
                      }}
                    >
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: poem.hasVibe ? '#0369a1' : 'var(--text-tertiary)' }} />
                      {poem.hasVibe ? 'Immersive' : 'Classic'}
                    </span>
                  </td>

                  {/* Likes */}
                  <td className="adt-td" style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {poem.likes} ♥
                  </td>

                  {/* Date */}
                  <td className="adt-td" style={{ padding: '14px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={formatDate(poem.createdAt)}>
                    {formatDate(poem.createdAt)}
                  </td>

                  {/* Feature Action Button */}
                  <td className="adt-td" style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      disabled={isFeatured}
                      onClick={() => handleFeatureClick(poem.id)}
                      style={{
                        background: isFeatured ? '#d1fae5' : 'var(--bg-primary)',
                        border: isFeatured ? 'none' : '1px solid var(--border-secondary)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: isFeatured ? 'default' : 'pointer',
                        color: isFeatured ? '#065f46' : 'var(--text-primary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap',
                        boxShadow: isFeatured ? 'none' : '0 1px 2px 0 rgba(0,0,0,0.05)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isFeatured ? '✓ Featured' : '★ Feature'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {poems.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)' }}>No trending candidates remaining.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default RecentVersesTable;
