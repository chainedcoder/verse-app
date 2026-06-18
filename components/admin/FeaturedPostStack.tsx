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

interface FeaturedPostStackProps {
  initialFeatured: FeaturedPost[];
}

export const FeaturedPostStack: React.FC<FeaturedPostStackProps> = ({ initialFeatured }) => {
  const [featuredList, setFeaturedList] = useState<FeaturedPost[]>(initialFeatured);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchQueryResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newList = [...featuredList];
    const temp = newList[index];
    newList[index] = newList[index - 1];
    newList[index - 1] = temp;
    setFeaturedList(newList);
  };

  const moveDown = (index: number) => {
    if (index === featuredList.length - 1) return;
    const newList = [...featuredList];
    const temp = newList[index];
    newList[index] = newList[index + 1];
    newList[index + 1] = temp;
    setFeaturedList(newList);
  };

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

      await togglePoemFeatured(poem.id, true);
    } catch (e) {
      console.error(e);
      setFeaturedList(initialFeatured);
    }
  };

  const removeFromFeatured = async (poemId: string) => {
    try {
      setFeaturedList(prev => prev.filter(p => p.id !== poemId));
      if (expandedId === poemId) setExpandedId(null);
      await togglePoemFeatured(poemId, false);
    } catch (e) {
      console.error(e);
      setFeaturedList(initialFeatured);
    }
  };

  return (
    <div style={{ background: 'var(--bg-primary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-secondary)', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)', color: 'var(--text-primary)', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Featured Curation Queue</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Manage and re-order homepage masterpieces</p>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search poems to feature..."
          style={{ width: '100%', padding: '10px 16px', fontSize: '13px', borderRadius: '100px', border: '1px solid var(--border-secondary)', outline: 'none', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
        />
        {isSearching && (
          <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: 'var(--text-tertiary)' }}>searching...</span>
        )}
        
        {/* Results */}
        {searchResults.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)', borderRadius: '12px', marginTop: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: '160px', overflowY: 'auto' }}>
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
                <button style={{ background: '#E6F89F', border: 'none', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>+ Add</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visual Queue list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
        {featuredList.map((post, index) => {
          const isExpanded = expandedId === post.id;
          return (
            <div 
              key={post.id} 
              style={{ border: '1px solid var(--border-secondary)', borderRadius: '12px', padding: '12px 16px', background: isExpanded ? 'var(--bg-secondary)' : 'var(--bg-primary)', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
              onClick={() => setExpandedId(isExpanded ? null : post.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ overflow: 'hidden', flex: 1, paddingRight: '12px' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>"{post.title}"</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>by {post.author.name}</div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                  <button disabled={index === 0} onClick={() => moveUp(index)} style={{ background: 'none', border: 'none', padding: '2px', cursor: index === 0 ? 'default' : 'pointer', color: index === 0 ? 'var(--border-secondary)' : 'var(--text-primary)', fontSize: '13px' }}>▲</button>
                  <button disabled={index === featuredList.length - 1} onClick={() => moveDown(index)} style={{ background: 'none', border: 'none', padding: '2px', cursor: index === featuredList.length - 1 ? 'default' : 'pointer', color: index === featuredList.length - 1 ? 'var(--border-secondary)' : 'var(--text-primary)', fontSize: '13px' }}>▼</button>
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-secondary)' }} onClick={(e) => e.stopPropagation()}>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '0 0 10px 0', lineHeight: 1.4 }}>"{post.excerpt}"</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Curation Rank: #{index + 1}</span>
                    <button onClick={() => removeFromFeatured(post.id)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 500, cursor: 'pointer' }}>Remove</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {featuredList.length === 0 && (
          <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', textAlign: 'center', padding: '16px 0', border: '1px dashed var(--border-secondary)', borderRadius: '12px' }}>No featured poems in queue.</p>
        )}
      </div>
    </div>
  );
};
export default FeaturedPostStack;
