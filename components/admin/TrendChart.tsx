"use client";

import React, { useState } from 'react';

interface PoemData {
  id: string;
  title: string;
  author: string;
  count: number;
}

interface TrendChartProps {
  topLiked: PoemData[];
  topCommented: PoemData[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ topLiked, topCommented }) => {
  const [metric, setMetric] = useState<'liked' | 'commented'>('liked');
  const currentData = metric === 'liked' ? topLiked : topCommented;
  const maxCount = Math.max(...currentData.map(d => d.count), 1);

  return (
    <div style={{ background: 'var(--bg-primary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-secondary)', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)', color: 'var(--text-primary)', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Top Performing Verses</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Most engaged publications on the platform</p>
        </div>
        
        {/* Toggle Switches */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '2px', borderRadius: '100px' }}>
          <button 
            onClick={() => setMetric('liked')}
            style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '100px', border: 'none', background: metric === 'liked' ? 'white' : 'transparent', color: metric === 'liked' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', boxShadow: metric === 'liked' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none', transition: 'all 0.15s ease' }}
          >
            Likes
          </button>
          <button 
            onClick={() => setMetric('commented')}
            style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '100px', border: 'none', background: metric === 'commented' ? 'white' : 'transparent', color: metric === 'commented' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', boxShadow: metric === 'commented' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none', transition: 'all 0.15s ease' }}
          >
            Comments
          </button>
        </div>
      </div>

      {/* Bar Chart list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {currentData.map((poem, index) => {
          const widthPct = Math.max(8, Math.min(100, Math.round((poem.count / maxCount) * 100)));
          return (
            <div key={poem.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                  {index + 1}. "{poem.title}"
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                  by <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{poem.author}</strong>
                </span>
              </div>
              
              {/* Proportional Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, height: '8px', background: 'var(--bg-secondary)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${widthPct}%`, 
                      height: '100%', 
                      background: metric === 'liked' ? 'var(--text-primary)' : '#E6F89F', 
                      borderRadius: '100px',
                      transition: 'width 0.5s ease-in-out' 
                    }} 
                  />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '40px', textAlign: 'right', color: 'var(--text-primary)' }}>
                  {poem.count}
                </span>
              </div>
            </div>
          );
        })}
        {currentData.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', margin: '16px 0' }}>No content data available.</p>
        )}
      </div>
    </div>
  );
};
export default TrendChart;
