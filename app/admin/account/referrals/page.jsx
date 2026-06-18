import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Share2, Copy } from "lucide-react"

export default async function ReferralsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const referralLink = `https://verse.app/join?ref=${session.user.id.substring(0, 8)}`

  return (
    <div className="card">
      <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ padding: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-tertiary)', color: '#7c3aed', borderRadius: '8px', display: 'flex' }}>
          <Share2 size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Referrals</h3>
          <p className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)' }}>Invite friends and earn rewards.</p>
        </div>
      </div>

      <div style={{ padding: '32px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-tertiary)', borderRadius: '12px', marginBottom: '32px', textAlign: 'center' }}>
        <h4 className="font-bold text-lg" style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Give 1 Month, Get 1 Month Free</h4>
        <p className="text-gray-500 text-sm" style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>Share your unique referral link. When a friend signs up for a paid plan, you both get a month free.</p>
        
        <div className="flex" style={{ display: 'flex', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
          <input 
            type="text" 
            readOnly 
            value={referralLink} 
            className="input"
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          />
          <button className="btn btn-primary" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Copy size={16} /> Copy
          </button>
        </div>
      </div>

      <h4 className="text-sm font-semibold" style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--text-primary)' }}>Referral Stats</h4>
      <div className="grid md:grid-cols-3 gap-4">
        <div style={{ padding: '24px', border: '1px solid var(--border-tertiary)', borderRadius: '12px', textAlign: 'center', backgroundColor: 'var(--bg-primary)' }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#7c3aed', marginBottom: '4px' }}>0</div>
          <div className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)' }}>Clicks</div>
        </div>
        <div style={{ padding: '24px', border: '1px solid var(--border-tertiary)', borderRadius: '12px', textAlign: 'center', backgroundColor: 'var(--bg-primary)' }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#7c3aed', marginBottom: '4px' }}>0</div>
          <div className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)' }}>Signups</div>
        </div>
        <div style={{ padding: '24px', border: '1px solid var(--border-tertiary)', borderRadius: '12px', textAlign: 'center', backgroundColor: 'var(--bg-primary)' }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#16a34a', marginBottom: '4px' }}>$0</div>
          <div className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)' }}>Earned</div>
        </div>
      </div>
    </div>
  )
}
