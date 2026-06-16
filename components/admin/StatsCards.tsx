
// Minimal SVGs
const IconSettings = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const IconArrow = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"></path></svg>;
const IconMore = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>;

const ProgressBar = ({ progress, totalBlocks = 8, color = 'var(--text-primary)' }: { progress: number; totalBlocks?: number; color?: string }) => {
  const activeBlocks = Math.round((progress / 100) * totalBlocks);
  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '32px' }}>
      {Array.from({ length: totalBlocks }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '48px',
            width: '32px',
            borderRadius: '16px',
            backgroundColor: i < activeBlocks ? color : 'transparent',
            border: i < activeBlocks ? 'none' : '1.5px dashed var(--border-secondary)',
          }}
        />
      ))}
    </div>
  );
};

const StatsCards = () => {
  return (
    <>
      <div className="card admin-stat-card" style={{ flex: 1, backgroundColor: '#e8ece8', borderRadius: '32px', padding: '24px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', border: 'none', color: '#111827' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827' }}>
              <IconSettings />
            </div>
            <span style={{ fontWeight: 500, fontSize: '17px', color: '#111827' }}>Operations</span>
          </div>
          <button style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
            <IconMore />
          </button>
        </div>
        
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', position: 'relative' }}>
            <span style={{ fontSize: 'clamp(48px, 6vw, 72px)', fontWeight: 500, lineHeight: 0.9, letterSpacing: '-0.03em', color: '#1c1c1c' }}>780</span>
            <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '4px' }}>
               <div style={{ position: 'absolute', top: '-12px', left: '150px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, background: '#E6F89F', color: '#161616', padding: '4px 10px', borderRadius: '12px' }}>
                 82%
                 <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px solid #161616' }} />
               </div>
               <span style={{ fontSize: '18px', color: '#9ca3af', fontWeight: 500 }}>/ 1 000</span>
            </div>
          </div>
          <ProgressBar progress={82} color="#222222" />
        </div>
      </div>

      <div className="card admin-stat-card" style={{ flex: 1, backgroundColor: '#E6F89F', borderRadius: '32px', padding: '24px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', border: 'none', color: '#161616' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827' }}>
              <IconArrow />
            </div>
            <span style={{ fontWeight: 500, fontSize: '17px' }}>Data Transfer</span>
          </div>
          <button style={{ color: 'rgba(0,0,0,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <IconMore />
          </button>
        </div>
        
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', position: 'relative' }}>
            <span style={{ fontSize: 'clamp(48px, 6vw, 72px)', fontWeight: 500, lineHeight: 0.9, letterSpacing: '-0.03em' }}>163</span>
            <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '4px' }}>
               <div style={{ position: 'absolute', top: '-12px', left: '140px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, background: 'rgba(255,255,255,0.8)', padding: '4px 10px', borderRadius: '12px' }}>
                 68%
                 <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px solid #161616' }} />
               </div>
               <span style={{ fontSize: '18px', color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>/ 512.0 MB</span>
            </div>
          </div>
          <ProgressBar progress={68} color="#161616" />
        </div>
      </div>
    </>
  );
};

export default StatsCards;
