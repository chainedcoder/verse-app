"use client"

import { useTransition } from "react"
import { deleteAccount } from "@/app/actions/profile"
import { Trash2, AlertTriangle } from "lucide-react"
import { useConfirm } from "@/components/ConfirmProvider"
import { useToast } from "@/components/ToastProvider"

export default function DeleteForm() {
  const [isPending, startTransition] = useTransition()
  const { confirm } = useConfirm()
  const { showToast } = useToast()

  async function handleDelete() {
    const isConfirmed = await confirm("Are you absolutely sure you want to archive your account? It can be restored within 30 days by logging back in.")
    if (isConfirmed) {
      startTransition(async () => {
        const res = await deleteAccount()
        if (res.success) {
          window.location.href = "/"
        } else {
          showToast(res.error || "Failed to delete account", "error")
        }
      })
    }
  }

  return (
    <div className="card" style={{ borderColor: '#fecaca', backgroundColor: 'rgba(239, 68, 68, 0.03)' }}>
      <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#ef4444' }}>
        <AlertTriangle size={24} />
        <h3 className="font-semibold text-lg">Danger Zone</h3>
      </div>
      
      <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div className="font-semibold" style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '4px' }}>Delete Account</div>
          <div className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
            Delete your account, poems, follows, and likes. Your past comments will be anonymized. This action is permanent and cannot be undone.
          </div>
        </div>
        <button 
          type="button" 
          onClick={handleDelete}
          disabled={isPending}
          className="custom-btn btn-danger"
          style={{ height: '40px', padding: '0 24px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Trash2 size={18} />
          {isPending ? "Deleting..." : "Delete Account"}
        </button>
      </div>
    </div>
  )
}
