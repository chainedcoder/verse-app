"use client"

import { useTransition } from "react"
import { updateSocialLinks } from "@/app/actions/account"

export default function SocialForm({ user }) {
  const [isPending, startTransition] = useTransition()
  const links = user.socialLinks || {}

  async function action(formData) {
    startTransition(async () => {
      await updateSocialLinks(formData)
    })
  }

  return (
    <form action={action} className="card">
      <h3 className="font-semibold text-lg" style={{ marginBottom: '24px' }}>Social Accounts</h3>
      
      <div className="space-y-4" style={{ maxWidth: '480px' }}>
        <div className="form-group">
          <label className="form-label">Facebook</label>
          <div className="flex" style={{ display: 'flex' }}>
            <span className="inline-flex items-center" style={{ display: 'inline-flex', alignItems: 'center', padding: '0 12px', fontSize: '14px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-secondary)', borderRight: 'none', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
              facebook.com/
            </span>
            <input type="text" name="facebook" defaultValue={links.facebook} className="input" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} placeholder="username" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Twitter / X</label>
          <div className="flex" style={{ display: 'flex' }}>
            <span className="inline-flex items-center" style={{ display: 'inline-flex', alignItems: 'center', padding: '0 12px', fontSize: '14px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-secondary)', borderRight: 'none', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
              twitter.com/
            </span>
            <input type="text" name="twitter" defaultValue={links.twitter} className="input" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} placeholder="username" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">LinkedIn</label>
          <div className="flex" style={{ display: 'flex' }}>
            <span className="inline-flex items-center" style={{ display: 'inline-flex', alignItems: 'center', padding: '0 12px', fontSize: '14px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-secondary)', borderRight: 'none', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
              linkedin.com/in/
            </span>
            <input type="text" name="linkedin" defaultValue={links.linkedin} className="input" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} placeholder="username" />
          </div>
        </div>
      </div>

      <div className="flex gap-3" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button type="submit" disabled={isPending} className="btn btn-primary" style={{ minWidth: '140px' }}>
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  )
}
