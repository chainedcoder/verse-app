"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { name: 'Organization', href: '/admin' },
  { name: 'Teams', href: '/admin' },
  { name: 'Users', href: '/admin/users' },
  { name: 'Subscription', href: '/admin' },
  { name: 'Payment', href: '/admin' },
  { name: 'Installed Apps', href: '/admin' },
  { name: 'Variables', href: '/admin' },
  { name: 'Scenario Properties', href: '/admin' }
];

const Tabs = () => {
  const pathname = usePathname();

  return (
    <div className="admin-tabs">
      {tabs.map((tab) => {
        // Dynamic active class: Organization is active on /admin, Users on /admin/users
        const isActive = pathname === tab.href;
        
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`admin-tab ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
};

export default Tabs;
