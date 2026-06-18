"use client"

import { useTransition } from "react"
import { updateNotifications } from "@/app/actions/account"

export default function NotificationsForm({ user }) {
  const [isPending, startTransition] = useTransition()
  const matrix = user.notificationMatrix || {}

  async function action(formData) {
    startTransition(async () => {
      await updateNotifications(formData)
    })
  }

  const rows = [
    { key: "newForYou", label: "New For you" },
    { key: "accountActivity", label: "Account activity" },
    { key: "newDeviceLinked", label: "A new device is linked" },
    { key: "newDeviceConnected", label: "A new device connected" },
    { key: "billingUpdates", label: "Billing Updates" },
    { key: "completedProjects", label: "Completed Projects" },
    { key: "newsletters", label: "Newsletters" },
  ]

  return (
    <form action={action} className="card">
      <h3 className="font-semibold text-lg" style={{ marginBottom: '8px' }}>Notifications</h3>
      <p className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>We need permission from your browser to show notifications. <a href="#" style={{ color: '#7c3aed', textDecoration: 'underline' }}>Request permission</a></p>
      
      <div className="overflow-x-auto" style={{ marginBottom: '32px' }}>
        <table className="w-full text-left text-sm" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr className="border-b text-gray-500" style={{ borderBottom: '1px solid var(--border-tertiary)', color: 'var(--text-secondary)' }}>
              <th className="pb-3 font-semibold pl-2" style={{ paddingBottom: '12px', paddingLeft: '8px', textAlign: 'left' }}>Type</th>
              <th className="pb-3 font-semibold text-center" style={{ paddingBottom: '12px', textAlign: 'center' }}>Email</th>
              <th className="pb-3 font-semibold text-center" style={{ paddingBottom: '12px', textAlign: 'center' }}>Browser</th>
              <th className="pb-3 font-semibold text-center" style={{ paddingBottom: '12px', textAlign: 'center' }}>App</th>
            </tr>
          </thead>
          <tbody style={{ color: 'var(--text-primary)' }}>
            {rows.map((row) => (
              <tr key={row.key} style={{ borderBottom: '1px solid var(--border-tertiary)' }}>
                <td className="py-4 pl-2" style={{ padding: '16px 8px' }}>{row.label}</td>
                <td className="py-4 text-center" style={{ padding: '16px 0', textAlign: 'center' }}>
                  <input type="checkbox" name={`${row.key}_email`} value="true" defaultChecked={matrix[row.key]?.email} style={{ cursor: 'pointer' }} />
                </td>
                <td className="py-4 text-center" style={{ padding: '16px 0', textAlign: 'center' }}>
                  <input type="checkbox" name={`${row.key}_browser`} value="true" defaultChecked={matrix[row.key]?.browser} style={{ cursor: 'pointer' }} />
                </td>
                <td className="py-4 text-center" style={{ padding: '16px 0', textAlign: 'center' }}>
                  <input type="checkbox" name={`${row.key}_app`} value="true" defaultChecked={matrix[row.key]?.app} style={{ cursor: 'pointer' }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="form-group" style={{ maxWidth: '380px' }}>
        <label className="form-label">When should we send you notifications?</label>
        <select className="input">
          <option>Always</option>
          <option>Only when I'm active</option>
          <option>Daily Digest</option>
        </select>
        <p className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '13px' }}>In order to cut back on noise, email notifications are grouped together and only sent when you're idle or offline.</p>
      </div>

      <div className="flex gap-3" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
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
