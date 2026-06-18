
const IconArrowUpRight = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>;

const PromoCard = () => {
  return (
    <div className="card admin-stat-card" style={{ padding: '24px', backgroundColor: '#1a1c1a', minHeight: '340px', position: 'relative', overflow: 'hidden', border: 'none', borderRadius: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div 
        style={{
          position: 'absolute', inset: 0, opacity: 0.6, backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'luminosity',
          backgroundImage: 'url("https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop")'
        }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.5), transparent)' }} />
      
      <div style={{ position: 'relative', zIndex: 10 }}>
        <h3 style={{ fontSize: '24px', fontWeight: 500, color: 'white', lineHeight: 1.2, marginBottom: '12px' }}>
          Broadcast <br />
          Platform <br />
          Announcements <span style={{ color: 'hsl(67, 85%, 80%)', verticalAlign: 'middle', display: 'inline-flex' }}><IconArrowUpRight /></span>
        </h3>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, margin: 0 }}>
          Draft global updates, push community challenges, and notify all active poets instantly.
        </p>
      </div>
      
      <button className="btn" style={{ position: 'relative', zIndex: 10, width: '100%', background: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '14px', borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '24px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
        Send Broadcast
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  );
};

export default PromoCard;
