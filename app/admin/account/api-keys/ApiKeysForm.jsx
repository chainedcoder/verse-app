"use client"

import { useState, useTransition } from "react"
import { generateApiKey, revokeApiKey } from "@/app/actions/account"
import { Key, Copy, Trash2, CheckCircle2 } from "lucide-react"
import { useConfirm } from "@/components/ConfirmProvider"

export default function ApiKeysForm({ apiKeys }) {
  const [isPending, startTransition] = useTransition()
  const [newKey, setNewKey] = useState(null)
  const [copied, setCopied] = useState(false)
  const { confirm } = useConfirm()

  async function handleGenerate(formData) {
    const name = formData.get("name")
    if (!name) return

    startTransition(async () => {
      const res = await generateApiKey(name)
      if (res?.success) {
        setNewKey(res.key)
        document.getElementById('generate-form').reset()
      }
    })
  }

  async function handleRevoke(id) {
    const isConfirmed = await confirm("Are you sure you want to revoke this API key? Systems using it will immediately lose access.")
    if (isConfirmed) {
      startTransition(async () => {
        await revokeApiKey(id)
      })
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ padding: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-tertiary)', color: '#7c3aed', borderRadius: '8px', display: 'flex' }}>
            <Key size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Developer API Keys</h3>
            <p className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)' }}>Manage keys for programmatic access to your account.</p>
          </div>
        </div>

        {newKey && (
          <div style={{ padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '32px' }}>
            <div className="flex items-start gap-3" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <CheckCircle2 style={{ color: '#16a34a', marginTop: '2px', flexShrink: 0 }} size={18} />
              <div style={{ flex: 1 }}>
                <h4 className="font-semibold text-sm" style={{ color: '#15803d', marginBottom: '4px' }}>New API key generated</h4>
                <p className="text-sm" style={{ color: '#15803d', marginBottom: '12px' }}>Please copy this key and store it somewhere safe. For security reasons, you will not be able to see it again.</p>
                <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
                  <code style={{ flex: 1, padding: '8px 12px', backgroundColor: 'white', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{newKey}</code>
                  <button onClick={copyToClipboard} className="btn btn-primary" style={{ padding: '0 12px', height: '38px' }}>
                    {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form id="generate-form" action={handleGenerate} className="flex gap-3" style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <input type="text" name="name" placeholder="Key name (e.g. Production Server)" required className="input" style={{ flex: 1 }} />
          <button type="submit" disabled={isPending} className="btn btn-primary" style={{ minWidth: '160px' }}>
            {isPending ? "Generating..." : "Generate New Key"}
          </button>
        </form>

        <h4 className="text-sm font-semibold" style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-primary)' }}>Active Keys</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr className="border-b text-gray-500" style={{ borderBottom: '1px solid var(--border-tertiary)', color: 'var(--text-secondary)' }}>
                <th className="pb-3 font-semibold pl-2" style={{ paddingBottom: '12px', paddingLeft: '8px', textAlign: 'left' }}>Name</th>
                <th className="pb-3 font-semibold" style={{ paddingBottom: '12px', textAlign: 'left' }}>Key Prefix</th>
                <th className="pb-3 font-semibold" style={{ paddingBottom: '12px', textAlign: 'left' }}>Created</th>
                <th className="pb-3 font-semibold text-right" style={{ paddingBottom: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--text-primary)' }}>
              {apiKeys.map((key) => (
                <tr key={key.id} style={{ borderBottom: '1px solid var(--border-tertiary)' }}>
                  <td className="py-4 pl-2 font-semibold" style={{ padding: '16px 8px', fontWeight: 600 }}>{key.name}</td>
                  <td className="py-4" style={{ padding: '16px 0', fontFamily: 'monospace', fontSize: '13px' }}>{key.prefix}••••••••••••••••••••••••</td>
                  <td className="py-4" style={{ padding: '16px 0' }}>{new Date(key.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 text-right" style={{ padding: '16px 0', textAlign: 'right' }}>
                    <button onClick={() => handleRevoke(key.id)} disabled={isPending} className="p-2" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'} onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {apiKeys.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500" style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>No active API keys.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
