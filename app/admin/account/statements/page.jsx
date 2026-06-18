import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Stripe from "stripe"
import { FileText, Download } from "lucide-react"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
})

export default async function StatementsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) redirect("/login")

  let invoices = []
  let error = null

  if (user.stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
    try {
      const response = await stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit: 20,
      })
      invoices = response.data
    } catch (err) {
      console.error(err)
      error = "Could not load statements from billing provider."
    }
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ padding: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-tertiary)', color: '#7c3aed', borderRadius: '8px', display: 'flex' }}>
          <FileText size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Billing Statements</h3>
          <p className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)' }}>View and download your past invoices.</p>
        </div>
      </div>

      {error ? (
        <div style={{ padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr className="border-b text-gray-500" style={{ borderBottom: '1px solid var(--border-tertiary)', color: 'var(--text-secondary)' }}>
                <th className="pb-3 font-semibold pl-2" style={{ paddingBottom: '12px', paddingLeft: '8px', textAlign: 'left' }}>Date</th>
                <th className="pb-3 font-semibold" style={{ paddingBottom: '12px', textAlign: 'left' }}>Amount</th>
                <th className="pb-3 font-semibold" style={{ paddingBottom: '12px', textAlign: 'left' }}>Status</th>
                <th className="pb-3 font-semibold text-right" style={{ paddingBottom: '12px', textAlign: 'right' }}>Invoice</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--text-primary)' }}>
              {invoices.map((invoice) => (
                <tr key={invoice.id} style={{ borderBottom: '1px solid var(--border-tertiary)' }}>
                  <td className="py-4 pl-2" style={{ padding: '16px 8px', fontWeight: 500 }}>{new Date(invoice.created * 1000).toLocaleDateString()}</td>
                  <td className="py-4 font-semibold" style={{ padding: '16px 0', fontWeight: 600 }}>${(invoice.amount_paid / 100).toFixed(2)}</td>
                  <td className="py-4" style={{ padding: '16px 0' }}>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: '#15803d', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>{invoice.status}</span>
                  </td>
                  <td className="py-4 text-right" style={{ padding: '16px 0', textAlign: 'right' }}>
                    {invoice.invoice_pdf && (
                      <a href={invoice.invoice_pdf} target="_blank" rel="noreferrer" className="flex items-center gap-1" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#7c3aed', fontWeight: 500 }}>
                        <Download size={16} /> Download
                      </a>
                    )}
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500" style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>No statements found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
