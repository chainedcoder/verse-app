"use client"

import { useState, useTransition } from "react"
import { changePassword } from "@/app/actions/account"

export default function PasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  async function action(formData) {
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const res = await changePassword(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        setSuccess(true)
      }
    })
  }

  return (
    <form action={action} className="card">
      <h3 className="font-semibold text-lg" style={{ marginBottom: '24px' }}>Change Your Password</h3>
      
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm" style={{ padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md text-sm" style={{ padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>Password successfully updated.</div>}

      <div className="space-y-4" style={{ maxWidth: '480px' }}>
        <div className="form-group">
          <label className="form-label">Current Password</label>
          <input type="password" name="currentPassword" placeholder="Enter Current Password" required className="input" />
        </div>
        
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input type="password" name="newPassword" placeholder="Enter New Password" required className="input" />
        </div>
        
        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <input type="password" name="confirmNewPassword" placeholder="Confirm New Password" required className="input" />
        </div>
      </div>

      <div style={{ marginTop: '32px', marginBottom: '24px', borderTop: '1px solid var(--border-tertiary)', paddingTop: '24px' }}>
        <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>Password requirements:</h4>
        <p className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '14px' }}>Ensure that these requirements are met:</p>
        <ul className="text-sm text-gray-500 space-y-1" style={{ color: 'var(--text-secondary)', fontSize: '13px', paddingLeft: '20px', listStyleType: 'disc' }}>
          <li>Minimum 8 characters long - the more, the better</li>
          <li>At least one lowercase character</li>
          <li>At least one uppercase character</li>
          <li>At least one number, symbol, or whitespace character</li>
        </ul>
      </div>

      <div className="flex gap-3" style={{ display: 'flex', gap: '12px' }}>
        <button type="submit" disabled={isPending} className="btn btn-primary" style={{ minWidth: '140px' }}>
          {isPending ? "Saving..." : "Save Changes"}
        </button>
        <button type="button" className="btn btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  )
}
