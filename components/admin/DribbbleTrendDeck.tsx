"use client";

import React, { useState } from 'react';

interface DailyData {
  day: string;
  ops?: number;  // Normalized verses created
  data?: number; // Normalized poet signups
  empty: boolean;
  tooltipOps?: string;   // e.g. "6 verses"
  tooltipData?: string;  // e.g. "16 sign-ups"
}

interface DribbbleTrendDeckProps {
  chartData: DailyData[];
  totalPoems: number;
  vibeConfigured: number;
}

export const DribbbleTrendDeck: React.FC<DribbbleTrendDeckProps> = ({ 
  chartData, 
  totalPoems, 
  vibeConfigured 
}) => {
  const [activeMetric, setActiveMetric] = useState<'verses' | 'signups'>('verses');

  // Find max values to scale SVG coordinates cleanly
  // If the chartData represents the normalized coordinates (0.0 to 1.0), we can use them directly!
  // Let's check: chartData has ops (for verses) and data (for signups) as normalized numbers from 0 to 1.0.
  // This is perfect!

  const width = 600;
  const height = 180;
  const padding = 20;

  // Generate SVG path coordinates
  const points = chartData.map((d, index) => {
    const divisor = Math.max(1, chartData.length - 1);
    const x = padding + (index * (width - padding * 2)) / divisor;
    const normalizedVal = activeMetric === 'verses' ? (d.ops || 0) : (d.data || 0);
    // Scale y coordinate so that 0 is at bottom (height - padding) and 1.0 is at top (padding)
    const y = height - padding - normalizedVal * (height - padding * 2);
    return { x, y, day: d.day, tooltip: activeMetric === 'verses' ? d.tooltipOps : d.tooltipData, isEmpty: d.empty };
  });

  // Construct SVG Path d string for line and area fill
  let linePath = '';
  let areaPath = '';

  if (points.length > 0) {
    // Smooth spline approximation or simple straight lines. Clean straight lines look extremely modern on Dribbble!
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      linePath += ` L ${points[i].x} ${points[i].y}`;
    }
    // Close the area path for the translucent gradient fill
    areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  }

  // Calculate percentages for Vibe distribution donut
  const vibePct = totalPoems > 0 ? Math.round((vibeConfigured / totalPoems) * 100) : 0;
  const classicPct = 100 - vibePct;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', margin: '32px 0', boxSizing: 'border-box' }}>
      
      {/* 1. LEFT PANEL: Platform Performance Area Spline (The Widescreen Trend Chart) */}
      <div 
        style={{ 
          background: 'var(--bg-primary)', 
          borderRadius: '32px', 
          padding: '24px', 
          border: '1px solid var(--border-secondary)', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)', 
          color: 'var(--text-primary)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontWeight: 600 }}>Analytics</span>
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '4px 0 0 0', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Platform Activity Trends</h3>
          </div>

          {/* Metric Selector pills */}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '2px', borderRadius: '100px' }}>
            <button 
              onClick={() => setActiveMetric('verses')}
              style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '100px', border: 'none', background: activeMetric === 'verses' ? 'var(--bg-primary)' : 'transparent', color: activeMetric === 'verses' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              Published Verses
            </button>
            <button 
              onClick={() => setActiveMetric('signups')}
              style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '100px', border: 'none', background: activeMetric === 'signups' ? 'var(--bg-primary)' : 'transparent', color: activeMetric === 'signups' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              Poet Sign-ups
            </button>
          </div>
        </div>

        {/* Gorgeous Widescreen SVG Spline Chart */}
        <div style={{ position: 'relative', width: '100%', height: `${height}px`, marginTop: '12px' }}>
          <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={activeMetric === 'verses' ? 'var(--text-primary)' : '#E6F89F'} stopOpacity="0.15" />
                <stop offset="100%" stopColor={activeMetric === 'verses' ? 'var(--text-primary)' : '#E6F89F'} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Guide lines */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--bg-secondary)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="var(--bg-secondary)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--bg-secondary)" strokeWidth="1" />

            {/* Area Fill */}
            {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}

            {/* Stroke Line */}
            {linePath && (
              <path 
                d={linePath} 
                fill="none" 
                stroke={activeMetric === 'verses' ? 'var(--text-primary)' : '#b4c900'} 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            )}

            {/* Active Data Points */}
            {points.map((pt, i) => {
              if (pt.isEmpty) return null;
              return (
                <g key={i}>
                  {/* Glowing dot on hover */}
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r="5" 
                    fill={activeMetric === 'verses' ? 'var(--text-primary)' : '#E6F89F'} 
                    stroke="var(--bg-primary)" 
                    strokeWidth="2" 
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                  />
                  
                  {/* Miniature Tooltip Label on top of dots */}
                  <text 
                    x={pt.x} 
                    y={pt.y - 12} 
                    textAnchor="middle" 
                    fontSize="10px" 
                    fontWeight="700" 
                    fill="var(--text-primary)"
                  >
                    {pt.tooltip ? pt.tooltip.split(' ')[0] : '0'}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* X-Axis labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 10px 0 10px', fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', borderTop: '1px solid var(--bg-secondary)', marginTop: '12px' }}>
          {chartData.map((d, i) => (
            <span key={i}>{d.day}</span>
          ))}
        </div>
      </div>

      {/* 2. RIGHT PANEL: Privacy/Sharing Balance Donut/Pill Ring (Catalog Balance) */}
      <div 
        style={{ 
          background: 'var(--bg-primary)', 
          borderRadius: '32px', 
          padding: '24px', 
          border: '1px solid var(--border-secondary)', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)', 
          color: 'var(--text-primary)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontWeight: 600 }}>Curation</span>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '4px 0 0 0', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Catalog Balance</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Public sharing vs private journals</p>
        </div>

        {/* Visual Donut Ring using simple, stunning CSS concentric border circles */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0' }}>
          <div 
            style={{ 
              position: 'relative', 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              background: `concentric-gradient(var(--text-primary) 0deg ${vibePct}%, var(--border-secondary) ${vibePct}% 360deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 8px rgba(0,0,0,0.05)'
            }}
          >
            {/* Center Cutout */}
            <div 
              style={{ 
                width: '74px', 
                height: '74px', 
                borderRadius: '50%', 
                background: 'var(--bg-secondary)', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{vibePct}%</span>
              <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-tertiary)', marginTop: '4px', textTransform: 'uppercase' }}>Public</span>
            </div>
          </div>
        </div>

        {/* Color Legends */}
        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '12px', fontWeight: 500, borderTop: '1px solid var(--bg-secondary)', paddingTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-primary)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Public ({vibeConfigured})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--border-secondary)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Private ({totalPoems - vibeConfigured})</span>
          </div>
        </div>
      </div>

    </div>
  );
};
export default DribbbleTrendDeck;
