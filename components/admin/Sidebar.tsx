"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Minimal inline SVGs
const IconHome = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const IconAdminUsers = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconUsers = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconCard = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const IconLink = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>;

const Sidebar = () => {
  const pathname = usePathname();
  const getNavClass = (path: string) => `nav-item ${pathname === path ? 'active' : ''}`;

  return (
    <aside className="admin-sidebar-left">
      <div className="flex flex-col items-center gap-4 w-full" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '16px' }}>
        {/* Logo */}
        <div className="nav-item" style={{ border: '1px solid rgba(255, 255, 255, 0.2)', marginBottom: '16px', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>

        <Link href="/admin" className={getNavClass('/admin')} title="Workflow"><IconHome /></Link>
        <Link href="/admin/users" className={getNavClass('/admin/users')} title="User Management"><IconAdminUsers /></Link>
        <Link href="/admin/employee" className={getNavClass('/admin/employee')} title="Employee"><IconUsers /></Link>
        <Link href="/admin/finance" className={getNavClass('/admin/finance')} title="Finance"><IconCard /></Link>
        <Link href="/admin/timers" className={getNavClass('/admin/timers')} title="Timers"><IconLink /></Link>
      </div>

      <div style={{ marginTop: 'auto', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        {/* User Avatar */}
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: 'var(--border-secondary)' }}>
          <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
