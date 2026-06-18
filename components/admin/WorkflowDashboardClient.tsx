"use client";

import React, { useState, useEffect } from 'react';

import Header from '@/components/admin/Header';
import StatsCards from '@/components/admin/StatsCards';
import PromoCard from '@/components/admin/PromoCard';
import RightSidebar from '@/components/admin/RightSidebar';
import { TimeTracker } from '@/components/admin/TimeTracker';
import { TimerList } from '@/components/admin/TimerList';
import { useTimers } from '@/components/admin/context/TimerContext';
import { updateReportStatus } from '@/app/actions/admin';

// Import our completely redesigned premium visual Dribbble-level widgets
import { DribbbleTrendDeck } from './DribbbleTrendDeck';
import { CollectionComposer } from './CollectionComposer';
import { RecentVersesTable } from './RecentVersesTable';
import { LiveModerationFeed } from './LiveModerationFeed';

interface WorkflowDashboardClientProps {
  stats: {
    card1Title: string;
    card1Value: number | string;
    card1Progress: number;
    card1Sub: string;
    
    card2Title: string;
    card2Value: number | string;
    card2Progress: number;
    card2Sub: string;

    totalPoems?: number;
    publicPoemsCount?: number;
    privatePoemsCount?: number;
  };
  chartData: Array<{
    day: string;
    ops?: number;
    data?: number;
    empty: boolean;
    tooltipOps?: string;
    tooltipData?: string;
  }>;
  featuredList: Array<{
    id: string;
    title: string;
    excerpt?: string;
    author: {
      name: string | null;
    };
  }>;
  recentPoems: Array<{
    id: string;
    title: string;
    author: string;
    likes: number;
    comments: number;
    hasVibe: boolean;
    createdAt: string;
  }>;
  bannedPoems?: Array<{
    id: string;
    title: string;
    author: string;
    likes: number;
    comments: number;
    hasVibe: boolean;
    createdAt: string;
  }>;
  reportsList: Array<{
    id: string;
    reporter: string;
    reportedEntity: string;
    reportedContent: string;
    reportedEntityId: string;
    type: 'Poem' | 'Comment';
    reason: string;
    status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
    createdAt: string;
  }>;
}

const WorkflowDashboardClient: React.FC<WorkflowDashboardClientProps> = ({ 
  stats, 
  chartData,
  featuredList,
  recentPoems,
  bannedPoems = [],
  reportsList
}) => {
  const { urgentTimer } = useTimers();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Local state for reports list to allow instant taking down / dismissing
  const [reports, setReports] = useState<any[]>(reportsList);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  // Sync state with props when changed
  useEffect(() => {
    Promise.resolve().then(() => {
      setReports(reportsList);
    });
  }, [reportsList]);

  const totalPoemsCount = stats.totalPoems ?? (stats.card1Sub ? parseInt(stats.card1Sub.split(' ')[1]) || 79 : 79);
  const vibeConfiguredCount = stats.publicPoemsCount ?? (typeof stats.card1Value === 'number' ? stats.card1Value : 10);

  // Handle Moderation action from the TOP-LEVEL widescreen modal
  const handleModerationAction = async (reportId: string, nextStatus: 'RESOLVED' | 'DISMISSED') => {
    try {
      // Optimistic state updates
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: nextStatus } : r));
      setSelectedReport(null);

      // Call Backend Server Action
      await updateReportStatus(reportId, nextStatus);
    } catch (e) {
      console.error("Error executing moderation action:", e);
    }
  };

  return (
    <>

      {/* Main Content Pane */}
      <main 
        className="admin-main" 
        style={{ 
          transition: 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          marginRight: isSidebarCollapsed ? '0' : '320px',
          width: 'auto',
          boxSizing: 'border-box'
        }}
      >
        <Header />
        
        {/* Top Overview Cards Grid */}
        <div className="admin-grid-top">
          <StatsCards {...stats} />
          <TimeTracker timer={urgentTimer} />
          <PromoCard />
        </div>

        {/* Mid Row: Dribbble Widescreen Area Spline Trend & Donut Deck */}
        <DribbbleTrendDeck 
          chartData={chartData} 
          totalPoems={totalPoemsCount}
          vibeConfigured={vibeConfiguredCount}
        />

        {/* Lower Row: Publications Postcards & Curation Book Covers Carousel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px', margin: '32px 0' }}>
          <div style={{ flex: 1.5 }}>
            <RecentVersesTable recentPoems={recentPoems} />
          </div>
          <div style={{ flex: 1 }}>
            <CollectionComposer initialFeatured={featuredList} />
          </div>
        </div>

        {/* Bottom Row: Live Appeals Moderation & Timer list */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', margin: '32px 0' }}>
          <div style={{ flex: 2.2 }}>
            <LiveModerationFeed initialReports={reports} bannedPoems={bannedPoems} onReportSelect={setSelectedReport} />
          </div>
          <div className="admin-grid-bottom" style={{ flex: 1, gridTemplateColumns: '1fr', minHeight: 'auto' }}>
            <TimerList />
          </div>
        </div>
      </main>

      {/* Collapsible Right Sidebar Container */}
      <div 
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: '320px',
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
          zIndex: 9999,
          transform: isSidebarCollapsed ? 'translateX(100%)' : 'translateX(0)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isSidebarCollapsed ? 'none' : '-4px 0 24px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <RightSidebar />
      </div>

      {/* Pull Tab Indicator Tab */}
      <button 
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        style={{
          position: 'fixed',
          right: isSidebarCollapsed ? '0' : '320px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '36px',
          height: '72px',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-secondary)',
          borderRight: 'none',
          borderRadius: '16px 0 0 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '-2px 0 12px rgba(0,0,0,0.12)'
        }}
        aria-label={isSidebarCollapsed ? "Expand resources drawer" : "Collapse resources drawer"}
        title={isSidebarCollapsed ? "Show Resources" : "Hide Resources"}
      >
        {isSidebarCollapsed ? (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        ) : (
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </button>

      {/* 🛑 HIGH-FIDELITY WIDESCREEN INVESTIGATION MODAL (Rendered at top-level viewport) */}
      {selectedReport && (
        <div 
          onClick={() => setSelectedReport(null)}
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.4)', 
            backdropFilter: 'blur(8px)', 
            zIndex: 100000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '24px' 
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: 'var(--bg-secondary)', 
              borderRadius: '24px', 
              padding: '32px', 
              width: '100%', 
              maxWidth: '560px', 
              boxShadow: '0 20px 48px rgba(0,0,0,0.2)',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedReport(null)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'var(--bg-secondary)', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer', fontSize: '12px', color: 'var(--text-primary)' }}
            >
              ✕
            </button>

            {/* Modal Header */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: selectedReport.type === 'Poem' ? '#c2410c' : '#7e22ce', letterSpacing: '0.1em' }}>
                Incident Investigation — #{selectedReport.id}
              </span>
              <h3 style={{ fontSize: '20px', fontWeight: 600, margin: '6px 0 0 0', color: 'var(--text-primary)' }}>
                Verify Flagged Content
              </h3>
            </div>

            {/* Flagged Poem clickable navigation header */}
            <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Target Name:</span>
              {selectedReport.type === 'Poem' && selectedReport.reportedEntityId ? (
                <a 
                  href={`/poem/${selectedReport.reportedEntityId}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '13px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  title="Click to view live verse on the platform"
                >
                  "{selectedReport.reportedEntity}"
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                  </svg>
                </a>
              ) : (
                <strong style={{ color: '#0f172a', fontSize: '13px' }}>"{selectedReport.reportedEntity}"</strong>
              )}
            </div>

            {/* Content Preview Canvas (displays full reported content) */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)', borderRadius: '16px', padding: '16px', marginBottom: '20px', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)', maxHeight: '180px', overflowY: 'auto' }}>
              "{selectedReport.reportedContent}"
            </div>

            {/* Poet & Reporter Meta info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '12px', background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--border-secondary)' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Reporter username:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedReport.reporter}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Reported reason:</span>
                <strong style={{ color: '#ef4444' }}>{selectedReport.reason}</strong>
              </div>
            </div>

            {/* POET / MODERATION RULES GLOSSARY */}
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '16px', padding: '16px', marginBottom: '24px', fontSize: '11px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>🛡️ Administrative Actions Explanation:</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>• <strong style={{ color: 'var(--text-primary)' }}>Take Down Content (Penalize):</strong> Does NOT permanently delete the poem. It safely restricts it from all public feeds and lists. The record remains preserved in the database for compliance audits and potential appeals.</div>
                <div>• <strong style={{ color: 'var(--text-primary)' }}>Dismiss Flag:</strong> Rejects the report as invalid. The flag is cleared and the content remains publicly fully active.</div>
              </div>
            </div>

            {/* Actions Footer */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => handleModerationAction(selectedReport.id, 'DISMISSED')}
                style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '12px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' }}
              >
                Dismiss Flag
              </button>
              <button 
                onClick={() => handleModerationAction(selectedReport.id, 'RESOLVED')}
                style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)', transition: 'background 0.15s' }}
              >
                Take Down Content
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default WorkflowDashboardClient;
