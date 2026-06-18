"use client"

import { DollarSign, Award, Users, TrendingUp } from 'lucide-react'

export default function FinanceDashboardClient({ stats, recentSubscribers }) {
  const conversionRate = stats.totalUsers > 0 ? (stats.premiumUsers / stats.totalUsers) * 100 : 0

  return (
    <main className="admin-main">

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Finance &amp; Revenue</h1>
          <p className="admin-page-subtitle">Monthly recurring revenue, billing tiers, and subscriber overview.</p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="finance-kpi-grid">
        <div className="finance-kpi-card">
          <div className="finance-kpi-icon finance-kpi-icon--accent">
            <DollarSign size={20} />
          </div>
          <div className="finance-kpi-body">
            <span className="finance-kpi-label">Monthly Revenue (MRR)</span>
            <span className="finance-kpi-value">${stats.mrr.toFixed(2)}</span>
          </div>
        </div>

        <div className="finance-kpi-card">
          <div className="finance-kpi-icon finance-kpi-icon--gold">
            <Award size={20} />
          </div>
          <div className="finance-kpi-body">
            <span className="finance-kpi-label">Premium Subscribers</span>
            <span className="finance-kpi-value">{stats.premiumUsers} <span className="finance-kpi-unit">active</span></span>
          </div>
        </div>

        <div className="finance-kpi-card">
          <div className="finance-kpi-icon finance-kpi-icon--teal">
            <Users size={20} />
          </div>
          <div className="finance-kpi-body">
            <span className="finance-kpi-label">Total Platform Users</span>
            <span className="finance-kpi-value">{stats.totalUsers} <span className="finance-kpi-unit">registered</span></span>
          </div>
        </div>

        <div className="finance-kpi-card">
          <div className="finance-kpi-icon finance-kpi-icon--green">
            <TrendingUp size={20} />
          </div>
          <div className="finance-kpi-body">
            <span className="finance-kpi-label">Conversion Rate</span>
            <span className="finance-kpi-value">{conversionRate.toFixed(1)}<span className="finance-kpi-unit">%</span></span>
          </div>
        </div>
      </div>

      {/* Lower Section */}
      <div className="finance-lower-grid">

        {/* Donut Chart */}
        <div className="card finance-donut-card">
          <h3 className="finance-card-title">Paid vs Free</h3>
          <p className="finance-card-subtitle">Ratio of premium to free users</p>

          <div className="finance-donut-container">
            <div className="finance-donut-ring">
              <svg viewBox="0 0 36 36" className="finance-donut-svg">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border-primary)" strokeWidth="2.5" />
                <circle
                  cx="18" cy="18" r="15.915" fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeDasharray={`${conversionRate} ${100 - conversionRate}`}
                  strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
              </svg>
              <div className="finance-donut-center">
                <span className="finance-donut-pct">{conversionRate.toFixed(1)}%</span>
                <span className="finance-donut-pct-label">paid</span>
              </div>
            </div>
          </div>

          <div className="finance-donut-legend">
            <div className="finance-legend-row">
              <span className="finance-legend-dot" style={{ background: 'var(--accent)' }} />
              <span className="finance-legend-label">Premium ({stats.premiumUsers})</span>
            </div>
            <div className="finance-legend-row">
              <span className="finance-legend-dot" style={{ background: 'var(--border-primary)' }} />
              <span className="finance-legend-label">Free ({stats.totalUsers - stats.premiumUsers})</span>
            </div>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="card finance-table-card">
          <div className="finance-table-header">
            <div>
              <h3 className="finance-card-title">Active Premium Subscribers</h3>
              <p className="finance-card-subtitle">Your paid subscribers from the database</p>
            </div>
          </div>

          <div className="finance-table-scroll">
            <table className="finance-table">
              <thead>
                <tr>
                  <th>Subscriber</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentSubscribers.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="finance-subscriber-cell">
                        <div className="finance-avatar">
                          {s.image
                            ? <img src={s.image} alt="" />
                            : <span>{(s.name?.[0] || s.email?.[0] || 'U').toUpperCase()}</span>}
                        </div>
                        <div>
                          <div className="finance-subscriber-name">{s.name || 'Anonymous'}</div>
                          <div className="finance-subscriber-email">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="finance-plan-badge">{s.plan}</span></td>
                    <td>
                      <span className={`finance-status-badge finance-status-badge--${s.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="finance-date-cell">{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {recentSubscribers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="finance-empty-row">No active premium subscribers in the database yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  )
}
