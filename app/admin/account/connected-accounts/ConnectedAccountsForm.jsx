"use client"

import { signIn } from "next-auth/react"

export default function ConnectedAccountsForm({ user }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-lg" style={{ marginBottom: '24px' }}>Linked Accounts</h3>
      
      {user.accounts && user.accounts.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {user.accounts.map(account => (
            <div key={account.id} className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-tertiary)' }}>
              <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <i className={`ti ti-brand-${account.provider.toLowerCase()} text-2xl`} style={{ fontSize: '24px' }}></i>
                <div>
                  <div className="font-semibold" style={{ textTransform: 'capitalize' }}>{account.provider}</div>
                </div>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 500, color: '#15803d', backgroundColor: '#dcfce7', padding: '4px 12px', borderRadius: '9999px' }}>
                Connected
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)' }}>No accounts linked.</p>
      )}
      
      <div className="flex gap-3" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        {(!user.accounts || !user.accounts.some(a => a.provider.toLowerCase() === 'google')) && (
          <button type="button" className="btn btn-ghost" onClick={() => signIn("google")} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <i className="ti ti-brand-google"></i> Link Google
          </button>
        )}
        {(!user.accounts || !user.accounts.some(a => a.provider.toLowerCase() === 'github')) && (
          <button type="button" className="btn btn-ghost" onClick={() => signIn("github")} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <i className="ti ti-brand-github"></i> Link GitHub
          </button>
        )}
      </div>
    </div>
  )
}
