"use client";

import React, { useState, useEffect } from 'react';
import { reinstatePoemAdmin } from '@/app/actions/admin';

interface ReportItem {
  id: string;
  reporter: string;
  reportedEntity: string;
  reportedContent: string;
  reportedEntityId: string;
  type: 'Poem' | 'Comment';
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

interface BannedPoem {
  id: string;
  title: string;
  author: string;
  likes: number;
  comments: number;
  hasVibe: boolean;
  createdAt: string;
}

interface LiveModerationFeedProps {
  initialReports?: ReportItem[];
  bannedPoems?: BannedPoem[];
  onReportSelect?: (report: ReportItem) => void;
}

export const LiveModerationFeed: React.FC<LiveModerationFeedProps> = ({ 
  initialReports = [],
  bannedPoems = [],
  onReportSelect
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'banned'>('reports');
  const [banned, setBanned] = useState<BannedPoem[]>(bannedPoems);
  const [bannedSearchQuery, setBannedSearchQuery] = useState('');

  // Sync state with props
  useEffect(() => {
    setBanned(bannedPoems);
  }, [bannedPoems]);

  const pendingReports = initialReports.filter(r => r.status === 'PENDING');

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + `, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()}`;
  };

  const formatShortDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Reinstate/Unban action
  const handleReinstateClick = async (poemId: string) => {
    try {
      // Optimistically remove from banned list immediately
      setBanned(prev => prev.filter(p => p.id !== poemId));
      // Call Backend Server Action
      await reinstatePoemAdmin(poemId);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter banned list based on search query
  const filteredBanned = banned.filter(p => 
    p.title.toLowerCase().includes(bannedSearchQuery.toLowerCase()) ||
    p.author.toLowerCase().includes(bannedSearchQuery.toLowerCase())
  );

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', backdropFilter: 'blur(4px)', border: 'none', padding: '24px', borderRadius: '32px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', minHeight: '440px', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      
      {/* Header and Tab Switches */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Appeals & Moderation Desk
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            {activeTab === 'reports' 
              ? 'Click review triggers to open full incident investigations' 
              : 'Audit list of flagged verses that have been removed/banned'
            }
          </p>
        </div>
        
        {/* Tab Selection Switches */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '2px', borderRadius: '100px' }}>
          <button 
            onClick={() => setActiveTab('reports')}
            style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '100px', border: 'none', background: activeTab === 'reports' ? 'var(--bg-primary)' : 'transparent', color: activeTab === 'reports' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', boxShadow: activeTab === 'reports' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none', transition: 'all 0.15s ease' }}
          >
            Active Reports ({pendingReports.length})
          </button>
          <button 
            onClick={() => setActiveTab('banned')}
            style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '100px', border: 'none', background: activeTab === 'banned' ? 'var(--bg-primary)' : 'transparent', color: activeTab === 'banned' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', boxShadow: activeTab === 'banned' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none', transition: 'all 0.15s ease' }}
          >
            Recently Banned ({banned.length})
          </button>
        </div>
      </div>

      {/* 1. ACTIVE REPORTS TAB (Pristine High-Fidelity Datatable) */}
      {activeTab === 'reports' && (
        <div className="custom-premium-table-container" style={{ overflowX: 'auto', border: '1px solid var(--border-secondary)', borderRadius: '12px', background: 'var(--bg-secondary)', width: '100%', boxSizing: 'border-box' }}>
          <table className="custom-premium-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', color: 'var(--text-primary)', tableLayout: 'fixed', margin: 0 }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border-secondary)', color: 'var(--text-secondary)', fontWeight: 600, background: 'var(--bg-secondary)' }}>
                <th className="adt-th" style={{ padding: '14px 16px', width: '18%' }}>Verse ID</th>
                <th className="adt-th" style={{ padding: '14px 16px', width: '32%' }}>Title</th>
                <th className="adt-th" style={{ padding: '14px 16px', width: '22%' }}>Reason</th>
                <th className="adt-th" style={{ padding: '14px 16px', width: '15%' }}>Date Flagged</th>
                <th className="adt-th" style={{ padding: '14px 16px', textAlign: 'right', width: '120px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingReports.map((r) => (
                <tr 
                  key={r.id}
                  style={{ borderBottom: '1px solid var(--bg-secondary)', transition: 'background-color 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Verse ID */}
                  <td className="adt-td" style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>
                    #{r.id.substring(0, 8)}...
                  </td>

                  {/* Title / Content - Truncation + Tooltip */}
                  <td 
                    className="adt-td" 
                    style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    title={`"${r.reportedEntity}"`}
                  >
                    "{r.reportedEntity}"
                  </td>

                  {/* Reason - Truncation + Tooltip */}
                  <td className="adt-td" style={{ padding: '14px 16px' }} title={r.reason}>
                    <span style={{ display: 'inline-block', maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', verticalAlign: 'bottom', fontSize: '11px', padding: '4px 10px', borderRadius: '100px', background: '#fffdbf', color: '#854d0e', fontWeight: 500, boxSizing: 'border-box' }}>
                      {r.reason}
                    </span>
                  </td>

                  {/* Date Flagged */}
                  <td className="adt-td" style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {formatShortDate(r.createdAt)}
                  </td>

                  {/* Review Action Trigger */}
                  <td className="adt-td" style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => onReportSelect?.(r)}
                      style={{
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-secondary)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      🔍 Review
                    </button>
                  </td>
                </tr>
              ))}
              {pendingReports.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>No pending reports found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. RECENTLY BANNED TAB (Pristine High-Fidelity Dribbble Datatable) */}
      {activeTab === 'banned' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflow: 'hidden' }}>
          
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              value={bannedSearchQuery}
              onChange={(e) => setBannedSearchQuery(e.target.value)}
              placeholder="Search banned verses by title or poet name..."
              style={{ width: '100%', padding: '10px 16px', fontSize: '12px', borderRadius: '100px', border: '1px solid var(--border-secondary)', outline: 'none', background: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
            />
          </div>

          {/* Table Container with clean height containment */}
          <div className="custom-premium-table-container" style={{ overflowX: 'auto', border: '1px solid var(--border-secondary)', borderRadius: '12px', background: 'var(--bg-secondary)', width: '100%', boxSizing: 'border-box' }}>
            <table className="custom-premium-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', color: 'var(--text-primary)', tableLayout: 'fixed', margin: 0 }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border-secondary)', color: 'var(--text-secondary)', fontWeight: 600, background: 'var(--bg-secondary)' }}>
                  <th className="adt-th" style={{ padding: '14px 16px', width: '30%' }}>Verse Title</th>
                  <th className="adt-th" style={{ padding: '14px 16px', width: '22%' }}>Poet</th>
                  <th className="adt-th" style={{ padding: '14px 16px', textAlign: 'center', width: '15%' }}>Vibe Status</th>
                  <th className="adt-th" style={{ padding: '14px 16px', textAlign: 'center', width: '15%' }}>Engagement</th>
                  <th className="adt-th" style={{ padding: '14px 16px', width: '13%' }}>Banned Date</th>
                  <th className="adt-th" style={{ padding: '14px 16px', textAlign: 'right', width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBanned.map((p, idx) => (
                  <tr 
                    key={p.id}
                    style={{ borderBottom: '1px solid var(--bg-secondary)', transition: 'background-color 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Title - Truncation + Tooltip */}
                    <td 
                      className="adt-td" 
                      style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Georgia, serif', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      title={`"${p.title}"`}
                    >
                      "{p.title}"
                    </td>
                    
                    {/* Poet Avatar + Name - Truncation + Tooltip */}
                    <td className="adt-td" style={{ padding: '14px 16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.author}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)', flexShrink: 0 }}>
                          <img src={`https://i.pravatar.cc/100?img=${(idx * 4) + 2}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.author}</span>
                      </div>
                    </td>

                    {/* Banned Badge */}
                    <td className="adt-td" style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 500, background: '#fee2e2', color: '#ef4444' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                        Banned
                      </span>
                    </td>

                    {/* Engagement */}
                    <td className="adt-td" style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <strong>{p.likes}</strong> ♥
                    </td>

                    {/* Banned Date */}
                    <td className="adt-td" style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={formatDate(p.createdAt)}>
                      {formatDate(p.createdAt)}
                    </td>

                    {/* Action Reinstate Button */}
                    <td className="adt-td" style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleReinstateClick(p.id)}
                        style={{
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-secondary)',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                        </svg>
                        Reinstate
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredBanned.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>No recently banned verses found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};
export default LiveModerationFeed;
