import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function RecentDevicesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const sessions = await prisma.session.findMany({
    where: { userId: session.user.id },
    orderBy: { lastActive: 'desc' }
  })
  
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 className="font-semibold text-lg">Recent Devices</h3>
        <p className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)' }}>View and manage devices where you're currently logged in.</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr className="border-b text-gray-500" style={{ borderBottom: '1px solid var(--border-tertiary)', color: 'var(--text-secondary)' }}>
              <th className="pb-3 font-semibold pl-2" style={{ paddingBottom: '12px', paddingLeft: '8px', textAlign: 'left' }}>Browser</th>
              <th className="pb-3 font-semibold" style={{ paddingBottom: '12px', textAlign: 'left' }}>Devices</th>
              <th className="pb-3 font-semibold" style={{ paddingBottom: '12px', textAlign: 'left' }}>Location</th>
              <th className="pb-3 font-semibold" style={{ paddingBottom: '12px', textAlign: 'left' }}>Most Recent Activity</th>
            </tr>
          </thead>
          <tbody style={{ color: 'var(--text-primary)' }}>
            {sessions.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border-tertiary)' }}>
                <td className="py-4 pl-2 flex items-center gap-3" style={{ padding: '16px 8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div className="rounded-full flex items-center justify-center text-white font-bold" style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: i % 3 === 0 ? '#f97316' : i % 3 === 1 ? '#3b82f6' : '#ef4444', color: 'white', fontWeight: 600 }}>
                     {s.browser?.[0] || 'O'}
                   </div>
                   {s.browser || 'Unknown Browser'}
                </td>
                <td className="py-4" style={{ padding: '16px 0' }}>{s.device || 'Unknown Device'}</td>
                <td className="py-4" style={{ padding: '16px 0' }}>
                  <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {s.location || 'Unknown Location'}
                    {i === 0 && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-md" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>Current</span>}
                  </div>
                </td>
                <td className="py-4" style={{ padding: '16px 0' }}>
                  {i === 0 ? 'Now' : new Date(s.lastActive).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
               <tr>
                 <td colSpan={4} className="py-8 text-center text-gray-500" style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>No recent devices found.</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
