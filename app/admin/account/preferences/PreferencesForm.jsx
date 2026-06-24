"use client"

import { useTransition } from "react"
import { updatePreferences } from "@/app/actions/account"
import { updateAccountSettings } from "@/app/actions/profile"
import { useToast } from "@/components/ToastProvider"

export default function PreferencesForm({ user }) {
  const [isPending, startTransition] = useTransition()
  const { showToast } = useToast()
  const prefs = user.preferences || {}

  async function action(formData) {
    if (!formData.get("isPrivateAccount")) formData.set("isPrivateAccount", "false")
    if (!formData.get("emailNotifications")) formData.set("emailNotifications", "false")
    if (!formData.get("earlyRelease")) formData.set("earlyRelease", "false")
    if (!formData.get("emailSuccessfulPayments")) formData.set("emailSuccessfulPayments", "false")
    if (!formData.get("emailPayouts")) formData.set("emailPayouts", "false")
    if (!formData.get("emailFeeCollection")) formData.set("emailFeeCollection", "false")
    if (!formData.get("emailInvoice")) formData.set("emailInvoice", "false")

    startTransition(async () => {
      const res1 = await updatePreferences(formData)
      const res2 = await updateAccountSettings(formData)
      
      if (res1?.error || res2?.error) {
        showToast(res1?.error || res2?.error || "Failed to save settings", "error")
      } else {
        showToast("Preferences and privacy settings updated successfully", "success")
      }
    })
  }

  return (
    <form action={action} className="space-y-6">
      <div className="card">
        <h3 className="font-semibold text-lg" style={{ marginBottom: '24px' }}>General Preferences</h3>
        
        <div className="form-group" style={{ maxWidth: '380px' }}>
          <label className="form-label">Language</label>
          <select name="language" defaultValue={prefs.language || "English"} className="input">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
          </select>
        </div>

        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-tertiary)', paddingTop: '24px' }}>
          <label className="flex items-start gap-3" style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <input type="checkbox" name="earlyRelease" value="true" defaultChecked={prefs.earlyRelease} style={{ marginTop: '4px', cursor: 'pointer' }} />
            <div>
              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Early release</div>
              <div className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Get included on new features early. See info about your current features.</div>
            </div>
          </label>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg" style={{ marginBottom: '24px' }}>Privacy & Social Notifications</h3>
        
        <div className="space-y-4">
          <label className="flex items-start gap-3" style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <input type="checkbox" name="isPrivateAccount" value="true" defaultChecked={user.isPrivateAccount} style={{ marginTop: '4px', cursor: 'pointer' }} />
            <div>
              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Private Account</div>
              <div className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>When your account is private, only people you approve can see your profile and poems.</div>
            </div>
          </label>

          <label className="flex items-start gap-3" style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <input type="checkbox" name="emailNotifications" value="true" defaultChecked={user.emailNotifications} style={{ marginTop: '4px', cursor: 'pointer' }} />
            <div>
              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Social Email Notifications</div>
              <div className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Receive emails when someone likes or comments on your poems, or starts following you.</div>
            </div>
          </label>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg" style={{ marginBottom: '24px' }}>Email Preferences</h3>
        
        <div className="space-y-4">
          <label className="flex items-start gap-3" style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <input type="checkbox" name="emailSuccessfulPayments" value="true" defaultChecked={prefs.emailSuccessfulPayments} style={{ marginTop: '4px', cursor: 'pointer' }} />
            <div>
              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Successful payments</div>
              <div className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Receive a notification for every successful payment.</div>
            </div>
          </label>

          <label className="flex items-start gap-3" style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <input type="checkbox" name="emailPayouts" value="true" defaultChecked={prefs.emailPayouts} style={{ marginTop: '4px', cursor: 'pointer' }} />
            <div>
              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Payouts</div>
              <div className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Receive a notification for every initiated payout.</div>
            </div>
          </label>
          
          <label className="flex items-start gap-3" style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <input type="checkbox" name="emailFeeCollection" value="true" defaultChecked={prefs.emailFeeCollection} style={{ marginTop: '4px', cursor: 'pointer' }} />
            <div>
              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Fee Collection</div>
              <div className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Receive a notification each time you collect a fee from an account.</div>
            </div>
          </label>
          
          <label className="flex items-start gap-3" style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <input type="checkbox" name="emailInvoice" value="true" defaultChecked={prefs.emailInvoice} style={{ marginTop: '4px', cursor: 'pointer' }} />
            <div>
              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Invoice Payments</div>
              <div className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Receive a notification if an invoice is paid.</div>
            </div>
          </label>
        </div>
      </div>

      <div className="flex gap-3" style={{ display: 'flex', gap: '12px' }}>
        <button type="submit" disabled={isPending} className="btn btn-primary" style={{ minWidth: '140px' }}>
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  )
}
