import "../admin.css"
import { TimerProvider } from "@/components/admin/context/TimerContext"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: 'Admin Dashboard — Verse',
  description: 'Platform management and analytics.',
}

export default async function AdminLayout({ children }) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Use fixed inset-0 to break out of the global container, and our native .admin-layout class
  return (
    <div className="admin-layout fixed inset-0 z-[9999]">
      <TimerProvider>
        {children}
      </TimerProvider>
    </div>
  )
}
