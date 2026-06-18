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

interface StatsCardsProps {
  card1Title?: string;
  card1Value?: number | string;
  card1Progress?: number;
  card1Sub?: string;
  
  card2Title?: string;
  card2Value?: number | string;
  card2Progress?: number;
  card2Sub?: string;
}

const StatsCards = ({
  card1Title = "Published Verses",
  card1Value = 780,
  card1Progress = 82,
  card1Sub = "/ 1,000",
  
  card2Title = "Database Volume",
  card2Value = 163,
  card2Progress = 68,
  card2Sub = "/ 512.0 MB",
}: StatsCardsProps) => {
  return (
    <>
      <div className="card admin-stat-card" style={{ flex: 1, backgroundColor: 'var(--bg-card)', borderRadius: '32px', padding: '24px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', border: '1px solid var(--border-secondary)', color: 'var(--text-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--bg-secondary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
              <IconSettings />
            </div>
            <span style={{ fontWeight: 500, fontSize: '17px', color: 'var(--text-primary)' }}>{card1Title}</span>
          </div>
          <button style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <IconMore />
          </button>
        </div>
        
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', position: 'relative' }}>
            <span style={{ fontSize: 'clamp(48px, 6vw, 72px)', fontWeight: 500, lineHeight: 0.9, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>{card1Value}</span>
            <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '4px' }}>
               <div style={{ position: 'absolute', top: '-12px', left: '150px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, background: 'var(--accent)', color: '#fff', padding: '4px 10px', borderRadius: '12px' }}>
                 {card1Progress}%
                 <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px solid #fff' }} />
               </div>
               <span style={{ fontSize: '18px', color: 'var(--text-secondary)', fontWeight: 500 }}>{card1Sub}</span>
            </div>
          </div>
          <ProgressBar progress={card1Progress} color="var(--text-primary)" />
        </div>
      </div>

      <div className="card admin-stat-card" style={{ flex: 1, backgroundColor: 'var(--bg-card)', borderRadius: '32px', padding: '24px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', border: '1px solid var(--border-secondary)', color: 'var(--text-primary)' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--bg-secondary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
              <IconArrow />
            </div>
            <span style={{ fontWeight: 500, fontSize: '17px', color: 'var(--text-primary)' }}>{card2Title}</span>
          </div>
          <button style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <IconMore />
          </button>
        </div>
        
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', position: 'relative' }}>
            <span style={{ fontSize: 'clamp(48px, 6vw, 72px)', fontWeight: 500, lineHeight: 0.9, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>{card2Value}</span>
            <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '4px' }}>
               <div style={{ position: 'absolute', top: '-12px', left: '140px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, background: 'var(--accent)', color: '#fff', padding: '4px 10px', borderRadius: '12px' }}>
                 {card2Progress}%
                 <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px solid #fff' }} />
               </div>
               <span style={{ fontSize: '18px', color: 'var(--text-secondary)', fontWeight: 500 }}>{card2Sub}</span>
            </div>
          </div>
          <ProgressBar progress={card2Progress} color="var(--text-primary)" />
        </div>
      </div>
    </>
  );
};

export default StatsCards;
