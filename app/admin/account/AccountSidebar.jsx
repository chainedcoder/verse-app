"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AccountSidebar() {
  const pathname = usePathname()

  const links = [
    { href: "/admin/account/basic-info", label: "Basic Information" },
    { href: "/admin/account/preferences", label: "Preferences" },
    { href: "/admin/account/password", label: "Password" },
    { href: "/admin/account/recent-devices", label: "Recent Devices" },
    { href: "/admin/account/notifications", label: "Notifications" },
    { href: "/admin/account/2fa", label: "Two-step verification" },
    { href: "/admin/account/connected-accounts", label: "Connected accounts" },
    { href: "/admin/account/social", label: "Social Account" },
    { href: "/admin/account/billing", label: "Billing" },
    { href: "/admin/account/statements", label: "Statements" },
    { href: "/admin/account/referrals", label: "Referrals" },
    { href: "/admin/account/api-keys", label: "API Keys" },
    { href: "/admin/account/delete", label: "Delete your account", className: "text-red-500 hover:text-red-600 dark:text-red-400" },
  ]

  return (
    <aside className="account-sidebar hidden md:block">
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const isActive = pathname === link.href || (pathname === '/admin/account' && link.href === '/admin/account/basic-info')
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`account-sidebar-link ${isActive ? "active" : ""} ${link.className || ""}`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
