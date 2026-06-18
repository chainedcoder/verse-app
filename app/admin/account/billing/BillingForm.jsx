"use client"

import { useTransition } from "react"
import { createCheckoutSession } from "@/app/actions/billing"
import { CreditCard, CheckCircle2 } from "lucide-react"

import { useToast } from "@/components/ToastProvider"

export default function BillingForm({ user, isSuccess }) {
  const [isPending, startTransition] = useTransition()
  const { showToast } = useToast()

  async function handleAddPaymentMethod() {
    startTransition(async () => {
      const res = await createCheckoutSession()
      if (res?.url) {
        window.location.href = res.url
      } else {
        showToast(res?.error || "An error occurred", "error")
      }
    })
  }

  return (
    <div className="space-y-6">
      {isSuccess && (
        <div style={{ padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircle2 className="shrink-0" size={20} />
          <p className="text-sm font-medium">Payment method added successfully.</p>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ padding: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-tertiary)', color: '#7c3aed', borderRadius: '8px', display: 'flex' }}>
            <CreditCard size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Billing Plan</h3>
            <p className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)' }}>Manage your subscription and payment methods.</p>
          </div>
        </div>

        <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border-tertiary)', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', marginBottom: '24px' }}>
          <div>
            <div className="font-semibold" style={{ fontSize: '15px' }}>Current Plan: <span style={{ color: '#7c3aed', fontWeight: 700 }}>{user.plan || "FREE"}</span></div>
            <div className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              {user.plan === "FREE" ? "You are currently on the free tier." : `Next billing date: ${user.stripeCurrentPeriodEnd ? new Date(user.stripeCurrentPeriodEnd).toLocaleDateString() : 'N/A'}`}
            </div>
          </div>
          {user.plan === "FREE" && (
            <button className="btn btn-primary">
              Upgrade
            </button>
          )}
        </div>

        <h4 className="text-sm font-semibold" style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-primary)' }}>Payment Methods</h4>
        <div style={{ border: '1px solid var(--border-tertiary)', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ padding: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)' }}>
            {user.stripeCustomerId ? "Securely managed by Stripe." : "No payment methods on file."}
          </div>
        </div>

        <button 
          onClick={handleAddPaymentMethod} 
          disabled={isPending}
          className="btn btn-ghost"
        >
          {isPending ? "Redirecting..." : "Add Payment Method"}
        </button>
      </div>
    </div>
  )
}
