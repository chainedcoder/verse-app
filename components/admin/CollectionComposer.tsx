"use client";

import React, { useState, useEffect } from 'react';
import { togglePoemFeatured } from '@/app/actions/admin';
import { searchPoems } from '@/app/actions/poems';

interface FeaturedPost {
  id: string;
  title: string;
  excerpt?: string;
  author: {
    name: string | null;
  };
}

interface CollectionComposerProps {
  initialFeatured: FeaturedPost[];
}

export const CollectionComposer: React.FC<CollectionComposerProps> = ({ initialFeatured }) => {
  const [featuredList, setFeaturedList] = useState<FeaturedPost[]>(initialFeatured);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchQueryResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Expanded card options state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  // Curation configurations (Schedules & Expirations)
  const [publishImmediate, setPublishImmediate] = useState<Record<string, boolean>>({});
  const [publishDates, setPublishDates] = useState<Record<string, string>>({});
  const [indefiniteCurations, setIndefiniteCurations] = useState<Record<string, boolean>>({});
  const [expireDates, setExpireDates] = useState<Record<string, string>>({});

  // Drag and drop horizontal reordering state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Search logic (debounced)
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const query = searchQuery.trim();
      if (!query) {
        setSearchQueryResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const { poems } = await searchPoems(query);
        const filtered = (poems || []).filter(p => !featuredList.some(f => f.id === p.id));
        setSearchQueryResults(filtered);
      } catch (e) {
        console.error("Error searching poems:", e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, featuredList]);

  // Stable Hash-based Color Palette Theme Mapped directly to Poem IDs
  const getStableTheme = (id: string) => {
    const classes = ['composer-theme-blue', 'composer-theme-pink', 'composer-theme-orange', 'composer-theme-purple'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % classes.length;
    return classes[idx];
  };

  // Reordering controls (manual clicks)
  const moveLeft = (index: number) => {
    if (index === 0) return;
    const newList = [...featuredList];
    const temp = newList[index];
    newList[index] = newList[index - 1];
    newList[index - 1] = temp;
    setFeaturedList(newList);
  };

  const moveRight = (index: number) => {
    if (index === featuredList.length - 1) return;
    const newList = [...featuredList];
    const temp = newList[index];
    newList[index] = newList[index + 1];
    newList[index + 1] = temp;
    setFeaturedList(newList);
  };

  // HTML5 Native Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Required to enable dropping!
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const newList = [...featuredList];
    const draggedItem = newList[draggedIndex];
    newList.splice(draggedIndex, 1);
    newList.splice(targetIndex, 0, draggedItem);
    setFeaturedList(newList);
    setDraggedIndex(null);
  };

  // Add poem to featured list
  const addPoemToFeatured = async (poem: any) => {
    try {
      const newPost: FeaturedPost = {
        id: poem.id,
        title: poem.title,
        excerpt: poem.excerpt || "No excerpt config available.",
        author: { name: poem.author.name || "Anonymous" }
      };
      setFeaturedList([newPost, ...featuredList]);
      setSearchQuery('');
      setSearchQueryResults([]);

      // Initialize scheduling states
      setPublishImmediate(prev => ({ ...prev, [poem.id]: true }));
      setIndefiniteCurations(prev => ({ ...prev, [poem.id]: true }));

      await togglePoemFeatured(poem.id, true);
    } catch (e) {
      console.error(e);
      setFeaturedList(initialFeatured);
    }
  };

  // Remove from featured queue
  const removeFromFeatured = async (poemId: string) => {
    try {
      setFeaturedList(prev => prev.filter(p => p.id !== poemId));
      if (expandedId === poemId) setExpandedId(null);
      setConfirmRemoveId(null);
      await togglePoemFeatured(poemId, false);
    } catch (e) {
      console.error(e);
      setFeaturedList(initialFeatured);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', backdropFilter: 'blur(4px)', border: 'none', padding: '24px', borderRadius: '32px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', minHeight: '440px', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Editorial Curation Canvas
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Drag card covers to sequence or click cards to manage release schedules</p>
      </div>

      {/* Search to Feature */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search verses to add to cover canvas..."
          style={{ width: '100%', padding: '10px 16px', fontSize: '12px', borderRadius: '100px', border: '1px solid var(--border-secondary)', outline: 'none', background: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
        />
        {isSearching && (
          <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: 'var(--text-tertiary)' }}>searching...</span>
        )}
        
        {searchResults.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)', borderRadius: '16px', marginTop: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: '160px', overflowY: 'auto' }}>
            {searchResults.map(p => (
              <div 
                key={p.id} 
                onClick={() => addPoemToFeatured(p)}
                style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid var(--bg-secondary)' }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: '12px' }}>"{p.title}"</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>by {p.author.name}</div>
                </div>
                <button style={{ background: '#E6F89F', border: 'none', padding: '4px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, color: '#1a1a1a' }}>+ Add</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* horizontal scroll book cover cards with DRAG & DROP support */}
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px', flex: 1, alignItems: 'center' }}>
        {featuredList.map((post, index) => {
          const isSelected = expandedId === post.id;
          const isConfirmingRemove = confirmRemoveId === post.id;

          // Stable color theme class that MOVES with the card!
          const themeClass = getStableTheme(post.id);

          // Get local state values or defaults
          const isImmediate = publishImmediate[post.id] !== false;
          const pubDate = publishDates[post.id] || '';
          const isIndefinite = indefiniteCurations[post.id] !== false;
          const expDate = expireDates[post.id] || '';

          return (
            <div 
              key={post.id}
              className={themeClass}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onClick={() => {
                setExpandedId(isSelected ? null : post.id);
                setConfirmRemoveId(null);
              }}
              style={{
                flexShrink: 0,
                width: isSelected ? '260px' : '120px',
                height: '240px',
                background: 'var(--comp-bg)',
                border: isSelected ? `2px solid var(--comp-text)` : '1px solid var(--comp-border)',
                borderRadius: '16px',
                padding: '16px 12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isSelected ? '0 8px 24px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.04)',
                position: 'relative',
                cursor: 'grab',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s, box-shadow 0.2s',
                overflow: 'hidden'
              }}
            >
              {/* Cover Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '10px', color: 'var(--comp-text)', fontWeight: 700 }}>
                <span>VOL {index + 1}</span>
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmRemoveId(post.id);
                  }}
                  style={{ cursor: 'pointer', fontSize: '12px' }}
                  title="Remove from featured list"
                >
                  ✕
                </span>
              </div>

              {/* Standard View: Simple Title & Author */}
              {!isSelected && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '12px 0' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, textAlign: 'center', color: 'var(--comp-text)', margin: 0, fontFamily: 'Georgia, serif', lineHeight: 1.3, maxHeight: '80px', overflow: 'hidden' }}>
                    "{post.title}"
                  </h4>
                </div>
              )}

              {/* Expanded Interactive Control Area */}
              {isSelected && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', overflowY: 'auto', paddingRight: '2px' }}
                >
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--comp-text)', margin: 0, fontFamily: 'Georgia, serif' }}>"{post.title}"</h4>
                  
                  {/* Inline Removal Confirmation */}
                  {isConfirmingRemove ? (
                    <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.15)', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Confirm Curation Removal?</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={() => removeFromFeatured(post.id)}
                          style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', padding: '4px 0', borderRadius: '6px', fontSize: '10px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Yes
                        </button>
                        <button 
                          onClick={() => setConfirmRemoveId(null)}
                          style={{ flex: 1, background: 'rgba(0,0,0,0.05)', color: 'var(--comp-text)', border: '1px solid var(--comp-border)', padding: '4px 0', borderRadius: '6px', fontSize: '10px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Curation Go-Live Scheduler */}
                      <div style={{ fontSize: '10px' }}>
                        <label style={{ fontWeight: 700, display: 'block', color: 'var(--comp-text)', marginBottom: '4px' }}>Release Schedule</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <input 
                            type="checkbox" 
                            id={`imm-${post.id}`}
                            checked={isImmediate}
                            onChange={(e) => setPublishImmediate(prev => ({ ...prev, [post.id]: e.target.checked }))}
                            style={{ cursor: 'pointer' }}
                          />
                          <label htmlFor={`imm-${post.id}`} style={{ color: 'var(--comp-text)', opacity: 0.8, cursor: 'pointer', fontWeight: 500 }}>Publish Immediately</label>
                        </div>
                        {!isImmediate && (
                          <input 
                            type="datetime-local" 
                            value={pubDate}
                            onChange={(e) => setPublishDates(prev => ({ ...prev, [post.id]: e.target.value }))}
                            style={{ width: '100%', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none', background: 'rgba(255,255,255,0.5)', color: theme.text, boxSizing: 'border-box' }}
                          />
                        )}
                      </div>

                      {/* Curation Expiration Scheduler */}
                      <div style={{ fontSize: '10px' }}>
                        <label style={{ fontWeight: 700, display: 'block', color: 'var(--comp-text)', marginBottom: '4px' }}>Expiration Timeline</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <input 
                            type="checkbox" 
                            id={`exp-${post.id}`}
                            checked={isIndefinite}
                            onChange={(e) => setIndefiniteCurations(prev => ({ ...prev, [post.id]: e.target.checked }))}
                            style={{ cursor: 'pointer' }}
                          />
                          <label htmlFor={`exp-${post.id}`} style={{ color: 'var(--comp-text)', opacity: 0.8, cursor: 'pointer', fontWeight: 500 }}>Indefinite Curation</label>
                        </div>
                        {!isIndefinite && (
                          <input 
                            type="datetime-local" 
                            value={expDate}
                            onChange={(e) => setExpireDates(prev => ({ ...prev, [post.id]: e.target.value }))}
                            style={{ width: '100%', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none', background: 'rgba(255,255,255,0.5)', color: theme.text, boxSizing: 'border-box' }}
                          />
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Cover Footer */}
              {!isConfirmingRemove && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderTop: isSelected ? '1px solid rgba(0,0,0,0.06)' : 'none', paddingTop: isSelected ? '8px' : '0' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--comp-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60px' }}>
                    {post.author.name}
                  </span>

                  <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                    <button 
                      disabled={index === 0} 
                      onClick={() => moveLeft(index)} 
                      style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid var(--comp-border)', width: '18px', height: '16px', borderRadius: '4px', fontSize: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--comp-text)' }}
                    >
                      ◀
                    </button>
                    <button 
                      disabled={index === featuredList.length - 1} 
                      onClick={() => moveRight(index)} 
                      style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid var(--comp-border)', width: '18px', height: '16px', borderRadius: '4px', fontSize: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--comp-text)' }}
                    >
                      ▶
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {featuredList.length === 0 && (
          <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', textAlign: 'center', width: '100%' }}>No cover cards curated. Use search bar above.</p>
        )}
      </div>
    </div>
  );
};
export default CollectionComposer;
