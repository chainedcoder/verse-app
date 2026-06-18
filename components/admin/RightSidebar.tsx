
// Minimal SVGs
const IconMsg = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const IconGrad = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>;
const IconHelp = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const IconUsers = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconFile = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const IconChart = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>;
const IconArrowUpRight = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>;

const RightSidebar = () => {
  return (
    <div className="admin-sidebar-right" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Cards */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <button className="card" style={{ flex: 1, background: 'var(--bg-card)', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', border: 'none', cursor: 'pointer', borderRadius: '32px' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--bg-secondary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', color: 'var(--text-primary)' }}>
            <IconMsg />
          </div>
          <span style={{ fontWeight: 500, fontSize: '15px', color: 'var(--text-primary)' }}>Poet Guild</span>
        </button>
        <button className="card" style={{ flex: 1, background: 'var(--bg-card)', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', border: 'none', cursor: 'pointer', borderRadius: '32px' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--bg-secondary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', color: 'var(--text-primary)' }}>
            <IconGrad />
          </div>
          <span style={{ fontWeight: 500, fontSize: '15px', color: 'var(--text-primary)' }}>Poem Academy</span>
        </button>
      </div>

      {/* Links List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        <a href="#" className="card" style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '32px', textDecoration: 'none', border: 'none', display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--bg-secondary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', color: 'var(--text-primary)' }}>
              <IconHelp />
            </div>
            <span style={{ color: 'var(--text-primary)' }}><IconArrowUpRight /></span>
          </div>
          <h4 style={{ fontWeight: 500, fontSize: '18px', marginBottom: '4px', color: 'var(--text-primary)' }}>Poet Help</h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Explore our detailed guidelines on verse formatting, vibes...</p>
        </a>

        <a href="#" className="card" style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '32px', textDecoration: 'none', border: 'none', display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--bg-secondary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', color: 'var(--text-primary)' }}>
              <IconUsers />
            </div>
            <span style={{ color: 'var(--text-primary)' }}><IconArrowUpRight /></span>
          </div>
          <h4 style={{ fontWeight: 500, fontSize: '18px', marginBottom: '4px', color: 'var(--text-primary)' }}>Publisher Hub</h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Find the perfect publisher to support your physical print runs...</p>
        </a>

        <a href="#" className="card" style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '32px', textDecoration: 'none', border: 'none', display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--bg-secondary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', color: 'var(--text-primary)' }}>
              <IconFile />
            </div>
            <span style={{ color: 'var(--text-primary)' }}><IconArrowUpRight /></span>
          </div>
          <h4 style={{ fontWeight: 500, fontSize: '18px', marginBottom: '4px', color: 'var(--text-primary)' }}>Verse Blog</h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Access popular guides & stories about poetry and digital layout...</p>
        </a>

        <a href="#" className="card" style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '32px', textDecoration: 'none', border: 'none', display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--bg-secondary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', color: 'var(--text-primary)' }}>
              <IconChart />
            </div>
            <span style={{ color: 'var(--text-primary)' }}><IconArrowUpRight /></span>
          </div>
          <h4 style={{ fontWeight: 500, fontSize: '18px', marginBottom: '4px', color: 'var(--text-primary)' }}>Vibe Guidelines</h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Get inspired by all the ways you can configure immersive vibes...</p>
        </a>
      </div>
    </div>
  );
};

export default RightSidebar;
