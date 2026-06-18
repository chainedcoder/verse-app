"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Published Poems', href: '/admin' },
  { name: 'Poets Community', href: '/admin/users' },
  { name: 'Report Queue', href: '/admin' },
  { name: 'Vibe Playlists', href: '/admin' },
  { name: 'Tag Taxonomies', href: '/admin' },
  { name: 'Platform System', href: '/admin' },
  { name: 'Verse Settings', href: '/admin' }
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
